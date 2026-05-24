from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Literal, Optional, List
import os, json, urllib.request, urllib.error
from datetime import datetime

router = APIRouter()

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SMTP_FROM = os.environ.get("SMTP_EMAIL", "info@bertiefoundation.org")
APP_BASE_URL = os.environ.get("APP_BASE_URL", "https://bertiefoundation.org")

# Admin recipients - read from env, fallback to known addresses
def get_admin_emails() -> List[str]:
    env_val = os.environ.get("ADMIN_EMAILS", "")
    if env_val:
        return [e.strip() for e in env_val.split(",") if e.strip()]
    return ["bertiefoundation@gmail.com", "msleespark@gmail.com", "ai.agent.lamar@gmail.com"]

EMAIL_STYLES = """<style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; background: #f1f5f9; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #8B0000; color: white; padding: 28px 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
    .footer { margin-top: 16px; text-align: center; font-size: 12px; color: #6b7280; }
    h1 { margin: 0; font-size: 24px; } h2 { font-size: 20px; margin-top: 0; color: #8B0000; }
    p { line-height: 1.6; }
    .field { margin-bottom: 12px; }
    .label { font-weight: bold; color: #374151; }
    .btn { display:inline-block; background:#8B0000; color:white; padding:12px 28px; border-radius:6px; text-decoration:none; font-weight:bold; margin-top:16px; }
</style>"""

TemplateType = Literal["volunteer_application", "contact_form", "donation", "feedback", "success_story", "newsletter"]


class EmailNotification(BaseModel):
    to: str
    subject: str
    content_html: str
    content_text: str = ""


