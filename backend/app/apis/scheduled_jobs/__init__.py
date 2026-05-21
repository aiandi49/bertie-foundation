from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
import smtplib, os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.db.supabase_client import get_supabase, supabase_available
from app.apis.email_notifications import get_admin_emails

router = APIRouter(prefix="/scheduled-jobs", tags=["scheduled-jobs"])

SMTP_HOST = os.environ.get("SMTP_HOST", "mail.bertiefoundation.org")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "465"))
SMTP_FROM = os.environ.get("SMTP_EMAIL", "info@bertiefoundation.org")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")


def _send_report_email(to: str, subject: str, html: str):
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Bertie Foundation <{SMTP_FROM}>"
        msg["To"] = to
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as s:
            s.login(SMTP_FROM, SMTP_PASSWORD)
            s.sendmail(SMTP_FROM, to, msg.as_string())
    except Exception as e:
        print(f"Report email error: {e}")


@router.post("/deliver-subscriber-report")
async def deliver_subscriber_report(admin_emails: list[str] | None = None):
    if admin_emails is None:
        admin_emails = get_admin_emails()

    if not supabase_available():
        raise HTTPException(status_code=503, detail="Database not configured")

    try:
        supabase = get_supabase()
        result = supabase.table("newsletter_subscribers").select("*").eq("status", "active").execute()
        all_subs = result.data or []
        today = datetime.utcnow()
        one_week_ago = today - timedelta(days=7)
        new_this_week = [
            s for s in all_subs
            if s.get("subscribed_at") and datetime.fromisoformat(s["subscribed_at"].replace("Z", "")) >= one_week_ago
        ]

        rows = "".join(
            f"<tr><td style='padding:8px;border-bottom:1px solid #e5e7eb;'>{s.get('name','N/A')}</td>"
            f"<td style='padding:8px;border-bottom:1px solid #e5e7eb;'>{s.get('email','N/A')}</td>"
            f"<td style='padding:8px;border-bottom:1px solid #e5e7eb;'>{s.get('subscribed_at','')[:10]}</td></tr>"
            for s in new_this_week
        ) or "<tr><td colspan='3' style='padding:8px;color:#9ca3af;'>No new subscribers this week.</td></tr>"

        html = f"""<!DOCTYPE html><html><body style="font-family:Arial;background:#f1f5f9;padding:20px;">
        <div style="max-width:600px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;">
            <div style="background:#8B0000;color:white;padding:24px;text-align:center;">
                <h1 style="margin:0;">Weekly Subscriber Report</h1>
                <p style="margin:4px 0 0;">{one_week_ago.strftime('%Y-%m-%d')} to {today.strftime('%Y-%m-%d')}</p>
            </div>
            <div style="padding:24px;">
                <p><strong>Total Active Subscribers:</strong> {len(all_subs)}</p>
                <p><strong>New This Week:</strong> {len(new_this_week)}</p>
                <h3>New Subscribers</h3>
                <table style="width:100%;border-collapse:collapse;">
                    <thead><tr style="background:#f3f4f6;">
                        <th style="padding:8px;text-align:left;">Name</th>
                        <th style="padding:8px;text-align:left;">Email</th>
                        <th style="padding:8px;text-align:left;">Date</th>
                    </tr></thead>
                    <tbody>{rows}</tbody>
                </table>
            </div>
        </div></body></html>"""

        for email in admin_emails:
            _send_report_email(
                email,
                f"Weekly Subscriber Report ({one_week_ago.strftime('%Y-%m-%d')} to {today.strftime('%Y-%m-%d')})",
                html
            )

        return {"status": "success", "message": f"Weekly report sent to {', '.join(admin_emails)}.", "total_subscribers": len(all_subs), "new_this_week": len(new_this_week)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
