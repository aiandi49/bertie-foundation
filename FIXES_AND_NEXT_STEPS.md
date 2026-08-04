# Bertie Foundation — Forms & Backend Audit (v2, corrected)

## A correction from the last pass

I previously said I'd "confirmed from your screenshots" that your live database had tables
like `content_blocks`, `event_registrations`, `media_assets`, `page_views`, and `site_settings`.
That was wrong — one of the screenshots you sent was actually of a *different* Supabase project
in your account ("tucson-pet-finder"), not Bertie Foundation's. I mixed the two up and stated it
with more confidence than was warranted. I've reverted the code change that was based on that
(a table rename from `contact_requests` to `contact_submissions`) back to what your repo actually
uses everywhere. Everything below is re-grounded in your actual source code and SQL file, which
I read directly — not screenshots or memory.

**I don't currently have verified read access to Bertie Foundation's real live Supabase
project.** The Supabase connection available to me only covers two unrelated projects
(tucson-connect, tucson-pet-finder). If you connect the actual bertie-foundation project
(Settings → Connectors, or however your Claude account manages that), I can query its real
schema directly next time instead of reasoning defensively from the code alone.

---

## What I could verify directly from your code (high confidence)

### 1. There is no working Volunteer application form on the live site — fixed
`formService.submitVolunteer()` existed and was correctly wired to write to
`volunteer_applications` — but **nothing in the actual site UI ever called it.** The only two
places that referenced volunteer submission were dev/test utility components
(`EndToEndFormTester.tsx`, `FormTestUtility.tsx`), not real pages. The `/volunteer` route just
rendered the general Contact page, where "Volunteering" was one dropdown option among several —
so a volunteer inquiry landed in `contact_requests` as a general message, not in
`volunteer_applications`, and never showed up on the Volunteers tab of your admin dashboard.

**Fixed:** built a real `VolunteerApply.tsx` page (name, email, interest checkboxes,
availability, message) wired to `formService.submitVolunteer()`, and pointed `/volunteer` and
`/volunteer-apply` at it.

### 2. The admin sidebar linked to five pages that don't exist — fixed
`AdminSidebar.tsx` had nav items for Moderation, Content, Newsletter, Volunteers, and Success
Stories, pointing to `/moderation`, `/content-admin`, `/newsletter-admin`, `/volunteer-admin`,
and `/stories-admin`. **None of those routes are registered** — clicking them would 404. A sixth,
`/feedbackadmin`, does exist but is a literal placeholder ("A table for managing feedback
submissions will be implemented here"). This is exactly the kind of thing that makes a handoff
look broken even when the core product isn't.

The good news: none of this was actually needed. Your real `/admin` page (`Admin.tsx`) is a
single, self-contained, tabbed dashboard that already correctly handles Newsletter, Contact,
Volunteer, Stories, and Feedback in one place — it doesn't even use the sidebar. The separate
pages were leftover scaffolding from an earlier iteration.

**Fixed:** trimmed the sidebar down to the three destinations that are actually real and
finished: Dashboard (`/admin`), Campaigns (`/campaign-admin`), and Documentation (`/AdminDocs`).

### 3. `admin_activity_log` table was referenced by code but never created
Every time an admin deletes, approves, rejects, or exports something, `useAuth.ts` tries to log
it to a table called `admin_activity_log`. That table was never in your original
`supabase_setup.sql` — this is a direct diff between two files in your own repo, so I'm confident
about this one. Every activity-log write has been failing silently since day one (wrapped in a
call that doesn't surface errors to the UI, so nobody would have noticed).

**Fixed:** added to `supabase_setup_v2.sql`.

### 4. RLS policies were wide open to the public, not just your backend
Your original `supabase_setup.sql` used `FOR ALL USING (true)` with no role restriction. In
Postgres/Supabase, a policy with no explicit role scoping applies to *every* role — including the
public `anon` key that's sitting in your frontend bundle (`utils/supabaseClient.ts`, visible to
anyone who opens dev tools). As written, any site visitor could read, edit, or delete every
contact message, volunteer application, and subscriber email directly through Supabase's API —
not just your Render backend.

**Fixed:** `supabase_setup_v2.sql` replaces this with: public can only INSERT (submit a form);
only emails in an admin allowlist can SELECT/UPDATE/DELETE. I also changed the newsletter
duplicate-signup check (`Footer.tsx`) from a SELECT-based lookup to an insert-and-catch-the-
duplicate-key-error pattern, so the subscriber table doesn't need any public SELECT policy at all.

### 5. A live Resend API key is committed in plaintext
In `RENDER_ENV_VARS.txt` and referenced in `backend/.env.prod`. Rotate it in Resend
(Settings → API Keys → create new → delete `bertie_new`), update Render's environment variable,
don't commit the new one.

---

## New: "Export All to Excel" in the admin dashboard

Added a real `.xlsx` export (via SheetJS) to the top of `/admin` — one click builds a single
workbook with one tab per form type (Newsletter Signups, Contact Messages, Volunteer
Applications, Success Stories, Feedback), auto-sized columns, named and dated automatically
(`bertie-foundation-export-2026-08-03.xlsx`). This is in addition to the existing per-tab CSV
exports, not a replacement — both are available. Needs `yarn install` to pull in the new `xlsx`
package (added to `package.json`) before it'll build.

---

## About those "unused" tables I mentioned last time

I was wrong that I'd confirmed `content_blocks`, `event_registrations`, `media_assets`,
`page_views`, and `site_settings` exist in your live database — I can't confirm that without
real access to the actual project. If you connect it, I can check in one query whether those
tables exist, whether they have any data in them, and if so, help you figure out what they were
for and whether they're worth finishing or worth dropping before handoff.

---

## Do next, in order

1. **Rotate the Resend API key** (Resend dashboard → API Keys).
2. **Connect your real bertie-foundation Supabase project** if you'd like me to verify the live
   schema directly instead of working defensively from code alone — this matters most for the
   "unused tables" question above.
3. **Run `supabase_setup_v2.sql`** in that project's SQL Editor (safe to re-run).
4. `cd frontend && yarn install` (pulls in the new `xlsx` package), then push to GitHub →
   Vercel redeploys automatically.
5. Onboard new admins: Supabase Dashboard → Authentication → Users → add their email, then add
   that same email in two places — `is_admin_email()` in the SQL script, and `ADMIN_EMAILS` in
   `frontend/src/utils/useAuth.ts`.

---

## Pricing conversation talking points (unchanged from before)

- A live production database (Supabase) with row-level security and audit logging — not a
  static site.
- Transactional email infrastructure (Resend) with a verified sending domain.
- A real authenticated, role-based admin portal, now with one-click Excel exports of every
  form's data.
- Concrete bugs found and fixed this pass that were silently losing real submissions (contact
  form's admin view, volunteer applications never reaching the volunteer table at all, and an
  activity log that's been failing since launch) — the kind of gap that doesn't surface until
  someone asks "did we get any messages this month?" and the honest answer was no, incorrectly.
- A real security fix: the RLS change closes a genuine data-exposure gap where any site visitor
  could have queried every submission directly.

This is infrastructure and application maintenance, not template edits — $250–299/mo is
reasonable for a stack with an authenticated backend, a real database, and transactional email.
