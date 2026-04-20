from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime
import uuid
import threading
from app.db.supabase_client import supabase_available, get_supabase
from app.apis.email_notifications import send_form_notifications

router = APIRouter()


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str
    category: str


class ContactResponse(BaseModel):
    id: str
    status: str
    submitted_at: datetime


@router.post("/contact")
def submit_contact(request: ContactRequest) -> ContactResponse:
    contact_id = str(uuid.uuid4())
    now = datetime.now()

    contact_data = {
        "id": contact_id,
        "name": request.name,
        "email": request.email,
        "subject": request.subject,
        "message": request.message,
        "category": request.category,
        "submitted_at": now.isoformat(),
        "status": "received",
    }

    # Save to DB if available
    if supabase_available():
        try:
            get_supabase().table("contact_requests").insert(contact_data).execute()
        except Exception as e:
            print(f"DB save error (non-fatal): {e}")

    # Always try to send email notification — in background so response is instant
    try:
        threading.Thread(
            target=send_form_notifications,
            args=("contact_form", {**contact_data}),
            daemon=True
        ).start()
    except Exception as e:
        print(f"Email notification error (non-fatal): {e}")

    return ContactResponse(id=contact_id, status="received", submitted_at=now)
