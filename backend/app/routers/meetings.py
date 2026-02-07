from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from typing import List, Optional
from datetime import date
from app.models.meeting import (
    MeetingCreate, MeetingUpdate, MeetingResponse, MeetingDetailResponse,
    TranscriptResponse, DecisionResponse, ActionItemResponse, FollowUpResponse,
    ProblemStatementResponse, MeetingType, MeetingStatus
)
from app.core.database import get_supabase
from app.core.dependencies import get_current_user_id
from app.services.storage import upload_audio_file
from app.services.transcription import transcribe_audio
from app.services.intelligence import extract_intelligence

router = APIRouter(prefix="/api/meetings", tags=["Meetings"])


@router.post("", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
async def create_meeting(
    meeting_data: MeetingCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new meeting"""
    supabase = get_supabase()
    
    new_meeting = {
        "user_id": user_id,
        "project_id": meeting_data.project_id,
        "title": meeting_data.title,
        "meeting_date": str(meeting_data.meeting_date),
        "meeting_time": str(meeting_data.meeting_time),
        "meeting_type": meeting_data.meeting_type.value,
        "attendees": meeting_data.attendees,
        "source": meeting_data.source,
        "calendar_event_id": meeting_data.calendar_event_id,
        "status": MeetingStatus.SCHEDULED.value
    }
    
    response = supabase.table("meetings").insert(new_meeting).execute()
    
    if not response.data or len(response.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create meeting"
        )
    
    return MeetingResponse(**response.data[0])


@router.get("", response_model=List[MeetingResponse])
async def get_meetings(
    project_id: Optional[str] = None,
    meeting_type: Optional[MeetingType] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    user_id: str = Depends(get_current_user_id)
):
    """Get all meetings for the current user with optional filters"""
    supabase = get_supabase()
    
    query = supabase.table("meetings").select("*").eq("user_id", user_id)
    
    if project_id:
        query = query.eq("project_id", project_id)
    if meeting_type:
        query = query.eq("meeting_type", meeting_type.value)
    if start_date:
        query = query.gte("meeting_date", str(start_date))
    if end_date:
        query = query.lte("meeting_date", str(end_date))
    
    response = query.order("meeting_date", desc=True).execute()
    
    return [MeetingResponse(**meeting) for meeting in response.data]


@router.get("/{meeting_id}", response_model=MeetingDetailResponse)
async def get_meeting_detail(
    meeting_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get complete meeting details with all extracted data"""
    supabase = get_supabase()
    
    # Get meeting
    meeting_response = supabase.table("meetings").select("*").eq("id", meeting_id).eq("user_id", user_id).execute()
    
    if not meeting_response.data or len(meeting_response.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found"
        )
    
    meeting = meeting_response.data[0]
    
    # Get project info if exists
    project_name = None
    project_color = None
    if meeting.get("project_id"):
        project_response = supabase.table("projects").select("name, color").eq("id", meeting["project_id"]).execute()
        if project_response.data:
            project_name = project_response.data[0]["name"]
            project_color = project_response.data[0]["color"]
    
    # Get transcript
    transcript_response = supabase.table("transcripts").select("*").eq("meeting_id", meeting_id).execute()
    transcript = TranscriptResponse(**transcript_response.data[0]) if transcript_response.data else None
    
    # Get decisions
    decisions_response = supabase.table("decisions").select("*").eq("meeting_id", meeting_id).execute()
    decisions = [DecisionResponse(**d) for d in decisions_response.data]
    
    # Get action items
    actions_response = supabase.table("action_items").select("*").eq("meeting_id", meeting_id).execute()
    action_items = [ActionItemResponse(**a) for a in actions_response.data]
    
    # Get follow-ups
    followups_response = supabase.table("follow_ups").select("*").eq("meeting_id", meeting_id).execute()
    follow_ups = [FollowUpResponse(**f) for f in followups_response.data]
    
    # Get problem statements
    problems_response = supabase.table("problem_statements").select("*").eq("meeting_id", meeting_id).execute()
    problem_statements = [ProblemStatementResponse(**p) for p in problems_response.data]
    
    return MeetingDetailResponse(
        **meeting,
        transcript=transcript,
        decisions=decisions,
        action_items=action_items,
        follow_ups=follow_ups,
        problem_statements=problem_statements,
        project_name=project_name,
        project_color=project_color
    )


@router.put("/{meeting_id}", response_model=MeetingResponse)
async def update_meeting(
    meeting_id: str,
    meeting_data: MeetingUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update a meeting"""
    supabase = get_supabase()
    
    # Check if meeting exists
    existing = supabase.table("meetings").select("*").eq("id", meeting_id).eq("user_id", user_id).execute()
    
    if not existing.data or len(existing.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found"
        )
    
    # Prepare update data
    update_data = meeting_data.model_dump(exclude_unset=True)
    
    # Convert enum values to strings
    if "meeting_type" in update_data and update_data["meeting_type"]:
        update_data["meeting_type"] = update_data["meeting_type"].value
    if "status" in update_data and update_data["status"]:
        update_data["status"] = update_data["status"].value
    
    if not update_data:
        return MeetingResponse(**existing.data[0])
    
    response = supabase.table("meetings").update(update_data).eq("id", meeting_id).execute()
    
    return MeetingResponse(**response.data[0])


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_meeting(
    meeting_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a meeting"""
    supabase = get_supabase()
    
    # Check if meeting exists
    existing = supabase.table("meetings").select("*").eq("id", meeting_id).eq("user_id", user_id).execute()
    
    if not existing.data or len(existing.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found"
        )
    
    # Delete meeting (cascade will handle related records)
    supabase.table("meetings").delete().eq("id", meeting_id).execute()
    
    return None


@router.post("/{meeting_id}/audio", response_model=dict)
async def upload_meeting_audio(
    meeting_id: str,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id)
):
    """Upload audio file for a meeting"""
    supabase = get_supabase()
    
    # Check if meeting exists
    meeting_response = supabase.table("meetings").select("*").eq("id", meeting_id).eq("user_id", user_id).execute()
    
    if not meeting_response.data or len(meeting_response.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found"
        )
    
    # Upload audio file
    try:
        file_path, file_url = await upload_audio_file(file, meeting_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to upload audio: {str(e)}"
        )
    
    # Update meeting with audio file info
    supabase.table("meetings").update({
        "audio_file_path": file_path,
        "audio_file_url": file_url
    }).eq("id", meeting_id).execute()
    
    return {
        "message": "Audio uploaded successfully",
        "file_path": file_path,
        "file_url": file_url
    }


@router.post("/{meeting_id}/process", response_model=dict)
async def process_meeting(
    meeting_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Process meeting audio: transcribe and extract intelligence"""
    supabase = get_supabase()
    
    # Get meeting
    meeting_response = supabase.table("meetings").select("*").eq("id", meeting_id).eq("user_id", user_id).execute()
    
    if not meeting_response.data or len(meeting_response.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found"
        )
    
    meeting = meeting_response.data[0]
    
    if not meeting.get("audio_file_path"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No audio file uploaded for this meeting"
        )
    
    try:
        # Step 1: Transcribe audio
        transcript_id = await transcribe_audio(meeting_id, meeting["audio_file_path"])
        
        # Step 2: Extract intelligence from transcript
        await extract_intelligence(meeting_id, transcript_id)
        
        # Update meeting status
        supabase.table("meetings").update({"status": MeetingStatus.COMPLETED.value}).eq("id", meeting_id).execute()
        
        return {
            "message": "Meeting processed successfully",
            "meeting_id": meeting_id,
            "transcript_id": transcript_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process meeting: {str(e)}"
        )
