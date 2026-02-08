import base64
import os
import tempfile
import httpx
from app.core.database import get_supabase
from app.core.config import settings


async def transcribe_audio(meeting_id: str, audio_file_path: str) -> str:
    """
    Transcribe audio file using Groq's Whisper API
    
    Args:
        meeting_id: Meeting ID
        audio_file_path: Path to audio file in Supabase Storage
        
    Returns:
        Transcript ID
    """
    supabase = get_supabase()
    
    # Create transcript record with pending status
    transcript_data = {
        "meeting_id": meeting_id,
        "transcription_status": "processing"
    }
    transcript_response = supabase.table("transcripts").insert(transcript_data).execute()
    transcript_id = transcript_response.data[0]["id"]
    
    try:
        # Download audio file from Supabase Storage
        public_url = supabase.storage.from_(settings.SUPABASE_STORAGE_BUCKET).get_public_url(audio_file_path)
        
        # Download file to temp location
        async with httpx.AsyncClient() as client:
            response = await client.get(public_url)
            response.raise_for_status()
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio_file_path)[1]) as temp_file:
                temp_file.write(response.content)
                temp_file_path = temp_file.name
        
        # Transcribe using Groq's Whisper API
        transcript = await transcribe_with_groq(temp_file_path)
        
        # Clean up temp file
        os.unlink(temp_file_path)
        
        # Basic cleaning
        cleaned_transcript = transcript.strip()
        
        # Update transcript record
        supabase.table("transcripts").update({
            "raw_transcript": transcript,
            "cleaned_transcript": cleaned_transcript,
            "transcription_status": "completed"
        }).eq("id", transcript_id).execute()
        
        return transcript_id
        
    except Exception as e:
        # Update transcript with error
        supabase.table("transcripts").update({
            "transcription_status": "failed",
            "error_message": str(e)
        }).eq("id", transcript_id).execute()
        
        raise Exception(f"Transcription failed: {str(e)}")


async def transcribe_with_groq(audio_file_path: str) -> str:
    """
    Transcribe audio using Groq's Whisper API
    
    Args:
        audio_file_path: Path to audio file
        
    Returns:
        Transcribed text
    """
    if not settings.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not configured")
    
    # Read and encode audio file
    with open(audio_file_path, "rb") as audio_file:
        audio_data = audio_file.read()
    
    # Prepare the request to Groq
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
    }
    
    # Use multipart form data for file upload
    files = {
        "file": (os.path.basename(audio_file_path), audio_data, "audio/mpeg")
    }
    
    data = {
        "model": "whisper-large-v3",  # Groq's Whisper model
        "response_format": "json",
        "language": "en"  # Optional: specify language
    }
    
    async with httpx.AsyncClient(timeout=300.0) as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/audio/transcriptions",
            headers=headers,
            files=files,
            data=data
        )
        response.raise_for_status()
        
        result = response.json()
        return result.get("text", "")
