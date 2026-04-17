from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel, EmailStr
import databutton as db
from datetime import datetime
import json

router = APIRouter()

class SuccessStory(BaseModel):
    title: str
    story: str
    program: str
    impact: str
    name: str
    email: str
    image_url: str | None = None

class SuccessStoryResponse(BaseModel):
    message: str
    id: str

class ProgramImpact(BaseModel):
    program_name: str
    beneficiaries: int
    success_rate: float
    key_achievement: str

class CommunityStats(BaseModel):
    total_stories: int
    total_volunteers: int
    active_programs: int
    total_hours: int
    total_beneficiaries: int
    avg_satisfaction: float
    funds_raised: float
    program_distribution: dict[str, int]
    program_impacts: list[ProgramImpact]
    recent_stories: list[SuccessStory]

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return "".join(c for c in key if c.isalnum() or c in "._-")

@router.post("/success-stories")
async def submit_success_story_form(
    title: str = Form(...),
    story: str = Form(...),
    program: str = Form(...),
    impact: str = Form(...),
    name: str = Form(...),
    email: str = Form(...),
    image: UploadFile | None = File(None)
) -> SuccessStoryResponse:
    # Generate unique ID for the story
    story_id = f"story_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # Handle image upload if provided
    image_url = None
    if image:
        file_ext = image.filename.split('.')[-1]
        image_key = f"success_stories/{story_id}.{file_ext}"
        image_content = await image.read()
        db.storage.binary.put(sanitize_storage_key(image_key), image_content)
        image_url = f"/public/{image_key}"
    
    # Create story object
    story_data = {
        "id": story_id,
        "title": title,
        "story": story,
        "program": program,
        "impact": impact,
        "name": name,
        "email": email,
        "image_url": image_url,
        "timestamp": datetime.now().isoformat(),
        "status": "pending"  # pending, approved, rejected
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
    
    return SuccessStoryResponse(
        message="Your story has been submitted successfully!",
        id=story_id
    )

@router.get("/community-stats")
def get_community_stats() -> CommunityStats:
    # Get success stories
    try:
        all_stories = db.storage.json.get("success_stories")
    except:
        all_stories = []
    
    # Get approved stories only
    approved_stories = [story for story in all_stories if story.get("status") == "approved"]
    
    # Calculate program distribution
    program_dist = {}
    for story in approved_stories:
        program = story.get("program")
        program_dist[program] = program_dist.get(program, 0) + 1
    
    # Get recent stories (last 5 approved stories)
    recent_stories = [
        SuccessStory(
            title=story["title"],
            story=story["story"],
            program=story["program"],
            impact=story["impact"],
            name=story["name"],
            email=story["email"],
            image_url=story.get("image_url")
        )
        for story in sorted(
            approved_stories,
            key=lambda x: x["timestamp"],
            reverse=True
        )[:5]
    ]
    
    # Mock program impacts (in real app, these would come from a database)
    program_impacts = [
        ProgramImpact(
            program_name="Youth Mentoring",
            beneficiaries=500,
            success_rate=0.92,
            key_achievement="90% improved academic performance"
        ),
        ProgramImpact(
            program_name="Community Garden",
            beneficiaries=750,
            success_rate=0.88,
            key_achievement="3,000+ lbs of produce distributed"
        ),
        ProgramImpact(
            program_name="Education Support",
            beneficiaries=1200,
            success_rate=0.95,
            key_achievement="85% college acceptance rate"
        ),
        ProgramImpact(
            program_name="Elderly Care",
            beneficiaries=450,
            success_rate=0.94,
            key_achievement="75% reduction in isolation"
        ),
        ProgramImpact(
            program_name="Skills Development",
            beneficiaries=800,
            success_rate=0.91,
            key_achievement="92% job placement rate"
        )
    ]

    # Calculate total beneficiaries
    total_beneficiaries = sum(impact.beneficiaries for impact in program_impacts)
    
    # Mock some engagement metrics (in real app, these would come from a database)
    return CommunityStats(
        total_stories=len(approved_stories),
        total_volunteers=2000,
        active_programs=95,
        total_hours=55000,
        total_beneficiaries=total_beneficiaries,
        avg_satisfaction=4.8,
        funds_raised=250000.0,
        program_distribution=program_dist,
        program_impacts=program_impacts,
        recent_stories=recent_stories
    )
