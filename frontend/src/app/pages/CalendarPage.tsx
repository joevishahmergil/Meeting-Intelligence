import { useState } from 'react';
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { meetings } from '../data/mockData';
import { Meeting } from '../types';
import { MeetingDetailView } from '../components/MeetingDetailView';

export function CalendarPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1)); // February 2026
  
  // Get meetings for a specific date
  const getMeetingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return meetings.filter(m => m.date === dateStr);
  };
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };
  
  const hasMeetings = (date: Date) => {
    return getMeetingsForDate(date).length > 0;
  };
  
  const handleDateClick = (date: Date) => {
    const dateMeetings = getMeetingsForDate(date);
    if (dateMeetings.length > 0) {
      // Navigate to day view
      const dateStr = date.toISOString().split('T')[0];
      navigate(`/calendar/day?date=${dateStr}`);
    }
  };
  
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Calendar</h1>
          <p className="text-gray-600">View and explore your meetings</p>
        </div>
        <Button onClick={() => navigate('/upload-meeting')} className="bg-indigo-600 hover:bg-indigo-700">
          <Upload className="w-4 h-4 mr-2" />
          Upload Meeting
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Calendar View */}
        <div>
          <Card className="p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">{monthName}</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={previousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Day Labels */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => {
                const dayMeetings = getMeetingsForDate(day);
                const hasCompleted = dayMeetings.some(m => m.status === 'Completed');
                const hasPending = dayMeetings.some(m => m.status === 'Scheduled');
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleDateClick(day)}
                    className={`
                      aspect-square p-2 rounded-lg text-sm transition-colors relative
                      ${!isCurrentMonth(day) ? 'text-gray-300' : 'text-gray-900'}
                      ${isToday(day) ? 'bg-indigo-100 font-semibold' : ''}
                      ${hasCompleted ? 'hover:bg-indigo-50 cursor-pointer' : ''}
                      ${!hasCompleted && hasPending ? 'bg-gray-100' : ''}
                      ${!hasCompleted && !hasPending ? 'hover:bg-gray-50' : ''}
                    `}
                  >
                    <span>{day.getDate()}</span>
                    {hasMeetings(day) && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {hasCompleted && (
                          <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                        )}
                        {hasPending && (
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Legend:</p>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-600 rounded-full" />
                  <span className="text-gray-600">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  <span className="text-gray-600">Scheduled</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Click on any date with meetings to view day timeline
              </p>
            </div>
          </Card>
        </div>
        
        {/* Meeting Details Panel */}
        <div>
          {selectedMeeting ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Meeting Details</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedMeeting(null)}>
                  Close
                </Button>
              </div>
              <div className="max-h-[calc(100vh-180px)] overflow-y-auto pr-2">
                <MeetingDetailView meeting={selectedMeeting} />
              </div>
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center text-gray-500">
                <p className="mb-2">View your meetings in day timeline</p>
                <p className="text-sm">Click on any date with meetings to see the day view</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}