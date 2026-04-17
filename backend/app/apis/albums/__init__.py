from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import databutton as db
import json
import re

router = APIRouter()

class Album(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    created_at: str
    updated_at: str
    image_count: int = 0

class CreateAlbumRequest(BaseModel):
    title: str
    description: Optional[str] = None

class UpdateAlbumRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    cover_image_url: Optional[str] = None

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

def get_albums() -> List[Album]:
    """Get all albums from storage"""
    try:
        albums = db.storage.json.get('albums', default={})
        return [Album(**album) for album in albums.values()]
    except Exception as e:
        print(f'Error getting albums: {e}')
        return []

def save_albums(albums: dict) -> None:
    """Save albums to storage"""
    try:
        db.storage.json.put('albums', albums)
    except Exception as e:
        print(f'Error saving albums: {e}')
        raise HTTPException(status_code=500, detail='Failed to save albums')

@router.get('/albums')
def list_albums() -> List[Album]:
    """List all albums"""
    return get_albums()

@router.post('/albums')
def create_album(request: CreateAlbumRequest) -> Album:
    """Create a new album"""
    # Generate unique ID
    album_id = f'album_{datetime.now().strftime("%Y%m%d_%H%M%S")}_{len(get_albums())}'
    album_id = sanitize_storage_key(album_id)
    
    now = datetime.now().isoformat()
    
    # Create new album
    new_album = Album(
        id=album_id,
        title=request.title,
        description=request.description,
        created_at=now,
        updated_at=now
    )
    
    # Save to storage
    albums = db.storage.json.get('albums', default={})
    albums[album_id] = new_album.dict()
    save_albums(albums)
    
    return new_album

@router.get('/albums/{album_id}')
def get_album(album_id: str) -> Album:
    """Get a specific album"""
    albums = db.storage.json.get('albums', default={})
    if album_id not in albums:
        raise HTTPException(status_code=404, detail='Album not found')
    
    return Album(**albums[album_id])

@router.put('/albums/{album_id}')
def update_album(album_id: str, request: UpdateAlbumRequest) -> Album:
    """Update an album"""
    albums = db.storage.json.get('albums', default={})
    if album_id not in albums:
        raise HTTPException(status_code=404, detail='Album not found')
    
    album = albums[album_id]
    
    # Update only provided fields
    if request.title is not None:
        album['title'] = request.title
    if request.description is not None:
        album['description'] = request.description
    if request.cover_image_url is not None:
        album['cover_image_url'] = request.cover_image_url
    
    album['updated_at'] = datetime.now().isoformat()
    
    # Save changes
    albums[album_id] = album
    save_albums(albums)
    
    return Album(**album)

@router.delete('/albums/{album_id}')
def delete_album(album_id: str):
    """Delete an album"""
    albums = db.storage.json.get('albums', default={})
    if album_id not in albums:
        raise HTTPException(status_code=404, detail='Album not found')
    
    # Delete album
    del albums[album_id]
    save_albums(albums)
    
    return {'message': 'Album deleted successfully'}


class SyncVideoCategoriesResponse(BaseModel):
    created_albums: List[Album]
    updated_albums: List[Album]
    message: str

class VideoCategory(BaseModel):
    category: str
    title: Optional[str] = None
    description: Optional[str] = None

@router.post('/albums/sync-video-categories')
def sync_video_categories(categories: List[VideoCategory]) -> SyncVideoCategoriesResponse:
    """Create albums based on video categories if they don't exist"""
    try:
        # Get existing albums
        albums = db.storage.json.get('albums', default={})
        
        created_albums = []
        updated_albums = []
        
        # Process each video category
        for video_cat in categories:
            category_id = sanitize_storage_key(video_cat.category)
            
            # Check if an album for this category already exists
            album_exists = False
            for album_id, album in albums.items():
                # Match by category name (case insensitive)
                if album.get('title', '').lower() == video_cat.category.lower():
                    album_exists = True
                    # Update album if necessary
                    if video_cat.description and not album.get('description'):
                        album['description'] = video_cat.description
                        album['updated_at'] = datetime.now().isoformat()
                        updated_albums.append(Album(**album))
                    break
            
            # Create a new album if one doesn't exist for this category
            if not album_exists:
                # Generate unique ID based on category
                album_id = f'album_{sanitize_storage_key(video_cat.category)}_{datetime.now().strftime("%Y%m%d")}'                
                now = datetime.now().isoformat()
                
                # Use the category name as the album title if no title is provided
                title = video_cat.title if video_cat.title else video_cat.category
                
                # Create new album
                new_album = Album(
                    id=album_id,
                    title=title,
                    description=video_cat.description,
                    created_at=now,
                    updated_at=now
                )
                
                # Add to albums collection
                albums[album_id] = new_album.dict()
                created_albums.append(new_album)
        
        # Save changes to storage
        if created_albums or updated_albums:
            save_albums(albums)
        
        return SyncVideoCategoriesResponse(
            created_albums=created_albums,
            updated_albums=updated_albums,
            message=f"Successfully synced video categories: {len(created_albums)} created, {len(updated_albums)} updated"
        )
        
    except Exception as e:
        print(f"Error syncing video categories: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to sync video categories: {str(e)}")

