from typing import Dict, List, Any, Optional
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Body, HTTPException
from app.db.supabase_client import get_supabase
import uuid

router = APIRouter(prefix="/migration", tags=["migration"])

class MigrationResponse(BaseModel):
    success: bool
    message: str

class LocalStorageData(BaseModel):
    newsletter: Optional[List[Dict[str, Any]]] = []
    contact: Optional[List[Dict[str, Any]]] = []
    volunteer: Optional[List[Dict[str, Any]]] = []
    successStories: Optional[List[Dict[str, Any]]] = []
    feedback: Optional[List[Dict[str, Any]]] = []
    donations: Optional[List[Dict[str, Any]]] = []

def convert_date(date_obj: Any) -> str:
    if isinstance(date_obj, str):
        for fmt in [None, "%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%d %H:%M:%S"]:
            try:
                if fmt is None:
                    return datetime.fromisoformat(date_obj.replace('Z', '+00:00')).isoformat()
                return datetime.strptime(date_obj, fmt).isoformat()
            except ValueError:
                continue
    return datetime.now().isoformat()

def process_local_storage_data(local_data: LocalStorageData) -> List[Dict[str, Any]]:
    results = []
    for item in local_data.newsletter:
        results.append({"form_type": "newsletter", "timestamp": convert_date(item.get('subscribedAt', datetime.now())), "data": {"email": item.get('email',''), "status": item.get('status','active'), "source": item.get('source','website')}})
    for item in local_data.contact:
        results.append({"form_type": "contact", "timestamp": convert_date(item.get('submittedAt', datetime.now())), "data": {"name": item.get('name',''), "email": item.get('email',''), "subject": item.get('subject',''), "message": item.get('message',''), "status": item.get('status','new')}})
    for item in local_data.volunteer:
        results.append({"form_type": "volunteer", "timestamp": convert_date(item.get('submittedAt', datetime.now())), "data": {"name": item.get('name',''), "email": item.get('email',''), "skills": item.get('skills',[]), "interests": item.get('interests',[]), "availability": item.get('availability',''), "message": item.get('message',''), "status": item.get('status','pending')}})
    for item in local_data.successStories:
        results.append({"form_type": "success_stories", "timestamp": convert_date(item.get('submittedAt', datetime.now())), "data": {"title": item.get('title',''), "story": item.get('story',''), "program": item.get('program',''), "impact": item.get('impact',''), "name": item.get('name',''), "email": item.get('email',''), "status": item.get('status','pending')}})
    for item in local_data.feedback:
        results.append({"form_type": "feedback", "timestamp": convert_date(item.get('submittedAt', datetime.now())), "data": {"name": item.get('name',''), "email": item.get('email',''), "rating": item.get('rating',0), "category": item.get('category','general'), "feedback": item.get('feedback','') or item.get('comment','')}})
    for item in local_data.donations:
        results.append({"form_type": "donations", "timestamp": convert_date(item.get('submittedAt', datetime.now())), "data": {"name": item.get('name',''), "email": item.get('email',''), "amount": item.get('amount',0), "program": item.get('program',''), "message": item.get('message',''), "status": item.get('status','pending')}})
    return results

@router.post("/local-storage", response_model=MigrationResponse)
def migrate_from_local_storage(local_storage_data: Dict[str, Any] = Body(...)) -> MigrationResponse:
    try:
        supabase = get_supabase()
        data = LocalStorageData(**local_storage_data)
        processed = process_local_storage_data(data)
        for item in processed:
            try:
                supabase.table("form_submissions").insert({"id": str(uuid.uuid4()), "form_type": item["form_type"], "timestamp": item["timestamp"], "data": item["data"]}).execute()
            except Exception as e:
                print(f"Error inserting item: {e}")
        return MigrationResponse(success=True, message=f"Successfully migrated {len(processed)} submissions")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
