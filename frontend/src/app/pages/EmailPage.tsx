import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Send, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { useEffect, useState } from 'react';
import { fetchMeetingDetail, fetchEmailDraftForMeeting, sendEmailDraft } from '../api';

export function EmailPage() {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState<any | null>(null);
  const [draft, setDraft] = useState<any | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const recipients = draft?.recipients || [];
  const [sending, setSending] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if (!meetingId) return;
    let active = true;
    Promise.all([
      fetchMeetingDetail(meetingId),
      fetchEmailDraftForMeeting(meetingId),
    ])
      .then(([m, d]) => {
        if (!active) return;
        setMeeting(m);
        setDraft(d);
        setSubject(d.subject || `Meeting Summary: ${m.title}`);
        setBody(d.body || '');
      })
      .catch(() => {
        setMeeting(null);
      });
    return () => {
      active = false;
    };
  }, [meetingId]);

  const handleSend = async () => {
    if (!draft?.id) {
      alert('Email draft not ready yet');
      return;
    }
    setSending(true);
    try {
      await sendEmailDraft(draft.id);
      alert('Email sent successfully!');
      navigate('/home');
    } catch (e) {
      console.error(e);
      alert('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };
  
  if (!meeting) {
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
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Send Email</h1>
            <p className="text-gray-600">Review and approve email before sending</p>
          </div>
          <Button variant="ghost" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {/* Email Form */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                Email Draft
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recipients */}
              <div>
                <Label>Recipients</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {recipients.map((recipient, idx) => (
                    <Badge key={idx} variant="secondary" className="px-3 py-1">
                      {recipient}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Subject */}
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-2"
                  placeholder="Email subject"
                />
              </div>
              
              {/* Body */}
              <div>
                <Label htmlFor="body">Message</Label>
                <div
                  className="mt-2 border rounded-lg p-4 bg-white max-h-[500px] overflow-auto prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: body || '<p>No content</p>' }}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEditor(!showEditor)}
                  >
                    {showEditor ? 'Hide HTML' : 'Edit HTML'}
                  </Button>
                </div>
                {showEditor && (
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="mt-2 min-h-[200px] font-mono text-sm"
                    placeholder="Email HTML"
                  />
                )}
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleSend} disabled={sending} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? 'Sending...' : 'Approve & Send'}
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
              <CardTitle>Meeting Context</CardTitle>
              <CardDescription>Reference information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Meeting</p>
                <p className="text-sm text-gray-600">{meeting.title}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Project</p>
                <p className="text-sm text-gray-600">{meeting.project_name || meeting.projectName || 'General'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Date</p>
                <p className="text-sm text-gray-600">
                  {new Date(meeting.meeting_date || meeting.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Type</p>
                <Badge>{meeting.meeting_type || meeting.type}</Badge>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Attendees</p>
                <p className="text-sm text-gray-600">{(meeting.attendees || []).length} people</p>
              </div>
              
              {meeting.action_items && meeting.action_items.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Action Items</p>
                  <p className="text-sm text-gray-600">{meeting.action_items.length} items</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Review all action items before sending</li>
                <li>• Ensure all attendees are included</li>
                <li>• Check dates and deadlines</li>
                <li>• Personalize the message if needed</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
