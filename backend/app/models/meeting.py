from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date, time
from enum import Enum


class MeetingType(str, Enum):
    """Meeting type enumeration"""
    WEEKLY_UPDATE = "Weekly Update"
    STANDUP = "Standup"
    DISCUSSION = "Discussion"
    PLANNING = "Planning"
    REVIEW = "Review"


class MeetingStatus(str, Enum):
    """Meeting status enumeration"""
    SCHEDULED = "Scheduled"
    COMPLETED = "Completed"


class ActionType(str, Enum):
    """Action item type enumeration"""
    EMAIL = "Email"
    MEETING = "Meeting"
    TASK = "Task"


class ActionStatus(str, Enum):
    """Action item status enumeration"""
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    EXECUTED = "EXECUTED"
    COMPLETED = "COMPLETED"


class FollowUpStatus(str, Enum):
    """Follow-up status enumeration"""
    TRACKED = "Tracked"
    COMPLETED = "Completed"


# Meeting Models
class MeetingBase(BaseModel):
    """Base meeting model"""
    title: str = Field(..., min_length=1, max_length=255)
    project_id: Optional[str] = None
    meeting_date: date
    meeting_time: time
    meeting_type: MeetingType = MeetingType.DISCUSSION
    attendees: List[str] = Field(default_factory=list)
    source: str = Field(default="manual")
    calendar_event_id: Optional[str] = None


class MeetingCreate(MeetingBase):
    """Meeting creation model"""
    pass


class MeetingUpdate(BaseModel):
    """Meeting update model - all fields optional"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    project_id: Optional[str] = None
    meeting_date: Optional[date] = None
    meeting_time: Optional[time] = None
    meeting_type: Optional[MeetingType] = None
    attendees: Optional[List[str]] = None
    summary: Optional[str] = None
    status: Optional[MeetingStatus] = None


class MeetingResponse(MeetingBase):
    """Meeting response model"""
    id: str
    user_id: str
    status: MeetingStatus
    audio_file_path: Optional[str] = None
    audio_file_url: Optional[str] = None
    summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Transcript Models
class TranscriptResponse(BaseModel):
    """Transcript response model"""
    id: str
    meeting_id: str
    raw_transcript: Optional[str] = None
    cleaned_transcript: Optional[str] = None
    transcription_status: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Decision Models
class DecisionResponse(BaseModel):
    """Decision response model"""
    id: str
    meeting_id: str
    decision_text: str
    confidence_score: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Action Item Models
class ActionItemBase(BaseModel):
    """Base action item model"""
    action_type: ActionType
    description: str
    assigned_to: Optional[str] = None
    due_date: Optional[date] = None


class ActionItemCreate(ActionItemBase):
    """Action item creation model"""
    meeting_id: str
    project_id: Optional[str] = None
    metadata: Optional[dict] = None


class ActionItemUpdate(BaseModel):
    """Action item update model"""
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[date] = None
    metadata: Optional[dict] = None


class ActionItemResponse(ActionItemBase):
    """Action item response model"""
    id: str
    meeting_id: str
    project_id: Optional[str] = None
    status: ActionStatus
    confidence_score: Optional[float] = None
    metadata: Optional[dict] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Follow-up Models
class FollowUpResponse(BaseModel):
    """Follow-up response model"""
    id: str
    meeting_id: str
    project_id: Optional[str] = None
    description: str
    status: FollowUpStatus
    confidence_score: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Problem Statement Models
class ProblemStatementResponse(BaseModel):
    """Problem statement response model"""
    id: str
    meeting_id: str
    statement: str
    confidence_score: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Email Draft Models
class EmailDraftCreate(BaseModel):
    """Email draft creation model"""
    meeting_id: str
    action_item_id: Optional[str] = None
    subject: str
    body: str
    recipients: List[str]
    cc: Optional[List[str]] = Field(default_factory=list)


class EmailDraftResponse(EmailDraftCreate):
    """Email draft response model"""
    id: str
    sent_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Complete Meeting Detail Response
class MeetingDetailResponse(MeetingResponse):
    """Complete meeting detail with all extracted data"""
    transcript: Optional[TranscriptResponse] = None
    decisions: List[DecisionResponse] = Field(default_factory=list)
    action_items: List[ActionItemResponse] = Field(default_factory=list)
    follow_ups: List[FollowUpResponse] = Field(default_factory=list)
    problem_statements: List[ProblemStatementResponse] = Field(default_factory=list)
    project_name: Optional[str] = None
    project_color: Optional[str] = None
