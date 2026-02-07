from groq import Groq
from app.core.database import get_supabase
from app.core.config import settings
import os
import tempfile
import httpx


# Initialize Groq client
groq_client = Groq(api_key=settings.GROQ_API_KEY)


async def transcribe_audio(meeting_id: str, audio_file_path: str) -> str:
    """
    Transcribe audio file using Groq Whisper (Serverless)
    
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
        # Download audio file from Supabase Storage
        public_url = supabase.storage.from_(settings.SUPABASE_STORAGE_BUCKET).get_public_url(audio_file_path)
        
        # Download file to temp location
        async with httpx.AsyncClient() as client:
            response = await client.get(public_url)
            response.raise_for_status()
            
            # Save to temporary file
            # We use delete=False to close the file handle before reading it again
            suffix = os.path.splitext(audio_file_path)[1]
            if not suffix:
                suffix = ".mp3"  # Default to mp3 if no extension
                
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                temp_file.write(response.content)
                temp_file_path = temp_file.name
        
        # Transcribe using Groq
        with open(temp_file_path, "rb") as file:
            transcription = groq_client.audio.transcriptions.create(
                file=(os.path.basename(temp_file_path), file.read()),
                model=settings.GROQ_TRANSCRIPTION_MODEL,
                response_format="json",
                temperature=0.0
            )
        
        # Extract transcript
        raw_transcript = transcription.text
        
        # Basic cleaning
        cleaned_transcript = raw_transcript.strip()
        
        # Update transcript record
        supabase.table("transcripts").update({
            "raw_transcript": raw_transcript,
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
        
    finally:
        # Clean up temp file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception:
                pass
