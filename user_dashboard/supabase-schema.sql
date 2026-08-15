-- Run this once in your Supabase project's SQL Editor (Supabase dashboard ->
-- SQL Editor -> New query -> paste this whole file -> Run).

create table if not exists game_sessions (
  room_code   text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

-- Keep updated_at fresh on every write
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists game_sessions_set_updated_at on game_sessions;
create trigger game_sessions_set_updated_at
  before update on game_sessions
  for each row execute function set_updated_at();

-- Row Level Security: this app has no login system (players just enter a
-- name + room code), so we allow anyone with the anon key to read/write.
-- That's fine for a private party game, but note it means anyone who knows
-- (or guesses) a room code can read/edit that room's data.
alter table game_sessions enable row level security;

drop policy if exists "Allow anon read" on game_sessions;
create policy "Allow anon read" on game_sessions
  for select using (true);

drop policy if exists "Allow anon insert" on game_sessions;
create policy "Allow anon insert" on game_sessions
  for insert with check (true);

drop policy if exists "Allow anon update" on game_sessions;
create policy "Allow anon update" on game_sessions
  for update using (true);

drop policy if exists "Allow anon delete" on game_sessions;
create policy "Allow anon delete" on game_sessions
  for delete using (true);

-- Enable Realtime (live sync) on this table
alter publication supabase_realtime add table game_sessions;
