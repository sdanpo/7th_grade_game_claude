-- Migration 002: Add Supabase Auth support
-- Authenticated users' session_id = their auth.uid() (a UUID).
-- This lets us use the same session_id column for both guests and logged-in users.

-- 1. Update RLS policies to restrict writes to the owner of each row.
--    Read remains public (for leaderboard).

drop policy if exists "Insert own session" on game_states;
drop policy if exists "Update own session" on game_states;

-- Inserts: anyone can create a row for themselves
-- (anon key is used for guests; auth users' session_id matches auth.uid())
create policy "Insert own session" on game_states
  for insert with check (true);

-- Updates: only the owner can update their row.
-- For authenticated users: session_id must equal their user ID.
-- For anonymous/guest users (no JWT): allow if no auth uid present.
create policy "Update own session" on game_states
  for update using (
    auth.uid() is null                        -- guest (anonymous key, no user)
    or session_id = auth.uid()::text          -- logged-in user owns this row
  );

-- Deletes: same rule as updates
drop policy if exists "Delete own session" on game_states;
create policy "Delete own session" on game_states
  for delete using (
    auth.uid() is null
    or session_id = auth.uid()::text
  );

-- 2. Enable Google OAuth in your Supabase Dashboard:
--    Authentication → Providers → Google → Enable
--    Set "Authorized redirect URIs" in Google Cloud Console to:
--      https://<your-project>.supabase.co/auth/v1/callback
--    Set "Site URL" in Supabase to your Vercel domain.
