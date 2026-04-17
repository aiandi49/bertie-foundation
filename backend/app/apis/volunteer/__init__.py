from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime
import databutton as db
from app.apis.email_notifications import send_form_notifications
from typing import List

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
    """Submit a volunteer application"""
    try:
        # Store the volunteer application
        applications = db.storage.json.get("volunteer_applications", default=[])
        
        application_data = {
            "id": f"volunteer_{len(applications) + 1}",
            "name": request.name,
            "email": request.email,
            "message": request.message,
            "interests": request.interests,
            "skills": request.skills,
            "availability": request.availability,
            "submitted_at": datetime.now().isoformat(),
            "status": "pending"
        }
        
        applications.append(application_data)
        db.storage.json.put("volunteer_applications", applications)
        
        # Send notification emails using the unified system
        try:
            notification_data = {
                "name": request.name,
                "email": request.email,
                "message": request.message,
                "interests": request.interests,
                "skills": request.skills,
                "availability": request.availability,
                "submitted_at": application_data["submitted_at"]
            }
            
            send_form_notifications("volunteer_application", notification_data)
        except Exception as e:
            print(f"Error sending notification emails: {e}")
            # Continue even if email sending fails
        
        return VolunteerResponse(
            id=application_data["id"],
            status="received",
            submitted_at=datetime.now()
        )
    except Exception as e:
        print(f"Error submitting volunteer application: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e
