import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, FileAudio, CheckCircle, Plus, Calendar as CalendarIcon, Clock, Users, FolderKanban } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { projects } from '../data/mockData';

interface AudioFile {
  file: File;
  name: string;
  size: string;
}

export function UploadMeetingPage() {
  const navigate = useNavigate();
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Form state
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [meetingType, setMeetingType] = useState<string>('Weekly Update');
  const [attendees, setAttendees] = useState('');
  const [trackInCalendar, setTrackInCalendar] = useState(true);
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const audioFiles = files.filter(file => 
      file.type === 'audio/mpeg' || 
      file.type === 'audio/wav' || 
      file.name.endsWith('.mp3') || 
      file.name.endsWith('.wav')
    );
    
    if (audioFiles.length > 0) {
      handleFileSelection(audioFiles[0]);
    }
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };
  
  const handleFileSelection = (file: File) => {
    setAudioFile({
      file,
      name: file.name,
      size: formatFileSize(file.size)
    });
    
    // Simulate upload progress
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };
  
  const removeFile = () => {
    setAudioFile(null);
    setUploadProgress(0);
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!audioFile) {
      newErrors.audio = 'Please upload an audio file';
    }
    
    if (showNewProjectInput) {
      if (!newProjectName.trim()) {
        newErrors.project = 'Please enter a project name';
      }
    } else {
      if (!selectedProject) {
        newErrors.project = 'Please select a project';
      }
    }
    
    if (!meetingTitle.trim()) {
      newErrors.title = 'Please enter a meeting title';
    }
    
    if (!meetingDate) {
      newErrors.date = 'Please select a meeting date';
    }
    
    if (!startTime) {
      newErrors.startTime = 'Please select a start time';
    }
    
    if (!endTime) {
      newErrors.endTime = 'Please select an end time';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = (generateTranscript: boolean) => {
    if (!validateForm()) {
      return;
    }
    
    // In a real app, this would send the data to the backend
    const meetingData = {
      audioFile: audioFile?.file,
      project: showNewProjectInput ? newProjectName : selectedProject,
      title: meetingTitle,
      date: meetingDate,
      startTime,
      endTime,
      type: meetingType,
      attendees: attendees.split(',').map(a => a.trim()),
      trackInCalendar,
      generateTranscript
    };
    
    console.log('Saving meeting:', meetingData);
    
    // Show success message and redirect
    alert(`Meeting ${generateTranscript ? 'saved and processing transcript' : 'saved successfully'}!`);
    navigate('/calendar');
  };
  
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Upload Meeting</h1>
        <p className="text-gray-600">Manually add a meeting using an audio recording</p>
      </div>
      
      {/* Info Banner */}
      <div className="max-w-3xl mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
        <p className="text-sm text-indigo-900">
          <strong>How it works:</strong> Upload your meeting audio file and fill in the details below. 
          We'll process the audio and generate a transcript automatically. The meeting will then be 
          available in your calendar and project dashboards.
        </p>
      </div>
      
      <div className="max-w-3xl space-y-6">
        {/* Audio Upload Card */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Upload Audio File</h2>
          
          {!audioFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center transition-colors
                ${isDragging 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : errors.audio 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              <div className="flex flex-col items-center">
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center mb-4
                  ${isDragging ? 'bg-indigo-100' : errors.audio ? 'bg-red-100' : 'bg-gray-100'}
                `}>
                  <Upload className={`w-8 h-8 ${isDragging ? 'text-indigo-600' : errors.audio ? 'text-red-600' : 'text-gray-400'}`} />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Drop your audio file here
                </h3>
                <p className="text-gray-600 mb-4">
                  or click to browse
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Supported formats: .mp3, .wav (Max 500MB)
                </p>
                
                <label>
                  <input
                    type="file"
                    accept=".mp3,.wav,audio/mpeg,audio/wav"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <span className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors">
                    Select File
                  </span>
                </label>
                
                {errors.audio && (
                  <p className="mt-4 text-sm text-red-600">{errors.audio}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileAudio className="w-5 h-5 text-indigo-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-1 truncate">
                      {audioFile.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">{audioFile.size}</p>
                    
                    {isUploading ? (
                      <div className="space-y-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600">
                          Uploading... {uploadProgress}%
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Upload complete</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={removeFile}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  disabled={isUploading}
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </Card>
        
        {/* Meeting Metadata Card */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Meeting Information</h2>
          
          <div className="space-y-4">
            {/* Project Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FolderKanban className="w-4 h-4" />
                Project
              </label>
              
              {!showNewProjectInput ? (
                <div className="flex gap-2">
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className={`
                      flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500
                      ${errors.project ? 'border-red-300' : 'border-gray-300'}
                    `}
                  >
                    <option value="">Select a project...</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNewProjectInput(true);
                      setSelectedProject('');
                      setErrors({ ...errors, project: '' });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => {
                      setNewProjectName(e.target.value);
                      setErrors({ ...errors, project: '' });
                    }}
                    placeholder="Enter new project name..."
                    className={`
                      flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500
                      ${errors.project ? 'border-red-300' : 'border-gray-300'}
                    `}
                  />
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNewProjectInput(false);
                      setNewProjectName('');
                      setErrors({ ...errors, project: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              
              {errors.project && (
                <p className="mt-1 text-sm text-red-600">{errors.project}</p>
              )}
            </div>
            
            {/* Meeting Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Title
              </label>
              <input
                type="text"
                value={meetingTitle}
                onChange={(e) => {
                  setMeetingTitle(e.target.value);
                  setErrors({ ...errors, title: '' });
                }}
                placeholder="e.g., Weekly Team Standup"
                className={`
                  w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500
                  ${errors.title ? 'border-red-300' : 'border-gray-300'}
                `}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>
            
            {/* Meeting Date */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="w-4 h-4" />
                Meeting Date
              </label>
              <input
                type="date"
                value={meetingDate}
                onChange={(e) => {
                  setMeetingDate(e.target.value);
                  setErrors({ ...errors, date: '' });
                }}
                className={`
                  w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500
                  ${errors.date ? 'border-red-300' : 'border-gray-300'}
                `}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>
            
            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4" />
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    setErrors({ ...errors, startTime: '' });
                  }}
                  className={`
                    w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500
                    ${errors.startTime ? 'border-red-300' : 'border-gray-300'}
                  `}
                />
                {errors.startTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                )}
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4" />
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    setErrors({ ...errors, endTime: '' });
                  }}
                  className={`
                    w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500
                    ${errors.endTime ? 'border-red-300' : 'border-gray-300'}
                  `}
                />
                {errors.endTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
                )}
              </div>
            </div>
            
            {/* Meeting Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Type
              </label>
              <select
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Standup">Standup</option>
                <option value="Weekly Update">Weekly Update</option>
                <option value="Client Call">Client Call</option>
                <option value="Planning">Planning</option>
                <option value="Review">Review</option>
                <option value="Discussion">Discussion</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            {/* Attendees */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4" />
                Attendees
              </label>
              <input
                type="text"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                placeholder="e.g., John Doe, Jane Smith, Bob Johnson (comma-separated)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter attendee names separated by commas
              </p>
            </div>
          </div>
        </Card>
        
        {/* Calendar Tracking Card */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Calendar Options</h2>
          
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={trackInCalendar}
              onChange={(e) => setTrackInCalendar(e.target.checked)}
              className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <div>
              <span className="font-medium text-gray-900">Track this meeting in calendar</span>
              <p className="text-sm text-gray-600 mt-1">
                When enabled, this meeting will appear in your calendar view and day-wise timeline. 
                You can still access it from the project dashboard regardless of this setting.
              </p>
            </div>
          </label>
        </Card>
        
        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/calendar')}
            className="flex-1"
          >
            Cancel
          </Button>
          
          <Button
            onClick={() => handleSave(false)}
            variant="outline"
            className="flex-1"
          >
            Save Meeting
          </Button>
          
          <Button
            onClick={() => handleSave(true)}
            className="flex-1"
          >
            Save & Generate Transcript
          </Button>
        </div>
        
        {/* Info Box */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> After saving, the meeting will be processed and available in your 
            calendar and project dashboards. If you choose to generate a transcript, it may take a few 
            minutes to complete processing.
          </p>
        </Card>
      </div>
    </div>
  );
}