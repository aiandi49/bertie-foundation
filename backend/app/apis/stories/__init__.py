from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
import uuid
import threading
from app.apis.email_notifications import send_form_notifications
from app.db.supabase_client import get_supabase

router = APIRouter()

class SuccessStoryRequest(BaseModel):
    title: str
    story: str
    program: str
    impact: str
    name: str
    email: str
    imageUrl: Optional[str] = None
    tags: Optional[List[str]] = None

@router.post("/success-story")
def submit_success_story(story: SuccessStoryRequest) -> dict:
    try:
        supabase = get_supabase()
        story_id = str(uuid.uuid4())
        data = {"id": story_id, "title": story.title, "story": story.story, "program": story.program, "impact": story.impact, "name": story.name, "email": story.email, "image_url": story.imageUrl, "tags": story.tags or [], "status": "pending", "timestamp": datetime.now().isoformat()}
        supabase.table("success_stories").insert(data).execute()
        try:
            threading.Thread(
                target=send_form_notifications,
                args=("success_story", {**data}),
                daemon=True
            ).start()
        except Exception as e:
            print(f"Notification error: {e}")
        return {"message": "Thank you for sharing your story!", "id": story_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/success-stories")
def get_success_stories() -> List[dict]:
    try:
        supabase = get_supabase()
        result = supabase.table("success_stories").select("*").eq("status", "approved").order("timestamp", desc=True).execute()
        return result.data or []
    except Exception:
        return []
