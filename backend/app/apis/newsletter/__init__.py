from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr, validator, Field
from fastapi.responses import HTMLResponse
import smtplib, os, uuid, re
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.db.supabase_client import get_supabase

router = APIRouter()

SMTP_HOST = os.environ.get("SMTP_HOST", "mail.bertiefoundation.org")
SMTP_PORT = 465
SMTP_EMAIL = os.environ.get("SMTP_EMAIL", "info@bertiefoundation.org")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
APP_BASE_URL = "https://metaearth.riff.works/bertie-foundation"

class NewsletterSubscriptionRequest(BaseModel):
    name: str | None = Field(default=None)
    email: EmailStr
    source: str = Field(default="website")

    @validator('email')
    def validate_email(cls, v):
        return v.lower() if v else v

class NewsletterSubscriptionResponse(BaseModel):
    status: str
    message: str

class SubscriberResponse(BaseModel):
    id: str
    name: str | None = None
    email: str
    source: str = "website"
    status: str = "active"
    subscribed_at: str

class SubscribersListResponse(BaseModel):
    subscribers: list[SubscriberResponse] = []

def send_email(to: str, subject: str, html_content: str):
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Bertie Foundation <{SMTP_EMAIL}>"
        msg["To"] = to
        msg.attach(MIMEText(html_content, "html"))
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, to, msg.as_string())
    except Exception as e:
        print(f"Email error: {e}")

def send_admin_notification(name, email, source, subscribed_at):
    html = f"""<html><body>
    <h2>New Newsletter Subscriber</h2>
    <p><strong>Name:</strong> {name or 'Not provided'}</p>
    <p><strong>Email:</strong> {email}</p>
    <p><strong>Source:</strong> {source}</p>
    <p><strong>Subscribed at:</strong> {subscribed_at}</p>
    </body></html>"""
    send_email("info@bertiefoundation.org", f"New Newsletter Subscriber: {name or email}", html)

def send_welcome_email(name, email, source, subscribed_at, unsubscribe_url):
    display_name = name or "Friend"
    html = f"""<html><body style="font-family:Arial,sans-serif;background:#f3f4f6;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;">
        <div style="background:#8B0000;color:white;padding:30px;text-align:center;">
            <h1>Welcome to the Bertie Foundation!</h1>
        </div>
        <div style="padding:30px;">
            <h2>Dear {display_name},</h2>
            <p>We are thrilled to have you as part of the Bertie Foundation family!</p>
            <p>You'll be the first to know about volunteer opportunities, impact stories, community events, and more.</p>
            <p style="text-align:center;"><a href="https://metaearth.riff.works/bertie-foundation" style="background:#8B0000;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;">Visit Our Website</a></p>
        </div>
        <div style="text-align:center;padding:20px;font-size:12px;color:#9ca3af;">
            <a href="{unsubscribe_url}">Unsubscribe</a>
        </div>
    </div></body></html>"""
    send_email(email, "Welcome to the Bertie Foundation Newsletter! 🌟", html)

@router.get("/get-subscribers")
async def get_all_subscribers() -> SubscribersListResponse:
    try:
        supabase = get_supabase()
        result = supabase.table("newsletter_subscribers").select("*").execute()
        subs = [SubscriberResponse(
            id=s.get("id", str(uuid.uuid4())),
            name=s.get("name"),
            email=s.get("email", ""),
            source=s.get("source", "website"),
            status=s.get("status", "active"),
            subscribed_at=s.get("subscribed_at", datetime.now().isoformat())
        ) for s in (result.data or [])]
        return SubscribersListResponse(subscribers=subs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/subscribe-to-newsletter")
def subscribe_to_newsletter(background_tasks: BackgroundTasks, body: NewsletterSubscriptionRequest) -> NewsletterSubscriptionResponse:
    try:
        supabase = get_supabase()
        existing = supabase.table("newsletter_subscribers").select("id").eq("email", body.email).execute()
        if existing.data:
            return NewsletterSubscriptionResponse(status="success", message="This email is already subscribed.")
        sub_id = str(uuid.uuid4())
        sub = {"id": sub_id, "name": body.name, "email": body.email, "source": body.source, "status": "active", "subscribed_at": datetime.utcnow().isoformat()}
        supabase.table("newsletter_subscribers").insert(sub).execute()
        unsubscribe_url = f"{APP_BASE_URL}/unsubscribe/{sub_id}"
        background_tasks.add_task(send_admin_notification, body.name, body.email, body.source, sub["subscribed_at"])
        background_tasks.add_task(send_welcome_email, body.name, body.email, body.source, sub["subscribed_at"], unsubscribe_url)
        return NewsletterSubscriptionResponse(status="success", message="Thank you for subscribing!")
    except Exception as e:
        return NewsletterSubscriptionResponse(status="error", message="An unexpected error occurred.")

@router.post("/routes/subscribe")
def legacy_subscribe_route(body: NewsletterSubscriptionRequest, background_tasks: BackgroundTasks) -> NewsletterSubscriptionResponse:
    return subscribe_to_newsletter(background_tasks, body)

@router.get("/unsubscribe/{subscriber_id}", response_class=HTMLResponse)
async def unsubscribe_user(subscriber_id: str):
    try:
        supabase = get_supabase()
        result = supabase.table("newsletter_subscribers").update({"status": "unsubscribed"}).eq("id", subscriber_id).execute()
        if not result.data:
            return HTMLResponse("<html><body><h1>Subscription Not Found</h1></body></html>", status_code=404)
        return HTMLResponse("<html><body><h1>You have been unsubscribed.</h1><p>We're sorry to see you go.</p></body></html>")
    except Exception as e:
        return HTMLResponse("<html><body><h1>An error occurred.</h1></body></html>", status_code=500)

@router.delete("/subscriber/{subscriber_id}")
async def delete_subscriber(subscriber_id: str) -> dict:
    try:
        supabase = get_supabase()
        supabase.table("newsletter_subscribers").delete().eq("id", subscriber_id).execute()
        return {"status": "success", "message": "Subscriber deleted successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
