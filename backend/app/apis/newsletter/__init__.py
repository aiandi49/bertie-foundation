from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr, validator, Field
from fastapi.responses import HTMLResponse
import os, uuid
from datetime import datetime
from app.db.supabase_client import get_supabase, supabase_available
from app.apis.email_notifications import send_form_notifications, get_admin_emails

router = APIRouter()

APP_BASE_URL = os.environ.get("APP_BASE_URL", "https://bertiefoundation.org")


class NewsletterSubscriptionRequest(BaseModel):
    name: str | None = Field(default=None)
    email: EmailStr
    source: str = Field(default="website")

    @validator("email")
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


@router.get("/get-subscribers")
async def get_all_subscribers() -> SubscribersListResponse:
    if not supabase_available():
        return SubscribersListResponse(subscribers=[])
    try:
        supabase = get_supabase()
        result = supabase.table("newsletter_subscribers").select("*").order("subscribed_at", desc=True).execute()
        subs = [SubscriberResponse(
            id=s.get("id", str(uuid.uuid4())),
            name=s.get("name"),
            email=s.get("email", ""),
            source=s.get("source", "website"),
            status=s.get("status", "active"),
            subscribed_at=s.get("subscribed_at", datetime.now().isoformat()),
        ) for s in (result.data or [])]
        return SubscribersListResponse(subscribers=subs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/subscribe-to-newsletter")
def subscribe_to_newsletter(
    background_tasks: BackgroundTasks,
    body: NewsletterSubscriptionRequest,
) -> NewsletterSubscriptionResponse:
    sub_id = str(uuid.uuid4())
    subscribed_at = datetime.utcnow().isoformat()

    # Save to Supabase
    if supabase_available():
        try:
            supabase = get_supabase()
            existing = supabase.table("newsletter_subscribers").select("id").eq("email", body.email).execute()
            if existing.data:
                return NewsletterSubscriptionResponse(status="success", message="You are already subscribed!")
            sub = {
                "id": sub_id,
                "name": body.name,
                "email": body.email,
                "source": body.source,
                "status": "active",
                "subscribed_at": subscribed_at,
            }
            supabase.table("newsletter_subscribers").insert(sub).execute()
        except Exception as e:
            print(f"DB error (non-fatal): {e}")
    else:
        print("WARNING: Supabase not configured - newsletter subscriber not saved to DB")

    # Send welcome email to subscriber + admin notification
    form_data = {
        "id": sub_id,
        "name": body.name or "Friend",
        "email": body.email,
        "source": body.source,
        "submitted_at": subscribed_at,
    }
    background_tasks.add_task(send_form_notifications, "newsletter", form_data, get_admin_emails())

    return NewsletterSubscriptionResponse(status="success", message="Thank you for subscribing! Check your email for a welcome message.")


@router.get("/unsubscribe/{subscriber_id}", response_class=HTMLResponse)
async def unsubscribe_user(subscriber_id: str):
    base = APP_BASE_URL
    if not supabase_available():
        return HTMLResponse(f"""<!DOCTYPE html><html><body style="font-family:Arial;text-align:center;padding:60px;">
        <h1>Unsubscribed</h1><p>You have been removed from our mailing list.</p>
        <a href="{base}">Return to Bertie Foundation</a></body></html>""")
    try:
        supabase = get_supabase()
        result = supabase.table("newsletter_subscribers").update({"status": "unsubscribed"}).eq("id", subscriber_id).execute()
        if not result.data:
            return HTMLResponse(f"""<!DOCTYPE html><html><body style="font-family:Arial;text-align:center;padding:60px;">
            <h1>Not Found</h1><p>That subscription link was not found.</p>
            <a href="{base}">Return to Bertie Foundation</a></body></html>""", status_code=404)
        return HTMLResponse(f"""<!DOCTYPE html><html><body style="font-family:Arial;text-align:center;padding:60px;">
        <h1 style="color:#8B0000;">You have been unsubscribed.</h1>
        <p>We're sorry to see you go. You have been removed from the Bertie Foundation newsletter.</p>
        <a href="{base}" style="background:#8B0000;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">Return to Our Website</a>
        </body></html>""")
    except Exception as e:
        return HTMLResponse("<html><body><h1>An error occurred. Please try again later.</h1></body></html>", status_code=500)


@router.delete("/subscriber/{subscriber_id}")
async def delete_subscriber(subscriber_id: str) -> dict:
    if not supabase_available():
        raise HTTPException(status_code=503, detail="Database not configured")
    try:
        get_supabase().table("newsletter_subscribers").delete().eq("id", subscriber_id).execute()
        return {"status": "success", "message": "Subscriber deleted successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
