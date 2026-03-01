import { Calendar, Clock, Users, FileText, CheckCircle, ListTodo, MessageSquare, AlertTriangle, Mail, CalendarPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Meeting } from '../types';
import { useNavigate } from 'react-router-dom';

interface MeetingDetailViewProps {
  meeting: any;
}

export function MeetingDetailView({ meeting }: MeetingDetailViewProps) {
  const navigate = useNavigate();

  const handleSendMOM = () => {
    navigate(`/email/${meeting.id}`);
  };

  const handleScheduleMeeting = () => {
    navigate(`/schedule/${meeting.id}`);
  };

  // Format time for display: converts "14:30" to "2:30 PM"
  const formatTime = (time: string) => {
    if (!time) return '';
    if (time.includes('AM') || time.includes('PM')) return time;
    const [hourStr, minStr] = time.split(':');
    const hour = parseInt(hourStr);
    const min = minStr || '00';
    if (hour === 0) return `12:${min} AM`;
    if (hour < 12) return `${hour}:${min} AM`;
    if (hour === 12) return `12:${min} PM`;
    return `${hour - 12}:${min} PM`;
  };

  return (
    <div className="space-y-4">
      {/* Meeting Metadata */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{meeting.title}</CardTitle>
              <p className="text-indigo-600 font-medium">{meeting.project_name || meeting.projectName || 'General'}</p>
            </div>
            <Badge className="bg-indigo-100 text-indigo-800">
              {meeting.meeting_type || meeting.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{new Date(meeting.meeting_date || meeting.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{formatTime(meeting.meeting_time || meeting.time)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>{meeting.attendees?.length || 0} attendees</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Attendees:</p>
            <div className="flex flex-wrap gap-2">
              {(meeting.attendees || []).map((attendee: string, idx: number) => (
                <Badge key={idx} variant="outline" className="bg-gray-50">
                  {attendee}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transcript */}
      {meeting.transcript && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Transcript
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                {meeting.transcript?.cleaned_transcript || meeting.transcript?.raw_transcript || meeting.transcript || 'No transcript available.'}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary / MOM */}
      {meeting.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              Meeting Summary (MOM)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              defaultValue={meeting.summary}
              className="min-h-32 mb-4"
              placeholder="Enter meeting summary..."
            />
            <Button onClick={handleSendMOM} className="bg-indigo-600 hover:bg-indigo-700">
              <Mail className="w-4 h-4 mr-2" />
              Send MOM
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Decisions */}
      {meeting.decisions && meeting.decisions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Decisions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(meeting.decisions || []).map((decision: any, idx: number) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{decision.decision_text || decision}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Action Items */}
      {(meeting.action_items || meeting.actionItems)?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-indigo-600" />
              Action Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(meeting.action_items || meeting.actionItems).map((action: any) => (
                <div
                  key={action.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={action.status === 'Completed'}
                    className="mt-1 w-4 h-4 text-indigo-600 rounded"
                    readOnly
                  />
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{action.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      {(action.assigned_to || action.assignedTo) && <span>Assigned to: {action.assigned_to || action.assignedTo}</span>}
                      <span>•</span>
                      <span>Due: {new Date(action.due_date || action.dueDate || meeting.meeting_date || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge
                    variant={action.status === 'Completed' ? 'default' : 'outline'}
                    className={
                      action.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : action.status === 'Blocked'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                    }
                  >
                    {action.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Follow-ups */}
      {(meeting.follow_ups || meeting.followUps)?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Follow-ups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(meeting.follow_ups || meeting.followUps).map((followUp: any) => (
                <div
                  key={followUp.id}
                  className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={followUp.status === 'Completed'}
                    className="mt-1 w-4 h-4 text-blue-600 rounded"
                    readOnly
                  />
                  <span className="text-gray-900 flex-1">{followUp.description}</span>
                  <Badge variant="outline" className="bg-white">
                    {followUp.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Problem Statements */}
      {(meeting.problem_statements || meeting.problemStatements)?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Problem Statements / Feasibility Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(meeting.problem_statements || meeting.problemStatements).map((problem: any, idx: number) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{problem.statement || problem}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Automation Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-indigo-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button onClick={handleSendMOM} variant="outline" className="flex-1">
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
            <Button onClick={handleScheduleMeeting} variant="outline" className="flex-1">
              <CalendarPlus className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
