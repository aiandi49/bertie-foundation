from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import databutton as db
from datetime import datetime, timedelta
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

router = APIRouter(
    prefix="/scheduled-jobs",
    tags=["scheduled-jobs"],
)

# SMTP configuration
SMTP_HOST = os.environ.get("SMTP_HOST", "mail.bertiefoundation.org")
SMTP_PORT = 465
SMTP_FROM = os.environ.get("SMTP_EMAIL", "info@bertiefoundation.org")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")

def _send_report_email(to: str, subject: str, content_text: str) -> bool:
    """Send plain-text report email via SMTP SSL."""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Bertie Foundation <{SMTP_FROM}>"
        msg["To"] = to
        msg.attach(MIMEText(content_text, "plain"))
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
            server.login(SMTP_FROM, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, to, msg.as_string())
        print(f"Report email sent to {to}")
        return True
    except Exception as e:
        print(f"Error sending report email to {to}: {e}")
        return False

# --- Data Models ---

class WeeklySummary(BaseModel):
    new_subscribers: list[dict]
    total_subscribers: int
    start_date: str
    end_date: str

# --- Helper Functions ---

def get_all_subscribers() -> list[dict]:
    """Retrieve all subscribers from storage."""
    try:
        return db.storage.json.get("newsletter_subscribers", default=[])
    except Exception as e:
        print(f"Error retrieving subscribers: {e}")
        return []

def generate_weekly_summary() -> WeeklySummary:
    """Generate a summary of new subscribers for the past week."""
    all_subscribers = get_all_subscribers()
    today = datetime.utcnow()
    one_week_ago = today - timedelta(days=7)

    new_subscribers_this_week = []
    for sub in all_subscribers:
        subscribed_at_str = sub.get('subscribed_at')
        if subscribed_at_str:
            try:
                # Handle different ISO formats, including those with 'Z'
                if subscribed_at_str.endswith('Z'):
                    subscribed_at_str = subscribed_at_str[:-1] + '+00:00'
                
                subscribed_date = datetime.fromisoformat(subscribed_at_str)

                # If the datetime is timezone-aware, convert to naive UTC for comparison
                if subscribed_date.tzinfo is not None:
                    subscribed_date = subscribed_date.replace(tzinfo=None)

                if one_week_ago <= subscribed_date <= today:
                    new_subscribers_this_week.append(sub)
            except (ValueError, TypeError) as e:
                print(f"Could not parse date for subscriber {sub.get('email', 'N/A')}: {subscribed_at_str}, error: {e}")

    return WeeklySummary(
        new_subscribers=new_subscribers_this_week,
        total_subscribers=len(all_subscribers),
        start_date=one_week_ago.strftime("%Y-%m-%d"),
        end_date=today.strftime("%Y-%m-%d"),
    )

def format_summary_for_email(summary: WeeklySummary) -> str:
    """Format the weekly summary into a plain-text email body."""
    
    new_subscriber_list = ""
    if summary.new_subscribers:
        for sub in summary.new_subscribers:
            name = sub.get('name', 'N/A')
            email = sub.get('email', 'N/A')
            new_subscriber_list += f"- Name: {name}, Email: {email}\n"
    else:
        new_subscriber_list = "No new subscribers this week.\n"

    text_content = f"""
    Bertie Foundation - Weekly Subscriber Report
    Report Period: {summary.start_date} to {summary.end_date}
    
    --- SUMMARY ---
    Total Subscribers: {summary.total_subscribers}
    New Subscribers This Week: {len(summary.new_subscribers)}
    
    --- NEW SUBSCRIBERS ---
    {new_subscriber_list}
    
    This is an automated report.
    """
    return text_content

# --- API Endpoints ---

@router.post("/deliver-subscriber-report", summary="Generate and email the weekly subscriber report")
async def deliver_subscriber_report(
    admin_emails: list[str] | None = None
):
    """
    Generates a weekly summary of newsletter subscribers and emails it
    to the provided list of admin email addresses.
    """
    if admin_emails is None:
        admin_emails = ["bertiefoundation@gmail.com", "msleespark@gmail.com", "ai.agent.lamar@gmail.com"]
    
    try:
        # Use the simple test content to bypass spam filters
        summary = generate_weekly_summary()
        email_text = format_summary_for_email(summary)
        print(f"Weekly summary generated for the period {summary.start_date} to {summary.end_date}.")
        
        for email in admin_emails:
            print(f"Attempting to send email to {email}...")
            _send_report_email(
                to=email,
                subject=f"Bertie Foundation - Weekly Subscriber Report ({summary.start_date} to {summary.end_date})",
                content_text=email_text,
            )
            print(f"Successfully triggered email to {email}.")
        
        print("All emails triggered successfully.")
        return {"status": "success", "message": f"Weekly report sent to {', '.join(admin_emails)}."}
        
    except Exception as e:
        print(f"An error occurred in deliver_subscriber_report: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate or send the weekly report.") from e
