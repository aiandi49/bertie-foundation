from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import databutton as db
from typing import List, Optional, Dict, Any
from datetime import datetime

router = APIRouter()

class CRMSubmission(BaseModel):
    id: str
    type: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    submitted_at: str
    status: str
    data: Dict[str, Any]

class CRMResponse(BaseModel):
    submissions: List[CRMSubmission]

@router.get("/crm/submissions")
def get_crm_submissions() -> CRMResponse:
    submissions = []
    
    # Fetch Contact Requests
    try:
        contacts = db.storage.json.get("contact_requests", default=[])
        for c in contacts:
            submissions.append(CRMSubmission(
                id=c.get("id", "unknown"),
                type="Contact",
                name=c.get("name", "Unknown"),
                email=c.get("email"),
                phone=None, # Contact form doesn't seem to have phone
                submitted_at=c.get("submitted_at", datetime.now().isoformat()),
                status=c.get("status", "received"),
                data=c
            ))
    except Exception as e:
        print(f"Error fetching contacts: {e}")

    # Fetch Volunteer Applications
    try:
        volunteers = db.storage.json.get("volunteer_applications", default=[])
        for v in volunteers:
            submissions.append(CRMSubmission(
                id=v.get("id", "unknown"),
                type="Volunteer",
                name=v.get("name", "Unknown"),
                email=v.get("email"),
                phone=v.get("phone"), # Volunteer form might have phone? Let's assume no for now based on previous check, but good to handle if it does
                submitted_at=v.get("submitted_at", datetime.now().isoformat()),
                status=v.get("status", "pending"),
                data=v
            ))
    except Exception as e:
        print(f"Error fetching volunteers: {e}")

    # Fetch Success Stories
    try:
        stories = db.storage.json.get("success_stories", default=[])
        for s in stories:
            submissions.append(CRMSubmission(
                id=s.get("id", "unknown"),
                type="Success Story",
                name=s.get("name", "Unknown"),
                email=s.get("email"),
                phone=None,
                submitted_at=s.get("timestamp", datetime.now().isoformat()), # Stories use 'timestamp'
                status=s.get("status", "pending"),
                data=s
            ))
    except Exception as e:
        print(f"Error fetching stories: {e}")

    # Fetch Feedback
    try:
        feedback = db.storage.json.get("feedback_data", default=[])
        for f in feedback:
            submissions.append(CRMSubmission(
                id=f.get("id", "unknown"),
                type="Feedback",
                name="Anonymous" if not f.get("email") else f.get("email"), # Feedback might be anon
                email=f.get("email"),
                phone=None,
                submitted_at=f.get("timestamp", datetime.now().isoformat()),
                status=f.get("status", "pending"),
                data=f
            ))
    except Exception as e:
        print(f"Error fetching feedback: {e}")

    # Sort by submitted_at desc
    submissions.sort(key=lambda x: x.submitted_at, reverse=True)

    return CRMResponse(submissions=submissions)
