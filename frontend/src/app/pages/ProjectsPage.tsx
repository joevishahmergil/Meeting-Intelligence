import { useState } from 'react';
import { FolderKanban, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { projects, meetings } from '../data/mockData';
import { Meeting, MeetingType, Project } from '../types';
import { MeetingDetailView } from '../components/MeetingDetailView';

export function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [filterType, setFilterType] = useState<MeetingType | 'All'>('All');
  
  const getProjectMeetings = (projectId: string) => {
    return meetings.filter(m => m.projectId === projectId);
  };
  
  const groupMeetingsByType = (projectMeetings: Meeting[]) => {
    const filtered = filterType === 'All' 
      ? projectMeetings 
      : projectMeetings.filter(m => m.type === filterType);
      
    return {
      'Weekly Update': filtered.filter(m => m.type === 'Weekly Update'),
      'Standup': filtered.filter(m => m.type === 'Standup'),
      'Planning': filtered.filter(m => m.type === 'Planning'),
      'Review': filtered.filter(m => m.type === 'Review'),
      'Discussion': filtered.filter(m => m.type === 'Discussion'),
    };
  };
  
  const handleMeetingClick = (meeting: Meeting) => {
    if (meeting.status === 'Completed') {
      setSelectedMeeting(meeting);
    }
  };
  
  if (selectedMeeting) {
    return (
      <div className="p-8">
        <Button variant="ghost" onClick={() => setSelectedMeeting(null)} className="mb-6">
          ← Back to Project
        </Button>
        <MeetingDetailView meeting={selectedMeeting} />
      </div>
    );
  }
  
  if (selectedProject) {
    const projectMeetings = getProjectMeetings(selectedProject.id);
    const groupedMeetings = groupMeetingsByType(projectMeetings);
    const projectActions = projectMeetings.flatMap(m => m.actionItems || []);
    const projectDecisions = projectMeetings.flatMap(m => m.decisions || []);
    
    return (
      <div className="p-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => setSelectedProject(null)} className="mb-6">
          ← Back to Projects
        </Button>
        
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: selectedProject.color }}
            />
            <h1 className="text-3xl font-semibold text-gray-900">{selectedProject.name}</h1>
          </div>
          <p className="text-gray-600">{selectedProject.description}</p>
        </div>
        
        {/* Project Tabs */}
        <Tabs defaultValue="meetings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="decisions">Decisions</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-semibold text-gray-900 mb-1">
                    {projectMeetings.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Meetings</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-semibold text-gray-900 mb-1">
                    {projectActions.filter(a => a.status === 'Pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending Actions</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-semibold text-gray-900 mb-1">
                    {projectDecisions.length}
                  </div>
                  <div className="text-sm text-gray-600">Decisions Made</div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectMeetings.slice(0, 5).map(meeting => (
                    <div key={meeting.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{meeting.title}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(meeting.date).toLocaleDateString()} • {meeting.type}
                        </p>
                      </div>
                      <Badge variant={meeting.status === 'Completed' ? 'default' : 'outline'}>
                        {meeting.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Meetings Tab */}
          <TabsContent value="meetings" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 mr-2">Filter by type:</span>
                  <div className="flex gap-2">
                    <Button
                      variant={filterType === 'All' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType('All')}
                    >
                      All
                    </Button>
                    {(['Weekly Update', 'Standup', 'Planning', 'Review', 'Discussion'] as MeetingType[]).map(type => (
                      <Button
                        key={type}
                        variant={filterType === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterType(type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Meeting Groups */}
            <div className="space-y-6">
              {Object.entries(groupedMeetings).map(([type, typeMeetings]) => {
                if (typeMeetings.length === 0) return null;
                
                return (
                  <div key={type}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{type}</h3>
                    <div className="grid gap-4">
                      {typeMeetings.map(meeting => (
                        <Card
                          key={meeting.id}
                          className={`${
                            meeting.status === 'Completed'
                              ? 'hover:shadow-md cursor-pointer transition-shadow'
                              : 'opacity-75'
                          }`}
                          onClick={() => handleMeetingClick(meeting)}
                        >
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-2">{meeting.title}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(meeting.date).toLocaleDateString()}
                                  </span>
                                  <span>•</span>
                                  <span>{meeting.attendees.length} attendees</span>
                                  {meeting.actionItems && meeting.actionItems.length > 0 && (
                                    <>
                                      <span>•</span>
                                      <span>{meeting.actionItems.length} actions</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <Badge
                                variant={meeting.status === 'Completed' ? 'default' : 'outline'}
                                className={meeting.status === 'Completed' ? 'bg-green-100 text-green-800' : ''}
                              >
                                {meeting.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          
          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-4">
            {projectActions.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center text-gray-500">
                  No actions found for this project
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {projectActions.map(action => (
                  <Card key={action.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-1">{action.description}</p>
                          <p className="text-sm text-gray-600 mb-2">
                            From: {action.relatedMeeting}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {action.assignedTo && <span>Assigned to: {action.assignedTo}</span>}
                            <span>•</span>
                            <span>Due: {new Date(action.dueDate).toLocaleDateString()}</span>
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Decisions Tab */}
          <TabsContent value="decisions" className="space-y-4">
            {projectDecisions.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center text-gray-500">
                  No decisions found for this project
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {projectDecisions.map((decision, idx) => (
                      <li key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{decision}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  
  // Project List View
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Projects</h1>
        <p className="text-gray-600">View project-centric meetings and actions</p>
      </div>
      
      {/* Project Cards */}
      <div className="grid grid-cols-2 gap-6">
        {projects.map(project => {
          const projectMeetings = getProjectMeetings(project.id);
          const projectActions = projectMeetings.flatMap(m => m.actionItems || []);
          const pendingActions = projectActions.filter(a => a.status === 'Pending' || a.status === 'Blocked');
          
          return (
            <Card
              key={project.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <div>
                      <CardTitle className="text-xl">{project.name}</CardTitle>
                      <CardDescription className="mt-1">{project.description}</CardDescription>
                    </div>
                  </div>
                  <FolderKanban className="w-6 h-6 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">{projectMeetings.length}</div>
                    <div className="text-sm text-gray-600">Meetings</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">{pendingActions.length}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">{projectActions.length}</div>
                    <div className="text-sm text-gray-600">Total Actions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
