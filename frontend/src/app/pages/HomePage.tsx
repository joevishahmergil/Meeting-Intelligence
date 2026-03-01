import { CheckCircle2, Mail, Calendar, ClipboardList, AlertTriangle, Clock, Loader2, Pencil } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Action, FollowUp, HeldItem, Project } from '../types';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchPendingActions, fetchFollowUps, approveAction, completeAction, fetchProjects, fetchMeetings, fetchMeetingDetail } from '../api';

export function HomePage() {
  const navigate = useNavigate();

  const [pendingActions, setPendingActions] = useState<Action[]>([]);
  const [pendingFollowUps, setPendingFollowUps] = useState<FollowUp[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [problemStatements, setProblemStatements] = useState<Array<{ meetingId: string; meetingTitle: string; statement: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [actions, followups, proj] = await Promise.all([
        fetchPendingActions(),
        fetchFollowUps(),
        fetchProjects()
      ]);
      setPendingActions(actions);
      setPendingFollowUps(followups);
      setProjects(proj);

      // Load a small batch of recent meetings and collect problem statements
      const meetings = await fetchMeetings();
      const recent = meetings.slice(0, 8); // limit to avoid heavy calls
      const details = await Promise.allSettled(recent.map((m: any) => fetchMeetingDetail(m.id)));
      const problems: Array<{ meetingId: string; meetingTitle: string; statement: string }> = [];
      details.forEach((res, idx) => {
        if (res.status === 'fulfilled') {
          const detail: any = res.value;
          const items = detail.problem_statements || [];
          items.forEach((p: any) => {
            problems.push({
              meetingId: detail.id,
              meetingTitle: detail.title,
              statement: p.statement || String(p)
            });
          });
        }
      });
      setProblemStatements(problems);
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Group actions by meeting
  const actionsByMeeting = pendingActions.reduce((acc, action: any) => {
    const key = action.meeting_id || 'unknown';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(action);
    return acc;
  }, {} as Record<string, any[]>);

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'Email': return Mail;
      case 'Meeting': return Calendar;
      case 'Task': return ClipboardList;
      default: return ClipboardList;
    }
  };

  const handleCompleteAction = async (actionId: string) => {
    try {
      await completeAction(actionId);
      loadData(); // Refresh UI
    } catch (e) {
      console.error(e);
      alert('Failed to complete action');
    }
  };

  const handleApproveAction = async (actionId: string) => {
    try {
      await approveAction(actionId);
      loadData(); // Ensure UI status reflects change

      const action: any = pendingActions.find(a => a.id === actionId);
      if (action?.action_type === 'Email' || action?.type === 'Email') {
        navigate(`/email/${action.meeting_id}`);
      } else if (action?.action_type === 'Meeting' || action?.type === 'Meeting') {
        navigate(`/schedule/${action.meeting_id}`);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to approve action');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Pending Work Dashboard</h1>
        <p className="text-gray-600">Review and manage your action items</p>
      </div>

      <div className="space-y-6">
        {/* Pending Actions Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
              Pending Actions
            </CardTitle>
            <CardDescription>High priority items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(actionsByMeeting).length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">No pending actions. Great work!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(actionsByMeeting).map(([meetingId, actions]) => {
                  return (
                    <div key={meetingId} className="space-y-3">
                      <div className="space-y-3">
                        {actions.map((action) => {
                          const actionType = action.action_type || action.type || 'Task';
                          const Icon = getActionIcon(actionType);
                          return (
                            <div
                              key={action.id}
                              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Icon className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-4 mb-2">
                                    <div>
                                      <p className="font-medium text-gray-900 mb-1">
                                        {action.description}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Type: {actionType}
                                      </p>
                                    </div>
                                    <Badge
                                      variant={action.status === 'PENDING' ? 'default' : 'outline'}
                                      className={action.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''}
                                    >
                                      {action.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                      {action.due_date && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-4 h-4" />
                                          Due: {new Date(action.due_date).toLocaleDateString()}
                                        </span>
                                      )}
                                      {action.assigned_to && (
                                        <span>Assigned to: {action.assigned_to}</span>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          const mid = (action as any).meeting_id || (action as any).meetingId || (action as any).meeting?.id;
                                          if (!mid) { alert('Meeting id not found'); return; }
                                          navigate(`/meeting/${mid}?edit=1`);
                                        }}
                                      >
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Edit Meeting
                                      </Button>
                                      {actionType === 'Email' || actionType === 'Meeting' ? (
                                        <Button
                                          size="sm"
                                          onClick={() => handleApproveAction(action.id)}
                                          className="bg-indigo-600 hover:bg-indigo-700"
                                        >
                                          Approve
                                        </Button>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleCompleteAction(action.id)}
                                        >
                                          Complete
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Follow-ups Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              Follow-ups to Track
            </CardTitle>
            <CardDescription>Items mentioned in meetings awaiting completion</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingFollowUps.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No follow-ups to track</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingFollowUps.map((followUp) => (
                  <div
                    key={followUp.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 text-indigo-600 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">{followUp.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{followUp.projectName}</span>
                          <span>•</span>
                          <span>{followUp.meetingName}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {followUp.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const mid = (followUp as any).meeting_id || (followUp as any).meetingId;
                          if (!mid) { alert('Meeting id not found'); return; }
                          navigate(`/meeting/${mid}?edit=1`);
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Meeting
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Problem Statements Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Problem Statements
            </CardTitle>
            <CardDescription>Issues raised in recent transcripts</CardDescription>
          </CardHeader>
          <CardContent>
            {problemStatements.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                No problem statements detected in recent meetings
              </div>
            ) : (
              <div className="space-y-3">
                {problemStatements.map((p, idx) => (
                  <div
                    key={`${p.meetingId}-${idx}`}
                    className="bg-white border border-amber-200 rounded-lg p-4 hover:bg-amber-50/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/meeting/${p.meetingId}`)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">{p.statement}</p>
                        <p className="text-sm text-gray-600">From: {p.meetingTitle}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Held Items Section - Removed for now as it's not supported natively by the endpoints supplied. */}
      </div>
    </div>
  );
}
