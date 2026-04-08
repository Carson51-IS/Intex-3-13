# Supabase CLI (RLS migrations)

This folder holds **database migrations** you can apply to Supabase Postgres with the Supabase CLI (`npx supabase …`). It does **not** replace EF Core migrations in `backend/HavenLightApi/Migrations` — those still own your schema shape; this adds **Row Level Security** on whatever tables already exist in `public`.

## Apply to your hosted project

**Option A — linked project**

```powershell
cd path\to\Intex
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

**Option B — connection string (no link)**

Use the same values as `ConnectionStrings__DefaultConnection`, in Postgres URI form:

```powershell
cd path\to\Intex
npx supabase db push --db-url "postgresql://postgres.[REF]:YOUR_PASSWORD@aws-0-....pooler.supabase.com:6543/postgres"
```

Or run the SQL in `supabase/migrations/*.sql` manually in **Supabase → SQL Editor**.

## After RLS

- **ASP.NET + Npgsql** as the table-owning `postgres` user: keeps working (owner bypasses RLS).
- **Supabase Data API** (`anon` / `authenticated` JWT): blocked from `public` data until you add `CREATE POLICY … N` (intentional).

If you later add **Supabase client** reads from the browser, add narrow policies (e.g. read-only on `public_impact_snapshots` where `is_published`) instead of weakening RLS globally.
