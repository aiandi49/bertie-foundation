from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import uuid
from app.db.supabase_client import get_supabase
from app.apis.email_notifications import send_form_notifications

router = APIRouter()

class FeedbackRequest(BaseModel):
    rating: int
    comment: str
    category: str
    email: Optional[str] = None

class FeedbackResponse(BaseModel):
    message: str
    id: str

@router.post("/feedback")
def submit_feedback(feedback: FeedbackRequest) -> FeedbackResponse:
    try:
        supabase = get_supabase()
        feedback_id = str(uuid.uuid4())
        data = {
            "id": feedback_id,
            "rating": feedback.rating,
            "comment": feedback.comment,
            "category": feedback.category,
            "email": feedback.email,
            "created_at": datetime.now().isoformat(),
            "status": "pending"
        }
        supabase.table("feedback").insert(data).execute()
        try:
            send_form_notifications("feedback", {**data})
        except Exception as e:
            print(f"Notification error: {e}")
        return FeedbackResponse(message="Thank you for your feedback!", id=feedback_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/feedback/stats")
def get_feedback_stats():
    try:
        supabase = get_supabase()
        result = supabase.table("feedback").select("*").eq("status", "approved").execute()
        approved = result.data or []
        total = len(approved)
        if total == 0:
            return {"total_feedback": 0, "average_rating": 0, "category_distribution": {}, "rating_distribution": {str(i): 0 for i in range(1, 6)}}
        total_rating = sum(f["rating"] for f in approved)
        category_dist = {}
        rating_dist = {str(i): 0 for i in range(1, 6)}
        for f in approved:
            rating_dist[str(f["rating"])] = rating_dist.get(str(f["rating"]), 0) + 1
            category_dist[f["category"]] = category_dist.get(f["category"], 0) + 1
        return {"total_feedback": total, "average_rating": round(total_rating / total, 2), "category_distribution": category_dist, "rating_distribution": rating_dist}
    except Exception as e:
        return {"total_feedback": 0, "average_rating": 0, "category_distribution": {}, "rating_distribution": {}}
