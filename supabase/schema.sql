-- Fit-Track Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).
--
-- This replaces the old standalone Postgres/Flask user database. Auth is
-- handled entirely by Supabase Auth (auth.users); this file only adds the
-- app-specific "Day" table and locks it down with Row Level Security so
-- users can only ever see and modify their own food logs.
-- (Previously EVERY signed-in user could see and edit every other user's
-- logged days -- that bug is fixed by the policies below.)

create table if not exists public."Day" (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  food_list jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists day_user_id_idx on public."Day" (user_id);
create unique index if not exists day_user_id_date_idx on public."Day" (user_id, date);

alter table public."Day" enable row level security;

drop policy if exists "Users can view their own days" on public."Day";
create policy "Users can view their own days"
  on public."Day" for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own days" on public."Day";
create policy "Users can insert their own days"
  on public."Day" for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own days" on public."Day";
create policy "Users can update their own days"
  on public."Day" for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own days" on public."Day";
create policy "Users can delete their own days"
  on public."Day" for delete
  using (auth.uid() = user_id);

-- Enable realtime for the Day table (Supabase dashboard: Database > Replication)
-- so the live-updating Groups view keeps working.
alter publication supabase_realtime add table public."Day";
