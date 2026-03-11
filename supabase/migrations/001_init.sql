-- MathQuest game state table
-- Each row represents one anonymous browser session identified by session_id (UUID).

create table if not exists game_states (
  id              uuid primary key default gen_random_uuid(),
  session_id      text unique not null,
  player_name     text        not null default '',
  coins           integer     not null default 50,
  total_coins     integer     not null default 50,
  xp              integer     not null default 0,
  level           integer     not null default 1,
  streak          integer     not null default 0,
  last_play_date  text        not null default '',
  solved_puzzles  text[]      not null default '{}',
  unlocked_rooms  text[]      not null default '{"ancient-library","pharaoh-tomb"}',
  purchased_rewards text[]    not null default '{}',
  achievements    text[]      not null default '{}',
  avatar          text        not null default '🧠',
  total_solved    integer     not null default 0,
  perfect_solves  integer     not null default 0,
  daily_challenge_completed boolean not null default false,
  last_daily_date text        not null default '',
  updated_at      timestamptz not null default now()
);

-- Index for leaderboard queries
create index if not exists game_states_total_coins_idx on game_states (total_coins desc);
create index if not exists game_states_level_idx       on game_states (level desc);

-- Row Level Security: allow anonymous access keyed by session_id.
-- In production you'd tighten this with Supabase Auth.
alter table game_states enable row level security;

create policy "Public read" on game_states
  for select using (true);

create policy "Insert own session" on game_states
  for insert with check (true);

create policy "Update own session" on game_states
  for update using (true);

-- Leaderboard view (top 50 by total coins, public names only)
create or replace view leaderboard as
  select
    player_name,
    total_coins,
    level,
    total_solved,
    streak,
    avatar,
    updated_at
  from game_states
  where player_name <> ''
  order by total_coins desc
  limit 50;
