-- ============================================================
-- Bertie Foundation: set up Bertie's OWN Supabase project
-- Run once in the NEW project's SQL Editor (bertie-foundation), before
-- copying any data across. Safe to run more than once.
--
-- It creates the seven tables the website and admin dashboard use, with the
-- same columns as today, and locks them down:
--   • visitors (the public website) can only ADD rows: forms, sign-ups, analytics;
--   • only the admin emails below can read, change, delete or export anything.
-- Next, run ../2026-10-18_site_analytics.sql for the Analytics tab.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ─── Who is an admin ────────────────────────────────────────────────────────
-- To add an admin: add the email here (lowercase, in quotes), run this block again,
-- add the same email to ADMIN_EMAILS in frontend/src/utils/useAuth.ts, and create the
-- person in Authentication → Users → Add user.
CREATE OR REPLACE FUNCTION public.is_admin_email() RETURNS BOOLEAN
LANGUAGE sql STABLE AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email', '')) IN (
    'msleespark@gmail.com',
    'ai.agent.lamar@gmail.com',
    'bertiefoundation@gmail.com'
  );
$$;

-- ─── Tables ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT,
  category TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'received'
);

CREATE TABLE IF NOT EXISTS public.volunteer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  interests JSONB DEFAULT '[]',
  skills JSONB DEFAULT '[]',
  availability TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'active',
  subscribed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating INTEGER,
  comment TEXT,
  category TEXT,
  name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'pending'
);

-- `tags` is included because the Share Your Story form sends it. The current
-- project's table has no `tags` column, which makes every story submission fail.
CREATE TABLE IF NOT EXISTS public.success_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  story TEXT,
  program TEXT,
  impact TEXT,
  name TEXT,
  email TEXT,
  image_url TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'pending',
  timestamp TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.success_stories ADD COLUMN IF NOT EXISTS tags TEXT[];

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT,
  component TEXT,
  action TEXT,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  details TEXT,
  performed_by TEXT NOT NULL,
  performed_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Row level security ─────────────────────────────────────────────────────
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['contact_requests','volunteer_applications','newsletter_subscribers',
                           'feedback','success_stories','analytics_events','admin_activity_log']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "admin_full_access" ON public.%I', t);
    EXECUTE format('CREATE POLICY "admin_full_access" ON public.%I FOR ALL TO authenticated USING (public.is_admin_email()) WITH CHECK (public.is_admin_email())', t);
  END LOOP;

  -- The public website may add form entries (never read them back).
  FOREACH t IN ARRAY ARRAY['contact_requests','volunteer_applications','newsletter_subscribers',
                           'feedback','success_stories']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "public_can_submit" ON public.%I', t);
    EXECUTE format('CREATE POLICY "public_can_submit" ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (true)', t);
  END LOOP;
END $$;

-- New submissions always start as pending/received, so nobody can publish their own story.
DROP POLICY IF EXISTS "public_can_submit" ON public.success_stories;
CREATE POLICY "public_can_submit" ON public.success_stories
  FOR INSERT TO anon, authenticated
  WITH CHECK (coalesce(status, 'pending') = 'pending');

-- Admin activity is written by signed-in admins only (covered by admin_full_access).
-- Analytics inserts are allowed by ../2026-10-18_site_analytics.sql.

-- Table access for the website's roles (row level security above still decides which rows).
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.contact_requests, public.volunteer_applications, public.newsletter_subscribers,
                public.feedback, public.success_stories, public.analytics_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_requests, public.volunteer_applications,
                public.newsletter_subscribers, public.feedback, public.success_stories,
                public.analytics_events, public.admin_activity_log TO authenticated;

-- ─── Check ──────────────────────────────────────────────────────────────────
SELECT table_name, (SELECT count(*) FROM pg_policies p WHERE p.tablename = t.table_name) AS policies
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('contact_requests','volunteer_applications','newsletter_subscribers','feedback',
                     'success_stories','analytics_events','admin_activity_log')
ORDER BY 1;
