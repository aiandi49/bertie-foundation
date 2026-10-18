-- ============================================================
-- Bertie Foundation: site analytics for the admin dashboard
-- Run once in the Supabase SQL Editor of the project the website uses
-- (today: tucson-pet-finder; after the move: bertie-foundation).
-- Safe to run more than once.
--
-- What it does
--   1. Makes sure analytics_events exists, and that visitors can only ADD rows.
--   2. Adds indexes so the dashboard stays fast as rows pile up.
--   3. Adds bertie_analytics_summary(days): one call that returns every number
--      and chart on the Analytics tab. Only admins can run it.
--   4. Adds bertie_analytics_prune(): deletes analytics rows older than 13 months.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT,
  component TEXT,
  action TEXT,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- The admin check used by every Bertie table. Created here only if it is missing,
-- so an existing list of admin emails is never overwritten.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'is_admin_email'
  ) THEN
    EXECUTE $f$
      CREATE FUNCTION public.is_admin_email() RETURNS BOOLEAN
      LANGUAGE sql STABLE AS $body$
        SELECT lower(coalesce(auth.jwt() ->> 'email', '')) IN (
          'msleespark@gmail.com',
          'ai.agent.lamar@gmail.com',
          'bertiefoundation@gmail.com'
        );
      $body$;
    $f$;
  END IF;
END $$;

-- Visitors may add events, never read, change or delete them.
DROP POLICY IF EXISTS "public_can_track" ON public.analytics_events;
CREATE POLICY "public_can_track" ON public.analytics_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    event_type IS NOT NULL
    AND length(event_type) <= 40
    AND length(coalesce(component, '')) <= 200
    AND length(coalesce(action, '')) <= 200
    AND pg_column_size(metadata) <= 2048
  );

DROP POLICY IF EXISTS "admin_full_access" ON public.analytics_events;
CREATE POLICY "admin_full_access" ON public.analytics_events
  FOR ALL TO authenticated
  USING (public.is_admin_email())
  WITH CHECK (public.is_admin_email());

CREATE INDEX IF NOT EXISTS analytics_events_time_idx      ON public.analytics_events (timestamp DESC);
CREATE INDEX IF NOT EXISTS analytics_events_type_time_idx ON public.analytics_events (event_type, timestamp DESC);

-- ─── The dashboard summary ─────────────────────────────────────────────────
-- p_days: 7, 30, 90 or 365 for "the last N days" (counted in Pattaya time),
--         or NULL for everything since tracking began.
CREATE OR REPLACE FUNCTION public.bertie_analytics_summary(p_days INTEGER DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tz CONSTANT TEXT := 'Asia/Bangkok';
  first_seen TIMESTAMPTZ;
  range_from TIMESTAMPTZ;
  range_to   TIMESTAMPTZ := now();
  result JSONB;
BEGIN
  IF NOT public.is_admin_email() THEN
    RAISE EXCEPTION 'Only Bertie Foundation admins can see analytics.' USING ERRCODE = '42501';
  END IF;

  SELECT min(timestamp) INTO first_seen FROM public.analytics_events WHERE event_type = 'pageview';

  IF p_days IS NULL THEN
    range_from := coalesce(date_trunc('day', first_seen AT TIME ZONE tz) AT TIME ZONE tz,
                           date_trunc('day', now() AT TIME ZONE tz) AT TIME ZONE tz);
  ELSE
    range_from := (date_trunc('day', now() AT TIME ZONE tz) - make_interval(days => greatest(p_days, 1) - 1)) AT TIME ZONE tz;
  END IF;

  WITH ev AS (
    SELECT event_type, component, action, metadata, timestamp
    FROM public.analytics_events
    WHERE timestamp >= range_from AND timestamp < range_to
  ),
  pv AS (SELECT * FROM ev WHERE event_type = 'pageview'),
  ck AS (SELECT * FROM ev WHERE event_type = 'click'),
  days AS (
    SELECT generate_series(
      (range_from AT TIME ZONE tz)::date,
      (range_to AT TIME ZONE tz)::date,
      INTERVAL '1 day'
    )::date AS day
  )
  SELECT jsonb_build_object(
    'range_from',     range_from,
    'range_to',       range_to,
    'tracking_since', first_seen,
    'pageviews',      (SELECT count(*) FROM pv),
    'visitors',       (SELECT count(DISTINCT metadata->>'v') FROM pv),
    'new_visitors',   (SELECT count(DISTINCT metadata->>'v') FROM pv WHERE metadata->>'new' = 'true'),
    'visits',         (SELECT count(DISTINCT metadata->>'s') FROM pv),
    'clicks',         (SELECT count(*) FROM ck),
    'form_events',    (SELECT count(*) FROM ev WHERE action ILIKE 'submit%'),
    'pages', (SELECT coalesce(jsonb_agg(x ORDER BY x.n DESC, x.label), '[]'::jsonb) FROM (
                SELECT component AS label, count(*) AS n FROM pv GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 12) x),
    'buttons', (SELECT coalesce(jsonb_agg(x ORDER BY x.n DESC, x.label), '[]'::jsonb) FROM (
                SELECT action AS label, coalesce(max(metadata->>'kind'), 'Button') AS kind, count(*) AS n
                FROM ck GROUP BY action ORDER BY 3 DESC, 1 LIMIT 12) x),
    'click_kinds', (SELECT coalesce(jsonb_agg(x ORDER BY x.n DESC), '[]'::jsonb) FROM (
                SELECT coalesce(metadata->>'kind', 'Button') AS label, count(*) AS n FROM ck GROUP BY 1) x),
    'devices', (SELECT coalesce(jsonb_agg(x ORDER BY x.n DESC), '[]'::jsonb) FROM (
                SELECT coalesce(metadata->>'dev', 'Unknown') AS label, count(DISTINCT metadata->>'v') AS n
                FROM pv GROUP BY 1 HAVING count(DISTINCT metadata->>'v') > 0) x),
    'sources', (SELECT coalesce(jsonb_agg(x ORDER BY x.n DESC), '[]'::jsonb) FROM (
                SELECT coalesce(metadata->>'src', 'Direct') AS label, count(*) AS n
                FROM pv WHERE metadata->>'entry' = 'true' GROUP BY 1) x),
    'daily', (SELECT coalesce(jsonb_agg(jsonb_build_object('day', d.day, 'pageviews', coalesce(t.pageviews, 0), 'visitors', coalesce(t.visitors, 0)) ORDER BY d.day), '[]'::jsonb)
              FROM days d
              LEFT JOIN (
                SELECT (timestamp AT TIME ZONE tz)::date AS day, count(*) AS pageviews, count(DISTINCT metadata->>'v') AS visitors
                FROM pv GROUP BY 1
              ) t ON t.day = d.day)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.bertie_analytics_summary(INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bertie_analytics_summary(INTEGER) TO authenticated;

-- ─── Housekeeping: keep 13 months of detail ─────────────────────────────────
-- Run by hand (SELECT public.bertie_analytics_prune();) or on a monthly schedule.
CREATE OR REPLACE FUNCTION public.bertie_analytics_prune()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH gone AS (
    DELETE FROM public.analytics_events
    WHERE timestamp < now() - INTERVAL '13 months'
    RETURNING 1
  )
  SELECT count(*)::int FROM gone;
$$;

REVOKE ALL ON FUNCTION public.bertie_analytics_prune() FROM PUBLIC, anon, authenticated;
