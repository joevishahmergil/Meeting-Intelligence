import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, X, CalendarPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { meetings } from '../data/mockData';
import { useState } from 'react';

export function ScheduleMeetingPage() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  
  const sourceMeeting = meetings.find(m => m.id === meetingId);
  
  // Find action that triggered this
  const triggerAction = sourceMeeting?.actionItems?.find(a => a.type === 'Meeting');
  
  const [title, setTitle] = useState(
    triggerAction?.description || 'Follow-up Meeting'
  );
  
  const [date, setDate] = useState('2026-02-10');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState('60');
  const [attendees, setAttendees] = useState(
    sourceMeeting?.attendees.join(', ') || ''
  );
  const [agenda, setAgenda] = useState(
    sourceMeeting ? `Follow-up on: ${sourceMeeting.title}\n\nAgenda:\n- Review action items\n- Discuss next steps` : ''
  );
  
  const handleSchedule = () => {
    // Mock schedule - would integrate with calendar service in real app
    console.log('Scheduling meeting:', { title, date, time, duration, attendees, agenda });
    alert('Meeting scheduled successfully!');
    navigate('/calendar');
  };
  
  const handleCancel = () => {
    navigate(-1);
  };
  
  if (!sourceMeeting) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-12 pb-12 text-center text-gray-500">
            Meeting not found
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Schedule Meeting</h1>
            <p className="text-gray-600">Create a new meeting based on action items</p>
          </div>
          <Button variant="ghost" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {/* Meeting Form */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-indigo-600" />
                Meeting Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title">Meeting Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2"
                  placeholder="Enter meeting title"
                />
              </div>
              
              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="time" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
              
              {/* Duration */}
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="mt-2"
                  placeholder="60"
                />
              </div>
              
              {/* Attendees */}
              <div>
                <Label htmlFor="attendees" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Attendees
                </Label>
                <Input
                  id="attendees"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  className="mt-2"
                  placeholder="Enter attendee names, separated by commas"
                />
                <p className="text-sm text-gray-500 mt-1">Separate multiple attendees with commas</p>
              </div>
              
              {/* Agenda */}
              <div>
                <Label htmlFor="agenda">Agenda</Label>
                <Textarea
                  id="agenda"
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  className="mt-2 min-h-[200px]"
                  placeholder="Enter meeting agenda"
                />
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleSchedule} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Context Card */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Source Meeting</CardTitle>
              <CardDescription>Context from previous meeting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Meeting</p>
                <p className="text-sm text-gray-600">{sourceMeeting.title}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Project</p>
                <p className="text-sm text-gray-600">{sourceMeeting.projectName}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Date</p>
                <p className="text-sm text-gray-600">
                  {new Date(sourceMeeting.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Type</p>
                <Badge>{sourceMeeting.type}</Badge>
              </div>
              
              {triggerAction && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Action Item</p>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">{triggerAction.description}</p>
                    {triggerAction.assignedTo && (
                      <p className="text-xs text-gray-500 mt-1">
                        Assigned to: {triggerAction.assignedTo}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Scheduling Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Include all relevant stakeholders</li>
                <li>• Set a clear agenda</li>
                <li>• Choose optimal time slots</li>
                <li>• Allow buffer time between meetings</li>
                <li>• Send calendar invites promptly</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
