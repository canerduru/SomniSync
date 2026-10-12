-- Keep ownership checks explicit in procedural lookup functions.
create or replace function public.ai_get_job(p_user uuid,p_job uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_job jsonb;
begin
 select to_jsonb(j) into v_job from private.ai_jobs j join public.users u on u.id=j.user_id where j.id=p_job and j.user_id=p_user and u.deletion_requested_at is null;
 return v_job;
end;$$;
create or replace function public.ai_get_dream_job(p_user uuid,p_dream uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_job jsonb;
begin
 select to_jsonb(j) into v_job from private.ai_jobs j join public.users u on u.id=j.user_id join public.dreams d on d.id=j.dream_id where j.dream_id=p_dream and j.user_id=p_user and u.deletion_requested_at is null and d.deletion_requested_at is null order by j.created_at desc,j.id desc limit 1;
 return v_job;
end;$$;
