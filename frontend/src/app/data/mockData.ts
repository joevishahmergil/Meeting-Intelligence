import { Project, Meeting, Action, FollowUp, HeldItem } from '../types';

export const projects: Project[] = [
  {
    id: 'proj-1',
    name: 'Customer Portal Redesign',
    description: 'Modernizing the customer portal experience',
    color: '#3b82f6'
  },
  {
    id: 'proj-2',
    name: 'Mobile App v2.0',
    description: 'Next generation mobile application',
    color: '#8b5cf6'
  },
  {
    id: 'proj-3',
    name: 'Analytics Platform',
    description: 'Real-time analytics and reporting system',
    color: '#06b6d4'
  },
  {
    id: 'proj-4',
    name: 'Payment Gateway Integration',
    description: 'New payment provider integration',
    color: '#10b981'
  }
];

export const meetings: Meeting[] = [
  {
    id: 'meet-1',
    title: 'Q1 Planning Session',
    projectId: 'proj-1',
    projectName: 'Customer Portal Redesign',
    date: '2026-02-05',
    time: '10:00 AM',
    type: 'Planning',
    attendees: ['Sarah Chen', 'Mike Johnson', 'Emily Rodriguez'],
    transcript: `Sarah Chen (10:00 AM): Good morning everyone. Let's start with our Q1 planning for the customer portal redesign.

Mike Johnson (10:02 AM): Thanks Sarah. I've reviewed the wireframes and I think we should prioritize the dashboard improvements first.

Emily Rodriguez (10:05 AM): I agree. The current dashboard is getting a lot of complaints from users. We should also consider mobile responsiveness.

Sarah Chen (10:10 AM): Good points. Let's make that our first sprint goal. Mike, can you prepare the technical specifications by next week?

Mike Johnson (10:12 AM): Yes, I'll have them ready by Friday.

Emily Rodriguez (10:15 AM): I'll coordinate with the design team to finalize the mockups.

Sarah Chen (10:18 AM): Perfect. Let's also discuss the authentication flow improvements...`,
    summary: 'Discussed Q1 priorities for the customer portal redesign project. Team agreed to prioritize dashboard improvements and mobile responsiveness. Technical specifications and design mockups to be completed by end of week.',
    decisions: [
      'Dashboard improvements will be the first sprint goal',
      'Mobile responsiveness is a key priority',
      'Technical specs due by Friday, Feb 7',
      'Design team to finalize mockups by Friday'
    ],
    actionItems: [
      {
        id: 'action-1',
        type: 'Task',
        description: 'Prepare technical specifications for dashboard',
        relatedMeeting: 'Q1 Planning Session',
        meetingId: 'meet-1',
        projectId: 'proj-1',
        projectName: 'Customer Portal Redesign',
        dueDate: '2026-02-07',
        status: 'Pending',
        assignedTo: 'Mike Johnson'
      },
      {
        id: 'action-2',
        type: 'Email',
        description: 'Send meeting summary to stakeholders',
        relatedMeeting: 'Q1 Planning Session',
        meetingId: 'meet-1',
        projectId: 'proj-1',
        projectName: 'Customer Portal Redesign',
        dueDate: '2026-02-06',
        status: 'Pending',
        assignedTo: 'Sarah Chen'
      }
    ],
    followUps: [
      {
        id: 'follow-1',
        description: 'Check with design team on mockup timeline',
        projectName: 'Customer Portal Redesign',
        projectId: 'proj-1',
        meetingId: 'meet-1',
        meetingName: 'Q1 Planning Session',
        status: 'Tracked'
      }
    ],
    problemStatements: [
      'Current dashboard performance is slow with large datasets',
      'Mobile users report navigation difficulties'
    ],
    status: 'Completed'
  },
  {
    id: 'meet-2',
    title: 'Weekly Standup - Week 6',
    projectId: 'proj-2',
    projectName: 'Mobile App v2.0',
    date: '2026-02-03',
    time: '9:00 AM',
    type: 'Standup',
    attendees: ['David Lee', 'Jennifer Wu', 'Tom Bradley'],
    transcript: `David Lee (9:00 AM): Good morning team. Let's do our quick standup. Jennifer, what did you work on?

Jennifer Wu (9:01 AM): I completed the user authentication flow and started on the profile screen. No blockers.

Tom Bradley (9:03 AM): I finished the API integration for the news feed. Currently working on the notification system. I need David's help with the push notification setup.

David Lee (9:05 AM): Sure Tom, let's sync after this meeting. I'll be working on the settings module today.`,
    summary: 'Quick standup to review progress on Mobile App v2.0. Jennifer completed auth flow, Tom needs help with push notifications, David working on settings.',
    decisions: [
      'David to help Tom with push notification setup',
      'Profile screen to be reviewed in tomorrow\'s sync'
    ],
    actionItems: [
      {
        id: 'action-3',
        type: 'Meeting',
        description: 'Schedule sync for push notification setup',
        relatedMeeting: 'Weekly Standup - Week 6',
        meetingId: 'meet-2',
        projectId: 'proj-2',
        projectName: 'Mobile App v2.0',
        dueDate: '2026-02-03',
        status: 'Pending',
        assignedTo: 'David Lee'
      },
      {
        id: 'action-4',
        type: 'Task',
        description: 'Complete notification system implementation',
        relatedMeeting: 'Weekly Standup - Week 6',
        meetingId: 'meet-2',
        projectId: 'proj-2',
        projectName: 'Mobile App v2.0',
        dueDate: '2026-02-10',
        status: 'Pending',
        assignedTo: 'Tom Bradley'
      }
    ],
    followUps: [],
    problemStatements: [],
    status: 'Completed'
  },
  {
    id: 'meet-3',
    title: 'Data Pipeline Architecture Review',
    projectId: 'proj-3',
    projectName: 'Analytics Platform',
    date: '2026-02-04',
    time: '2:00 PM',
    type: 'Review',
    attendees: ['Rachel Park', 'Alex Kumar', 'Lisa Thompson'],
    transcript: `Rachel Park (2:00 PM): Let's review the data pipeline architecture. Alex, can you walk us through the proposed design?

Alex Kumar (2:02 PM): Sure. We're planning to use a streaming architecture with Apache Kafka for real-time data ingestion...

Lisa Thompson (2:15 PM): What about data retention policies? We need to consider compliance requirements.

Rachel Park (2:18 PM): Good point. Alex, can you research the compliance requirements and update the architecture document?

Alex Kumar (2:20 PM): Will do. I'll have it ready by Monday.`,
    summary: 'Reviewed proposed data pipeline architecture for the Analytics Platform. Identified need for compliance research regarding data retention.',
    decisions: [
      'Use Apache Kafka for real-time data ingestion',
      'Research compliance requirements before finalizing architecture'
    ],
    actionItems: [
      {
        id: 'action-5',
        type: 'Task',
        description: 'Research compliance requirements for data retention',
        relatedMeeting: 'Data Pipeline Architecture Review',
        meetingId: 'meet-3',
        projectId: 'proj-3',
        projectName: 'Analytics Platform',
        dueDate: '2026-02-10',
        status: 'Blocked',
        assignedTo: 'Alex Kumar'
      },
      {
        id: 'action-6',
        type: 'Task',
        description: 'Update architecture document with compliance details',
        relatedMeeting: 'Data Pipeline Architecture Review',
        meetingId: 'meet-3',
        projectId: 'proj-3',
        projectName: 'Analytics Platform',
        dueDate: '2026-02-10',
        status: 'Blocked',
        assignedTo: 'Alex Kumar'
      }
    ],
    followUps: [
      {
        id: 'follow-2',
        description: 'Schedule follow-up meeting with compliance team',
        projectName: 'Analytics Platform',
        projectId: 'proj-3',
        meetingId: 'meet-3',
        meetingName: 'Data Pipeline Architecture Review',
        status: 'Tracked'
      }
    ],
    problemStatements: [
      'Need to verify compliance requirements for data retention policies',
      'Scaling concerns for high-volume data ingestion'
    ],
    status: 'Completed'
  },
  {
    id: 'meet-4',
    title: 'Payment Provider Integration Kickoff',
    projectId: 'proj-4',
    projectName: 'Payment Gateway Integration',
    date: '2026-02-06',
    time: '11:00 AM',
    type: 'Planning',
    attendees: ['Marcus Chen', 'Nina Patel'],
    status: 'Scheduled'
  },
  {
    id: 'meet-5',
    title: 'Weekly Update - Portal Team',
    projectId: 'proj-1',
    projectName: 'Customer Portal Redesign',
    date: '2026-01-30',
    time: '3:00 PM',
    type: 'Weekly Update',
    attendees: ['Sarah Chen', 'Mike Johnson', 'Emily Rodriguez'],
    transcript: `Sarah Chen (3:00 PM): Let's review our progress from last week...`,
    summary: 'Weekly progress update for the portal redesign team. Discussed completed tasks and upcoming milestones.',
    decisions: ['Move forward with current design direction'],
    actionItems: [],
    followUps: [],
    problemStatements: [],
    status: 'Completed'
  },
  {
    id: 'meet-6',
    title: 'Design Review - Dashboard UI',
    projectId: 'proj-1',
    projectName: 'Customer Portal Redesign',
    date: '2026-02-05',
    time: '2:00 PM',
    type: 'Review',
    attendees: ['Sarah Chen', 'Emily Rodriguez', 'Design Team'],
    transcript: `Emily Rodriguez (2:00 PM): Thanks everyone for joining. Let's review the latest dashboard designs...`,
    summary: 'Reviewed dashboard UI mockups and provided feedback on color scheme and layout.',
    decisions: ['Approved primary color scheme', 'Requested adjustments to card spacing'],
    actionItems: [],
    followUps: [],
    problemStatements: [],
    status: 'Completed'
  },
  {
    id: 'meet-7',
    title: 'Team Coffee Chat',
    projectId: 'proj-2',
    projectName: 'Mobile App v2.0',
    date: '2026-02-05',
    time: '4:00 PM',
    type: 'Discussion',
    attendees: ['David Lee', 'Jennifer Wu', 'Tom Bradley', 'Lisa Thompson'],
    summary: 'Informal team sync to discuss progress and blockers.',
    decisions: [],
    actionItems: [],
    followUps: [],
    problemStatements: [],
    status: 'Completed'
  }
];

export const pendingActions: Action[] = meetings
  .flatMap(m => m.actionItems || [])
  .filter(a => a.status === 'Pending' || a.status === 'Blocked');

export const pendingFollowUps: FollowUp[] = meetings
  .flatMap(m => m.followUps || [])
  .filter(f => f.status === 'Tracked');

export const heldItems: HeldItem[] = [
  {
    id: 'held-1',
    description: 'Update architecture document with compliance details',
    reason: 'Waiting for compliance team response',
    projectName: 'Analytics Platform',
    projectId: 'proj-3',
    blockedSince: '2026-02-04'
  },
  {
    id: 'held-2',
    description: 'API endpoint finalization',
    reason: 'Dependent on backend team sprint completion',
    projectName: 'Mobile App v2.0',
    projectId: 'proj-2',
    blockedSince: '2026-02-01'
  }
];

// Current user
export const currentUser = {
  name: 'Sarah Chen',
  email: 'sarah.chen@company.com',
  avatar: 'SC'
};