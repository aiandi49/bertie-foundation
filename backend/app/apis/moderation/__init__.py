from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from enum import Enum
from typing import List, Optional, Dict, Any, Union
import databutton as db
import uuid
from datetime import datetime
import json
import re
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

router = APIRouter(prefix="/moderation")

# SMTP configuration
SMTP_HOST = os.environ.get("SMTP_HOST", "mail.bertiefoundation.org")
SMTP_PORT = 465
SMTP_FROM = os.environ.get("SMTP_EMAIL", "info@bertiefoundation.org")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")

class ContentType(str, Enum):
    """Content types that require moderation"""
    FEEDBACK = "feedback"
    SUCCESS_STORY = "success-story"
    VOLUNTEER = "volunteer"
    CONTACT = "contact"

class ContentStatus(str, Enum):
    """Status of moderated content"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class ModerationAction(str, Enum):
    """Actions that can be taken on content"""
    APPROVE = "approve"
    REJECT = "reject"

class ContentSubmission(BaseModel):
    """Base model for content submissions"""
    id: str
    content_type: ContentType
    status: ContentStatus
    created_at: str
    email: Optional[str] = None
    name: Optional[str] = None
    data: Dict[str, Any] = {}

class ModerationActionRequest(BaseModel):
    """Request to take action on content"""
    content_id: str
    action: ModerationAction
    notify_user: bool = True
    message: Optional[str] = None
    admin_notes: Optional[str] = None

class ModerationResponse(BaseModel):
    """Response for moderation actions"""
    success: bool
    message: str
    content_id: Optional[str] = None

class NotificationRequest(BaseModel):
    """Notification to send to admin or user"""
    recipient: str
    subject: str
    content_text: str
    content_html: str

class PendingSubmissionsResponse(BaseModel):
    """Response containing pending submissions"""
    pending_submissions: List[ContentSubmission]
    counts: Dict[str, int]

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

def get_content_storage_key(content_type: ContentType) -> str:
    """Get storage key for a content type"""
    mapping = {
        ContentType.FEEDBACK: "moderation_feedback",
        ContentType.SUCCESS_STORY: "moderation_success_stories",
        ContentType.VOLUNTEER: "moderation_volunteer",
        ContentType.CONTACT: "moderation_contact"
    }
    return mapping.get(content_type, "moderation_other")

def get_all_submissions() -> Dict[str, List[dict]]:
    """Get all submissions from storage"""
    all_submissions = {}
    
    # Get submissions for each content type
    for content_type in ContentType:
        storage_key = get_content_storage_key(content_type)
        try:
            submissions = db.storage.json.get(storage_key, default=[])
            all_submissions[content_type] = submissions
        except:
            all_submissions[content_type] = []
    
    return all_submissions

def save_submissions(content_type: ContentType, submissions: List[dict]) -> bool:
    """Save submissions to storage"""
    storage_key = get_content_storage_key(content_type)
    try:
        db.storage.json.put(sanitize_storage_key(storage_key), submissions)
        return True
    except Exception as e:
        print(f"Error saving submissions: {e}")
        return False

def send_notification(notification: NotificationRequest) -> bool:
    """Send notification to user or admin via SMTP"""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = notification.subject
        msg["From"] = f"Bertie Foundation <{SMTP_FROM}>"
        msg["To"] = notification.recipient
        if notification.content_html:
            msg.attach(MIMEText(notification.content_html, "html"))
        elif notification.content_text:
            msg.attach(MIMEText(notification.content_text, "plain"))
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
            server.login(SMTP_FROM, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, notification.recipient, msg.as_string())
        print(f"Moderation notification sent to {notification.recipient}")
        return True
    except Exception as e:
        print(f"Error sending moderation notification: {e}")
        return False

@router.post("/submit")
async def submit_content(content: Dict[str, Any], content_type: ContentType) -> ModerationResponse:
    """Submit content for moderation"""
    try:
        storage_key = get_content_storage_key(content_type)
        
        # Get existing submissions
        submissions = db.storage.json.get(sanitize_storage_key(storage_key), default=[])
        
        # Create new submission entry
        submission_id = f"{content_type}_{uuid.uuid4()}"
        submission = {
            "id": submission_id,
            "content_type": content_type,
            "status": ContentStatus.PENDING,
            "created_at": datetime.now().isoformat(),
            "email": content.get("email"),
            "name": content.get("name"),
            "data": content
        }
        
        # Add to submissions and save
        submissions.append(submission)
        db.storage.json.put(sanitize_storage_key(storage_key), submissions)
        
        # Send notification to admin
        admin_email = os.environ.get("ADMIN_EMAIL")
        if admin_email:
            send_notification(NotificationRequest(
                recipient=admin_email,
                subject=f"New {content_type.value} submission requires moderation",
                content_text=f"A new {content_type.value} submission has been received and requires moderation. ID: {submission_id}\n\nSubmission details:\n{json.dumps(content, indent=2)}",
                content_html=f"<h2>New {content_type.value} submission</h2><p>A new submission has been received and requires moderation.</p><p><strong>ID:</strong> {submission_id}</p><pre>{json.dumps(content, indent=2)}</pre>"
            ))
        
        return ModerationResponse(
            success=True,
            message=f"Content submitted for moderation",
            content_id=submission_id
        )
    except Exception as e:
        print(f"Error submitting content: {e}")
        return ModerationResponse(
            success=False,
            message=f"Error submitting content: {str(e)}"
        )

@router.get("/pending")
async def get_pending_submissions() -> PendingSubmissionsResponse:
    """Get all pending submissions"""
    try:
        all_submissions = get_all_submissions()
        pending_submissions = []
        counts = {
            "total": 0,
            "pending": 0,
            "approved": 0,
            "rejected": 0
        }
        
        # Count submissions by type
        for content_type, submissions in all_submissions.items():
            counts[content_type] = len(submissions)
            counts["total"] += len(submissions)
            
            # Add pending submissions to the list
            for submission in submissions:
                if submission.get("status") == ContentStatus.PENDING:
                    counts["pending"] += 1
                    pending_submissions.append(ContentSubmission(
                        id=submission.get("id"),
                        content_type=submission.get("content_type"),
                        status=submission.get("status"),
                        created_at=submission.get("created_at"),
                        email=submission.get("email"),
                        name=submission.get("name"),
                        data=submission.get("data", {})
                    ))
                elif submission.get("status") == ContentStatus.APPROVED:
                    counts["approved"] += 1
                elif submission.get("status") == ContentStatus.REJECTED:
                    counts["rejected"] += 1
        
        return PendingSubmissionsResponse(
            pending_submissions=pending_submissions,
            counts=counts
        )
    except Exception as e:
        print(f"Error getting pending submissions: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting pending submissions: {str(e)}")

@router.post("/action")
async def take_moderation_action(request: ModerationActionRequest) -> ModerationResponse:
    """Take action on a submission (approve/reject)"""
    try:
        # Find the submission in all content types
        all_submissions = get_all_submissions()
        submission_found = False
        content_type = None
        submission = None
        
        for ct, submissions in all_submissions.items():
            for i, sub in enumerate(submissions):
                if sub.get("id") == request.content_id:
                    content_type = ct
                    submission = sub
                    submission_found = True
                    
                    # Update the submission status
                    new_status = ContentStatus.APPROVED if request.action == ModerationAction.APPROVE else ContentStatus.REJECTED
                    all_submissions[ct][i]["status"] = new_status
                    all_submissions[ct][i]["moderated_at"] = datetime.now().isoformat()
                    all_submissions[ct][i]["admin_notes"] = request.message
                    
                    # Save the updated submissions
                    save_submissions(ct, all_submissions[ct])
                    
                    # For success stories, make sure they're updated in the success_stories list too
                    if ct == ContentType.SUCCESS_STORY and request.action == ModerationAction.APPROVE:
                        try:
                            # Get current success stories
                            try:
                                success_stories = db.storage.json.get("success_stories")
                            except:
                                success_stories = []
                            
                            # Add this story to the approved stories if it doesn't already exist
                            story_data = submission.get("data", {})
                            story_data["id"] = submission.get("id")
                            story_data["status"] = "approved"
                            story_data["timestamp"] = submission.get("created_at")
                            story_data["approved_at"] = all_submissions[ct][i]["moderated_at"]
                            
                            # Check if story is already in the list
                            story_exists = any(s.get("id") == submission.get("id") for s in success_stories)
                            
                            if not story_exists:
                                success_stories.append(story_data)
                                db.storage.json.put("success_stories", success_stories)
                                print(f"Added approved story to success_stories: {submission.get('id')}")
                            else:
                                # Update existing story
                                for j, story in enumerate(success_stories):
                                    if story.get("id") == submission.get("id"):
                                        success_stories[j] = story_data
                                        break
                                db.storage.json.put("success_stories", success_stories)
                                print(f"Updated existing story in success_stories: {submission.get('id')}")
                        except Exception as e:
                            print(f"Error updating success_stories: {e}")
                    break
            if submission_found:
                break
        
        if not submission_found:
            return ModerationResponse(
                success=False,
                message=f"Submission with ID {request.content_id} not found"
            )
        
        # Send notification to user if requested
        if request.notify_user and submission.get("email"):
            action_text = "approved" if request.action == ModerationAction.APPROVE else "rejected"
            message_html = f"<h2>Your {content_type} submission has been {action_text}</h2>"
            message_text = f"Your {content_type} submission has been {action_text}\n\n"
            
            # Add custom message if provided
            if request.message:
                message_html += f"<p>{request.message}</p>"
                message_text += f"{request.message}\n\n"
            
            send_notification(NotificationRequest(
                recipient=submission.get("email"),
                subject=f"Your {content_type} submission has been {action_text}",
                content_text=message_text,
                content_html=message_html
            ))
        
        return ModerationResponse(
            success=True,
            message=f"Submission {request.action.value}d successfully",
            content_id=request.content_id
        )
    except Exception as e:
        print(f"Error in moderation action: {e}")
        return ModerationResponse(
            success=False,
            message=f"Error in moderation action: {str(e)}"
        )

@router.get("/submissions/{content_type}")
async def get_submissions_by_type(content_type: ContentType, status: Optional[str] = None) -> List[ContentSubmission]:
    """Get all submissions of a specific type"""
    try:
        storage_key = get_content_storage_key(content_type)
        submissions = db.storage.json.get(sanitize_storage_key(storage_key), default=[])
        
        # Filter by status if specified
        if status and status in [ContentStatus.PENDING, ContentStatus.APPROVED, ContentStatus.REJECTED]:
            submissions = [s for s in submissions if s.get("status") == status]
        
        return [
            ContentSubmission(
                id=sub.get("id"),
                content_type=sub.get("content_type"),
                status=sub.get("status"),
                created_at=sub.get("created_at"),
                email=sub.get("email"),
                name=sub.get("name"),
                data=sub.get("data", {})
            ) for sub in submissions
        ]
    except Exception as e:
        print(f"Error getting submissions by type: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting submissions by type: {str(e)}")
