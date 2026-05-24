from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel
from enum import Enum
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from app.db.supabase_client import get_supabase, supabase_available
from app.apis.email_notifications import send_form_notifications, send_email, EmailNotification

router = APIRouter(prefix="/moderation")


class ContentType(str, Enum):
    Feedback = "feedback"
    SuccessStory = "success-story"
    Volunteer = "volunteer"
    Contact = "contact"


class ModerationAction(str, Enum):
    APPROVE = "approve"
    REJECT = "reject"


class ModerationActionRequest(BaseModel):
    content_id: str
    action: ModerationAction
    notify_user: bool = True
    message: Optional[str] = None


class ModerationResponse(BaseModel):
    success: bool
    message: str
    content_id: Optional[str] = None


@router.post("/submit")
async def submit_content(
    content_type: ContentType = Query(...),
    data: Dict[str, Any] = Body(None)
) -> ModerationResponse:
    try:
        submission_id = str(uuid.uuid4())
        now = datetime.now().isoformat()

        record = {
            "id": submission_id,
            "content_type": content_type.value,
            "status": "pending",
            "created_at": now,
            "email": data.get("email") if data else None,
            "name": data.get("name") if data else None,
            "data": data or {},
        }

        if supabase_available():
            try:
                get_supabase().table("moderation_submissions").insert(record).execute()
            except Exception as e:
                print(f"DB save error (non-fatal): {e}")

        try:
            send_form_notifications(content_type.value, {**record, "submitted_at": now})
        except Exception as e:
            print(f"Notification error (non-fatal): {e}")

        return ModerationResponse(
            success=True,
            message="Submission received successfully",
            content_id=submission_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pending")
async def get_pending_submissions() -> dict:
    try:
        supabase = get_supabase()
        result = supabase.table("moderation_submissions").select("*").eq("status", "pending").execute()
        return {"pending_submissions": result.data or [], "counts": {"pending": len(result.data or [])}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/action")
async def take_moderation_action(request: ModerationActionRequest) -> ModerationResponse:
    try:
        supabase = get_supabase()
        new_status = "approved" if request.action == ModerationAction.APPROVE else "rejected"
        result = supabase.table("moderation_submissions").update({
            "status": new_status,
            "moderated_at": datetime.now().isoformat(),
            "admin_notes": request.message
        }).eq("id", request.content_id).execute()
        if not result.data:
            return ModerationResponse(success=False, message="Submission not found")
        sub = result.data[0]
        if request.notify_user and sub.get("email"):
            send_email(EmailNotification(
                to=sub["email"],
                subject=f"Your submission has been {new_status}",
                content_html=f"<p>Your submission has been <strong>{new_status}</strong>.</p>"
            ))
        return ModerationResponse(success=True, message=f"Submission {new_status}", content_id=request.content_id)
    except Exception as e:
        return ModerationResponse(success=False, message=str(e))
