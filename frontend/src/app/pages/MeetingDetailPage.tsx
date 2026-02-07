import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { meetings } from '../data/mockData';
import { MeetingDetailView } from '../components/MeetingDetailView';

export function MeetingDetailPage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  
  const meeting = meetings.find(m => m.id === meetingId);
  
  if (!meeting) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Meeting Not Found</h2>
          <p className="text-gray-600 mb-6">The meeting you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/calendar')}>
            Back to Calendar
          </Button>
        </div>
      </div>
    );
  }
  
  const isScheduled = meeting.status === 'Scheduled';
  
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          {meeting.title}
        </h1>
        <p className="text-gray-600">
          {meeting.projectName} • {new Date(meeting.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
      
      {/* Meeting Details */}
      <div className="max-w-5xl">
        {isScheduled && !meeting.transcript && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> This meeting is scheduled but hasn't occurred yet. 
              Transcript and summary will be available after the meeting is completed.
            </p>
          </div>
        )}
        
        <MeetingDetailView meeting={meeting} />
      </div>
    </div>
  );
}