from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from enum import Enum
from typing import List, Optional, Dict, Any
from datetime import datetime
import smtplib, os, uuid
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.db.supabase_client import get_supabase

router = APIRouter(prefix="/moderation")

SMTP_HOST = os.environ.get("SMTP_HOST", "mail.bertiefoundation.org")
SMTP_PORT = 465
SMTP_FROM = os.environ.get("SMTP_EMAIL", "info@bertiefoundation.org")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")

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

def _send_email(to: str, subject: str, html: str):
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Bertie Foundation <{SMTP_FROM}>"
        msg["To"] = to
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as s:
            s.login(SMTP_FROM, SMTP_PASSWORD)
            s.sendmail(SMTP_FROM, to, msg.as_string())
    except Exception as e:
        print(f"Email error: {e}")

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
        result = supabase.table("moderation_submissions").update({"status": new_status, "moderated_at": datetime.now().isoformat(), "admin_notes": request.message}).eq("id", request.content_id).execute()
        if not result.data:
            return ModerationResponse(success=False, message="Submission not found")
        sub = result.data[0]
        if request.notify_user and sub.get("email"):
            _send_email(sub["email"], f"Your submission has been {new_status}", f"<p>Your submission has been <strong>{new_status}</strong>.</p>")
        return ModerationResponse(success=True, message=f"Submission {new_status}", content_id=request.content_id)
    except Exception as e:
        return ModerationResponse(success=False, message=str(e))
