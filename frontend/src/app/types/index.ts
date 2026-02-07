export type ActionType = 'Email' | 'Meeting' | 'Task';
export type ActionStatus = 'Pending' | 'Blocked' | 'Completed';
export type MeetingType = 'Weekly Update' | 'Standup' | 'Discussion' | 'Planning' | 'Review';

export interface Action {
  id: string;
  type: ActionType;
  description: string;
  relatedMeeting: string;
  meetingId: string;
  projectId: string;
  projectName: string;
  dueDate: string;
  status: ActionStatus;
  assignedTo?: string;
}

export interface FollowUp {
  id: string;
  description: string;
  projectName: string;
  projectId: string;
  meetingId: string;
  meetingName: string;
  status: 'Tracked' | 'Completed';
}

export interface HeldItem {
  id: string;
  description: string;
  reason: string;
  projectName: string;
  projectId: string;
  blockedSince: string;
}

export interface Meeting {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  date: string;
  time: string;
  type: MeetingType;
  attendees: string[];
  transcript?: string;
  summary?: string;
  decisions: string[];
  actionItems: Action[];
  followUps: FollowUp[];
  problemStatements: string[];
  status: 'Scheduled' | 'Completed';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface EmailDraft {
  id: string;
  meetingId: string;
  projectId: string;
  subject: string;
  body: string;
  recipients: string[];
}
