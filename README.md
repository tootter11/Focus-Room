# Focus Room

Gamified Pomodoro timer: finish a 25-minute session, earn 10 coins, spend them
in the shop, decorate your room. Works offline via localStorage; optionally
syncs to Supabase when a user logs in.

## V2 features (already built in)

- **Tasks** — a simple per-session to-do list (add, check off, delete), synced
  the same way as coins. The tab badge shows how many are still open.
- **Live presence** — "X people focusing right now", using Supabase Realtime
  presence (no video, no extra table — just a live count of active timers).
- **Daily stats** — a 7-day bar chart of focus minutes plus lifetime total,
  built from the new `sessions` table (login required).
- **Opt-in leaderboard** — top 10 by coins, only shows users who've toggled
  it on; off by default for privacy.
- **Daily goal** — set a target number of sessions per day with a progress
  bar on the Focus tab.
- **Streak multiplier** — completing a session on 5+ consecutive days doubles
  the coin reward (20 instead of 10) for as long as the streak holds.
- **Room themes** — `src/items.js` → `THEMES` defines unlockable room
  backgrounds (Cabin, Cyberpunk, Library). Add more by adding entries there.
- **Ambience** — a "rain sounds" toggle, generated procedurally with the Web
  Audio API (brown noise), so it needs no external audio file or hosting.
- **Feedback link** — footer link to a form for "what should I add next?".
  Update `FEEDBACK_URL` in `src/App.jsx` with your own Tally.so or Google
  Form link.

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in your Supabase project URL and
   anon key (Supabase dashboard → Settings → API).
3. `npm run dev`

The app works fully without Supabase configured — coins and unlocked items
just stay local to that browser instead of syncing across devices.

## Supabase setup

In the Supabase SQL editor, run:

```sql
create table user_profiles (
  id uuid references auth.users primary key,
  total_coins integer default 0,
  unlocked_items jsonb default '{}'::jsonb,
  username text,
  leaderboard_opt_in boolean default false
);

alter table user_profiles enable row level security;

create policy "Users can read own profile"
  on user_profiles for select using (auth.uid() = id);

create policy "Users can upsert own profile"
  on user_profiles for all using (auth.uid() = id);

create policy "Anyone can read opted-in profiles for the leaderboard"
  on user_profiles for select using (leaderboard_opt_in = true);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  completed_at timestamptz default now(),
  duration_minutes integer default 25
);

alter table sessions enable row level security;

create policy "Users can insert own sessions"
  on sessions for insert with check (auth.uid() = user_id);

create policy "Users can read own sessions"
  on sessions for select using (auth.uid() = user_id);
```

**Already have the table from before?** Run this instead to add the new
columns without losing existing data:

```sql
alter table user_profiles add column if not exists username text;
alter table user_profiles add column if not exists leaderboard_opt_in boolean default false;

create policy "Anyone can read opted-in profiles for the leaderboard"
  on user_profiles for select using (leaderboard_opt_in = true);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  completed_at timestamptz default now(),
  duration_minutes integer default 25
);

alter table sessions enable row level security;

create policy "Users can insert own sessions"
  on sessions for insert with check (auth.uid() = user_id);

create policy "Users can read own sessions"
  on sessions for select using (auth.uid() = user_id);
```

Realtime presence (the "X people focusing now" count) works out of the box —
no extra setup needed, it doesn't use a table.

Then in Authentication → Providers, enable GitHub (or swap `useAuth.js` to
`signInWithOtp` for email magic links) and set the redirect URL Supabase
gives you.

## Deploy

1. Push this folder to a GitHub repo:
   `git init && git add . && git commit -m "init" && git push`
2. On vercel.com → "Add New Project" → import the repo.
3. In the Vercel project's Environment Variables, add the same
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your `.env`.
4. Deploy — Vercel auto-detects the Vite project.

## Project structure

- `src/items.js` — the shop catalog (id, name, emoji, cost)
- `src/hooks/useFocusState.js` — timer, coins, unlock/place logic, local +
  Supabase persistence
- `src/hooks/useAuth.js` — Supabase auth session
- `src/components/Timer.jsx`, `Room.jsx`, `Shop.jsx` — UI
- `src/App.jsx` — wires it all together
