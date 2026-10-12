-- Grounded reports are owner-private, and journal data has no training/export path.
alter table public.dreams add column transcript_revision integer not null default 1 check(transcript_revision>0);
alter table public.dreams add column content_report jsonb;
alter table public.dreams add column journal jsonb;
create function public.bump_transcript_revision() returns trigger
language plpgsql set search_path='' as $$
begin
 if new.transcript is distinct from old.transcript then new.transcript_revision:=old.transcript_revision+1; new.content_report:=null; end if;
 return new;
end;$$;
revoke all on function public.bump_transcript_revision() from public,anon,authenticated;
create trigger dreams_transcript_revision before update of transcript on public.dreams for each row execute function public.bump_transcript_revision();
create or replace function public.save_dream_analysis(p_user uuid, p_id uuid, p_input jsonb, p_analysis jsonb, p_image text, p_audio text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_tag text; v_tag_id uuid;
begin
  perform 1 from public.users where id=p_user and deletion_requested_at is null for update;
  if not found then raise exception 'ACCOUNT_UNAVAILABLE'; end if;
  if exists(select 1 from public.dreams where id=p_id and (user_id<>p_user or deletion_requested_at is not null)) then raise exception 'NOT_FOUND'; end if;
  if jsonb_array_length(p_analysis->'tags') not between 0 and 6 then raise exception 'INVALID_TAGS'; end if;
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
  update public.dreams set content_report=case when p_analysis->'content_report' is not null and p_analysis->'content_report'<>'null'::jsonb
    then jsonb_set(p_analysis->'content_report','{revision}',to_jsonb(transcript_revision)) else null end where id=p_id and user_id=p_user;
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


create or replace function public.save_mock_dream(p_user uuid,p_id uuid,p_input jsonb,p_analysis jsonb,p_image text,p_audio text) returns uuid
language plpgsql security definer set search_path='' as $$
begin
 return public.save_dream_analysis(p_user,p_id,p_input||'{"analysisSource":"mock","astrologyContext":{"available":false,"mock":true}}'::jsonb,p_analysis,p_image,p_audio);
end;$$;

create function public.revise_dream(p_user uuid,p_id uuid,p_transcript text,p_revision integer) returns uuid
language plpgsql security definer set search_path='' as $$
declare v_row public.dreams%rowtype;
begin
 select d.* into v_row from public.dreams d join public.users u on u.id=d.user_id where d.id=p_id and d.user_id=p_user and d.deletion_requested_at is null and u.deletion_requested_at is null for update of d;
 if not found then raise exception 'NOT_FOUND';end if;
 if v_row.transcript_revision<>p_revision then raise exception 'REVISION_CONFLICT';end if;
 if char_length(trim(p_transcript)) not between 1 and 20000 then raise exception 'INVALID_TRANSCRIPT';end if;
 if v_row.transcript=trim(p_transcript) then return p_id;end if;
 if exists(select 1 from private.ai_jobs where dream_id=p_id and status='pending') then raise exception 'BUSY';end if;
 update public.dreams set transcript=trim(p_transcript),title=left(trim(p_transcript),100),status='draft',
 content_report=null,neuroscience_interpretation=null,jungian_interpretation=null,astrological_interpretation=null,
 image_path=null,image_prompt=null,astrology_context=null,processed_at=null,error_code=null,
 aggregate_opt_in=false,matching_opt_in=false where id=p_id;
 delete from public.dream_tags where dream_id=p_id;
 -- Failed jobs from an earlier transcript must never resume over the new revision.
 update private.ai_jobs set input='{}',state='{"errorCode":"REVISION_CHANGED"}'::jsonb,status='failed' where dream_id=p_id and status<>'completed';
 return p_id;
end;$$;
create function public.save_dream_journal(p_user uuid,p_id uuid,p_journal jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
begin
 if p_journal is not null and (jsonb_typeof(p_journal)<>'object' or not (p_journal ?& array['sleepHours','sleepQuality','stressBeforeSleep','dreamEmotion','wakingMood','recurring','sleepDate','timezone','capturedAt']) or (select count(*) from jsonb_object_keys(p_journal))<>9) then raise exception 'INVALID_JOURNAL';end if;
 update public.dreams d set journal=p_journal where d.id=p_id and d.user_id=p_user and d.deletion_requested_at is null and exists(select 1 from public.users u where u.id=p_user and u.deletion_requested_at is null);
 if not found then raise exception 'NOT_FOUND';end if;
 return p_id;
end;$$;
create function public.review_dream_observation(p_user uuid,p_id uuid,p_index integer,p_rejected boolean,p_revision integer) returns uuid
language plpgsql security definer set search_path='' as $$
declare v_row public.dreams%rowtype;v_tag text;v_tag_id uuid;
begin
 select d.* into v_row from public.dreams d join public.users u on u.id=d.user_id where d.id=p_id and d.user_id=p_user and d.deletion_requested_at is null and u.deletion_requested_at is null for update of d;
 if not found then raise exception 'NOT_FOUND';end if;
 if v_row.transcript_revision<>p_revision or (v_row.content_report->>'revision')::int is distinct from p_revision then raise exception 'REVISION_CONFLICT';end if;
 if p_index<0 or p_index>=coalesce(jsonb_array_length(v_row.content_report->'observations'),0) then raise exception 'INVALID_OBSERVATION';end if;
 update public.dreams set content_report=jsonb_set(content_report,array['observations',p_index::text,'rejected'],to_jsonb(p_rejected)),aggregate_opt_in=false,matching_opt_in=false where id=p_id returning * into v_row;
 delete from public.dream_tags where dream_id=p_id;
 for v_tag in select distinct o->>'tag' from jsonb_array_elements(v_row.content_report->'observations') o where o->>'rejected'='false' and o->>'polarity'='positive' and o->>'literal'='true' and o->>'context'='dream' and o->>'experiencer'='narrator' order by 1 limit 6 loop
   insert into public.tags(slug) values(v_tag) on conflict(slug) do update set slug=excluded.slug returning id into v_tag_id;
   insert into public.dream_tags values(p_id,v_tag_id);
 end loop;
 return p_id;
end;$$;
revoke all on function public.revise_dream(uuid,uuid,text,integer),public.save_dream_journal(uuid,uuid,jsonb),public.review_dream_observation(uuid,uuid,integer,boolean,integer) from public,anon,authenticated;
grant execute on function public.revise_dream(uuid,uuid,text,integer),public.save_dream_journal(uuid,uuid,jsonb),public.review_dream_observation(uuid,uuid,integer,boolean,integer) to service_role;
