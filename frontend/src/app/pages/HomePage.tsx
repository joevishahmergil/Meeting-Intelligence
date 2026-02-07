import { CheckCircle2, Mail, Calendar, ClipboardList, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { pendingActions, pendingFollowUps, heldItems, projects } from '../data/mockData';
import { Action, FollowUp, HeldItem } from '../types';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();
  
  // Group actions by project
  const actionsByProject = pendingActions.reduce((acc, action) => {
    if (!acc[action.projectId]) {
      acc[action.projectId] = [];
    }
    acc[action.projectId].push(action);
    return acc;
  }, {} as Record<string, Action[]>);
  
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'Email': return Mail;
      case 'Meeting': return Calendar;
      case 'Task': return ClipboardList;
      default: return ClipboardList;
    }
  };
  
  const handleCompleteAction = (actionId: string) => {
    // Mock completion - would update backend in real app
    console.log('Completing action:', actionId);
  };
  
  const handleApproveAction = (actionId: string) => {
    // Mock approval - would update backend in real app
    console.log('Approving action:', actionId);
    // Navigate to appropriate page based on action type
    const action = pendingActions.find(a => a.id === actionId);
    if (action?.type === 'Email') {
      navigate(`/email/${action.meetingId}`);
    } else if (action?.type === 'Meeting') {
      navigate(`/schedule/${action.meetingId}`);
    }
  };
  
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
            {Object.keys(actionsByProject).length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">No pending actions. Great work!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(actionsByProject).map(([projectId, actions]) => {
                  const project = projects.find(p => p.id === projectId);
                  return (
                    <div key={projectId} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: project?.color }}
                        />
                        <h3 className="font-medium text-gray-900">{project?.name}</h3>
                      </div>
                      <div className="space-y-3 ml-5">
                        {actions.map((action) => {
                          const Icon = getActionIcon(action.type);
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
                                        Related to: {action.relatedMeeting}
                                      </p>
                                    </div>
                                    <Badge
                                      variant={action.status === 'Blocked' ? 'destructive' : 'default'}
                                      className={action.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''}
                                    >
                                      {action.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        Due: {new Date(action.dueDate).toLocaleDateString()}
                                      </span>
                                      {action.assignedTo && (
                                        <span>Assigned to: {action.assignedTo}</span>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      {action.type === 'Email' || action.type === 'Meeting' ? (
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Held Items Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Recently Missed / Held Items
            </CardTitle>
            <CardDescription>Items delayed due to dependencies or blockers</CardDescription>
          </CardHeader>
          <CardContent>
            {heldItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No held items</p>
              </div>
            ) : (
              <div className="space-y-3">
                {heldItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-amber-50 border border-amber-200 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">{item.description}</p>
                        <p className="text-sm text-amber-800 mb-2">{item.reason}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{item.projectName}</span>
                          <span>•</span>
                          <span>Blocked since: {new Date(item.blockedSince).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
