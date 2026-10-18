-- Dial-In: run this once in Supabase → SQL Editor → New query → Run.

create table if not exists public.beans (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id         text not null,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.settings (
  user_id    uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- Each person can only see and change their own rows.
alter table public.beans    enable row level security;
alter table public.settings enable row level security;

create policy "own beans"    on public.beans    for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own settings" on public.settings for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Live updates: a change on one device shows up on the others right away.
alter publication supabase_realtime add table public.beans;
