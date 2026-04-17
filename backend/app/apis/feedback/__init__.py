from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
import databutton as db
from datetime import datetime
import json
from app.apis.email_notifications import send_form_notifications

router = APIRouter()

class FeedbackRequest(BaseModel):
    rating: int
    comment: str
    category: str
    email: str | None = None

class FeedbackResponse(BaseModel):
    message: str
    id: str

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return "".join(c for c in key if c.isalnum() or c in "._-")

@router.post("/feedback")
def submit_feedback(feedback: FeedbackRequest) -> FeedbackResponse:
    # Create a unique ID for the feedback
    feedback_id = f"feedback_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # Add timestamp and pending status to feedback data
    feedback_data = {
        **feedback.model_dump(),
        "timestamp": datetime.now().isoformat(),
        "id": feedback_id,
        "status": "pending"
    }
    
    # Get existing feedback or create new list
    try:
        all_feedback = db.storage.json.get("feedback_data")
    except:
        all_feedback = []
    
    # Add new feedback
    all_feedback.append(feedback_data)
    
    # Store updated feedback
    db.storage.json.put("feedback_data", all_feedback)
    
    # Send notification emails using the unified system
    try:
        notification_data = {
            "rating": feedback.rating,
            "comment": feedback.comment,
            "category": feedback.category,
            "email": feedback.email,
            "created_at": feedback_data["timestamp"]
        }
        
        # Only send user confirmation if email was provided
        send_form_notifications("feedback", notification_data)
    except Exception as e:
        print(f"Error sending notification emails: {e}")
        # Continue even if email sending fails
    
    return FeedbackResponse(
        message="Thank you for your feedback!",
        id=feedback_id
    )

@router.get("/feedback/stats")
def get_feedback_stats():
    try:
        all_feedback = db.storage.json.get("feedback_data")
        # Filter for approved feedback only
        approved_feedback = [f for f in all_feedback if f.get("status") == "approved"]
    except:
        approved_feedback = []
    
    # Calculate statistics
    total_feedback = len(approved_feedback)
    if total_feedback == 0:
        return {
            "total_feedback": 0,
            "average_rating": 0,
            "category_distribution": {},
            "rating_distribution": {str(i): 0 for i in range(1, 6)}
        }
    
    # Calculate averages and distributions
    total_rating = 0
    category_dist = {}
    rating_dist = {str(i): 0 for i in range(1, 6)}
    
    for feedback in approved_feedback:
        rating = feedback["rating"]
        category = feedback["category"]
        
        total_rating += rating
        rating_dist[str(rating)] += 1
        category_dist[category] = category_dist.get(category, 0) + 1
    
    return {
        "total_feedback": total_feedback,
        "average_rating": round(total_rating / total_feedback, 2),
        "category_distribution": category_dist,
        "rating_distribution": rating_dist
    }
