# bertie-foundation

Nonprofit web app for The Bertie Foundation — donation management, blog, volunteer opportunities, and an admin dashboard.

## Architecture

- **Frontend**: React + TypeScript + Vite, hosted on Vercel
- **Backend**: Supabase — Postgres database, Auth, Storage, and Edge Functions (no separate backend server)
- **Transactional email**: Resend, called from Supabase Edge Functions

There is no standalone backend service. Form submissions (contact, volunteer, feedback, newsletter) are handled by Supabase Edge Functions, which write to Postgres and send confirmation emails directly — nothing runs on Render, Railway, or any other host besides Vercel (frontend) and Supabase (everything else).

## Project Structure

```
.
├── frontend/                # React frontend (Vercel)
│   ├── src/
│   │   ├── pages/            # Page components (ContactUs.tsx, VolunteerApply.tsx, Feedback.tsx, Admin.tsx, ...)
│   │   ├── components/       # Reusable components
│   │   └── utils/
│   │       ├── supabaseClient.ts   # Supabase client (anon key)
│   │       └── backendApi.ts       # Calls Supabase Edge Functions for form submissions
│   └── package.json
├── supabase_setup_v2.sql     # Table definitions + RLS policies — run in Supabase SQL Editor
└── vercel.json
```

Supabase Edge Functions live inside the Supabase project itself (Dashboard → Edge Functions), not in this repo:
- `submit-contact`, `submit-volunteer`, `submit-feedback`, `subscribe-newsletter` — handle the 4 public forms
- `notify-admin` — emails the admin list when a row lands in `contact_requests` / `volunteer_applications` / `feedback` / `success_stories`
- `weekly-digest` — Friday cron job, emails admins a CSV summary of the week's forms

## Database

Run `supabase_setup_v2.sql` in your Supabase project's SQL Editor to create the tables (`contact_requests`, `volunteer_applications`, `newsletter_subscribers`, `feedback`, `success_stories`, `analytics_events`, `admin_activity_log`) and Row Level Security policies. It's idempotent — safe to re-run.

## Environment / Secrets

**Frontend (Vercel):** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — set in Vercel → Project → Environment Variables.

**Supabase Edge Functions:** secrets are set per-project in Supabase → Edge Functions → Secrets, not in this repo. Currently used: `RESEND_API_KEY`, `SMTP_EMAIL`, `SUPABASE_SERVICE_ROLE_KEY` (auto-injected by Supabase), `ADMIN_EMAILS`.

## Development

```bash
cd frontend
yarn install
yarn dev
```

## Admin Dashboard

`/admin` — gated to the email addresses listed in `frontend/src/utils/useAuth.ts` (`ADMIN_EMAILS`). Includes an Org Chart tab, form submission views, and Excel export.

## Deployment

- **Frontend**: Vercel, auto-deploys from `main`
- **Backend**: Supabase (no separate deploy step — Edge Functions are deployed directly via the Supabase Dashboard or CLI)

## License

Your license here.
