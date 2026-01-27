from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.core.storage import storage
from app.api.deps import get_current_user
from app.models.all_models import User
import uuid
import os

router = APIRouter()

@router.post("/", response_model=dict)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a file to Minio storage.
    Returns the file URL/Key.
    """
    try:
        # Generate a unique filename
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        
        # Upload
        object_name = storage.upload_file(
            file.file, 
            unique_filename, 
            file.content_type
        )
        
        # Get accessible URL (Presigned or Public)
        # For now, returning the presigned URL directly for immediate use
        url = storage.get_file_url(unique_filename)
        
        return {
            "filename": unique_filename,
            "object_key": object_name,
            "url": url
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
