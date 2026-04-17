from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from datetime import datetime
import uuid
from app.db.supabase_client import get_supabase

router = APIRouter()

@router.post("/success-stories")
async def submit_success_story_form(title: str = Form(...), story: str = Form(...), program: str = Form(...), impact: str = Form(...), name: str = Form(...), email: str = Form(...), image: Optional[UploadFile] = File(None)) -> dict:
    try:
        supabase = get_supabase()
        story_id = str(uuid.uuid4())
        data = {"id": story_id, "title": title, "story": story, "program": program, "impact": impact, "name": name, "email": email, "image_url": None, "timestamp": datetime.now().isoformat(), "status": "pending"}
        supabase.table("success_stories").insert(data).execute()
        return {"message": "Your story has been submitted successfully!", "id": story_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/community-stats")
def get_community_stats() -> dict:
    try:
        supabase = get_supabase()
        result = supabase.table("success_stories").select("*").eq("status", "approved").execute()
        stories = result.data or []
        program_dist = {}
        for s in stories:
            p = s.get("program")
            if p:
                program_dist[p] = program_dist.get(p, 0) + 1
        recent_stories = sorted(stories, key=lambda x: x.get("timestamp",""), reverse=True)[:5]
        return {"total_stories": len(stories), "total_volunteers": 2000, "active_programs": 95, "total_hours": 55000, "total_beneficiaries": 2450, "avg_satisfaction": 4.8, "funds_raised": 250000.0, "program_distribution": program_dist, "recent_stories": recent_stories}
    except Exception as e:
        return {"total_stories": 0, "total_volunteers": 0, "active_programs": 0, "total_hours": 0, "total_beneficiaries": 0, "avg_satisfaction": 0, "funds_raised": 0, "program_distribution": {}, "recent_stories": []}
