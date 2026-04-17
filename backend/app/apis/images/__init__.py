from fastapi import APIRouter, HTTPException, UploadFile, File, Response, Form
from pydantic import BaseModel
from typing import List
import databutton as db
from datetime import datetime
import re

router = APIRouter(prefix="/images", tags=["images"])

class ImageMetadata(BaseModel):
    id: str
    filename: str
    category: str
    title: str
    description: str | None = None
    uploaded_at: str
    url: str
    album_id: str | None = None

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
    """Sanitize filename to prevent directory traversal and invalid chars"""
    # Remove any directory components
    filename = filename.replace('/', '_').replace('\\', '_')
    # Remove any non-alphanumeric chars except .-_
    filename = re.sub(r'[^\w.-]', '_', filename)
    return filename

def get_image_metadata():
    """Get the list of image metadata"""
    try:
        return db.storage.json.get('image_metadata', default=[])
    except Exception as e:
        print(f"Error getting image metadata: {str(e)}")
        return []

def save_image_metadata(metadata: List[dict]):
    """Save the list of image metadata"""
    db.storage.json.put('image_metadata', metadata)

@router.post('/upload', response_model=ImageUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    title: str | None = None,
    category: str | None = None,
    description: str | None = None
) -> ImageUploadResponse:
    print(f"Received file: {file.filename}, title: {title}, category: {category}")
    try:
        # Validate file type
        content_type = file.content_type
        print(f"Content type: {content_type}")
        
        if not content_type or not content_type.startswith('image/'):
            print(f"Invalid content type: {content_type}")
            raise HTTPException(
                status_code=400,
                detail="File must be an image"
            )

        # Generate unique filename
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        safe_filename = sanitize_filename(file.filename)
        unique_filename = f"{timestamp}_{safe_filename}"

        # Read file content
        content = await file.read()

        # Save to binary storage
        db.storage.binary.put(unique_filename, content)

        # Create metadata
        # Generate a URL that will serve the image from binary storage
        image_url = f"/api/images/view/{unique_filename}"
        metadata = ImageMetadata(
            id=unique_filename,
            filename=file.filename,
            category=category or "Uncategorized",
            title=title if title else file.filename.rsplit('.', 1)[0],
            description=description,
            uploaded_at=datetime.utcnow().isoformat(),
            url=image_url,
            album_id=category  # Use category as album_id if provided
        )

        # If this is being added to an album, update the album's image count and cover
        if category:  # Using category as album_id
            try:
                albums = db.storage.json.get('albums', default={})
                if category in albums:
                    album = albums[category]
                    album['image_count'] = album.get('image_count', 0) + 1
                    if not album.get('cover_image_url'):
                        album['cover_image_url'] = image_url
                    albums[category] = album
                    db.storage.json.put('albums', albums)
            except Exception as e:
                print(f'Error updating album: {e}')

        # Save metadata
        all_metadata = get_image_metadata()
        all_metadata.append(metadata.dict())
        save_image_metadata(all_metadata)

        return ImageUploadResponse(
            message="Image uploaded successfully",
            image=metadata
        )

    except Exception as e:
        print(f"Error uploading image: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to upload image"
        ) from e

@router.post('/batch-upload', response_model=BatchImageUploadResponse)
async def batch_upload_images(
    files: List[UploadFile] = File(...),
    title: str | None = Form(None),
    category: str | None = Form(None),
    description: str | None = Form(None)
) -> BatchImageUploadResponse:
    print(f"Received {len(files)} files with category: {category}")
    
    uploaded_images = []
    failed_uploads = 0
    
    # Limit to 25 images for performance reasons
    if len(files) > 25:
        files = files[:25]
        print(f"Limiting batch upload to 25 files")
    
    for i, file in enumerate(files):
        try:
            # Validate file type
            content_type = file.content_type
            
            if not content_type or not content_type.startswith('image/'):
                print(f"Skipping invalid content type: {content_type}")
                failed_uploads += 1
                continue

            # Generate unique filename
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            safe_filename = sanitize_filename(file.filename)
            unique_filename = f"{timestamp}_{i}_{safe_filename}"

            # Read file content
            content = await file.read()

            # Save to binary storage
            db.storage.binary.put(unique_filename, content)

            # Create metadata
            # Generate a URL that will serve the image from binary storage
            image_url = f"/api/images/view/{unique_filename}"
            
            # Generate individual title if batch title is provided
            image_title = title
            if title:
                # For batches, add a number to each image
                image_title = f"{title} ({i+1})" if len(files) > 1 else title
            else:
                # Default to filename without extension
                image_title = file.filename.rsplit('.', 1)[0]
            
            metadata = ImageMetadata(
                id=unique_filename,
                filename=file.filename,
                category=category or "Uncategorized",
                title=image_title,
                description=description,
                uploaded_at=datetime.utcnow().isoformat(),
                url=image_url,
                album_id=category  # Use category as album_id if provided
            )

            # If this is being added to an album, update the album's image count and cover
            if category:  # Using category as album_id
                try:
                    albums = db.storage.json.get('albums', default={})
                    if category in albums:
                        album = albums[category]
                        album['image_count'] = album.get('image_count', 0) + 1
                        # Only set cover image if it's the first image and album doesn't have a cover
                        if i == 0 and not album.get('cover_image_url'):
                            album['cover_image_url'] = image_url
                        albums[category] = album
                        db.storage.json.put('albums', albums)
                except Exception as e:
                    print(f'Error updating album during batch upload: {e}')

            # Save metadata
            all_metadata = get_image_metadata()
            all_metadata.append(metadata.dict())
            save_image_metadata(all_metadata)
            
            # Add to successfully uploaded images
            uploaded_images.append(metadata)

        except Exception as e:
            print(f"Error uploading image {i}: {str(e)}")
            failed_uploads += 1
    
    return BatchImageUploadResponse(
        message=f"Batch upload completed: {len(uploaded_images)} succeeded, {failed_uploads} failed",
        images=uploaded_images,
        success_count=len(uploaded_images),
        failed_count=failed_uploads
    )

@router.get('/view/{filename}')
def view_image(filename: str):
    """Get an image by filename"""
    try:
        # Get the image from storage
        image_data = db.storage.binary.get(filename)
        
        # Determine content type based on file extension
        content_type = "image/jpeg"  # Default to JPEG
        if filename.lower().endswith('.png'):
            content_type = "image/png"
        elif filename.lower().endswith('.gif'):
            content_type = "image/gif"
        
        # Return the image with proper content type
        return Response(
            content=image_data,
            media_type=content_type
        )
        
    except Exception as e:
        print(f"Error getting image: {str(e)}")
        raise HTTPException(
            status_code=404,
            detail="Image not found"
        )

@router.get('/list', response_model=ImagesListResponse)
def list_images(
    category: str | None = None
) -> ImagesListResponse:
    try:
        images = get_image_metadata()
        
        # Filter by category/album if provided
        if category:
            images = [img for img in images if img.get('album_id') == category or img['category'] == category]
            
        # Sort by upload date, newest first
        images.sort(key=lambda x: x['uploaded_at'], reverse=True)
        
        return ImagesListResponse(images=[ImageMetadata(**img) for img in images])
        
    except Exception as e:
        print(f"Error listing images: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to list images"
        ) from e
