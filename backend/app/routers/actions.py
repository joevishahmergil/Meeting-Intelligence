from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from app.models.meeting import (
    ActionItemResponse, ActionItemUpdate, ActionStatus,
    FollowUpResponse, FollowUpStatus
)
from app.core.database import get_supabase
from app.core.dependencies import get_current_user_id

router = APIRouter(prefix="/api/actions", tags=["Actions"])


@router.get("/pending", response_model=List[ActionItemResponse])
async def get_pending_actions(user_id: str = Depends(get_current_user_id)):
    """Get all pending action items for the current user"""
    supabase = get_supabase()
    
    # Get all meetings for user
    meetings_response = supabase.table("meetings").select("id").eq("user_id", user_id).execute()
    meeting_ids = [m["id"] for m in meetings_response.data]
    
    if not meeting_ids:
        return []
    
    # Get pending actions for these meetings
    response = supabase.table("action_items").select("*").in_("meeting_id", meeting_ids).in_("status", ["PENDING", "APPROVED"]).order("due_date").execute()
    
    return [ActionItemResponse(**action) for action in response.data]


@router.get("", response_model=List[ActionItemResponse])
async def get_all_actions(
    status: Optional[ActionStatus] = None,
    meeting_id: Optional[str] = None,
    user_id: str = Depends(get_current_user_id)
):
    """Get all action items with optional filters"""
    supabase = get_supabase()
    
    # Get all meetings for user
    meetings_response = supabase.table("meetings").select("id").eq("user_id", user_id).execute()
    meeting_ids = [m["id"] for m in meetings_response.data]
    
    if not meeting_ids:
        return []
    
    query = supabase.table("action_items").select("*").in_("meeting_id", meeting_ids)
    
    if status:
        query = query.eq("status", status.value)
    if meeting_id:
        query = query.eq("meeting_id", meeting_id)
    
    response = query.order("created_at", desc=True).execute()
    
    return [ActionItemResponse(**action) for action in response.data]


@router.put("/{action_id}", response_model=ActionItemResponse)
async def update_action(
    action_id: str,
    action_data: ActionItemUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update an action item (before approval)"""
    supabase = get_supabase()
    
    # Verify action belongs to user's meeting
    action_response = supabase.table("action_items").select("*, meetings!inner(user_id)").eq("id", action_id).execute()
    
    if not action_response.data or action_response.data[0]["meetings"]["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Action item not found"
        )
    
    # Prepare update data
    update_data = action_data.model_dump(exclude_unset=True)
    
    if not update_data:
        return ActionItemResponse(**action_response.data[0])
    
    response = supabase.table("action_items").update(update_data).eq("id", action_id).execute()
    
    return ActionItemResponse(**response.data[0])


@router.post("/{action_id}/approve", response_model=ActionItemResponse)
async def approve_action(
    action_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Approve an action item"""
    supabase = get_supabase()
    
    # Verify action belongs to user
    action_response = supabase.table("action_items").select("*, meetings!inner(user_id)").eq("id", action_id).execute()
    
    if not action_response.data or action_response.data[0]["meetings"]["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Action item not found"
        )
    
    action = action_response.data[0]
    
    if action["status"] != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending actions can be approved"
        )
    
    # Update status to approved
    response = supabase.table("action_items").update({"status": "APPROVED"}).eq("id", action_id).execute()
    
    # Log audit trail
    audit_data = {
        "user_id": user_id,
        "entity_type": "action_item",
        "entity_id": action_id,
        "action": "APPROVED",
        "previous_value": {"status": "PENDING"},
        "new_value": {"status": "APPROVED"}
    }
    supabase.table("audit_log").insert(audit_data).execute()
    
    return ActionItemResponse(**response.data[0])


@router.post("/{action_id}/reject", response_model=ActionItemResponse)
async def reject_action(
    action_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Reject an action item"""
    supabase = get_supabase()
    
    # Verify action belongs to user
    action_response = supabase.table("action_items").select("*, meetings!inner(user_id)").eq("id", action_id).execute()
    
    if not action_response.data or action_response.data[0]["meetings"]["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Action item not found"
        )
    
    # Update status to rejected
    response = supabase.table("action_items").update({"status": "REJECTED"}).eq("id", action_id).execute()
    
    # Log audit trail
    audit_data = {
        "user_id": user_id,
        "entity_type": "action_item",
        "entity_id": action_id,
        "action": "REJECTED",
        "previous_value": {"status": action_response.data[0]["status"]},
        "new_value": {"status": "REJECTED"}
    }
    supabase.table("audit_log").insert(audit_data).execute()
    
    return ActionItemResponse(**response.data[0])


@router.post("/{action_id}/complete", response_model=ActionItemResponse)
async def complete_action(
    action_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Mark an action item as completed"""
    supabase = get_supabase()
    
    # Verify action belongs to user
    action_response = supabase.table("action_items").select("*, meetings!inner(user_id)").eq("id", action_id).execute()
    
    if not action_response.data or action_response.data[0]["meetings"]["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Action item not found"
        )
    
    # Update status to completed
    response = supabase.table("action_items").update({"status": "COMPLETED"}).eq("id", action_id).execute()
    
    # Log audit trail
    audit_data = {
        "user_id": user_id,
        "entity_type": "action_item",
        "entity_id": action_id,
        "action": "COMPLETED",
        "previous_value": {"status": action_response.data[0]["status"]},
        "new_value": {"status": "COMPLETED"}
    }
    supabase.table("audit_log").insert(audit_data).execute()
    
    return ActionItemResponse(**response.data[0])


@router.get("/followups", response_model=List[FollowUpResponse])
async def get_follow_ups(
    status: Optional[FollowUpStatus] = None,
    user_id: str = Depends(get_current_user_id)
):
    """Get all follow-up items"""
    supabase = get_supabase()
    
    # Get all meetings for user
    meetings_response = supabase.table("meetings").select("id").eq("user_id", user_id).execute()
    meeting_ids = [m["id"] for m in meetings_response.data]
    
    if not meeting_ids:
        return []
    
    query = supabase.table("follow_ups").select("*").in_("meeting_id", meeting_ids)
    
    if status:
        query = query.eq("status", status.value)
    
    response = query.order("created_at", desc=True).execute()
    
    return [FollowUpResponse(**followup) for followup in response.data]


@router.post("/followups/{followup_id}/complete", response_model=FollowUpResponse)
async def complete_follow_up(
    followup_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Mark a follow-up as completed"""
    supabase = get_supabase()
    
    # Verify follow-up belongs to user
    followup_response = supabase.table("follow_ups").select("*, meetings!inner(user_id)").eq("id", followup_id).execute()
    
    if not followup_response.data or followup_response.data[0]["meetings"]["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Follow-up not found"
        )
    
    # Update status
    response = supabase.table("follow_ups").update({"status": "Completed"}).eq("id", followup_id).execute()
    
    return FollowUpResponse(**response.data[0])
