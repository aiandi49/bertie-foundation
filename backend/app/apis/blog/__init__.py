from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import databutton as db
import json

router = APIRouter()

class BlogPost(BaseModel):
    id: str
    title: str
    content: str
    author: str
    image_url: Optional[str] = None
    category: str
    published_at: datetime
    tags: List[str] = []

class CreateBlogPostRequest(BaseModel):
    title: str
    content: str
    author: str
    image_url: Optional[str] = None
    category: str
    tags: List[str] = []

@router.get("/blog/posts")
def get_blog_posts() -> List[BlogPost]:
    """Get all blog posts"""
    try:
        posts = db.storage.json.get("blog_posts", default=[])
        return posts
    except Exception as e:
        print(f"Error getting blog posts: {e}")
        return []

@router.post("/blog/posts")
def create_blog_post(post: CreateBlogPostRequest) -> BlogPost:
    """Create a new blog post"""
    try:
        posts = db.storage.json.get("blog_posts", default=[])
        
        # Create a new post dictionary with ISO format for datetime
        post_data = {
            "id": f"post_{len(posts) + 1}",
            "title": post.title,
            "content": post.content,
            "author": post.author,
            "image_url": post.image_url,
            "category": post.category,
            "tags": post.tags,
            "published_at": datetime.now().isoformat()
        }
        
        posts.append(post_data)
        db.storage.json.put("blog_posts", posts)
        
        # Convert back to BlogPost model for response
        new_post = BlogPost(**post_data)
        
        return new_post
    except Exception as e:
        print(f"Error creating blog post: {e}")
        raise HTTPException(status_code=500, detail=str(e))
