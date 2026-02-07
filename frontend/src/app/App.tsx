import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { CalendarPage } from './pages/CalendarPage';
import { CalendarDayViewPage } from './pages/CalendarDayViewPage';
import { MeetingDetailPage } from './pages/MeetingDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { EmailPage } from './pages/EmailPage';
import { ScheduleMeetingPage } from './pages/ScheduleMeetingPage';
import { UploadMeetingPage } from './pages/UploadMeetingPage';
import { Layout } from './components/Layout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login route without sidebar */}
        <Route path="/" element={<LoginPage />} />
        
        {/* Protected routes with layout */}
        <Route element={<Layout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/calendar/day" element={<CalendarDayViewPage />} />
          <Route path="/meeting/:meetingId" element={<MeetingDetailPage />} />
          <Route path="/upload-meeting" element={<UploadMeetingPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/email/:meetingId" element={<EmailPage />} />
          <Route path="/schedule/:meetingId" element={<ScheduleMeetingPage />} />
        </Route>
        
        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}