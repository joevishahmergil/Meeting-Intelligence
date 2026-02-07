from fastapi import UploadFile, HTTPException
from app.core.config import settings
from app.core.database import get_supabase
import os
import uuid


ALLOWED_EXTENSIONS = {".wav", ".mp3"}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB


async def upload_audio_file(file: UploadFile, meeting_id: str) -> tuple[str, str]:
    """
    Upload audio file to Supabase Storage
    
    Args:
        file: Uploaded audio file
        meeting_id: Meeting ID for organizing files
        
    Returns:
        Tuple of (file_path, public_url)
        
    Raises:
        HTTPException: If file validation fails or upload fails
    """
    # Validate file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Generate unique filename
    unique_filename = f"{meeting_id}_{uuid.uuid4()}{file_ext}"
    file_path = f"meetings/{unique_filename}"
    
    # Read file content
    content = await file.read()
    
    # Validate file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / (1024*1024)}MB"
        )
    
    try:
        supabase = get_supabase()
        
        # Upload to Supabase Storage
        response = supabase.storage.from_(settings.SUPABASE_STORAGE_BUCKET).upload(
            file_path,
            content,
            file_options={"content-type": file.content_type or "audio/mpeg"}
        )
        
        # Get public URL
        public_url = supabase.storage.from_(settings.SUPABASE_STORAGE_BUCKET).get_public_url(file_path)
        
        return file_path, public_url
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload file: {str(e)}"
        )


async def delete_audio_file(file_path: str) -> bool:
    """
    Delete audio file from Supabase Storage
    
    Args:
        file_path: Path to file in storage
        
    Returns:
        True if successful
    """
    try:
        supabase = get_supabase()
        supabase.storage.from_(settings.SUPABASE_STORAGE_BUCKET).remove([file_path])
        return True
    except Exception:
        return False
