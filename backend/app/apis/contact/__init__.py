from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime
import uuid
from app.db.supabase_client import get_supabase
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
    try:
        supabase = get_supabase()
        contact_data = {
            "id": str(uuid.uuid4()),
            "name": request.name,
            "email": request.email,
            "subject": request.subject,
            "message": request.message,
            "category": request.category,
            "submitted_at": datetime.now().isoformat(),
            "status": "received"
        }
        supabase.table("contact_requests").insert(contact_data).execute()
        try:
            send_form_notifications("contact_form", {**contact_data})
        except Exception as e:
            print(f"Error sending notification: {e}")
        return ContactResponse(id=contact_data["id"], status="received", submitted_at=datetime.now())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
