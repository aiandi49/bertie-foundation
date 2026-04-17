from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
from app.db.supabase_client import get_supabase

router = APIRouter()

class CreateAlbumRequest(BaseModel):
    title: str
    description: Optional[str] = None

class UpdateAlbumRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    cover_image_url: Optional[str] = None

@router.get("/albums")
def list_albums() -> List[dict]:
    try:
        supabase = get_supabase()
        return supabase.table("albums").select("*").order("created_at", desc=True).execute().data or []
    except Exception:
        return []

@router.post("/albums")
def create_album(r: CreateAlbumRequest) -> dict:
    try:
        supabase = get_supabase()
        now = datetime.now().isoformat()
        data = {"id": str(uuid.uuid4()), "title": r.title, "description": r.description, "created_at": now, "updated_at": now, "image_count": 0}
        result = supabase.table("albums").insert(data).execute()
        return result.data[0] if result.data else data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/albums/{album_id}")
def get_album(album_id: str) -> dict:
    try:
        supabase = get_supabase()
        result = supabase.table("albums").select("*").eq("id", album_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Album not found")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/albums/{album_id}")
def update_album(album_id: str, r: UpdateAlbumRequest) -> dict:
    try:
        supabase = get_supabase()
        patch = {k: v for k, v in r.dict().items() if v is not None}
        patch["updated_at"] = datetime.now().isoformat()
        result = supabase.table("albums").update(patch).eq("id", album_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Album not found")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/albums/{album_id}")
def delete_album(album_id: str) -> dict:
    try:
        supabase = get_supabase()
        supabase.table("albums").delete().eq("id", album_id).execute()
        return {"message": "Album deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
