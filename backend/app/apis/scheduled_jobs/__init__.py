from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
import smtplib, os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.db.supabase_client import get_supabase

router = APIRouter(prefix="/scheduled-jobs", tags=["scheduled-jobs"])

SMTP_HOST = os.environ.get("SMTP_HOST", "mail.bertiefoundation.org")
SMTP_PORT = 465
SMTP_FROM = os.environ.get("SMTP_EMAIL", "info@bertiefoundation.org")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")

def _send_report_email(to: str, subject: str, text: str):
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Bertie Foundation <{SMTP_FROM}>"
        msg["To"] = to
        msg.attach(MIMEText(text, "plain"))
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as s:
            s.login(SMTP_FROM, SMTP_PASSWORD)
            s.sendmail(SMTP_FROM, to, msg.as_string())
    except Exception as e:
        print(f"Report email error: {e}")

@router.post("/deliver-subscriber-report")
async def deliver_subscriber_report(admin_emails: list[str] | None = None):
    if admin_emails is None:
        admin_emails = ["bertiefoundation@gmail.com", "msleespark@gmail.com", "ai.agent.lamar@gmail.com"]
    try:
        supabase = get_supabase()
        result = supabase.table("newsletter_subscribers").select("*").eq("status", "active").execute()
        all_subs = result.data or []
        today = datetime.utcnow()
        one_week_ago = today - timedelta(days=7)
        new_this_week = [s for s in all_subs if s.get("subscribed_at") and datetime.fromisoformat(s["subscribed_at"].replace("Z","")) >= one_week_ago]
        lines = "\n".join([f"- {s.get('name','N/A')}, {s.get('email','N/A')}" for s in new_this_week]) or "No new subscribers this week."
        text = f"Bertie Foundation - Weekly Subscriber Report\nPeriod: {one_week_ago.strftime('%Y-%m-%d')} to {today.strftime('%Y-%m-%d')}\n\nTotal Subscribers: {len(all_subs)}\nNew This Week: {len(new_this_week)}\n\nNEW SUBSCRIBERS:\n{lines}\n\nThis is an automated report."
        for email in admin_emails:
            _send_report_email(email, f"Weekly Subscriber Report ({one_week_ago.strftime('%Y-%m-%d')} to {today.strftime('%Y-%m-%d')})", text)
        return {"status": "success", "message": f"Weekly report sent to {', '.join(admin_emails)}."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
