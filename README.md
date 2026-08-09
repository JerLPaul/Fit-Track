# Fit-Track

Fit-Track is a fitness app for tracking everyday nutrition. Search for foods,
build up meals from the results, and keep a running, per-user history of what
you've logged.

## Architecture

- **`react/`** — Next.js frontend. Handles the UI, and talks to Supabase
  directly for auth and data (food days).
- **`flask/`** — a thin stateless proxy in front of the FatSecret nutrition
  API, so the FatSecret client secret never reaches the browser. It holds no
  user data and has no database of its own.
- **Supabase** — owns authentication (email/password + Google OAuth) and
  storage for logged days. Schema and Row Level Security policies live in
  `supabase/schema.sql`.

Auth and app data used to be split across a custom (and insecure —
plaintext passwords) Flask/Postgres user system and a partially-wired
Supabase integration. That's been consolidated: **Supabase is now the only
source of truth for users and data.**

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql`. This creates the `Day`
   table and locks it down with Row Level Security so users can only ever
   read/write their own rows.
3. Under Authentication → Providers, enable Email and (optionally) Google.
4. Under Database → Replication, make sure the `Day` table is included so
   the live-updating view keeps working.
5. Grab your project's URL and anon key from Project Settings → API.

### 2. FatSecret API

Fit-Track uses the [FatSecret Platform API](https://platform.fatsecret.com/)
for nutrition lookups. Create an account and generate a client id/secret.

### 3. Environment variables

**`flask/.env`**
```
API_KEY=your_fatsecret_client_id
API_SECRET=your_fatsecret_client_secret
ALLOWED_ORIGINS=http://localhost:3000
```

**`react/.env.local`**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
FLASK_API_URL=http://localhost:5000
```

### 4. Run it

```bash
docker compose up --build
```

or run each service directly:

```bash
# Flask
cd flask && pip install -r requirements.txt && python application.py

# Next.js
cd react && npm install && npm run dev
```

The app is served at `http://localhost:3000`, the nutrition proxy at
`http://localhost:5000`.

## Notes

* The Flask server can have a 20-50s cold-start delay on free hosting tiers
  (e.g. Render) after periods of inactivity.
* Passwords are handled entirely by Supabase Auth — Fit-Track's own code
  never sees or stores a raw password.
