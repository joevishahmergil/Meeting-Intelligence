import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Calendar, Filter, Loader2, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Project } from '../types';
import { MeetingDetailView } from '../components/MeetingDetailView';
import { fetchProjects, fetchProjectMeetings, fetchMeetingDetail, updateProject, deleteProject, deleteMeeting } from '../api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

type MeetingTypeFilter = 'Weekly Update' | 'Standup' | 'Discussion' | 'Planning' | 'Review' | 'Client Call' | 'Other' | 'All';

export function ProjectsPage() {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
  const [filterType, setFilterType] = useState<MeetingTypeFilter>('All');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Project-level data (fetched when a project is selected)
  const [projectMeetings, setProjectMeetings] = useState<any[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);

  // Project card stats (meeting counts per project)
  const [projectStats, setProjectStats] = useState<Record<string, { meetings: number }>>({});
  const [editOpen, setEditOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; description?: string; color: string }>({ name: '', description: '', color: '#3b82f6' });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await fetchProjects();
      setProjects(data);
      // Load meeting counts for each project
      const stats: Record<string, { meetings: number }> = {};
      await Promise.all(
        data.map(async (project: Project) => {
          try {
            const meetings = await fetchProjectMeetings(project.id);
            stats[project.id] = { meetings: meetings.length };
          } catch {
            stats[project.id] = { meetings: 0 };
          }
        })
      );
      setProjectStats(stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectMeetings = async (projectId: string) => {
    setProjectLoading(true);
    try {
      const meetings = await fetchProjectMeetings(projectId);
      setProjectMeetings(meetings);
    } catch (err) {
      console.error(err);
      setProjectMeetings([]);
    } finally {
      setProjectLoading(false);
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setFilterType('All');
    loadProjectMeetings(project.id);
  };

  const openEditProject = (project: Project) => {
    setEditProject(project);
    setEditForm({ name: project.name, description: project.description, color: project.color });
    setEditOpen(true);
  };

  const saveEditProject = async () => {
    if (!editProject) return;
    try {
      const updated = await updateProject(editProject.id, editForm);
      setEditOpen(false);
      // Update both list and header
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (selectedProject && selectedProject.id === updated.id) {
        setSelectedProject(updated as any);
      }
    } catch (e) {
      alert('Failed to update project');
    }
  };

  const removeProject = async (project: Project) => {
    if (!confirm('Delete this project? Meetings remain, but project will be removed.')) return;
    try {
      await deleteProject(project.id);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      if (selectedProject && selectedProject.id === project.id) {
        setSelectedProject(null);
        setProjectMeetings([]);
      }
    } catch (e) {
      alert('Failed to delete project');
    }
  };

  const handleMeetingClick = async (meeting: any) => {
    // Fetch full meeting detail (with transcript, decisions, etc.)
    try {
      const detail = await fetchMeetingDetail(meeting.id);
      setSelectedMeeting(detail);
    } catch (err) {
      console.error(err);
      // Fall back to basic meeting data
      setSelectedMeeting(meeting);
    }
  };

  const groupMeetingsByType = (meetings: any[]) => {
    const filtered = filterType === 'All'
      ? meetings
      : meetings.filter((m: any) => (m.meeting_type || m.type) === filterType);

    const groups: Record<string, any[]> = {};
    for (const m of filtered) {
      const type = m.meeting_type || m.type || 'Other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(m);
    }
    return groups;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Meeting Detail View
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

  // Project Detail View
  if (selectedProject) {
    const groupedMeetings = groupMeetingsByType(projectMeetings);
    const completedMeetings = projectMeetings.filter((m: any) =>
      (m.status || '').toLowerCase() === 'completed'
    );

    return (
      <div className="p-8">
        {/* Back Button */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => { setSelectedProject(null); setProjectMeetings([]); }}>
            ← Back to Projects
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => openEditProject(selectedProject)}>
              <Pencil className="w-4 h-4 mr-1" /> Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => removeProject(selectedProject)}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          </div>
        </div>

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
                    {completedMeetings.length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-semibold text-gray-900 mb-1">
                    {projectMeetings.length - completedMeetings.length}
                  </div>
                  <div className="text-sm text-gray-600">Scheduled</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Meetings</CardTitle>
              </CardHeader>
              <CardContent>
                {projectLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                ) : projectMeetings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No meetings found for this project
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projectMeetings.slice(0, 5).map((meeting: any) => (
                      <div
                        key={meeting.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 rounded px-2"
                        onClick={() => handleMeetingClick(meeting)}
                      >
                        <div>
                          <p className="font-medium text-gray-900">{meeting.title}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(meeting.meeting_date || meeting.date).toLocaleDateString()} • {meeting.meeting_type || meeting.type}
                          </p>
                        </div>
                        <Badge
                          variant={(meeting.status || '').toLowerCase() === 'completed' ? 'default' : 'outline'}
                          className={(meeting.status || '').toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {meeting.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meetings Tab */}
          <TabsContent value="meetings" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 mr-2">Filter by type:</span>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={filterType === 'All' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType('All')}
                    >
                      All
                    </Button>
                    {(['Weekly Update', 'Standup', 'Planning', 'Review', 'Discussion', 'Client Call', 'Other'] as MeetingTypeFilter[]).map(type => (
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
            {projectLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : Object.keys(groupedMeetings).length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center text-gray-500">
                  No meetings found for this filter
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedMeetings).map(([type, typeMeetings]) => (
                  <div key={type}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{type}</h3>
                    <div className="grid gap-4">
                      {typeMeetings.map((meeting: any) => (
                        <Card
                          key={meeting.id}
                          className="hover:shadow-md cursor-pointer transition-shadow"
                          onClick={() => handleMeetingClick(meeting)}
                        >
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-2">{meeting.title}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(meeting.meeting_date || meeting.date).toLocaleDateString()}
                                  </span>
                                  <span>•</span>
                                  <span>{(meeting.attendees || []).length} attendees</span>
                                </div>
                              </div>
                              <Badge
                                variant={(meeting.status || '').toLowerCase() === 'completed' ? 'default' : 'outline'}
                                className={(meeting.status || '').toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' : ''}
                              >
                                {meeting.status}
                              </Badge>
                              <div className="ml-3 flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/meeting/${meeting.id}?edit=1`);
                                  }}
                                >
                                  <Pencil className="w-4 h-4 mr-1" /> Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!confirm('Delete this meeting?')) return;
                                    try {
                                      await deleteMeeting(meeting.id);
                                      setProjectMeetings((prev) => prev.filter((m: any) => m.id !== meeting.id));
                                    } catch {
                                      alert('Failed to delete meeting');
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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

      {projects.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center text-gray-500">
            <FolderKanban className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No projects yet. Create a project when uploading a meeting.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {projects.map(project => {
            const stats = projectStats[project.id] || { meetings: 0 };

            return (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleProjectClick(project)}
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
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openEditProject(project); }}>
                        <Pencil className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); removeProject(project); }}>
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <div className="text-2xl font-semibold text-gray-900">{stats.meetings}</div>
                      <div className="text-sm text-gray-600">Meetings</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      {/* Edit Project Dialog (available on list view as well) */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700">Name</label>
              <input className="w-full px-3 py-2 border rounded-lg" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-gray-700">Description</label>
              <input className="w-full px-3 py-2 border rounded-lg" value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-gray-700">Color</label>
              <input type="color" className="w-16 h-10 p-1 border rounded" value={editForm.color} onChange={(e) => setEditForm({ ...editForm, color: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={saveEditProject}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
