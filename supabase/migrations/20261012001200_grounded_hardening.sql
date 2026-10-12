alter table public.dreams add column event_confirmed boolean not null default false;
create or replace function public.bump_transcript_revision() returns trigger
language plpgsql set search_path='' as $$
begin
 if new.transcript is distinct from old.transcript then
   new.transcript_revision:=old.transcript_revision+1; new.content_report:=null; new.event_confirmed:=false;
 end if;
 if new.dream_date is distinct from old.dream_date then new.event_confirmed:=false;end if;
 return new;
end;$$;
drop trigger dreams_transcript_revision on public.dreams;
create trigger dreams_transcript_revision before update of transcript,dream_date on public.dreams for each row execute function public.bump_transcript_revision();
create function public.confirm_dream_event(p_user uuid,p_id uuid,p_revision integer) returns uuid
language plpgsql security definer set search_path='' as $$
begin
 update public.dreams d set event_confirmed=true where d.id=p_id and d.user_id=p_user and d.deletion_requested_at is null and d.transcript_revision=p_revision and exists(select 1 from public.users where id=p_user and deletion_requested_at is null);
 if not found then raise exception 'REVISION_CONFLICT';end if;
 return p_id;
end;$$;
revoke all on function public.confirm_dream_event(uuid,uuid,integer) from public,anon,authenticated;
grant execute on function public.confirm_dream_event(uuid,uuid,integer) to service_role;
-- A job can only commit to the transcript revision against which it was reserved.
create or replace function public.save_ai_dream(p_user uuid,p_job uuid,p_id uuid,p_input jsonb,p_analysis jsonb,p_image text,p_audio text) returns uuid
language plpgsql security definer set search_path='' as $$
declare v_revision integer;
begin
 perform 1 from private.ai_jobs where id=p_job and dream_id=p_id and user_id=p_user for update;
 if not found then raise exception 'NOT_FOUND';end if;
 select transcript_revision into v_revision from public.dreams where id=p_id and user_id=p_user and deletion_requested_at is null for update;
 if not found then raise exception 'NOT_FOUND';end if;
 if p_input ? 'expectedRevision' and (p_input->>'expectedRevision')::integer is distinct from v_revision then raise exception 'REVISION_CONFLICT';end if;
 perform public.save_dream_analysis(p_user,p_id,p_input,p_analysis,p_image,p_audio);
 update public.dreams set ai_processing_consent_at=now(),error_code=null,input_mode=p_input->>'inputMode',content_locale=p_input->>'locale',capture_timezone=p_input->>'timezone',dream_date=(p_input->>'dreamDate')::date where id=p_id and user_id=p_user;
 perform public.ai_finish_job(p_user,p_job,null);
 return p_id;
end;$$;
