from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List
import uuid
from app.db.supabase_client import get_supabase
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
    try:
        supabase = get_supabase()
        data = {
            "id": str(uuid.uuid4()),
            "name": request.name,
            "email": request.email,
            "message": request.message,
            "interests": request.interests,
            "skills": request.skills,
            "availability": request.availability,
            "submitted_at": datetime.now().isoformat(),
            "status": "pending"
        }
        supabase.table("volunteer_applications").insert(data).execute()
        try:
            send_form_notifications("volunteer_application", {**data})
        except Exception as e:
            print(f"Notification error: {e}")
        return VolunteerResponse(id=data["id"], status="received", submitted_at=datetime.now())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
