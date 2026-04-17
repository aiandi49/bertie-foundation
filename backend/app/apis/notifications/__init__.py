from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import databutton as db
from datetime import datetime

router = APIRouter()

class Notification(BaseModel):
    id: str
    title: str
    description: str
    type: str  # 'volunteer' or 'event'
    date: str
    created_at: str

class CreateNotificationRequest(BaseModel):
    title: str
    description: str
    type: str
    date: str

def get_notifications_from_storage() -> List[Notification]:
    """Get notifications from storage"""
    try:
        notifications = db.storage.json.get('notifications', default=[])
        return [Notification(**n) for n in notifications]
    except Exception as e:
        print(f"Error getting notifications: {e}")
        return []

def save_notifications_to_storage(notifications: List[Notification]) -> None:
    """Save notifications to storage"""
    try:
        db.storage.json.put('notifications', [n.dict() for n in notifications])
    except Exception as e:
        print(f"Error saving notifications: {e}")
        raise HTTPException(status_code=500, detail="Error saving notification")

@router.get("/notifications")
def get_notifications() -> List[Notification]:
    """Get all notifications"""
    return get_notifications_from_storage()

@router.post("/notifications")
def create_notification(notification: CreateNotificationRequest) -> Notification:
    """Create a new notification"""
    notifications = get_notifications_from_storage()
    
    new_notification = Notification(
        id=f"notif_{len(notifications) + 1}",
        title=notification.title,
        description=notification.description,
        type=notification.type,
        date=notification.date,
        created_at=datetime.now().isoformat()
    )
    
    notifications.append(new_notification)
    save_notifications_to_storage(notifications)
    
    return new_notification
