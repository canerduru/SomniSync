-- All media mutations go through authenticated Edge Functions.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
alter table public.users add column deletion_requested_at timestamptz;
alter table public.dreams add column deletion_requested_at timestamptz;
create table private.mutation_leases (user_id uuid primary key references public.users(id) on delete cascade, token uuid not null, expires_at timestamptz not null);
revoke all on private.mutation_leases from public, anon, authenticated;

create function public.claim_mutation(p_user uuid, p_token uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  insert into private.mutation_leases values(p_user,p_token,now()+interval '5 minutes')
  on conflict(user_id) do update set token=excluded.token, expires_at=excluded.expires_at
    where private.mutation_leases.expires_at < now();
  return found;
end; $$;
create function public.release_mutation(p_user uuid, p_token uuid) returns void
language sql security definer set search_path = '' as $$
  delete from private.mutation_leases where user_id=p_user and token=p_token;
$$;
revoke all on function public.claim_mutation(uuid,uuid), public.release_mutation(uuid,uuid) from public,anon,authenticated;
grant execute on function public.claim_mutation(uuid,uuid), public.release_mutation(uuid,uuid) to service_role;

create function public.account_active() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.users where id=auth.uid() and deletion_requested_at is null);
$$;
revoke all on function public.account_active() from public,anon;
grant execute on function public.account_active() to authenticated;
create policy dreams_active on public.dreams as restrictive for all to authenticated
 using (public.account_active() and deletion_requested_at is null)
 with check (public.account_active() and deletion_requested_at is null);
create policy users_active_update on public.users as restrictive for update to authenticated
 using (deletion_requested_at is null) with check (deletion_requested_at is null);
revoke delete on public.dreams from authenticated;
drop policy dreams_delete_own on public.dreams;
-- Removing Storage metadata directly would leave the underlying bytes behind.
drop policy if exists audio_insert_own on storage.objects;
drop policy dream_audio_upload_own on storage.objects;
drop policy dream_media_delete_own on storage.objects;
create policy media_active on storage.objects as restrictive for select to authenticated using(public.account_active());

create function public.save_mock_dream(p_user uuid, p_id uuid, p_input jsonb, p_analysis jsonb, p_image text, p_audio text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_tag text; v_tag_id uuid;
begin
  perform 1 from public.users where id=p_user and deletion_requested_at is null for update;
  if not found then raise exception 'ACCOUNT_UNAVAILABLE'; end if;
  if exists(select 1 from public.dreams where id=p_id and (user_id<>p_user or deletion_requested_at is not null)) then raise exception 'NOT_FOUND'; end if;
  if jsonb_array_length(p_analysis->'tags') not between 3 and 6 then raise exception 'INVALID_TAGS'; end if;
  insert into public.dreams(id,user_id,title,transcript,input_mode,dream_date,capture_timezone,content_locale,status,
    neuroscience_interpretation,jungian_interpretation,astrological_interpretation,astrology_context,image_prompt,image_path,audio_path,processed_at)
  values(p_id,p_user,left(p_input->>'transcript',100),p_input->>'transcript',p_input->>'inputMode',
    (p_input->>'dreamDate')::date,p_input->>'timezone',p_input->>'locale','ready',
    p_analysis#>>'{interpretations,neuroscience}',p_analysis#>>'{interpretations,jungian}',p_analysis#>>'{interpretations,astrological}',
    '{"available":false,"mock":true}'::jsonb,p_analysis->>'image_prompt',p_image,p_audio,now())
  on conflict(id) do update set transcript=excluded.transcript,title=excluded.title,status='ready',
    neuroscience_interpretation=excluded.neuroscience_interpretation,jungian_interpretation=excluded.jungian_interpretation,
    astrological_interpretation=excluded.astrological_interpretation,astrology_context=excluded.astrology_context,
    image_prompt=excluded.image_prompt,image_path=excluded.image_path,audio_path=excluded.audio_path,
    processed_at=now(),aggregate_opt_in=false,matching_opt_in=false;
  delete from public.dream_tags where dream_id=p_id;
  for v_tag in select distinct value from jsonb_array_elements_text(p_analysis->'tags') loop
    if v_tag !~ '^[a-z]+(_[a-z]+)*$' then raise exception 'INVALID_TAGS'; end if;
    insert into public.tags(slug) values(v_tag) on conflict(slug) do update set slug=excluded.slug returning id into v_tag_id;
    insert into public.dream_tags values(p_id,v_tag_id);
  end loop;
  return p_id;
end; $$;
revoke all on function public.save_mock_dream(uuid,uuid,jsonb,jsonb,text,text) from public,anon,authenticated;
grant execute on function public.save_mock_dream(uuid,uuid,jsonb,jsonb,text,text) to service_role;

create function public.invalidate_connections() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_owner uuid;
begin
  if tg_table_name='users' then v_owner=new.id; else v_owner=coalesce(new.user_id,old.user_id); end if;
  delete from public.connections where user_a_id=v_owner or user_b_id=v_owner;
  return coalesce(new,old);
end; $$;
revoke all on function public.invalidate_connections() from public,anon,authenticated;
create trigger users_invalidate_connections after update of matching_consent_at, deletion_requested_at on public.users for each row execute function public.invalidate_connections();
create trigger dreams_invalidate_connections after update of matching_opt_in, deletion_requested_at, transcript or delete on public.dreams for each row execute function public.invalidate_connections();

create function public.get_synastry() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_user public.users%rowtype; v_date date; v_count int; v_themes jsonb; v_stats jsonb:='{"status":"insufficient_data"}';
  v_matches jsonb:='[]'; v_self uuid[]; v_other record; v_shared text[]; v_id uuid; v_score numeric;
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
revoke all on function public.get_synastry() from public,anon;
grant execute on function public.get_synastry() to authenticated;
