from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
from app.db.supabase_client import get_supabase

router = APIRouter()

class CreateBlogPostRequest(BaseModel):
    title: str
    content: str
    author: str
    image_url: Optional[str] = None
    category: str
    tags: List[str] = []

@router.get("/blog/posts")
def get_blog_posts() -> List[dict]:
    try:
        supabase = get_supabase()
        result = supabase.table("blog_posts").select("*").order("published_at", desc=True).execute()
        return result.data or []
    except Exception as e:
        return []

@router.post("/blog/posts")
def create_blog_post(post: CreateBlogPostRequest) -> dict:
    try:
        supabase = get_supabase()
        data = {"id": str(uuid.uuid4()), "title": post.title, "content": post.content, "author": post.author, "image_url": post.image_url, "category": post.category, "tags": post.tags, "published_at": datetime.now().isoformat()}
        result = supabase.table("blog_posts").insert(data).execute()
        return result.data[0] if result.data else data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
