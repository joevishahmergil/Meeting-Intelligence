import whisper
from app.core.database import get_supabase
from app.core.config import settings
import os
import tempfile
import httpx


# Load Whisper model (use 'base' for faster processing, 'large' for better accuracy)
# You can change this to 'tiny', 'base', 'small', 'medium', or 'large'
WHISPER_MODEL = "base"
model = None


def get_whisper_model():
    """Lazy load Whisper model"""
    global model
    if model is None:
        model = whisper.load_model(WHISPER_MODEL)
    return model


async def transcribe_audio(meeting_id: str, audio_file_path: str) -> str:
    """
    Transcribe audio file using Whisper
    
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
        
        # Transcribe using Whisper
        whisper_model = get_whisper_model()
        result = whisper_model.transcribe(temp_file_path)
        
        # Clean up temp file
        os.unlink(temp_file_path)
        
        # Extract transcript
        raw_transcript = result["text"]
        
        # Basic cleaning (you can enhance this)
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
