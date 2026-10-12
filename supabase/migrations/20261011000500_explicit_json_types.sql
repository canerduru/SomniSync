create or replace function public.get_synastry() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_user public.users%rowtype; v_date date; v_count int; v_themes jsonb; v_stats jsonb:='{"status":"insufficient_data"}'::jsonb;
  v_matches jsonb:='[]'::jsonb; v_self uuid[]; v_other record; v_shared text[]; v_id uuid; v_score numeric;
begin
  select * into v_user from public.users where id=auth.uid() and deletion_requested_at is null;
  if not found then raise exception 'UNAUTHENTICATED'; end if;
  v_date:=(now() at time zone v_user.timezone)::date-1;
  if v_user.aggregate_consent_at is not null then
    select count(distinct d.user_id) into v_count from public.dreams d join public.users u on u.id=d.user_id
      where d.dream_date=v_date and d.aggregate_opt_in and d.status='ready' and d.deletion_requested_at is null
        and u.aggregate_consent_at is not null and u.deletion_requested_at is null;
    if v_count>=20 then
      select coalesce(jsonb_agg(jsonb_build_object('slug',x.slug,'percentage',round(100.0*x.n/v_count)) order by x.n desc,x.slug),'[]') into v_themes
      from (select t.slug,count(distinct d.user_id) n from public.dreams d join public.users u on u.id=d.user_id
        join public.dream_tags dt on dt.dream_id=d.id join public.tags t on t.id=dt.tag_id
        where d.dream_date=v_date and d.aggregate_opt_in and d.status='ready' and d.deletion_requested_at is null
          and u.aggregate_consent_at is not null and u.deletion_requested_at is null
        group by t.slug having count(distinct d.user_id)>=5 and v_count-count(distinct d.user_id)>=5) x;
      if jsonb_array_length(v_themes)>0 then v_stats:=jsonb_build_object('status','ready','cohortSize',v_count,'periodLabel',v_date::text,'themes',v_themes); end if;
    end if;
  end if;
  if v_user.matching_consent_at is not null then
    select array_agg(distinct dt.tag_id) into v_self from public.dreams d join public.dream_tags dt on dt.dream_id=d.id
      where d.user_id=v_user.id and d.matching_opt_in and d.status='ready' and d.deletion_requested_at is null and d.dream_date>=(now() at time zone v_user.timezone)::date-30;
    if cardinality(v_self)>0 then
      for v_other in
        select u.id,array_agg(distinct dt.tag_id) ids from public.users u join public.dreams d on d.user_id=u.id join public.dream_tags dt on dt.dream_id=d.id
        where u.id<>v_user.id and u.matching_consent_at is not null and u.deletion_requested_at is null
          and d.matching_opt_in and d.status='ready' and d.deletion_requested_at is null and d.dream_date>=(now() at time zone v_user.timezone)::date-30
        group by u.id having array_agg(distinct dt.tag_id) && v_self
        order by (select count(*) from unnest(array_agg(distinct dt.tag_id)) a where a=any(v_self)) desc,u.id limit 5
      loop
        select array_agg(slug order by slug) into v_shared from public.tags where id=any(v_self) and id=any(v_other.ids);
        v_score:=cardinality(v_shared)::numeric/(cardinality(v_self)+cardinality(v_other.ids)-cardinality(v_shared));
        insert into public.connections(user_a_id,user_b_id,match_score,expires_at)
          values(least(v_user.id,v_other.id),greatest(v_user.id,v_other.id),v_score,now()+interval '1 day')
          on conflict(user_a_id,user_b_id) do update set match_score=excluded.match_score,expires_at=excluded.expires_at
          returning id into v_id;
        v_matches:=v_matches||jsonb_build_array(jsonb_build_object('id',v_id,'alias',case when v_user.locale='tr' then 'Rüya ' else 'Dream ' end||upper(left(v_id::text,6)), 'sharedTags',v_shared,'isDemo',false));
      end loop;
    end if;
  end if;
  return jsonb_build_object('stats',v_stats,'matches',v_matches);
end; $$;
