-- ============================================================
-- Bertie Foundation — Supabase Setup SQL v2
-- Run this in the Supabase SQL Editor for your bertie-foundation
-- project (the one at the URL in backend/.env.prod).
--
-- IMPORTANT CONTEXT: I do not currently have verified read access to
-- your live bertie-foundation Supabase project — I don't have that
-- project connected, only two unrelated ones (tucson-connect,
-- tucson-pet-finder). Everything below is grounded in what your
-- ACTUAL REPO CODE does today (verified by reading the source files
-- directly), not in any assumption about what's already in the
-- database. That's the safe way to write this: every statement below
-- is idempotent (IF NOT EXISTS / CREATE OR REPLACE), so it is safe
-- to run whether these tables already exist or not.
--
-- If you connect the real bertie-foundation Supabase project to this
-- chat (via the connector/settings), I can actually query it directly
-- next time instead of writing defensively like this.
-- ============================================================


-- ─── 1. Tables your original supabase_setup.sql already defines ────────────
-- Re-running these is a safe no-op if they already exist, and fixes things
-- if they don't (e.g. if the script was never actually run against this
-- project, which would explain forms silently failing).

CREATE TABLE IF NOT EXISTS contact_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT,
    category TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'received'
);

CREATE TABLE IF NOT EXISTS volunteer_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT,
    interests JSONB DEFAULT '[]',
    skills JSONB DEFAULT '[]',
    availability TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    source TEXT DEFAULT 'website',
    status TEXT DEFAULT 'active',
    subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rating INTEGER,
    comment TEXT,
    category TEXT,
    name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS success_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    story TEXT,
    program TEXT,
    impact TEXT,
    name TEXT,
    email TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'pending',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT,
    component TEXT,
    action TEXT,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. A table the CODE needs but the ORIGINAL SQL file never created ──────
-- frontend/src/utils/useAuth.ts writes here every time an admin deletes,
-- approves, rejects, or exports something (logAdminActivity). This table
-- was never in supabase_setup.sql, so every one of those calls has been
-- failing silently since day one. This is the one gap I can say with
-- certainty exists, because it's a direct diff between two files in your
-- own repo, not a guess about the live database.

CREATE TABLE IF NOT EXISTS admin_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    details TEXT,
    performed_by TEXT NOT NULL,
    performed_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- 3. Row Level Security — lock down to "public can submit,
--    only admins can read/manage"
--
-- Your original supabase_setup.sql policies used
-- `FOR ALL USING (true)` with no role restriction. In Supabase,
-- a policy with no explicit `TO` clause applies to every role,
-- including the public anon key that's embedded in your frontend
-- (utils/supabaseClient.ts). That means, as written, any visitor
-- who opened dev tools could read, edit, or delete every contact
-- message, volunteer application, and email address directly —
-- not just your backend's service key. This section replaces those
-- policies with ones scoped correctly.
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin_email() RETURNS BOOLEAN AS $$
  SELECT (auth.jwt() ->> 'email') IN (
    'bertiefoundation@gmail.com',
    'msleespark@gmail.com',
    'ai.agent.lamar@gmail.com'
    -- add new management's email here, comma-separated, in quotes
  );
$$ LANGUAGE sql STABLE;

ALTER TABLE contact_requests        ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_applications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback                ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log      ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON contact_requests;
DROP POLICY IF EXISTS "service_role_all" ON volunteer_applications;
DROP POLICY IF EXISTS "service_role_all" ON newsletter_subscribers;
DROP POLICY IF EXISTS "service_role_all" ON feedback;
DROP POLICY IF EXISTS "service_role_all" ON success_stories;
DROP POLICY IF EXISTS "service_role_all" ON analytics_events;

-- Public (anon key) can INSERT — that's how your forms work — but not
-- read, edit, or delete other people's submissions.
CREATE POLICY "public_can_submit" ON contact_requests       FOR INSERT WITH CHECK (true);
CREATE POLICY "public_can_submit" ON volunteer_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "public_can_submit" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "public_can_submit" ON feedback                FOR INSERT WITH CHECK (true);
CREATE POLICY "public_can_submit" ON success_stories         FOR INSERT WITH CHECK (true);
CREATE POLICY "public_can_track"  ON analytics_events         FOR INSERT WITH CHECK (true);

-- Note: newsletter_subscribers.email already has a UNIQUE constraint, and
-- Footer.tsx now relies on that (catching the duplicate-key error) instead
-- of a public SELECT to check "are you already subscribed" — so no public
-- SELECT policy is needed here. That's deliberate: a public SELECT policy
-- would let anyone pull the full subscriber list via the anon key.

-- Admins (matched by email, via the function above) get full access.
CREATE POLICY "admin_full_access" ON contact_requests       FOR ALL USING (is_admin_email());
CREATE POLICY "admin_full_access" ON volunteer_applications FOR ALL USING (is_admin_email());
CREATE POLICY "admin_full_access" ON newsletter_subscribers FOR ALL USING (is_admin_email());
CREATE POLICY "admin_full_access" ON feedback               FOR ALL USING (is_admin_email());
CREATE POLICY "admin_full_access" ON success_stories        FOR ALL USING (is_admin_email());
CREATE POLICY "admin_full_access" ON analytics_events       FOR ALL USING (is_admin_email());
CREATE POLICY "admin_full_access" ON admin_activity_log     FOR ALL USING (is_admin_email());

-- Your Render backend uses SUPABASE_SERVICE_KEY (service_role), which
-- always bypasses RLS automatically — no policy needed for it.
-- These policies only govern requests made with the public anon key,
-- i.e. everything the frontend does directly from the browser.

-- ============================================================
-- To add a new admin later:
--   1. Supabase Dashboard → Authentication → Users → Add user (their email)
--   2. Add their email to the is_admin_email() list above and re-run
--      just that CREATE OR REPLACE FUNCTION block.
--   3. Add their email to ADMIN_EMAILS in
--      frontend/src/utils/useAuth.ts and redeploy the frontend.
-- ============================================================
