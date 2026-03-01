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
    
    temp_file_path = None
    
    try:
        # Download audio file bytes directly from Supabase Storage
        print(f"[Transcription] Downloading audio from bucket: {settings.SUPABASE_STORAGE_BUCKET}, path: {audio_file_path}")
        file_bytes: bytes = supabase.storage.from_(settings.SUPABASE_STORAGE_BUCKET).download(audio_file_path)
        print(f"[Transcription] Downloaded {len(file_bytes)} bytes")

        # Save to temporary file
        suffix = os.path.splitext(audio_file_path)[1]
        if not suffix:
            suffix = ".mp3"  # Default to mp3 if no extension
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(file_bytes)
            temp_file_path = temp_file.name
        
        # Transcribe using Groq's Whisper API
        print(f"[Transcription] Sending to Groq for transcription...")
        transcript = await transcribe_with_groq(temp_file_path)
        print(f"[Transcription] Transcription complete, length: {len(transcript)} chars")
        
        # Clean up temp file
        if temp_file_path and os.path.exists(temp_file_path):
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
        print(f"[Transcription] ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Clean up temp file on error
        if temp_file_path and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        
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
    
    # Determine content type based on file extension
    ext = os.path.splitext(audio_file_path)[1].lower()
    content_type = "audio/wav" if ext == ".wav" else "audio/mpeg"
    
    # Use multipart form data for file upload
    files = {
        "file": (os.path.basename(audio_file_path), audio_data, content_type)
    }
    
    # Use the model from settings instead of hardcoded value
    model = settings.GROQ_TRANSCRIPTION_MODEL or "distil-whisper-large-v3-en"
    print(f"[Transcription] Using Groq model: {model}")
    
    data = {
        "model": model,
        "response_format": "json",
        "language": "en"
    }
    
    async with httpx.AsyncClient(timeout=300.0) as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/audio/transcriptions",
            headers=headers,
            files=files,
            data=data
        )
        
        if response.status_code != 200:
            error_text = response.text
            print(f"[Transcription] Groq API error ({response.status_code}): {error_text}")
            response.raise_for_status()
        
        result = response.json()
        return result.get("text", "")
