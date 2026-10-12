create index ai_jobs_dream_created on private.ai_jobs(dream_id,created_at desc);
create function public.save_ai_dream(p_user uuid,p_job uuid,p_id uuid,p_input jsonb,p_analysis jsonb,p_image text,p_audio text) returns uuid
language plpgsql security definer set search_path='' as $$
begin
 perform 1 from private.ai_jobs where id=p_job and dream_id=p_id and user_id=p_user for update;
 if not found then raise exception 'NOT_FOUND';end if;
 perform public.save_dream_analysis(p_user,p_id,p_input,p_analysis,p_image,p_audio);
 perform public.ai_finish_job(p_user,p_job,null);
 return p_id;
end;$$;
revoke all on function public.save_ai_dream(uuid,uuid,uuid,jsonb,jsonb,text,text) from public,anon,authenticated;
grant execute on function public.save_ai_dream(uuid,uuid,uuid,jsonb,jsonb,text,text) to service_role;
