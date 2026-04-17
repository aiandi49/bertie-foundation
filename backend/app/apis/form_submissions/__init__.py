import json
from typing import Dict, List, Optional, Any, Literal
from datetime import datetime
from pydantic import BaseModel, Field
from fastapi import APIRouter, Query, Body, HTTPException, Path
import databutton as db

router = APIRouter(prefix="/form-submissions", tags=["form-submissions"])

# Storage key for form submissions
FORM_SUBMISSIONS_KEY = "form_submissions_data"

# Supported form types
FormType = Literal[
    "contact", 
    "volunteer", 
    "newsletter", 
    "success_stories", 
    "feedback", 
    "donations"
]

class FormSubmission(BaseModel):
    id: str
    form_type: FormType
    timestamp: datetime
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

class FormSubmissionUpdate(BaseModel):
    data: Dict[str, Any]

class FormSubmissionFilter(BaseModel):
    form_types: Optional[List[FormType]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    search_term: Optional[str] = None

class FormSubmissionExport(BaseModel):
    format: Literal["json", "csv"]
    filter: Optional[FormSubmissionFilter] = None

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    import re
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

def get_submissions() -> List[FormSubmission]:
    """Get all form submissions from storage"""
    try:
        data = db.storage.json.get(sanitize_storage_key(FORM_SUBMISSIONS_KEY), default=[])
        return [FormSubmission(**submission) for submission in data]
    except Exception as e:
        print(f"Error getting form submissions: {e}")
        return []

def save_submissions(submissions: List[FormSubmission]) -> None:
    """Save form submissions to storage"""
    try:
        # Convert datetime objects to string before saving
        data = []
        for submission in submissions:
            submission_dict = submission.model_dump()
            submission_dict['timestamp'] = submission_dict['timestamp'].isoformat()
            data.append(submission_dict)
            
        db.storage.json.put(sanitize_storage_key(FORM_SUBMISSIONS_KEY), data)
    except Exception as e:
        print(f"Error saving form submissions: {e}")
        raise HTTPException(status_code=500, detail=f"Error saving submissions: {str(e)}")

def search_submissions(submissions: List[FormSubmission], filter_params: FormSubmissionFilter) -> List[FormSubmission]:
    """Filter submissions based on provided parameters"""
    result = submissions
    
    # Filter by form type
    if filter_params.form_types:
        result = [s for s in result if s.form_type in filter_params.form_types]
    
    # Filter by date range
    if filter_params.start_date:
        result = [s for s in result if s.timestamp >= filter_params.start_date]
    
    if filter_params.end_date:
        result = [s for s in result if s.timestamp <= filter_params.end_date]
    
    # Filter by search term (in any string field)
    if filter_params.search_term and filter_params.search_term.strip():
        search_term = filter_params.search_term.lower()
        filtered = []
        
        for submission in result:
            # Convert submission to string for searching
            submission_str = json.dumps(submission.model_dump()).lower()
            if search_term in submission_str:
                filtered.append(submission)
        
        result = filtered
    
    return result

@router.post("/", response_model=FormSubmissionResponse)
def create_submission(submission: FormSubmissionCreate) -> FormSubmissionResponse:
    """Create a new form submission"""
    try:
        # Get existing submissions
        submissions = get_submissions()
        
        # Create new submission with timestamp and ID
        submission_id = f"{submission.form_type}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{len(submissions)}"
        new_submission = FormSubmission(
            id=submission_id,
            form_type=submission.form_type,
            timestamp=datetime.now(),
            data=submission.data
        )
        
        # Add to list and save
        submissions.append(new_submission)
        save_submissions(submissions)
        
        return FormSubmissionResponse(
            success=True,
            message=f"Form submission created successfully",
            submission_id=submission_id
        )
    except Exception as e:
        print(f"Error creating form submission: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=FormSubmissionsList)
def get_all_submissions(
    form_types: Optional[List[FormType]] = Query(None, description="Filter by form types"),
    search: Optional[str] = Query(None, description="Search term to filter submissions"),
    start_date: Optional[str] = Query(None, description="Start date for filtering (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date for filtering (ISO format)")
) -> FormSubmissionsList:
    """Get all form submissions with optional filtering"""
    try:
        # Get all submissions
        submissions = get_submissions()
        
        # Create filter parameters
        filter_params = FormSubmissionFilter(
            form_types=form_types,
            search_term=search,
            start_date=datetime.fromisoformat(start_date) if start_date else None,
            end_date=datetime.fromisoformat(end_date) if end_date else None
        )
        
        # Apply filters
        filtered_submissions = search_submissions(submissions, filter_params)
        
        # Sort by timestamp (newest first)
        filtered_submissions.sort(key=lambda x: x.timestamp, reverse=True)
        
        return FormSubmissionsList(submissions=filtered_submissions)
    except Exception as e:
        print(f"Error getting form submissions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{submission_id}", response_model=FormSubmission)
def get_submission(submission_id: str = Path(..., description="The ID of the form submission to get")) -> FormSubmission:
    """Get a single form submission by ID"""
    try:
        submissions = get_submissions()
        for submission in submissions:
            if submission.id == submission_id:
                return submission
        
        raise HTTPException(status_code=404, detail=f"Form submission with ID {submission_id} not found")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting form submission: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{submission_id}", response_model=FormSubmissionResponse)
def delete_submission(submission_id: str = Path(..., description="The ID of the form submission to delete")) -> FormSubmissionResponse:
    """Delete a form submission by ID"""
    try:
        submissions = get_submissions()
        filtered_submissions = [s for s in submissions if s.id != submission_id]
        
        # Check if any submission was removed
        if len(filtered_submissions) == len(submissions):
            raise HTTPException(status_code=404, detail=f"Form submission with ID {submission_id} not found")
        
        # Save updated list
        save_submissions(filtered_submissions)
        
        return FormSubmissionResponse(
            success=True,
            message=f"Form submission deleted successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting form submission: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{submission_id}", response_model=FormSubmissionResponse)
def update_submission(
    submission_id: str = Path(..., description="The ID of the form submission to update"),
    update_data: FormSubmissionUpdate = Body(..., description="The updated form submission data")
) -> FormSubmissionResponse:
    """Update a form submission by ID"""
    try:
        submissions = get_submissions()
        updated = False
        
        for i, submission in enumerate(submissions):
            if submission.id == submission_id:
                # Update only the data field
                submissions[i].data.update(update_data.data)
                updated = True
                break
        
        if not updated:
            raise HTTPException(status_code=404, detail=f"Form submission with ID {submission_id} not found")
        
        # Save updated list
        save_submissions(submissions)
        
        return FormSubmissionResponse(
            success=True,
            message=f"Form submission updated successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating form submission: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/export", response_model=dict)
def export_submissions(export_options: FormSubmissionExport = Body(..., description="Export options")) -> dict:
    """Export form submissions as JSON or CSV"""
    try:
        # Get all submissions
        submissions = get_submissions()
        
        # Apply filters if provided
        if export_options.filter:
            submissions = search_submissions(submissions, export_options.filter)
        
        # Sort by timestamp (newest first)
        submissions.sort(key=lambda x: x.timestamp, reverse=True)
        
        if export_options.format == "json":
            # Return JSON format
            return {
                "success": True,
                "format": "json",
                "data": [s.model_dump() for s in submissions]
            }
        elif export_options.format == "csv":
            # Convert to CSV format
            import csv
            import io
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write header row with common fields and all possible data fields
            header = ["id", "form_type", "timestamp"]
            
            # Collect all possible data keys
            all_data_keys = set()
            for s in submissions:
                all_data_keys.update(s.data.keys())
            
            # Add data keys to header
            header.extend(sorted(all_data_keys))
            writer.writerow(header)
            
            # Write data rows
            for s in submissions:
                row = [s.id, s.form_type, s.timestamp.isoformat()]
                
                # Add data fields, preserving order from header
                for key in header[3:]:
                    row.append(s.data.get(key, ""))
                
                writer.writerow(row)
            
            return {
                "success": True,
                "format": "csv",
                "data": output.getvalue()
            }
    except Exception as e:
        print(f"Error exporting form submissions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/migrate-local-storage", response_model=FormSubmissionResponse)
def migrate_from_local_storage(local_storage_data: Dict[str, Any] = Body(...)) -> FormSubmissionResponse:
    """Migrate form submissions from localStorage to the centralized system"""
    try:
        from app.apis.migration import LocalStorageData, process_local_storage_data
        
        # Parse local storage data
        data = LocalStorageData(**local_storage_data)
        processed_data = process_local_storage_data(data)
        
        # Get existing submissions
        submissions = get_submissions()
        
        # Create new submissions
        count = 0
        for item in processed_data:
            try:
                # Parse timestamp string to datetime
                timestamp = datetime.fromisoformat(item['timestamp']) if isinstance(item['timestamp'], str) else datetime.now()
                
                submission_id = f"{item['form_type']}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{len(submissions) + count}"
                new_submission = FormSubmission(
                    id=submission_id,
                    form_type=item['form_type'],
                    timestamp=timestamp,
                    data=item['data']
                )
                
                submissions.append(new_submission)
                count += 1
            except Exception as item_error:
                print(f"Error processing migration item: {item_error}")
                # Continue with next item
                continue
        
        # Save updated list
        if count > 0:
            save_submissions(submissions)
        
        return FormSubmissionResponse(
            success=True,
            message=f"Successfully migrated {count} form submissions"
        )
    except Exception as e:
        print(f"Error migrating form submissions: {e}")
        raise HTTPException(status_code=500, detail=str(e))
