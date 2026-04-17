from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr, validator, Field
import databutton as db
import re
from datetime import datetime
import uuid
from fastapi.responses import HTMLResponse
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

router = APIRouter()

# Storage keys
NEWSLETTER_DB_KEY = "newsletter_subscribers"

# SMTP config from environment
SMTP_HOST = os.environ.get("SMTP_HOST", "mail.bertiefoundation.org")
SMTP_PORT = 465
SMTP_EMAIL = os.environ.get("SMTP_EMAIL", "info@bertiefoundation.org")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")

# Production base URL for unsubscribe links
APP_BASE_URL = "https://metaearth.riff.works/bertie-foundation"

class NewsletterSubscriptionRequest(BaseModel):
    name: str | None = Field(default=None, description="Name of the subscriber")
    email: EmailStr
    source: str = Field(default="website", description="Source of the subscription")
    
    @validator('email')
    def validate_email(cls, v):
        # Convert to lowercase for consistent handling
        return v.lower() if v else v

class NewsletterSubscriptionResponse(BaseModel):
    status: str
    message: str

class SubscriberResponse(BaseModel):
    id: str = Field(..., description="Unique identifier for the subscriber")
    name: str | None = Field(default=None, description="Name of the subscriber")
    email: str = Field(..., description="Email address of the subscriber")
    source: str = Field(default="website", description="Source of the subscription")
    status: str = Field(default="active", description="Status of the subscription")
    subscribed_at: str = Field(..., description="Date and time of subscription")

class SubscribersListResponse(BaseModel):
    subscribers: list[SubscriberResponse] = Field(default=[], description="List of subscribers")

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)


def send_email(to: str, subject: str, html_content: str):
    """Send email via SMTP SSL on port 465."""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Bertie Foundation <{SMTP_EMAIL}>"
        msg["To"] = to
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, to, msg.as_string())

        print(f"Email sent successfully to {to}")
    except Exception as e:
        print(f"Error sending email to {to}: {e}")


