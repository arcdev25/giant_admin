-- Run once in Supabase: SQL Editor -> New query -> paste -> Run
-- (the private "applications" storage bucket for resumes/photos is created automatically by the app)
create table if not exists public.applications (
  id            uuid primary key default gen_random_uuid(),
  job_id        text,
  role          text not null default '',
  first_name    text not null default '',
  last_name     text not null default '',
  email         text not null default '',
  phone         text not null default '',
  location      text not null default '',
  linkedin      text not null default '',
  portfolio     text not null default '',
  experience    text not null default '',
  why_us        text not null default '',
  cover_letter  text not null default '',
  salary        text not null default '',
  start_date    text not null default '',
  referral      text not null default '',
  work_auth     text not null default '',
  resume_name   text,
  resume_path   text,
  photo_path    text,
  created_at    timestamptz not null default now()
);

alter table public.applications enable row level security;
