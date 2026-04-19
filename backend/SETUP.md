# Bertie Foundation Backend - Setup Guide

## Quick Start (Local Dev)

1. **Copy the env file and fill in your SMTP password:**
   ```bash
   cp .env.example .env
   # Edit .env and set SMTP_PASSWORD
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the backend:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

4. **Test a form endpoint:**
   ```bash
   curl -X POST http://localhost:8000/api/contact \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@test.com","subject":"Hello","message":"Test message","category":"general"}'
   ```

## Forms Work Without Supabase

The Contact, Volunteer, Feedback, and Newsletter forms **will work and send emails** even without Supabase configured. You just need valid SMTP credentials in `.env`.

To add database storage later, create a Supabase project and add `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` to `.env`.

## Deploying to Railway

1. Create a new Railway project
2. Connect this `backend/` folder as the source
3. Set these environment variables in Railway dashboard:
   - `SMTP_HOST` = mail.bertiefoundation.org
   - `SMTP_EMAIL` = info@bertiefoundation.org
   - `SMTP_PASSWORD` = (your password)
   - `ALLOWED_ORIGINS` = https://your-frontend-domain.com
   - `SUPABASE_URL` = (when ready)
   - `SUPABASE_SERVICE_KEY` = (when ready)

## API Endpoints

All form endpoints are at `/api/`:

| Form | Method | Endpoint |
|------|--------|----------|
| Contact Us | POST | `/api/contact` |
| Volunteer | POST | `/api/volunteer` |
| Feedback | POST | `/api/feedback` |
| Newsletter | POST | `/api/subscribe-to-newsletter` |
| Form Submissions | POST | `/api/form-submissions/` |
