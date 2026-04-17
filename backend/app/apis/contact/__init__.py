from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime
import databutton as db
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
    """Submit a contact form"""
    try:
        # Store the contact request
        contacts = db.storage.json.get("contact_requests", default=[])
        
        contact_data = {
            "id": f"contact_{len(contacts) + 1}",
            "name": request.name,
            "email": request.email,
            "subject": request.subject,
            "message": request.message,
            "category": request.category,
            "submitted_at": datetime.now().isoformat(),
            "status": "received"
        }
        
        contacts.append(contact_data)
        db.storage.json.put("contact_requests", contacts)
        
        # Send notification emails using the unified system
        try:
            notification_data = {
                "name": request.name,
                "email": request.email,
                "subject": request.subject,
                "message": request.message,
                "category": request.category,
                "submitted_at": contact_data["submitted_at"]
            }
            
            send_form_notifications("contact_form", notification_data)
        except Exception as e:
            print(f"Error sending notification emails: {e}")
            # Continue even if email sending fails
        
        return ContactResponse(
            id=contact_data["id"],
            status="received",
            submitted_at=datetime.now()
        )
    except Exception as e:
        print(f"Error submitting contact form: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e
