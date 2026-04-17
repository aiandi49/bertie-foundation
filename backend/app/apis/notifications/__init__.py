from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime
import uuid
from app.db.supabase_client import get_supabase

router = APIRouter()

class CreateNotificationRequest(BaseModel):
    title: str
    description: str
    type: str
    date: str

@router.get("/notifications")
def get_notifications() -> List[dict]:
    try:
        supabase = get_supabase()
        result = supabase.table("notifications").select("*").order("created_at", desc=True).execute()
        return result.data or []
    except Exception:
        return []

@router.post("/notifications")
def create_notification(n: CreateNotificationRequest) -> dict:
    try:
        supabase = get_supabase()
        data = {"id": str(uuid.uuid4()), "title": n.title, "description": n.description, "type": n.type, "date": n.date, "created_at": datetime.now().isoformat()}
        result = supabase.table("notifications").insert(data).execute()
        return result.data[0] if result.data else data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
