create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  locale text not null default 'tr' check (locale in ('tr', 'en')),
  timezone text not null default 'UTC',
  analytics_consent_at timestamptz,
  aggregate_consent_at timestamptz,
  matching_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dreams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text check (char_length(title) <= 160),
  transcript text check (char_length(transcript) between 1 and 20000),
  input_mode text not null check (input_mode in ('text', 'audio')),
  dream_date date not null,
  capture_timezone text not null default 'UTC',
  content_locale text not null default 'tr' check (content_locale in ('tr', 'en')),
  status text not null default 'draft' check (status in ('draft', 'processing', 'ready', 'failed')),
  neuroscience_interpretation text,
  jungian_interpretation text,
  astrological_interpretation text,
  astrology_context jsonb check (astrology_context is null or jsonb_typeof(astrology_context) = 'object'),
  image_prompt text,
  audio_path text unique,
  image_path text unique,
  error_code text,
  aggregate_opt_in boolean not null default false,
  matching_opt_in boolean not null default false,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint text_capture_requires_transcript check (input_mode <> 'text' or transcript is not null),
  constraint ready_requires_analysis check (status <> 'ready' or (
    transcript is not null and neuroscience_interpretation is not null
    and jungian_interpretation is not null and astrological_interpretation is not null
    and image_prompt is not null and processed_at is not null
  )),
  constraint audio_path_owner check (audio_path is null or audio_path like user_id::text || '/' || id::text || '/%'),
  constraint image_path_owner check (image_path is null or image_path like user_id::text || '/' || id::text || '/%')
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z]+(_[a-z]+)*$'),
  created_at timestamptz not null default now()
);

create table public.dream_tags (
  dream_id uuid not null references public.dreams(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete restrict,
  primary key (dream_id, tag_id)
);

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references public.users(id) on delete cascade,
  user_b_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'suggested' check (status in ('suggested', 'dismissed')),
  match_score numeric(5,4) not null check (match_score between 0 and 1),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint canonical_connection_pair check (user_a_id < user_b_id),
  unique (user_a_id, user_b_id)
);

create index dreams_owner_date_idx on public.dreams(user_id, dream_date desc, created_at desc);
create index dreams_aggregate_date_idx on public.dreams(dream_date, user_id)
  where aggregate_opt_in and status = 'ready';
create index dreams_matching_owner_idx on public.dreams(user_id, dream_date desc)
  where matching_opt_in and status = 'ready';
create index dream_tags_tag_dream_idx on public.dream_tags(tag_id, dream_id);
create index connections_user_b_idx on public.connections(user_b_id);

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at before update on public.users
  for each row execute function public.set_updated_at();
create trigger dreams_updated_at before update on public.dreams
  for each row execute function public.set_updated_at();
create trigger connections_updated_at before update on public.connections
  for each row execute function public.set_updated_at();

create function public.validate_timezone() returns trigger
language plpgsql set search_path = '' as $$
declare
  candidate text;
begin
  if tg_table_name = 'users' then candidate = new.timezone;
  else candidate = new.capture_timezone;
  end if;
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = candidate) then
    raise exception 'Invalid IANA timezone' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger users_validate_timezone before insert or update of timezone on public.users
  for each row execute function public.validate_timezone();
create trigger dreams_validate_timezone before insert or update of capture_timezone on public.dreams
  for each row execute function public.validate_timezone();

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.users (id) values (new.id);
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.validate_timezone() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.users enable row level security;
alter table public.dreams enable row level security;
alter table public.tags enable row level security;
alter table public.dream_tags enable row level security;
alter table public.connections enable row level security;

revoke all on table public.users, public.dreams, public.tags, public.dream_tags, public.connections
  from anon, authenticated;
grant select on public.users to authenticated;
grant update (locale, timezone, analytics_consent_at, aggregate_consent_at, matching_consent_at)
  on public.users to authenticated;
grant select, delete on public.dreams to authenticated;
grant insert (id, user_id, title, transcript, input_mode, dream_date, capture_timezone,
  content_locale, aggregate_opt_in, matching_opt_in) on public.dreams to authenticated;
grant update (title, dream_date, aggregate_opt_in, matching_opt_in) on public.dreams to authenticated;
grant select on public.tags, public.dream_tags to authenticated;
grant all on table public.users, public.dreams, public.tags, public.dream_tags, public.connections to service_role;

create policy users_select_own on public.users for select to authenticated
  using (id = (select auth.uid()));
create policy users_update_own on public.users for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy dreams_select_own on public.dreams for select to authenticated
  using (user_id = (select auth.uid()));
create policy dreams_insert_own on public.dreams for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy dreams_update_own on public.dreams for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy dreams_delete_own on public.dreams for delete to authenticated
  using (user_id = (select auth.uid()));
create policy tags_select_authenticated on public.tags for select to authenticated using (true);
create policy dream_tags_select_own on public.dream_tags for select to authenticated using (
  exists (select 1 from public.dreams d where d.id = dream_tags.dream_id and d.user_id = (select auth.uid()))
);
-- Connections intentionally have no client grants or policies.
-- Future endpoints must recheck both users' current consent before returning sanitized results.
