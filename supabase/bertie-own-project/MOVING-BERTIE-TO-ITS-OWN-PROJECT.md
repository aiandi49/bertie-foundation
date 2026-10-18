# Moving Bertie to its own Supabase project

Today the Bertie Foundation website keeps its forms, admin logins and analytics in the
**tucson-pet-finder** project, alongside Secure Vault, the pet finder and other apps. That
is why Ms. Lee's password-reset email arrives branded "Secure Vault" and opens the wrong
site: a Supabase project has one login system, one email design and one website address.
Giving Bertie its own project fixes that for good and keeps Bertie's data apart from
everyone else's.

Time: about 45 minutes. Nothing changes for visitors until the last step, and the old
project keeps working the whole time, so you can stop and come back.

## What it costs

On the AI&I Pro organization, each extra project adds its own compute: **US$10 a month**
for the Micro size, which is plenty for Bertie (Supabase pricing page, October 2026).

## 1. Create the project

1. In Supabase, open the **AI&I** organization and click **New project**.
2. Name: `bertie-foundation`. Region: **Southeast Asia (Singapore)**, the closest to Pattaya.
3. Choose a strong database password and keep it in your password manager. Don't send it
   to anyone, including in chat.
4. Wait for the project to finish setting up (a couple of minutes).

## 2. Build the tables

In the new project, open **SQL Editor → New query**, paste each file, click **Run**:

1. `supabase/bertie-own-project/01_tables_and_security.sql`. The last result lists the
   seven tables with their policies.
2. `supabase/2026-10-18_site_analytics.sql`. This one is only needed once the Analytics tab
   is approved.

## 3. Copy the data across

For each table below, open the **old** project (tucson-pet-finder) → **Table Editor** →
the table → **Export → Export as CSV**. Then open the **new** project → **Table Editor** →
the same table → **Insert → Import data from CSV**.

- `contact_requests`
- `volunteer_applications`
- `newsletter_subscribers`
- `feedback`
- `success_stories`
- `admin_activity_log`
- `analytics_events`

Check that the row counts match before moving on.

## 4. Logins

New project → **Authentication**:

1. **Sign In / Providers → Email**: on. Turn **off** "Allow new users to sign up", so only
   people you add can have an account.
2. **Users → Add user → Create new user** for each admin (`msleespark@gmail.com`,
   `ai.agent.lamar@gmail.com`), with **Auto Confirm User** ticked. Let Ms. Lee choose her
   own password with the website's "Forgot password?" link once step 7 is done.
3. **URL Configuration**: set **Site URL** to `https://www.bertiefoundation.org`, and add
   `https://www.bertiefoundation.org/admin` and `https://bertiefoundation.org/admin` to
   **Redirect URLs**.
4. **Emails → Reset Password**: set the subject to `Reset your Bertie Foundation admin password`
   and use the message below.
5. Optional but recommended: **Emails → SMTP Settings**: send through Resend, so reset emails
   come from the foundation's address and aren't held up by Supabase's built-in email limit.

Reset Password message:

```
<h2>Reset your Bertie Foundation admin password</h2>
<p>Someone asked to reset the password for the Bertie Foundation admin dashboard using this email address.</p>
<p><a href="{{ .ConfirmationURL }}">Choose a new password</a></p>
<p>If this wasn't you, you can ignore this email. Your password stays the same.</p>
```

## 5. Server functions and email

The website uses these Edge Functions in the old project: `submit-contact`, `submit-volunteer`,
`submit-feedback`, `subscribe-newsletter`, `notify-admin` and `weekly-digest` (the Friday report).
`capture-paypal-order` and `dynamic-api` belong to other apps. Leave them where they are.

Copy each one with the Supabase command-line tool (`npm i -g supabase`, then `supabase login`):

```
supabase functions download submit-contact --project-ref msuqflssqixsplcearxr
```

```
supabase functions deploy submit-contact --project-ref NEW-PROJECT-REF
```

Repeat for the other five names. `NEW-PROJECT-REF` is the code in the new project's address
(Project Settings → General).

Then, in the new project, open **Edge Functions → Secrets** and add the same secret names the
old project has (for example the Resend key). Copy the values from Resend and the other
services directly; never paste them into a chat. If the Friday report runs on a schedule in the
old project (**Integrations → Cron**), create the same schedule in the new project.

The admin dashboard also calls a function named `send-admin-alert` when something is deleted.
It isn't deployed in the old project, so those alert emails have not been going out. Point it at
`notify-admin` or deploy it as part of this move.

## 6. Point the website at the new project

In Vercel, open the **bertie-foundation** project → **Settings → Environment Variables** and
add these two for Production. Both values are in the new project under **Project Settings →
API Keys** and **Data API**. They are public by design, and row level security protects the
data.

```
VITE_SUPABASE_URL
```

```
VITE_SUPABASE_ANON_KEY
```

Then merge the `own-database` branch into `main` (or redeploy, if it is already merged). Until
those two variables are set, the site keeps using the old project, so merging early is safe.

## 7. Test

- Send a test message from each form: Contact, Volunteer, Newsletter, Feedback, Share Your Story.
- Sign in at `https://www.bertiefoundation.org/admin` and check that each test entry appears.
- On the sign-in page, use **Forgot password?** for Ms. Lee's email. The email should say Bertie
  Foundation and open the Bertie admin page.
- Delete the test entries.

## 8. Tidy up the old project (after two weeks)

Once everything has run smoothly for two weeks, export the Bertie tables from tucson-pet-finder
one last time as a backup, then delete them there, together with Ms. Lee's login in that project.
