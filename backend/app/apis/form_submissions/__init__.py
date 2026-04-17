from typing import Dict, List, Optional, Any, Literal
from datetime import datetime
from pydantic import BaseModel, Field
from fastapi import APIRouter, Query, Body, HTTPException, Path
import uuid
from app.db.supabase_client import get_supabase

router = APIRouter(prefix="/form-submissions", tags=["form-submissions"])

FormType = Literal["contact", "volunteer", "newsletter", "success_stories", "feedback", "donations"]

class FormSubmission(BaseModel):
    id: str
    form_type: FormType
    timestamp: str
    data: Dict[str, Any]

class FormSubmissionsList(BaseModel):
    submissions: List[FormSubmission]

class FormSubmissionCreate(BaseModel):
    form_type: FormType
    data: Dict[str, Any]

class FormSubmissionResponse(BaseModel):
    success: bool
    message: str
    submission_id: Optional[str] = None

@router.post("/", response_model=FormSubmissionResponse)
def create_submission(submission: FormSubmissionCreate) -> FormSubmissionResponse:
    try:
        supabase = get_supabase()
        submission_id = f"{submission.form_type}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:6]}"
        supabase.table("form_submissions").insert({"id": submission_id, "form_type": submission.form_type, "timestamp": datetime.now().isoformat(), "data": submission.data}).execute()
        return FormSubmissionResponse(success=True, message="Form submission created successfully", submission_id=submission_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=FormSubmissionsList)
def get_all_submissions(form_types: Optional[List[FormType]] = Query(None), search: Optional[str] = Query(None)) -> FormSubmissionsList:
    try:
        supabase = get_supabase()
        query = supabase.table("form_submissions").select("*").order("timestamp", desc=True)
        result = query.execute()
        submissions = result.data or []
        if form_types:
            submissions = [s for s in submissions if s["form_type"] in form_types]
        if search:
            import json
            submissions = [s for s in submissions if search.lower() in json.dumps(s).lower()]
        return FormSubmissionsList(submissions=[FormSubmission(**s) for s in submissions])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{submission_id}", response_model=FormSubmission)
def get_submission(submission_id: str) -> FormSubmission:
    try:
        supabase = get_supabase()
        result = supabase.table("form_submissions").select("*").eq("id", submission_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Submission not found")
        return FormSubmission(**result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{submission_id}", response_model=FormSubmissionResponse)
def delete_submission(submission_id: str) -> FormSubmissionResponse:
    try:
        supabase = get_supabase()
        supabase.table("form_submissions").delete().eq("id", submission_id).execute()
        return FormSubmissionResponse(success=True, message="Deleted successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
