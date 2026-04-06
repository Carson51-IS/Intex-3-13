# Seed Supabase with `lighthouse_csv_v7`

## JWT vs database (common confusion)

- **`ConnectionStrings__DefaultConnection`** — PostgreSQL (Supabase). Used for **all data** and **migrations**. If you see `password authentication failed for user "postgres"`, that is **only** the DB password — **not JWT**.
- **`Jwt__Key` (and Issuer/Audience)** — Used **only** to sign login tokens **after** the app is running and users log in. It is **not** used when connecting to Postgres.

Put both in repo-root `.env` for local runs. The error `28P01` / `password authentication failed` always means fix the **Postgres** connection string (host, user, **database password**).

## Troubleshooting connection errors

### Still connecting to `localhost` / `havenlight_dev`

An old **`ConnectionStrings__DefaultConnection`** may be set in **Windows environment variables** or left over from earlier runs. DotNetEnv is configured to **overwrite** those with your repo-root `.env`.

1. In PowerShell, clear it for this session, then run again:

   ```powershell
   Remove-Item Env:\ConnectionStrings__DefaultConnection -ErrorAction SilentlyContinue
   cd path\to\Intex\backend\HavenLightApi
   dotnet run
   ```

2. On startup you should see a log line like: **`[HavenLightApi] Database host: db.xxxxx.supabase.co`** — if it still says `localhost`, search **System Properties → Environment Variables** for `ConnectionStrings` and remove the bad entry.

### `SocketException (11004)` / “The requested name is valid, but no data of the requested type was found”

That is **DNS** — your PC could not resolve the Supabase hostname (or IPv4/IPv6 mismatch). Try:

1. In PowerShell: `nslookup db.YOUR_PROJECT_REF.supabase.co` — if it fails, fix DNS (try another network, turn off VPN, or set DNS to `8.8.8.8`).

2. In **Supabase → Project Settings → Database**, copy the **Session pooler** or **Transaction pooler** connection string (different host, often `*.pooler.supabase.com`). Use that full string as `ConnectionStrings__DefaultConnection` (Npgsql accepts the same parameters; adjust **Port** and **Username** if the dashboard shows `postgres.xxxxx` for pooler).

3. Confirm the **project ref** in the hostname matches your project (no typos).

The API creates tables (EF migrations) and loads CSVs **on startup** — but only when **`safehouses` is empty**. If you already tried to seed and something went wrong, see **Reset** below.

## What you must do locally (secrets)

1. In the **Intex repo root** (same folder as `lighthouse_csv_v7/`), copy the template:
   - Copy `.env.example` → `.env`
2. Edit `.env` and set:
   - **`ConnectionStrings__DefaultConnection`** — your Supabase Postgres connection string (host `db.<ref>.supabase.co`, user `postgres`, **database password** from Supabase).
   - **`Jwt__Key`** — any long random string (32+ characters). This signs login tokens.

**I cannot create your `.env` for you** — it contains secrets. Never commit `.env` (it is gitignored).

## Run the API once (applies migrations + CSV seed)

From a terminal:

```powershell
cd "path\to\Intex\backend\HavenLightApi"
dotnet run
```

- First run: creates tables in Supabase, then reads all CSVs under `lighthouse_csv_v7/`, then creates Identity roles and the default admin user.
- Watch the console: if you see a warning about **no rows in safehouses**, the CSV path or connection string is wrong.

Default admin (from `Program.cs`): **`admin@havenlight.ph`** / **`Admin@Haven2026!`** — change in production.

## Verify in Supabase

**Table Editor** → `safehouses` should have **9** rows; `residents` about **60**; `donations` about **420** (same order of magnitude as the CSV row counts).

## Reset and re-seed (wipe app data)

Only if you need a clean load:

1. Supabase → **SQL Editor** — run something like (adjust if you added custom tables):

   ```sql
   -- Destructive: drops public schema and recreates (removes ALL data + tables)
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   GRANT ALL ON SCHEMA public TO postgres;
   GRANT ALL ON SCHEMA public TO public;
   ```

2. Run `dotnet run` again from `backend/HavenLightApi` so migrations and seed run on an empty database.

**Warning:** This deletes everything in `public` in that project. Do not run on shared/production DBs unless you mean it.

## What runs automatically in code

- **`PathResolver`** finds `lighthouse_csv_v7` by walking up from the current directory (works from `dotnet run` in `HavenLightApi`).
- **`DotNetEnv`** loads repo-root `.env` before configuration.
- **`SeedData.InitializeAsync`** skips entirely if **`Safehouses` already has rows** (so it will not duplicate data).

## Deployed API (Azure, etc.)

The CSV files are **not** on the server unless you publish them. For production, either:

- Run the seed **once** from your machine against Supabase (recommended), or  
- Add a CI step / one-off job that runs the API with the CSV folder present.

Your **Vercel** frontend never loads CSVs; it only calls the API.