def send_email(notification: EmailNotification) -> bool:
    if not RESEND_API_KEY:
        print("RESEND_API_KEY not set — skipping email send")
        return False
    try:
        html_body = notification.content_html
        if not html_body.strip().lower().startswith("<!doctype") and "<html" not in html_body.lower():
            html_body = f"""<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">{html_body}</body></html>"""

        payload = json.dumps({
            "from": f"Bertie Foundation <{SMTP_FROM}>",
            "to": [notification.to],
            "subject": notification.subject,
            "html": html_body,
        }).encode("utf-8")

        req = urllib.request.Request(
            "https://api.resend.com/emails",
            data=payload,
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            print(f"Email sent to {notification.to} — status {resp.status}")
            return True
    except Exception as e:
        print(f"Email error to {notification.to}: {e}")
        return False


def _wrap(body: str) -> str:
    return f"""<!DOCTYPE html><html><head><meta charset="UTF-8"/>{EMAIL_STYLES}</head>
<body><div class="wrapper">{body}<div class="footer"><p>© {datetime.now().year} Bertie Foundation · <a href="{APP_BASE_URL}">bertiefoundation.org</a></p></div></div></body></html>"""


def get_admin_template(template_type: str, data: dict) -> str:
    label = template_type.replace("_", " ").title()
    submitted_at = data.get("submitted_at", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    rows = "".join(
        f'<div class="field"><span class="label">{k.replace("_"," ").title()}:</span> {v}</div>'
        for k, v in data.items() if k not in ["submitted_at", "id", "status"] and v is not None
    )
    body = f"""
    <div class="header"><h1>📋 New {label} Submission</h1></div>
    <div class="content">
        <h2>{label}</h2>
        {rows}
        <div class="field"><span class="label">Submitted At:</span> {submitted_at}</div>
    </div>"""
    return _wrap(body)


def get_user_template(template_type: str, data: dict) -> str:
    name = data.get("name", "Friend")
    if template_type == "contact_form":
        body = f"""
        <div class="header"><h1>Message Received ✉️</h1></div>
        <div class="content">
            <h2>Hello, {name}!</h2>
            <p>Thank you for reaching out to the <strong>Bertie Foundation</strong>. We have received your message and will respond within <strong>24–48 hours</strong>.</p>
            <div class="field"><span class="label">Subject:</span> {data.get('subject','N/A')}</div>
            <div class="field"><span class="label">Your Message:</span><br>{data.get('message','')}</div>
            <p>In the meantime, feel free to explore our website.</p>
            <a href="{APP_BASE_URL}" class="btn">Visit Bertie Foundation</a>
        </div>"""
    elif template_type == "volunteer_application":
        interests = data.get("interests", [])
        if isinstance(interests, list):
            interests = ", ".join(interests) if interests else "Not specified"
        body = f"""
        <div class="header"><h1>Thank You for Volunteering! 🙌</h1></div>
        <div class="content">
            <h2>Hello {name}!</h2>
            <p>We are so excited to have you join the Bertie Foundation volunteer family! Your application has been received and a team member will be in touch soon about opportunities that match your interests.</p>
            <div class="field"><span class="label">Interests:</span> {interests}</div>
            <div class="field"><span class="label">Availability:</span> {data.get('availability','To be discussed')}</div>
            <a href="{APP_BASE_URL}" class="btn">Learn More About Us</a>
        </div>"""
    elif template_type in ["success_story", "success_stories"]:
        body = f"""
        <div class="header"><h1>Thank You for Sharing Your Story! 🌟</h1></div>
        <div class="content">
            <h2>Hello {name}!</h2>
            <p>Your story <strong>"{data.get('title','')}"</strong> has been received and is currently under review by our team.</p>
            <p>Once approved, it will be featured on our website to inspire others in our community. We'll notify you when it goes live!</p>
            <a href="{APP_BASE_URL}" class="btn">Visit Our Website</a>
        </div>"""
    elif template_type == "feedback":
        rating = data.get("rating", "")
        stars = "⭐" * int(rating) if rating else ""
        body = f"""
        <div class="header"><h1>Thank You for Your Feedback 💬</h1></div>
        <div class="content">
            <h2>We Value Your Input!</h2>
            <p>Thank you for taking the time to share your feedback with us. Your rating of {stars} ({rating}/5) has been recorded.</p>
            <p>Your insights help us improve our programs and better serve our community.</p>
            <a href="{APP_BASE_URL}" class="btn">Visit Bertie Foundation</a>
        </div>"""
    elif template_type == "donation":
        amount = data.get("amount", "")
        body = f"""
        <div class="header"><h1>Thank You for Your Donation! ❤️</h1></div>
        <div class="content">
            <h2>Hello {name}!</h2>
            <p>Your generous donation of <strong>${amount}</strong> has been received. Your contribution makes a real and lasting difference in our community.</p>
            <p>We are deeply grateful for your support of the Bertie Foundation's mission.</p>
            <a href="{APP_BASE_URL}" class="btn">See Our Impact</a>
        </div>"""
    elif template_type == "newsletter":
        sub_id = data.get("id", "")
        unsubscribe_url = f"{APP_BASE_URL}/unsubscribe/{sub_id}" if sub_id else f"{APP_BASE_URL}/unsubscribe"
        body = f"""
        <div class="header"><h1>Welcome to the Bertie Foundation! 🎉</h1></div>
        <div class="content">
            <h2>Hello {name}!</h2>
            <p>You're officially part of the Bertie Foundation family! 🌟</p>
            <p>You'll be the first to know about:</p>
            <ul>
                <li>Volunteer opportunities</li>
                <li>Community events</li>
                <li>Impact stories from our programs</li>
                <li>Ways to get involved</li>
            </ul>
            <a href="{APP_BASE_URL}" class="btn">Explore Our Website</a>
            <p style="margin-top:24px;font-size:13px;color:#9ca3af;">
                If you did not sign up for this newsletter, you can <a href="{unsubscribe_url}">unsubscribe here</a>.
            </p>
        </div>"""
    else:
        body = f"""
        <div class="header"><h1>Thank You for Your Submission</h1></div>
        <div class="content">
            <h2>Hello {name}!</h2>
            <p>We have received your submission and will process it accordingly. Thank you for connecting with the Bertie Foundation!</p>
            <a href="{APP_BASE_URL}" class="btn">Visit Our Website</a>
        </div>"""
    return _wrap(body)


def send_form_notifications(form_type: str, form_data: dict, admin_recipients: list = None) -> Dict[str, bool]:
    result = {"admin_sent": False, "user_sent": False}

    if not admin_recipients:
        admin_recipients = get_admin_emails()

    if "submitted_at" not in form_data:
        form_data["submitted_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Send admin notification
    admin_html = get_admin_template(form_type, form_data)
    name = form_data.get("name", "").strip()
    date_str = datetime.now().strftime("%m/%d/%Y")
    label = form_type.replace("_", " ").title()
    subject = f"New {label} | {name} | {date_str}" if name else f"New {label} | {date_str}"

    for admin_email in admin_recipients:
        if send_email(EmailNotification(to=admin_email, subject=subject, content_html=admin_html)):
            result["admin_sent"] = True

    # Send user confirmation
    user_email = form_data.get("email")
    form_types_with_confirmation = [
        "newsletter", "volunteer", "volunteer_application",
        "contact", "contact_form", "success_story", "success_stories",
        "feedback", "donation"
    ]
    if user_email and form_type in form_types_with_confirmation:
        type_map = {
            "contact": "contact_form",
            "volunteer": "volunteer_application",
            "success_stories": "success_story",
            "newsletter": "newsletter",
        }
        tkey = type_map.get(form_type, form_type)
        user_html = get_user_template(tkey, form_data)
        subjects = {
            "newsletter": "Welcome to the Bertie Foundation Newsletter! 🎉",
            "volunteer_application": "Your Volunteer Application - Bertie Foundation",
            "success_story": "Thank You for Sharing Your Story - Bertie Foundation",
            "feedback": "Thank You for Your Feedback - Bertie Foundation",
            "donation": "Thank You for Your Donation - Bertie Foundation",
            "contact_form": "We Received Your Message - Bertie Foundation",
        }
        user_subject = subjects.get(tkey, "Thank You - Bertie Foundation")
        result["user_sent"] = send_email(EmailNotification(to=user_email, subject=user_subject, content_html=user_html))

    return result


@router.post("/test-notification", tags=["admin"])
def test_notification(template_type: TemplateType, recipient_email: str):
    test_data = {
        "id": "test-123",
        "name": "Test User",
        "email": recipient_email,
        "subject": "Test Subject",
        "message": "This is a test message.",
        "rating": 5,
        "comment": "Great work!",
        "category": "general",
        "amount": "50.00",
        "title": "Test Story",
        "submitted_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
    result = send_form_notifications(template_type, test_data, [recipient_email])
    return {"status": "success", "result": result}
