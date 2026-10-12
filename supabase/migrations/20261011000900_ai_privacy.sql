alter table public.dreams add column ai_processing_consent_at timestamptz;
-- A one-day retry window limits duplicated sensitive job payloads. Cleanup is also run
-- on authenticated capabilities requests; account/dream deletion cascades immediately.
create function public.ai_prune_jobs() returns void language plpgsql security definer set search_path='' as $$
begin
 update public.dreams d set status='failed',error_code='JOB_EXPIRED' where d.status='processing' and exists(select 1 from private.ai_jobs j where j.dream_id=d.id and j.created_at<now()-interval '1 day' and j.status<>'completed');
 update private.ai_jobs set input='{}',state='{"errorCode":"JOB_EXPIRED"}',status='failed' where created_at<now()-interval '1 day' and status<>'completed' and input<>'{}';
end;$$;
revoke all on function public.ai_prune_jobs() from public,anon,authenticated;
grant execute on function public.ai_prune_jobs() to service_role;
create or replace function public.ai_patch_job(p_user uuid,p_job uuid,p_patch jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_job private.ai_jobs%rowtype;
begin
 update private.ai_jobs set state=state||p_patch,
 input=case when p_patch->>'audioPath' is not null then input-'audio' else input end,
 updated_at=now(),status='pending' where id=p_job and user_id=p_user and status<>'completed' returning * into v_job;
 if not found then raise exception 'NOT_FOUND';end if;
 return to_jsonb(v_job);
end;$$;
create or replace function public.save_ai_dream(p_user uuid,p_job uuid,p_id uuid,p_input jsonb,p_analysis jsonb,p_image text,p_audio text) returns uuid
language plpgsql security definer set search_path='' as $$
begin
 perform 1 from private.ai_jobs where id=p_job and dream_id=p_id and user_id=p_user for update;
 if not found then raise exception 'NOT_FOUND';end if;
 perform public.save_dream_analysis(p_user,p_id,p_input,p_analysis,p_image,p_audio);
 update public.dreams set ai_processing_consent_at=now(),error_code=null,input_mode=p_input->>'inputMode',content_locale=p_input->>'locale',capture_timezone=p_input->>'timezone',dream_date=(p_input->>'dreamDate')::date where id=p_id and user_id=p_user;
 perform public.ai_finish_job(p_user,p_job,null);
 return p_id;
end;$$;
