-- Row Level Security for all regular tables in `public`.
--
-- Why this does not break the .NET API:
--   The API connects with the Postgres user that owns these tables (created via EF migrations).
--   Table owners bypass RLS unless the table uses FORCE ROW LEVEL SECURITY (we do not).
--
-- What this improves:
--   Supabase PostgREST exposes `public` by default. Without RLS, anon/authenticated roles could
--   read/write whatever GRANTs allow. With RLS enabled and no permissive policies, those roles
--   cannot see or change rows (until you add explicit policies for a feature).
--
-- Idempotent: safe to run more than once.

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT n.nspname AS schemaname, c.relname AS relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND NOT pg_is_other_temp_schema(c.relnamespace)
    ORDER BY c.relname
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',
      r.schemaname,
      r.relname
    );
  END LOOP;
END $$;
