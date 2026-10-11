-- SomniSync Initial Database Schema & RLS Migrations
-- Phase 1: Foundation
-- Target: PostgreSQL / Supabase with Row Level Security

create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users)
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    anonymous_tag text not null default 'Dreamer #' || substr(md5(random()::text), 1, 6),
    preferred_language text not null default 'tr',
    allow_synastry boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 2. DREAMS (Strictly private by default)
create table if not exists public.dreams (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    raw_transcript text not null,
    audio_url text,
    image_url text,
    image_prompt text,
    interpretations jsonb not null default '{
      "neuroscience": "",
      "jungian": "",
      "astrological": ""
    }'::jsonb,
    is_private boolean not null default true,
    allow_anonymous_synastry boolean not null default false,
    recorded_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 3. TAGS (Normalized theme tags)
create table if not exists public.tags (
    id uuid primary key default uuid_generate_v4(),
    slug text unique not null,
    label_tr text not null,
    label_en text not null,
    usage_count integer not null default 1,
    created_at timestamptz not null default now()
);

-- 4. DREAM_TAGS (Junction table)
create table if not exists public.dream_tags (
    dream_id uuid not null references public.dreams(id) on delete cascade,
    tag_id uuid not null references public.tags(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (dream_id, tag_id)
);

-- 5. SYNASTRY_CONNECTIONS (Anonymous matching based on shared dream archetypes)
create table if not exists public.synastry_connections (
    id uuid primary key default uuid_generate_v4(),
    user_a uuid not null references public.profiles(id) on delete cascade,
    user_b uuid not null references public.profiles(id) on delete cascade,
    dream_a_id uuid not null references public.dreams(id) on delete cascade,
    dream_b_id uuid not null references public.dreams(id) on delete cascade,
    resonance_score real not null check (resonance_score >= 0.0 and resonance_score <= 1.0),
    shared_tags text[] not null default '{}',
    status text not null default 'pending' check (status in ('pending', 'acknowledged', 'dismissed')),
    created_at timestamptz not null default now(),
    constraint unique_synastry_pair unique(user_a, user_b, dream_a_id, dream_b_id)
);

-- Indexes for optimal lookup performance
create index if not exists idx_dreams_user_id on public.dreams(user_id);
create index if not exists idx_dreams_recorded_at on public.dreams(recorded_at desc);
create index if not exists idx_dreams_allow_synastry on public.dreams(allow_anonymous_synastry) where allow_anonymous_synastry = true;
create index if not exists idx_dream_tags_tag_id on public.dream_tags(tag_id);
create index if not exists idx_tags_slug on public.tags(slug);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.dreams enable row level security;
alter table public.tags enable row level security;
alter table public.dream_tags enable row level security;
alter table public.synastry_connections enable row level security;

-- PROFILES RLS
create policy "Users can view own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- DREAMS RLS
create policy "Users can view own dreams"
    on public.dreams for select
    using (auth.uid() = user_id);

create policy "Users can insert own dreams"
    on public.dreams for insert
    with check (auth.uid() = user_id);

create policy "Users can update own dreams"
    on public.dreams for update
    using (auth.uid() = user_id);

create policy "Users can delete own dreams"
    on public.dreams for delete
    using (auth.uid() = user_id);

-- TAGS RLS (Tags are readable globally)
create policy "Authenticated users can read tags"
    on public.tags for select
    to authenticated
    using (true);

-- DREAM_TAGS RLS
create policy "Users can view their own dream tags"
    on public.dream_tags for select
    using (
        exists (
            select 1 from public.dreams
            where dreams.id = dream_tags.dream_id
            and dreams.user_id = auth.uid()
        )
    );

create policy "Users can insert their own dream tags"
    on public.dream_tags for insert
    with check (
        exists (
            select 1 from public.dreams
            where dreams.id = dream_tags.dream_id
            and dreams.user_id = auth.uid()
        )
    );

-- SYNASTRY_CONNECTIONS RLS
create policy "Users can view synastry involving them"
    on public.synastry_connections for select
    using (auth.uid() = user_a or auth.uid() = user_b);

create policy "Users can update synastry status"
    on public.synastry_connections for update
    using (auth.uid() = user_b or auth.uid() = user_a);

-- Aggregate RPC function (Cold-start protected, real mathematical ratios)
create or replace function public.get_collective_synastry_stats(time_window_hours int default 24)
returns table (
    tag_name text,
    percentage real,
    dream_count bigint
) language sql security definer as $$
    with eligible_dreams as (
        select count(distinct d.id) as total_count
        from public.dreams d
        where d.allow_anonymous_synastry = true
          and d.recorded_at >= now() - (time_window_hours || ' hours')::interval
    ),
    tag_counts as (
        select t.slug as tag_slug, count(dt.dream_id) as dream_ct
        from public.dream_tags dt
        join public.dreams d on d.id = dt.dream_id
        join public.tags t on t.id = dt.tag_id
        where d.allow_anonymous_synastry = true
          and d.recorded_at >= now() - (time_window_hours || ' hours')::interval
        group by t.slug
    )
    select 
        tc.tag_slug as tag_name,
        case 
            when ed.total_count > 0 then round(((tc.dream_ct::numeric / ed.total_count::numeric) * 100), 1)::real
            else 0.0::real
        end as percentage,
        tc.dream_ct as dream_count
    from tag_counts tc, eligible_dreams ed
    order by tc.dream_ct desc
    limit 10;
$$;
