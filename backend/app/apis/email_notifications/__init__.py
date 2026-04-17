from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Literal, Optional
import smtplib, os, json
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

router = APIRouter()

SMTP_HOST = os.environ.get("SMTP_HOST", "mail.bertiefoundation.org")
SMTP_PORT = 465
SMTP_FROM = os.environ.get("SMTP_EMAIL", "info@bertiefoundation.org")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")

EMAIL_STYLES = """<style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }
    .header { background-color: #2563EB; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
    .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #6b7280; }
    h1 { margin: 0; font-size: 24px; } h2 { font-size: 20px; margin-top: 0; }
    p { line-height: 1.6; }
</style>"""

TemplateType = Literal["volunteer_application","contact_form","donation","feedback","success_story","newsletter"]

class EmailNotification(BaseModel):
    to: str
    subject: str
    content_html: str
    content_text: str

def send_email(notification: EmailNotification) -> bool:
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = notification.subject
        msg["From"] = f"Bertie Foundation <{SMTP_FROM}>"
        msg["To"] = notification.to
        html_body = notification.content_html
        if not html_body.strip().lower().startswith("<!doctype") and "<html" not in html_body.lower():
            html_body = f"""<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>{notification.subject}</title></head><body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">{html_body}</body></html>"""
        msg.attach(MIMEText(html_body, "html"))
        if notification.content_text:
            msg.attach(MIMEText(notification.content_text, "plain"))
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.login(SMTP_FROM, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, notification.to, msg.as_string())
        return True
    except Exception as e:
        print(f"Email error to {notification.to}: {e}")
        return False

def get_admin_template(template_type: str, data: dict) -> str:
    name = data.get('name', 'N/A')
    email = data.get('email', 'N/A')
    submitted_at = data.get('submitted_at', datetime.now().isoformat())
    rows = "".join(f"<p><strong>{k.replace('_',' ').title()}:</strong> {v}</p>" for k, v in data.items() if k not in ['submitted_at'])
    label = template_type.replace('_', ' ').title()
    return f"""{EMAIL_STYLES}<div class="header"><h1>New {label} Submission</h1></div><div class="content">{rows}<p><strong>Submitted at:</strong> {submitted_at}</p></div><div class="footer"><p>Bertie Foundation - Admin Notification</p></div>"""

def get_user_template(template_type: str, data: dict) -> str:
    name = data.get('name', 'Friend')
    if template_type == "contact_form":
        return f"""{EMAIL_STYLES}<div class="header"><h1>Message Received! ✉️</h1></div><div class="content"><h2>Hello, {name}!</h2><p>Thank you for reaching out to the <strong>Bertie Foundation</strong>. We'll respond within 24–48 hours.</p><p><strong>Subject:</strong> {data.get('subject','N/A')}</p><p><strong>Message:</strong> {data.get('message','')}</p></div><div class="footer"><p>© 2026 Bertie Foundation</p></div>"""
    elif template_type == "volunteer_application":
        return f"""{EMAIL_STYLES}<div class="header"><h1>Thank You for Volunteering!</h1></div><div class="content"><h2>Hello {name}!</h2><p>We've received your volunteer application and will be in touch soon about opportunities that match your interests.</p></div><div class="footer"><p>© 2026 Bertie Foundation</p></div>"""
    elif template_type in ["success_story","success_stories"]:
        return f"""{EMAIL_STYLES}<div class="header"><h1>Thank You for Your Story!</h1></div><div class="content"><h2>Hello {name}!</h2><p>Your story "<strong>{data.get('title','')}</strong>" has been received and is under review. Once approved, it will be featured on our website.</p></div><div class="footer"><p>© 2026 Bertie Foundation</p></div>"""
    elif template_type == "feedback":
        return f"""{EMAIL_STYLES}<div class="header"><h1>Thank You for Your Feedback</h1></div><div class="content"><h2>We Value Your Input!</h2><p>Thank you for sharing your feedback. It helps us improve our programs and services.</p></div><div class="footer"><p>© 2026 Bertie Foundation</p></div>"""
    elif template_type == "donation":
        return f"""{EMAIL_STYLES}<div class="header"><h1>Thank You for Your Donation!</h1></div><div class="content"><h2>Hello {name}!</h2><p>Thank you for your generous donation of <strong>${data.get('amount')}</strong>. Your contribution makes a real difference.</p></div><div class="footer"><p>© 2026 Bertie Foundation</p></div>"""
    else:
        return f"""{EMAIL_STYLES}<div class="header"><h1>Thank You for Your Submission</h1></div><div class="content"><p>We've received your submission and will process it accordingly.</p></div><div class="footer"><p>© 2026 Bertie Foundation</p></div>"""

def send_form_notifications(form_type: str, form_data: dict, admin_recipients: list = None) -> Dict[str, bool]:
    result = {"admin_sent": False, "user_sent": False}
    if not admin_recipients:
        admin_recipients = ["info@bertiefoundation.org"]
    if "submitted_at" not in form_data:
        form_data["submitted_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    admin_html = get_admin_template(form_type, form_data)
    name = form_data.get("name", "").strip()
    date_str = datetime.now().strftime("%m/%d/%Y")
    label = form_type.replace('_', ' ').title()
    subject = f"New {label} Submission | {name} | {date_str}" if name else f"New {label} Submission | {date_str}"
    for admin_email in admin_recipients:
        if send_email(EmailNotification(to=admin_email, subject=subject, content_html=admin_html, content_text="")):
            result["admin_sent"] = True
    user_email = form_data.get("email")
    if user_email and form_type in ["newsletter","volunteer","volunteer_application","contact","contact_form","success_story","success_stories","feedback","donation"]:
        type_map = {"contact": "contact_form", "volunteer": "volunteer_application", "success_stories": "success_story", "newsletter": "newsletter"}
        tkey = type_map.get(form_type, form_type)
        user_html = get_user_template(tkey, form_data)
        subjects = {"newsletter": "Welcome to the Bertie Foundation Newsletter!", "volunteer_application": "Thank You for Your Volunteer Application", "success_story": "Thank You for Sharing Your Story", "feedback": "Thank You for Your Feedback", "donation": "Thank You for Your Donation", "contact_form": "Thank You for Contacting Bertie Foundation"}
        user_subject = subjects.get(tkey, "Thank You - Bertie Foundation")
        result["user_sent"] = send_email(EmailNotification(to=user_email, subject=user_subject, content_html=user_html, content_text=""))
    return result

@router.post("/test-notification", tags=["admin"])
def test_notification(template_type: TemplateType, recipient_email: str):
    test_data = {"name": "Test User", "email": recipient_email, "submitted_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
    result = send_form_notifications(template_type, test_data, [recipient_email])
    return {"status": "success", "result": result}
