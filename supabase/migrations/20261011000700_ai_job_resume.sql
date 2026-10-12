create function public.ai_get_dream_job(p_user uuid,p_dream uuid) returns jsonb
language sql security definer set search_path='' as $$
 select to_jsonb(j) from private.ai_jobs j join public.users u on u.id=j.user_id join public.dreams d on d.id=j.dream_id where j.dream_id=p_dream and j.user_id=p_user and u.deletion_requested_at is null and d.deletion_requested_at is null order by j.created_at desc,j.id desc limit 1;
$$;
revoke all on function public.ai_get_dream_job(uuid,uuid) from public,anon,authenticated;
grant execute on function public.ai_get_dream_job(uuid,uuid) to service_role;
-- A completed save and its job receipt are committed together, including on retries.
create or replace function public.ai_finish_job(p_user uuid,p_job uuid,p_error text default null) returns void
language plpgsql security definer set search_path='' as $$
declare v_dream uuid;
begin
 if p_error is null then
  update private.ai_jobs set status='completed',input='{}',state='{"completed":true}',updated_at=now() where id=p_job and user_id=p_user returning dream_id into v_dream;
 else
  update private.ai_jobs set status='failed',state=state||jsonb_build_object('errorCode',p_error),updated_at=now() where id=p_job and user_id=p_user and status<>'completed' returning dream_id into v_dream;
  update public.dreams set status='failed',error_code=p_error where id=v_dream and user_id=p_user and status<>'ready' and deletion_requested_at is null;
 end if;
end;$$;
