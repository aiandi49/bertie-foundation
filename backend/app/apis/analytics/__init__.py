from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from app.db.supabase_client import get_supabase

router = APIRouter()

class AnalyticsEvent(BaseModel):
    event_type: str
    component: str
    action: str
    metadata: dict = {}

@router.post("/track-event")
def track_event(event: AnalyticsEvent) -> dict:
    try:
        supabase = get_supabase()
        supabase.table("analytics_events").insert({"event_type": event.event_type, "component": event.component, "action": event.action, "metadata": event.metadata, "timestamp": datetime.now().isoformat()}).execute()
        return {"success": True, "message": "Event tracked"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@router.get("/events-summary")
def get_events_summary() -> dict:
    try:
        supabase = get_supabase()
        result = supabase.table("analytics_events").select("*").order("timestamp", desc=True).execute()
        events = result.data or []
        by_type = {}
        by_component = {}
        for e in events:
            by_type[e["event_type"]] = by_type.get(e["event_type"], 0) + 1
            by_component[e["component"]] = by_component.get(e["component"], 0) + 1
        return {"total_events": len(events), "events_by_type": by_type, "events_by_component": by_component, "recent_events": events[:10]}
    except Exception as e:
        return {"error": str(e)}
