# Focus Room

Gamified Pomodoro timer: finish a 25-minute session, earn 10 coins, spend them
in the shop, decorate your room. Works offline via localStorage; optionally
syncs to Supabase when a user logs in.

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
  unlocked_items jsonb default '{}'::jsonb
);

alter table user_profiles enable row level security;

create policy "Users can read own profile"
  on user_profiles for select using (auth.uid() = id);

create policy "Users can upsert own profile"
  on user_profiles for all using (auth.uid() = id);
```

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
