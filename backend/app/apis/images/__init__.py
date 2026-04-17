from fastapi import APIRouter, HTTPException, UploadFile, File, Response, Form
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import re, uuid
from app.db.supabase_client import get_supabase

router = APIRouter(prefix="/images", tags=["images"])

SUPABASE_BUCKET = "images"

class ImageMetadata(BaseModel):
    id: str
    filename: str
    category: str
    title: str
    description: Optional[str] = None
    uploaded_at: str
    url: str
    album_id: Optional[str] = None

class ImageUploadResponse(BaseModel):
    message: str
    image: ImageMetadata

class BatchImageUploadResponse(BaseModel):
    message: str
    images: List[ImageMetadata]
    success_count: int
    failed_count: int

class ImagesListResponse(BaseModel):
    images: List[ImageMetadata]

def sanitize_filename(filename: str) -> str:
    filename = filename.replace('/', '_').replace('\\', '_')
    return re.sub(r'[^\w.-]', '_', filename)

@router.post('/upload', response_model=ImageUploadResponse)
async def upload_image(file: UploadFile = File(...), title: str | None = None, category: str | None = None, description: str | None = None) -> ImageUploadResponse:
    try:
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        supabase = get_supabase()
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        safe_filename = sanitize_filename(file.filename)
        unique_filename = f"{timestamp}_{safe_filename}"
        content = await file.read()
        # Upload to Supabase Storage
        supabase.storage.from_(SUPABASE_BUCKET).upload(unique_filename, content, {"content-type": file.content_type})
        public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(unique_filename)
        img_id = str(uuid.uuid4())
        metadata = {"id": img_id, "filename": file.filename, "category": category or "Uncategorized", "title": title or file.filename.rsplit('.', 1)[0], "description": description, "uploaded_at": datetime.utcnow().isoformat(), "url": public_url, "album_id": category}
        supabase.table("image_metadata").insert(metadata).execute()
        # Update album image count if category provided
        if category:
            try:
                result = supabase.table("albums").select("*").eq("id", category).execute()
                if result.data:
                    album = result.data[0]
                    updates = {"image_count": (album.get("image_count", 0) + 1)}
                    if not album.get("cover_image_url"):
                        updates["cover_image_url"] = public_url
                    supabase.table("albums").update(updates).eq("id", category).execute()
            except Exception as e:
                print(f"Album update error: {e}")
        return ImageUploadResponse(message="Image uploaded successfully", image=ImageMetadata(**metadata))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/batch-upload', response_model=BatchImageUploadResponse)
async def batch_upload_images(files: List[UploadFile] = File(...), title: str | None = Form(None), category: str | None = Form(None), description: str | None = Form(None)) -> BatchImageUploadResponse:
    uploaded = []
    failed = 0
    files = files[:25]
    supabase = get_supabase()
    for i, file in enumerate(files):
        try:
            if not file.content_type or not file.content_type.startswith('image/'):
                failed += 1
                continue
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            unique_filename = f"{timestamp}_{i}_{sanitize_filename(file.filename)}"
            content = await file.read()
            supabase.storage.from_(SUPABASE_BUCKET).upload(unique_filename, content, {"content-type": file.content_type})
            public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(unique_filename)
            img_title = f"{title} ({i+1})" if title and len(files) > 1 else (title or file.filename.rsplit('.', 1)[0])
            metadata = {"id": str(uuid.uuid4()), "filename": file.filename, "category": category or "Uncategorized", "title": img_title, "description": description, "uploaded_at": datetime.utcnow().isoformat(), "url": public_url, "album_id": category}
            supabase.table("image_metadata").insert(metadata).execute()
            uploaded.append(ImageMetadata(**metadata))
        except Exception as e:
            print(f"Error uploading image {i}: {e}")
            failed += 1
    return BatchImageUploadResponse(message=f"Batch upload: {len(uploaded)} succeeded, {failed} failed", images=uploaded, success_count=len(uploaded), failed_count=failed)

@router.get('/list', response_model=ImagesListResponse)
def list_images(category: str | None = None) -> ImagesListResponse:
    try:
        supabase = get_supabase()
        query = supabase.table("image_metadata").select("*").order("uploaded_at", desc=True)
        if category:
            query = query.eq("album_id", category)
        result = query.execute()
        return ImagesListResponse(images=[ImageMetadata(**img) for img in (result.data or [])])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/view/{filename}')
def view_image(filename: str):
    """Redirect to Supabase public URL"""
    try:
        supabase = get_supabase()
        public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(filename)
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url=public_url)
    except Exception as e:
        raise HTTPException(status_code=404, detail="Image not found")
