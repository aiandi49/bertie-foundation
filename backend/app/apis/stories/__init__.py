from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import databutton as db
from datetime import datetime
import re
import json
from app.apis.email_notifications import send_form_notifications

router = APIRouter()

class SuccessStoryRequest(BaseModel):
    title: str
    story: str
    program: str
    impact: str
    name: str
    email: str
    imageUrl: str | None = None
    tags: list[str] | None = None

class SuccessStoryResponse(BaseModel):
    message: str
    id: str

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return "".join(c for c in key if c.isalnum() or c in "._-")

@router.post("/success-story")
def submit_success_story(story: SuccessStoryRequest) -> SuccessStoryResponse:
    # Create a unique ID for the success story
    story_id = f"story_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # Add timestamp and status to story data
    story_data = {
        **story.model_dump(),
        "timestamp": datetime.now().isoformat(),
        "id": story_id,
        "status": "pending"
    }
    
    # Get existing stories or create new list
    try:
        all_stories = db.storage.json.get("success_stories")
    except:
        all_stories = []
    
    # Add new story
    all_stories.append(story_data)
    
    # Store updated stories
    db.storage.json.put("success_stories", all_stories)
    
    # Send notification emails using the unified system
    try:
        notification_data = {
            "title": story.title,
            "story": story.story,
            "program": story.program,
            "impact": story.impact,
            "name": story.name,
            "email": story.email,
            "imageUrl": story.imageUrl,
            "tags": story.tags,
            "submitted_at": story_data["timestamp"]
        }
        
        send_form_notifications("success_story", notification_data)
    except Exception as e:
        print(f"Error sending notification emails: {e}")
        # Continue even if email sending fails
        
    return SuccessStoryResponse(
        message="Thank you for sharing your story!",
        id=story_id
    )

@router.get("/success-stories")
def get_success_stories():
    try:
        all_stories = db.storage.json.get("success_stories")
    except:
        all_stories = []
        
    # Return the approved stories in reverse chronological order (newest first)
    approved_stories = [story for story in all_stories if story.get("status") == "approved"]
    return sorted(approved_stories, key=lambda x: x.get("timestamp", ""), reverse=True)

@router.get("/story-community-stats")
def get_story_community_stats():
    # Initialize stats
    stats = {
        "total_stories": 0,
        "total_programs": 0,
        "popular_programs": [],
        "recent_story": None
    }
    
    try:
        # Get success stories
        all_stories = db.storage.json.get("success_stories")
        
        # Filter approved stories
        approved_stories = [story for story in all_stories if story.get("status") == "approved"]
        
        # Count stories
        stats["total_stories"] = len(approved_stories)
        
        # Calculate program statistics
        programs = {}
        for story in approved_stories:
            program = story.get("program")
            if program:
                programs[program] = programs.get(program, 0) + 1
        
        # Sort programs by popularity
        popular_programs = sorted(programs.items(), key=lambda x: x[1], reverse=True)
        stats["total_programs"] = len(programs)
        stats["popular_programs"] = [{
            "name": program,
            "count": count
        } for program, count in popular_programs[:3]]
        
        # Get most recent story
        if approved_stories:
            sorted_stories = sorted(approved_stories, key=lambda x: x.get("timestamp", ""), reverse=True)
            stats["recent_story"] = {
                "id": sorted_stories[0].get("id"),
                "title": sorted_stories[0].get("title"),
                "name": sorted_stories[0].get("name"),
                "timestamp": sorted_stories[0].get("timestamp")
            }
    except Exception as e:
        print(f"Error getting community stats: {e}")
    
    return stats
