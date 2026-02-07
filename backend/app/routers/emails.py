from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.models.meeting import EmailDraftCreate, EmailDraftResponse
from app.core.database import get_supabase
from app.core.dependencies import get_current_user_id
from app.services.email_service import send_email, generate_meeting_summary_email
from datetime import datetime

router = APIRouter(prefix="/api/emails", tags=["Emails"])


@router.post("/drafts", response_model=EmailDraftResponse, status_code=status.HTTP_201_CREATED)
async def create_email_draft(
    draft_data: EmailDraftCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create an email draft"""
    supabase = get_supabase()
    
    # Verify meeting belongs to user
    meeting_response = supabase.table("meetings").select("*").eq("id", draft_data.meeting_id).eq("user_id", user_id).execute()
    
    if not meeting_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found"
        )
    
    new_draft = {
        "meeting_id": draft_data.meeting_id,
        "action_item_id": draft_data.action_item_id,
        "subject": draft_data.subject,
        "body": draft_data.body,
        "recipients": draft_data.recipients,
        "cc": draft_data.cc
    }
    
    response = supabase.table("email_drafts").insert(new_draft).execute()
    
    return EmailDraftResponse(**response.data[0])


@router.get("/meeting/{meeting_id}", response_model=EmailDraftResponse)
async def get_meeting_email_draft(
    meeting_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get or generate email draft for a meeting"""
    supabase = get_supabase()
    
    # Verify meeting belongs to user
    meeting_response = supabase.table("meetings").select("*").eq("id", meeting_id).eq("user_id", user_id).execute()
    
    if not meeting_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found"
        )
    
    meeting = meeting_response.data[0]
    
    # Check if draft already exists
    draft_response = supabase.table("email_drafts").select("*").eq("meeting_id", meeting_id).execute()
    
    if draft_response.data:
        return EmailDraftResponse(**draft_response.data[0])
    
    # Generate new draft
    # Get meeting details
    decisions_response = supabase.table("decisions").select("*").eq("meeting_id", meeting_id).execute()
    decisions = [d["decision_text"] for d in decisions_response.data]
    
    actions_response = supabase.table("action_items").select("*").eq("meeting_id", meeting_id).execute()
    action_items = actions_response.data
    
    # Generate email body
    email_body = generate_meeting_summary_email(
        meeting["title"],
        meeting.get("summary", "Meeting summary not available"),
        decisions,
        action_items
    )
    
    # Create draft
    new_draft = {
        "meeting_id": meeting_id,
        "subject": f"Meeting Summary: {meeting['title']}",
        "body": email_body,
        "recipients": meeting.get("attendees", [])
    }
    
    response = supabase.table("email_drafts").insert(new_draft).execute()
    
    return EmailDraftResponse(**response.data[0])


@router.post("/{draft_id}/send", response_model=dict)
async def send_email_draft(
    draft_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Send an email draft"""
    supabase = get_supabase()
    
    # Get draft
    draft_response = supabase.table("email_drafts").select("*, meetings!inner(user_id)").eq("id", draft_id).execute()
    
    if not draft_response.data or draft_response.data[0]["meetings"]["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email draft not found"
        )
    
    draft = draft_response.data[0]
    
    # Check if already sent
    if draft.get("sent_at"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already sent"
        )
    
    # Send email
    try:
        success = await send_email(
            subject=draft["subject"],
            body=draft["body"],
            recipients=draft["recipients"],
            cc=draft.get("cc")
        )
        
        if not success:
            raise Exception("Failed to send email")
        
        # Update draft as sent
        supabase.table("email_drafts").update({
            "sent_at": datetime.utcnow().isoformat()
        }).eq("id", draft_id).execute()
        
        # Update related action item if exists
        if draft.get("action_item_id"):
            supabase.table("action_items").update({
                "status": "EXECUTED"
            }).eq("id", draft["action_item_id"]).execute()
        
        return {
            "message": "Email sent successfully",
            "draft_id": draft_id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )
