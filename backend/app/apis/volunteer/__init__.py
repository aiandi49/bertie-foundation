from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List
import uuid
from app.db.supabase_client import supabase_available, get_supabase
from app.apis.email_notifications import send_form_notifications

router = APIRouter()


class VolunteerRequest(BaseModel):
    name: str
    email: EmailStr
    message: str
    interests: List[str] = []
    skills: List[str] = []
    availability: str = "To be discussed"


class VolunteerResponse(BaseModel):
    id: str
    status: str
    submitted_at: datetime


@router.post("/volunteer")
def submit_volunteer_application(request: VolunteerRequest) -> VolunteerResponse:
    vol_id = str(uuid.uuid4())
    now = datetime.now()

    data = {
        "id": vol_id,
        "name": request.name,
        "email": request.email,
        "message": request.message,
        "interests": request.interests,
        "skills": request.skills,
        "availability": request.availability,
        "submitted_at": now.isoformat(),
        "status": "pending",
    }

    if supabase_available():
        try:
            get_supabase().table("volunteer_applications").insert(data).execute()
        except Exception as e:
            print(f"DB save error (non-fatal): {e}")

    try:
        send_form_notifications("volunteer_application", {**data})
    except Exception as e:
        print(f"Notification error (non-fatal): {e}")

    return VolunteerResponse(id=vol_id, status="received", submitted_at=now)
