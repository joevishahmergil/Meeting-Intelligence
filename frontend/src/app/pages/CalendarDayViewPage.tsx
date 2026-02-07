import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Video, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { meetings } from '../data/mockData';
import { Meeting } from '../types';

export function CalendarDayViewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  
  // Parse the date from URL params or use today
  const selectedDate = dateParam ? new Date(dateParam) : new Date();
  
  // Get meetings for the selected date
  const getMeetingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return meetings.filter(m => m.date === dateStr);
  };
  
  const dayMeetings = getMeetingsForDate(selectedDate);
  
  // Generate time slots from 6 AM to 10 PM
  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = i + 6; // Start from 6 AM
    return {
      hour,
      label: hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`
    };
  });
  
  // Parse meeting time and get hour
  const getMeetingHour = (time: string) => {
    const [timePart, period] = time.split(' ');
    const [hourStr] = timePart.split(':');
    let hour = parseInt(hourStr);
    
    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }
    
    return hour;
  };
  
  // Get meetings for a specific hour
  const getMeetingsForHour = (hour: number) => {
    return dayMeetings.filter(meeting => {
      const meetingHour = getMeetingHour(meeting.time);
      return meetingHour === hour;
    });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const handleMeetingClick = (meeting: Meeting) => {
    // Navigate to detail page for all meetings, not just completed ones
    navigate(`/meeting/${meeting.id}`);
  };
  
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/calendar')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Calendar
        </Button>
        
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          {formatDate(selectedDate)}
        </h1>
        <p className="text-gray-600">
          {dayMeetings.length} {dayMeetings.length === 1 ? 'meeting' : 'meetings'} scheduled
        </p>
      </div>
      
      {/* Day Timeline */}
      <Card className="p-6">
        <div className="space-y-0">
          {timeSlots.map((slot) => {
            const hourMeetings = getMeetingsForHour(slot.hour);
            
            return (
              <div
                key={slot.hour}
                className="flex border-b border-gray-100 last:border-b-0"
              >
                {/* Time Label */}
                <div className="w-24 py-4 pr-4 text-sm text-gray-500 font-medium flex-shrink-0">
                  {slot.label}
                </div>
                
                {/* Meeting Slot */}
                <div className="flex-1 py-2 min-h-[60px]">
                  {hourMeetings.length > 0 ? (
                    <div className="space-y-2">
                      {hourMeetings.map((meeting) => (
                        <button
                          key={meeting.id}
                          onClick={() => handleMeetingClick(meeting)}
                          className={`
                            w-full text-left p-4 rounded-lg border-l-4 transition-all
                            ${meeting.status === 'Completed'
                              ? 'bg-indigo-50 border-indigo-600 hover:bg-indigo-100'
                              : 'bg-gray-50 border-gray-400 hover:bg-gray-100'
                            }
                          `}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {meeting.title}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {meeting.time}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5" />
                                  {meeting.attendees.length} attendees
                                </span>
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-white rounded text-xs">
                                  {meeting.type}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-2">
                                {meeting.projectName}
                              </p>
                            </div>
                            
                            {meeting.status === 'Completed' && (
                              <div className="ml-4 flex-shrink-0">
                                <div className="px-2 py-1 bg-indigo-600 text-white rounded text-xs font-medium">
                                  View Details
                                </div>
                              </div>
                            )}
                            
                            {meeting.status === 'Scheduled' && (
                              <div className="ml-4 flex-shrink-0">
                                <Video className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      
      {/* Empty State */}
      {dayMeetings.length === 0 && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No meetings scheduled
          </h3>
          <p className="text-gray-600 mb-6">
            You have no meetings on this day.
          </p>
          <Button onClick={() => navigate('/calendar')}>
            Back to Calendar
          </Button>
        </div>
      )}
    </div>
  );
}