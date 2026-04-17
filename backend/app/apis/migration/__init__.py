from typing import Dict, List, Any, Optional
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Body, HTTPException
import databutton as db

# Create a router
router = APIRouter(prefix="/migration", tags=["migration"])

# Define response model
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

def convert_date(date_obj: Any) -> datetime:
    """Convert various date formats to datetime"""
    if isinstance(date_obj, str):
        try:
            return datetime.fromisoformat(date_obj.replace('Z', '+00:00'))
        except ValueError:
            try:
                return datetime.strptime(date_obj, "%Y-%m-%dT%H:%M:%S.%fZ")
            except ValueError:
                pass
            
            try:
                return datetime.strptime(date_obj, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                pass
    
    # Default to current time if parsing fails
    return datetime.now()

def process_local_storage_data(local_data: LocalStorageData) -> List[Dict[str, Any]]:
    """Process and convert local storage data to centralized format"""
    results = []
    
    # Process newsletter subscriptions
    for item in local_data.newsletter:
        timestamp = convert_date(item.get('subscribedAt', datetime.now()))
        processed = {
            "form_type": "newsletter",
            "timestamp": timestamp,
            "data": {
                "email": item.get('email', ''),
                "status": item.get('status', 'active'),
                "source": item.get('source', 'website')
            }
        }
        results.append(processed)
    
    # Process contact form submissions
    for item in local_data.contact:
        timestamp = convert_date(item.get('submittedAt', datetime.now()))
        processed = {
            "form_type": "contact",
            "timestamp": timestamp,
            "data": {
                "name": item.get('name', ''),
                "email": item.get('email', ''),
                "subject": item.get('subject', ''),
                "message": item.get('message', ''),
                "status": item.get('status', 'new')
            }
        }
        results.append(processed)
    
    # Process volunteer applications
    for item in local_data.volunteer:
        timestamp = convert_date(item.get('submittedAt', datetime.now()))
        processed = {
            "form_type": "volunteer",
            "timestamp": timestamp,
            "data": {
                "name": item.get('name', ''),
                "email": item.get('email', ''),
                "phone": item.get('phone', ''),
                "skills": item.get('skills', []),
                "interests": item.get('interests', []),
                "availability": item.get('availability', ''),
                "message": item.get('message', ''),
                "status": item.get('status', 'pending')
            }
        }
        results.append(processed)
    
    # Process success stories
    for item in local_data.successStories:
        timestamp = convert_date(item.get('submittedAt', datetime.now()))
        processed = {
            "form_type": "success_stories",
            "timestamp": timestamp,
            "data": {
                "title": item.get('title', ''),
                "story": item.get('story', ''),
                "program": item.get('program', ''),
                "impact": item.get('impact', ''),
                "name": item.get('name', ''),
                "email": item.get('email', ''),
                "imageUrl": item.get('imageUrl', ''),
                "tags": item.get('tags', []),
                "approved": item.get('approved', False),
                "status": item.get('status', 'pending')
            }
        }
        results.append(processed)
    
    # Process feedback submissions
    for item in local_data.feedback:
        timestamp = convert_date(item.get('submittedAt', datetime.now()))
        processed = {
            "form_type": "feedback",
            "timestamp": timestamp,
            "data": {
                "name": item.get('name', ''),
                "email": item.get('email', ''),
                "rating": item.get('rating', 0),
                "category": item.get('category', 'general'),
                "feedback": item.get('feedback', '') or item.get('comment', ''),
                "approved": item.get('approved', False)
            }
        }
        results.append(processed)
    
    # Process donation submissions
    for item in local_data.donations:
        timestamp = convert_date(item.get('submittedAt', datetime.now()))
        processed = {
            "form_type": "donations",
            "timestamp": timestamp,
            "data": {
                "name": item.get('name', ''),
                "email": item.get('email', ''),
                "amount": item.get('amount', 0),
                "program": item.get('program', ''),
                "message": item.get('message', ''),
                "status": item.get('status', 'pending')
            }
        }
        results.append(processed)
    
    return results

@router.post("/local-storage", response_model=MigrationResponse)
def migrate_from_local_storage2(local_storage_data: Dict[str, Any] = Body(...)) -> MigrationResponse:
    """Migrate form submissions from localStorage to the centralized system"""
    try:
        # Parse local storage data
        data = LocalStorageData(**local_storage_data)
        processed_data = process_local_storage_data(data)
        
        # This endpoint just processes the data and returns success
        # The actual storage is handled by the form_submissions API
        
        return MigrationResponse(
            success=True,
            message=f"Successfully processed {len(processed_data)} form submissions"
        )
    except Exception as e:
        print(f"Error migrating form submissions: {e}")
        raise HTTPException(status_code=500, detail=str(e))
