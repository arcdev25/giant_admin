-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run
create table if not exists public.jobs (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  dept             text not null default 'Engineering',
  location         text not null default 'Remote',
  type             text not null default 'Full-time',
  about_us         text not null default '',
  about_role       text not null default '',
  responsibilities text[] not null default '{}',   -- What you'll do
  requirements     text[] not null default '{}',   -- What we're looking for
  nice_to_have     text[] not null default '{}',   -- Nice to have
  benefits         text[] not null default '{}',   -- What we offer
  is_active        boolean not null default true,  -- Enable / disable
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Only the server (service role key) touches this table; block direct public access.
alter table public.jobs enable row level security;
