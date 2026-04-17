from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
import databutton as db

router = APIRouter()

class AnalyticsEvent(BaseModel):
    event_type: str
    component: str
    action: str
    timestamp: datetime = None
    metadata: dict = None

class AnalyticsResponse(BaseModel):
    success: bool
    message: str

def save_analytics_event(event: dict):
    """Save analytics event to storage"""
    events = db.storage.json.get("analytics_events", default=[])
    events.append(event)
    db.storage.json.put("analytics_events", events)

@router.post("/track-event")
def track_event(event: AnalyticsEvent) -> AnalyticsResponse:
    """Track a user interaction event"""
    try:
        event_data = {
            **event.dict(),
            "timestamp": datetime.now().isoformat()
        }
        save_analytics_event(event_data)
        return AnalyticsResponse(success=True, message="Event tracked successfully")
    except Exception as e:
        print(f"Error tracking event: {e}")
        return AnalyticsResponse(success=False, message=str(e))

@router.get("/events-summary")
def get_events_summary() -> dict:
    """Get a summary of tracked events"""
    try:
        events = db.storage.json.get("analytics_events", default=[])
        
        # Group events by type and component
        summary = {
            "total_events": len(events),
            "events_by_type": {},
            "events_by_component": {},
            "recent_events": sorted(events, key=lambda x: x["timestamp"], reverse=True)[:10]
        }
        
        for event in events:
            # Count by event type
            event_type = event["event_type"]
            summary["events_by_type"][event_type] = summary["events_by_type"].get(event_type, 0) + 1
            
            # Count by component
            component = event["component"]
            summary["events_by_component"][component] = summary["events_by_component"].get(component, 0) + 1
        
        return summary
    except Exception as e:
        print(f"Error getting events summary: {e}")
        return {"error": str(e)}