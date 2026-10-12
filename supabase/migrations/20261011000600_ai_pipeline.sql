alter table public.dreams add column analysis_source text not null default 'mock' check(analysis_source in ('mock','live'));
create table private.ai_jobs (
 id uuid primary key,
 dream_id uuid not null references public.dreams(id) on delete cascade,
 user_id uuid not null references public.users(id) on delete cascade,
 input_digest text not null check(input_digest ~ '^[a-f0-9]{64}$'),
 input jsonb not null,
 state jsonb not null default '{}',
 status text not null default 'pending' check(status in ('pending','failed','completed')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table private.ai_daily_budget(day date primary key, reserved_micros bigint not null default 0);
create table private.ai_user_usage(user_id uuid references public.users(id) on delete cascade,day date not null, jobs int not null default 0,last_started_at timestamptz,primary key(user_id,day));
revoke all on private.ai_jobs,private.ai_daily_budget,private.ai_user_usage from public,anon,authenticated;

create function public.ai_reserve_job(p_user uuid,p_job uuid,p_dream uuid,p_digest text,p_input jsonb,p_user_limit int,p_budget_micros bigint) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_job private.ai_jobs%rowtype;v_day date:=(now() at time zone 'UTC')::date;v_usage private.ai_user_usage%rowtype;v_spent bigint;
begin
 select * into v_job from private.ai_jobs where id=p_job;
 if found then
  if v_job.user_id<>p_user or v_job.dream_id<>p_dream or v_job.input_digest<>p_digest then raise exception 'IDEMPOTENCY_CONFLICT';end if;
  return to_jsonb(v_job);
 end if;
 perform 1 from public.users where id=p_user and deletion_requested_at is null for update;
 if not found then raise exception 'ACCOUNT_UNAVAILABLE';end if;
 if exists(select 1 from public.dreams where id=p_dream and (user_id<>p_user or deletion_requested_at is not null)) then raise exception 'NOT_FOUND';end if;
 insert into private.ai_daily_budget(day) values(v_day) on conflict do nothing;
 select reserved_micros into v_spent from private.ai_daily_budget where day=v_day for update;
 insert into private.ai_user_usage(user_id,day) values(p_user,v_day) on conflict do nothing;
 select * into v_usage from private.ai_user_usage where user_id=p_user and day=v_day for update;
 if v_usage.jobs>=least(greatest(p_user_limit,1),10) or v_usage.last_started_at>now()-interval '1 minute' then raise exception 'RATE_LIMITED';end if;
 -- Reserve a conservative ceiling for up to two Whisper/GPT attempts and one image submission.
 if v_spent+100000>least(greatest(p_budget_micros,0),10000000) then raise exception 'BUDGET_EXCEEDED';end if;
 update private.ai_daily_budget set reserved_micros=reserved_micros+100000 where day=v_day;
 update private.ai_user_usage set jobs=jobs+1,last_started_at=now() where user_id=p_user and day=v_day;
 insert into public.dreams(id,user_id,title,transcript,input_mode,dream_date,capture_timezone,content_locale,status,analysis_source)
 values(p_dream,p_user,coalesce(nullif(left(p_input->>'transcript',100),''),case when p_input->>'locale'='en' then 'Voice dream' else 'Sesli rüya' end),nullif(p_input->>'transcript',''),p_input->>'inputMode',(p_input->>'dreamDate')::date,p_input->>'timezone',p_input->>'locale','processing','live')
 on conflict(id) do update set status='processing',error_code=null,aggregate_opt_in=false,matching_opt_in=false;
 insert into private.ai_jobs(id,dream_id,user_id,input_digest,input) values(p_job,p_dream,p_user,p_digest,p_input) returning * into v_job;
 delete from private.ai_daily_budget where day<v_day-7;
 delete from private.ai_user_usage where day<v_day-7;
 return to_jsonb(v_job);
end;$$;
create function public.ai_get_job(p_user uuid,p_job uuid) returns jsonb
language sql security definer set search_path='' as $$
 select to_jsonb(j) from private.ai_jobs j join public.users u on u.id=j.user_id where j.id=p_job and j.user_id=p_user and u.deletion_requested_at is null;
$$;
create function public.ai_patch_job(p_user uuid,p_job uuid,p_patch jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_job private.ai_jobs%rowtype;
begin
 update private.ai_jobs set state=state||p_patch,updated_at=now(),status='pending' where id=p_job and user_id=p_user and status<>'completed' returning * into v_job;
 if not found then raise exception 'NOT_FOUND';end if;
 return to_jsonb(v_job);
end;$$;
create function public.ai_attempt(p_user uuid,p_job uuid,p_stage text) returns int
language plpgsql security definer set search_path='' as $$
declare v_count int;v_limit int;
begin
 if p_stage not in ('whisper','interpret','image') then raise exception 'INVALID_STAGE';end if;
 v_limit:=case when p_stage='image' then 1 else 2 end;
 select coalesce((state->>(p_stage||'_attempts'))::int,0) into v_count from private.ai_jobs where id=p_job and user_id=p_user and status<>'completed' for update;
 if not found then raise exception 'NOT_FOUND';end if;
 if v_count>=v_limit then raise exception 'ATTEMPTS_EXHAUSTED';end if;
 update private.ai_jobs set state=jsonb_set(state,array[p_stage||'_attempts'],to_jsonb(v_count+1)),updated_at=now() where id=p_job;
 return v_count+1;
end;$$;
create function public.ai_finish_job(p_user uuid,p_job uuid,p_error text default null) returns void
language plpgsql security definer set search_path='' as $$
declare v_dream uuid;
begin
 if p_error is null then
  update private.ai_jobs set status='completed',input='{}',state='{"completed":true}',updated_at=now() where id=p_job and user_id=p_user returning dream_id into v_dream;
 else
  update private.ai_jobs set status='failed',state=state||jsonb_build_object('errorCode',p_error),updated_at=now() where id=p_job and user_id=p_user returning dream_id into v_dream;
  update public.dreams set status='failed',error_code=p_error where id=v_dream and user_id=p_user and deletion_requested_at is null;
 end if;
end;$$;
revoke all on function public.ai_reserve_job(uuid,uuid,uuid,text,jsonb,int,bigint),public.ai_get_job(uuid,uuid),public.ai_patch_job(uuid,uuid,jsonb),public.ai_attempt(uuid,uuid,text),public.ai_finish_job(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.ai_reserve_job(uuid,uuid,uuid,text,jsonb,int,bigint),public.ai_get_job(uuid,uuid),public.ai_patch_job(uuid,uuid,jsonb),public.ai_attempt(uuid,uuid,text),public.ai_finish_job(uuid,uuid,text) to service_role;

create function public.save_dream_analysis(p_user uuid, p_id uuid, p_input jsonb, p_analysis jsonb, p_image text, p_audio text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_tag text; v_tag_id uuid;
begin
  perform 1 from public.users where id=p_user and deletion_requested_at is null for update;
  if not found then raise exception 'ACCOUNT_UNAVAILABLE'; end if;
  if exists(select 1 from public.dreams where id=p_id and (user_id<>p_user or deletion_requested_at is not null)) then raise exception 'NOT_FOUND'; end if;
  if jsonb_array_length(p_analysis->'tags') not between 3 and 6 then raise exception 'INVALID_TAGS'; end if;
  insert into public.dreams(id,user_id,title,transcript,input_mode,dream_date,capture_timezone,content_locale,status,
    neuroscience_interpretation,jungian_interpretation,astrological_interpretation,astrology_context,image_prompt,image_path,audio_path,processed_at,analysis_source)
  values(p_id,p_user,left(p_input->>'transcript',100),p_input->>'transcript',p_input->>'inputMode',
    (p_input->>'dreamDate')::date,p_input->>'timezone',p_input->>'locale','ready',
    p_analysis#>>'{interpretations,neuroscience}',p_analysis#>>'{interpretations,jungian}',p_analysis#>>'{interpretations,astrological}',
    coalesce(p_input->'astrologyContext','{"available":false,"mock":true}'::jsonb),p_analysis->>'image_prompt',p_image,p_audio,now(),coalesce(p_input->>'analysisSource','mock'))
  on conflict(id) do update set transcript=excluded.transcript,title=excluded.title,status='ready',
    neuroscience_interpretation=excluded.neuroscience_interpretation,jungian_interpretation=excluded.jungian_interpretation,
    astrological_interpretation=excluded.astrological_interpretation,astrology_context=excluded.astrology_context,
    image_prompt=excluded.image_prompt,image_path=excluded.image_path,audio_path=excluded.audio_path,
    analysis_source=excluded.analysis_source,processed_at=now(),aggregate_opt_in=false,matching_opt_in=false;
  delete from public.dream_tags where dream_id=p_id;
  for v_tag in select distinct value from jsonb_array_elements_text(p_analysis->'tags') loop
    if v_tag !~ '^[a-z]+(_[a-z]+)*$' then raise exception 'INVALID_TAGS'; end if;
    insert into public.tags(slug) values(v_tag) on conflict(slug) do update set slug=excluded.slug returning id into v_tag_id;
    insert into public.dream_tags values(p_id,v_tag_id);
  end loop;
  return p_id;
end; $$;
revoke all on function public.save_dream_analysis(uuid,uuid,jsonb,jsonb,text,text) from public,anon,authenticated;
grant execute on function public.save_dream_analysis(uuid,uuid,jsonb,jsonb,text,text) to service_role;