def send_admin_notification(name: str, email: str, source: str, subscribed_at: str):
    """Sends a notification to the admin about a new subscriber."""
    admin_email = "info@bertiefoundation.org"
    subject = f"New Newsletter Subscriber: {name or email}"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; margin:0; padding:0; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }}
            .header {{ background-color: #2563EB; color: white; padding: 16px; text-align: center; border-radius: 8px 8px 0 0; }}
            .content {{ padding: 20px; background:#f9fafb; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header"><h2>New Newsletter Subscriber</h2></div>
            <div class="content">
                <p><strong>Name:</strong> {name or 'Not provided'}</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Source:</strong> {source}</p>
                <p><strong>Subscribed at:</strong> {subscribed_at}</p>
            </div>
        </div>
    </body>
    </html>
    """
    send_email(admin_email, subject, html_content)


def send_welcome_email(name: str, email: str, source: str, subscribed_at: str, unsubscribe_url: str):
    """Sends a branded welcome email to the new subscriber."""
    display_name = name or "Friend"
    subject = "Welcome to the Bertie Foundation Newsletter! 🌟"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
            .header {{ background-color: #8B0000; color: white; padding: 30px 20px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 26px; }}
            .header p {{ margin: 8px 0 0; font-size: 14px; opacity: 0.9; }}
            .content {{ padding: 30px 20px; color: #333; line-height: 1.7; }}
            .content h2 {{ color: #8B0000; }}
            .button {{ display: inline-block; background-color: #8B0000; color: white; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; margin-top: 10px; }}
            .divider {{ border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }}
            .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #9ca3af; background: #f9fafb; }}
            .footer a {{ color: #6b7280; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌟 Welcome to the Bertie Foundation!</h1>
                <p>Thank you for joining our community</p>
            </div>
            <div class="content">
                <h2>Dear {display_name},</h2>
                <p>We are thrilled to have you as part of the <strong>Bertie Foundation</strong> family! Your support means the world to us and to the communities we serve.</p>
                <p>By subscribing to our newsletter, you will be the first to know about:</p>
                <ul>
                    <li>🤝 Upcoming volunteer opportunities</li>
                    <li>❤️ Impact stories from the field</li>
                    <li>📅 Community events and programs</li>
                    <li>🌍 How your support is making a difference</li>
                </ul>
                <p>We are committed to transparency and community — and we are so glad you are on this journey with us.</p>
                <hr class="divider" />
                <p style="text-align:center;">
                    <a href="https://metaearth.riff.works/bertie-foundation" class="button">Visit Our Website</a>
                </p>
                <p>If you have any questions or want to get more involved, feel free to reach out to us at <a href="mailto:info@bertiefoundation.org">info@bertiefoundation.org</a>.</p>
                <p>With gratitude,<br/><strong>The Bertie Foundation Team</strong></p>
            </div>
            <div class="footer">
                <p>You are receiving this email because you signed up at the Bertie Foundation website.</p>
                <p><a href="{unsubscribe_url}">Unsubscribe</a> &nbsp;|&nbsp; <a href="mailto:info@bertiefoundation.org">Contact Us</a></p>
            </div>
        </div>
    </body>
    </html>
    """
    send_email(email, subject, html_content)

def get_subscribers():
    """Get the list of newsletter subscribers"""
    try:
        return db.storage.json.get(sanitize_storage_key(NEWSLETTER_DB_KEY), default=[])
    except Exception as e:
        print(f"Error getting subscribers: {str(e)}")
        return []

def save_subscribers(subscribers):
    """Save the list of newsletter subscribers"""
    db.storage.json.put(sanitize_storage_key(NEWSLETTER_DB_KEY), subscribers)

def email_exists(email: str) -> bool:
    """Check if an email already exists in the subscribers list"""
    subscribers = get_subscribers()
    return any(sub.get("email") == email for sub in subscribers)


@router.get("/get-subscribers")
async def get_all_subscribers() -> SubscribersListResponse:
    """Get all newsletter subscribers for admin dashboard"""
    try:
        subscribers = get_subscribers()
        subscriber_responses = []
        
        for sub in subscribers:
            # Handle missing fields for older records
            subscriber_responses.append(SubscriberResponse(
                id=sub.get("id", str(uuid.uuid4())),  # Generate ID if missing
                name=sub.get("name"),
                email=sub.get("email", ""),
                source=sub.get("source", "website"),
                status=sub.get("status", "active"),
                subscribed_at=sub.get("subscribed_at", datetime.now().isoformat())
            ))
        
        return SubscribersListResponse(subscribers=subscriber_responses)
        
    except Exception as e:
        print(f"Error retrieving subscribers: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve newsletter subscribers"
        )

# Optional route still exists for compatibility
@router.post("/routes/subscribe")
def legacy_subscribe_route(body: NewsletterSubscriptionRequest) -> NewsletterSubscriptionResponse:
    """Legacy route for subscribing to the newsletter"""
    return subscribe_to_newsletter(BackgroundTasks(), body)

@router.post("/subscribe-to-newsletter")
def subscribe_to_newsletter(background_tasks: BackgroundTasks, body: NewsletterSubscriptionRequest) -> NewsletterSubscriptionResponse:
    print(f"Attempting to subscribe email: {body.email}")
    
    try:
        # Check if email already exists
        if email_exists(body.email):
            return NewsletterSubscriptionResponse(
                status="success",
                message="This email is already subscribed to our newsletter."
            )
        
        # Create new subscriber
        new_subscriber = {
            'id': str(uuid.uuid4()),
            'name': body.name,
            'email': body.email,
            'source': body.source,
            'status': 'active',
            'subscribed_at': datetime.utcnow().isoformat()
        }
        
        # Get and update subscribers list
        subscribers = get_subscribers()
        subscribers.append(new_subscriber)
        save_subscribers(subscribers)
        
        # Build proper unsubscribe URL
        unsubscribe_url = f"{APP_BASE_URL}/unsubscribe/{new_subscriber['id']}"

        # Send notifications in background
        background_tasks.add_task(
            send_admin_notification,
            name=body.name,
            email=body.email,
            source=body.source,
            subscribed_at=new_subscriber['subscribed_at']
        )
        background_tasks.add_task(
            send_welcome_email,
            name=body.name,
            email=body.email,
            source=body.source,
            subscribed_at=new_subscriber['subscribed_at'],
            unsubscribe_url=unsubscribe_url
        )
        
        return NewsletterSubscriptionResponse(
            status="success",
            message="Thank you for subscribing! Please check your email for a welcome message."
        )
        
    except Exception as e:
        print(f"Unexpected error during subscription: {str(e)}")
        return NewsletterSubscriptionResponse(
            status="error",
            message="An unexpected error occurred. Please try again later."
        )

@router.get("/unsubscribe/{subscriber_id}", response_class=HTMLResponse)
async def unsubscribe_user(subscriber_id: str):
    """Unsubscribe a user from the newsletter."""
    try:
        subscribers = get_subscribers()
        
        # Find the subscriber and update their status
        subscriber_found = False
        for sub in subscribers:
            if sub.get("id") == subscriber_id:
                sub["status"] = "unsubscribed"
                subscriber_found = True
                break
        
        if not subscriber_found:
            return HTMLResponse(content="""
                <html>
                    <head><title>Error</title></head>
                    <body>
                        <h1>Subscription Not Found</h1>
                        <p>We couldn't find your subscription. You may already be unsubscribed, or the link may be invalid.</p>
                    </body>
                </html>
            """, status_code=404)

        save_subscribers(subscribers)
        
        return HTMLResponse(content="""
            <html>
                <head><title>Unsubscribed</title></head>
                <body>
                    <h1>You have been unsubscribed.</h1>
                    <p>You will no longer receive newsletter emails from the Bertie Foundation. We're sorry to see you go.</p>
                </body>
            </html>
        """)

    except Exception as e:
        print(f"Error during unsubscription for ID {subscriber_id}: {e}")
        return HTMLResponse(content="""
            <html>
                <head><title>Error</title></head>
                <body>
                    <h1>An error occurred.</h1>
                    <p>We were unable to process your unsubscribe request at this time. Please try again later.</p>
                </body>
            </html>
        """, status_code=500)


@router.delete("/subscriber/{subscriber_id}")
async def delete_subscriber(subscriber_id: str) -> dict:
    """Delete a newsletter subscriber by ID"""
    print(f"Attempting to delete subscriber with ID: {subscriber_id}")
    
    try:
        # Get existing subscribers
        subscribers = get_subscribers()
        
        # Find the subscriber
        subscriber_to_delete = None
        for subscriber in subscribers:
            if subscriber.get("id") == subscriber_id:
                subscriber_to_delete = subscriber
                break
        
        if not subscriber_to_delete:
            return {"status": "error", "message": f"Subscriber with ID {subscriber_id} not found"}
        
        # Remove subscriber
        subscribers = [s for s in subscribers if s.get("id") != subscriber_id]
        save_subscribers(subscribers)
        
        return {"status": "success", "message": "Subscriber deleted successfully"}
    except Exception as e:
        print(f"Error deleting subscriber: {str(e)}")
        return {"status": "error", "message": "Failed to delete subscriber"}
