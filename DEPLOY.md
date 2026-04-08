# Deploy: Vercel (frontend) + Supabase (database)

## Load CSV data into Supabase

See **[SEEDING.md](SEEDING.md)** — copy `.env.example` to `.env` in the repo root, add your Supabase connection string and JWT key, then run `dotnet run` from `backend/HavenLightApi` once.

---

## Supabase (PostgreSQL)

1. Create a project at [supabase.com](https://supabase.com).
2. **Project Settings → API:** copy **Project URL** and **anon public** key into `frontend/.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `frontend/.env.example`).
3. **Project Settings → Database:** copy the **connection string** (or host + password). Use the **database password** you chose for the project (not the anon key) in `ConnectionStrings__DefaultConnection` for the .NET API — see `backend/HavenLightApi/env.example`.
4. Run EF migrations against that database from your machine (or your CI) so tables exist before the API runs.

The .NET app talks to Postgres with **Npgsql**; you do not have to use the Supabase JS client unless you add features that need it (Auth hosted by Supabase, Realtime, Storage).

### Row Level Security (RLS)

Migrations under [`supabase/migrations/`](supabase/migrations/) turn on RLS for every table in schema `public`, which blocks accidental exposure via the Supabase Data API (`anon` / `authenticated`) until you add explicit policies. The .NET API normally connects as the owning database user and keeps working. See **[supabase/README.md](supabase/README.md)** for `npx supabase db push` commands.

---

## Vercel (React / Vite frontend only)

Vercel hosts the **static build** of the React app. Your **ASP.NET API** is not deployed on Vercel by this repo; deploy the API to **Azure App Service**, **Railway**, **Render**, etc., then point the frontend at it.

1. Push the repo to GitHub.
2. In Vercel: **Add New → Project** → import the repo.
3. Set **Root Directory** to `frontend` (important).
4. Framework: Vite (auto-detected). Build: `npm run build`. Output: `dist`.
5. **Environment Variables** (Production — same names as `frontend/.env.example`):
   - `VITE_API_URL` — your deployed API base URL, e.g. `https://your-api.azurewebsites.net/api`
   - `VITE_SUPABASE_URL` — optional unless you use Supabase in the browser
   - `VITE_SUPABASE_ANON_KEY` — optional unless you use Supabase in the browser
6. Deploy. After the API has a public HTTPS URL, update `VITE_API_URL` and redeploy the frontend if needed.

### Client-side routing

`frontend/vercel.json` rewrites non-asset paths to `index.html` so React Router works on refresh.

### CORS

Your API must allow your Vercel origin, e.g. `https://your-app.vercel.app`, in `Program.cs` (`AddCors` / `WithOrigins`).

---

## Quick local check

- Frontend: `cd frontend && copy .env.example .env.local` → edit values → `npm run dev`
- API: set `ConnectionStrings__DefaultConnection` (user-secrets or env) → run from `backend/HavenLightApi`
