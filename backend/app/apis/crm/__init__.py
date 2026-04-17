from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.db.supabase_client import get_supabase

router = APIRouter()

class CRMSubmission(BaseModel):
    id: str
    type: str
    name: str
    email: Optional[str] = None
    submitted_at: str
    status: str
    data: Dict[str, Any]

class CRMResponse(BaseModel):
    submissions: List[CRMSubmission]

@router.get("/crm/submissions")
def get_crm_submissions() -> CRMResponse:
    supabase = get_supabase()
    submissions = []
    def fetch(table, type_label, date_field="submitted_at", status_field="status", default_status="received"):
        try:
            result = supabase.table(table).select("*").execute()
            for r in (result.data or []):
                submissions.append(CRMSubmission(id=str(r.get("id","")), type=type_label, name=r.get("name","Unknown"), email=r.get("email"), submitted_at=r.get(date_field, datetime.now().isoformat()), status=r.get(status_field, default_status), data=r))
        except Exception as e:
            print(f"CRM fetch error ({table}): {e}")
    fetch("contact_requests", "Contact")
    fetch("volunteer_applications", "Volunteer", status_field="status", default_status="pending")
    fetch("success_stories", "Success Story", date_field="timestamp", status_field="status", default_status="pending")
    fetch("feedback", "Feedback", date_field="created_at")
    submissions.sort(key=lambda x: x.submitted_at, reverse=True)
    return CRMResponse(submissions=submissions)
