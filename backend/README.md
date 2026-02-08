# Meeting Intelligence - Backend API

Production-grade FastAPI backend for the Meeting Intelligence platform.

## Features

- ✅ **Authentication**: JWT-based user authentication with bcrypt password hashing
- ✅ **Project Management**: Full CRUD operations for projects
- ✅ **Meeting Management**: Create, update, and manage meetings
- ✅ **Audio Upload**: Upload meeting audio files (.wav, .mp3) to Supabase Storage
- ✅ **Transcription**: Automatic speech-to-text using OpenAI Whisper
- ✅ **AI Intelligence Extraction**: Extract decisions, action items, follow-ups, and problems using Groq API (LLaMA 3.1 70B)
- ✅ **Approval Workflow**: Approve/reject/complete action items with audit trail
- ✅ **Email Integration**: Send meeting summaries via SMTP
- ✅ **Supabase Integration**: PostgreSQL database and file storage

## Tech Stack

- **Framework**: FastAPI 0.115.0
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: JWT + bcrypt
- **AI/LLM**: Groq API with LLaMA 3.1 70B (FREE - No local installation required!)
- **Speech-to-Text**: OpenAI Whisper
- **Email**: SMTP (Gmail/SendGrid)

## Prerequisites

- Python 3.10+
- Supabase account (already configured)
- **Groq API Key** (FREE - Get it at https://console.groq.com)
- SMTP credentials (Gmail App Password or SendGrid)

## Installation

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Supabase Database

1. Go to your Supabase project: https://hpjwdvxdgqthqudoglel.supabase.co
2. Navigate to SQL Editor
3. Execute the schema from `database/schema.sql`
4. Create a storage bucket named `meeting-audio`:
   - Go to Storage
   - Click "New bucket"
   - Name: `meeting-audio`
   - Public bucket: Yes (or configure signed URLs)

### 3. Get Your FREE Groq API Key

**Why Groq?**
- ✅ **100% FREE** - 14,400 requests/day (more than enough!)
- ✅ **No Installation** - Cloud-based, zero disk space
- ✅ **Blazing Fast** - Fastest LLM inference available
- ✅ **Powerful Model** - LLaMA 3.1 70B (better than GPT-3.5)

**Steps to Get API Key:**

1. Visit https://console.groq.com
2. Sign up with Google/GitHub (takes 30 seconds)
3. Go to **API Keys** section
4. Click **"Create API Key"**
5. Copy your API key (starts with `gsk_...`)

**Free Tier Limits:**
- 14,400 requests per day
- 30 requests per minute
- More than enough for your meeting intelligence app!

### 4. Configure Environment Variables

The `.env` file is already created. Update the following:

```env
# Groq API Configuration
GROQ_API_KEY=gsk_your_actual_api_key_here
GROQ_MODEL=llama-3.1-70b-versatile

# SMTP Configuration (for email sending)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Meeting Intelligence

# Optional: Change JWT secret for production
JWT_SECRET_KEY=your-secret-key-change-this-in-production-min-32-characters
```

**To get Gmail App Password:**
1. Go to Google Account settings
2. Security → 2-Step Verification
3. App passwords → Generate new app password
4. Copy the 16-character password

## Running the Server

### Development Mode

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### Production Mode

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - List all projects
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Meetings
- `POST /api/meetings` - Create meeting
- `GET /api/meetings` - List meetings (with filters)
- `GET /api/meetings/{id}` - Get meeting details
- `PUT /api/meetings/{id}` - Update meeting
- `DELETE /api/meetings/{id}` - Delete meeting
- `POST /api/meetings/{id}/audio` - Upload audio file
- `POST /api/meetings/{id}/process` - Transcribe and extract intelligence

### Actions
- `GET /api/actions/pending` - Get pending actions
- `GET /api/actions` - List all actions
- `PUT /api/actions/{id}` - Update action
- `POST /api/actions/{id}/approve` - Approve action
- `POST /api/actions/{id}/reject` - Reject action
- `POST /api/actions/{id}/complete` - Mark as completed
- `GET /api/actions/followups` - Get follow-ups
- `POST /api/actions/followups/{id}/complete` - Complete follow-up

### Emails
- `POST /api/emails/drafts` - Create email draft
- `GET /api/emails/meeting/{meeting_id}` - Get/generate email draft
- `POST /api/emails/{draft_id}/send` - Send email

## Testing the API

### 1. Register a User

```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'
```

### 2. Login

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `access_token` from the response.

### 3. Create a Project

```bash
curl -X POST "http://localhost:8000/api/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test Project",
    "description": "My first project",
    "color": "#3b82f6"
  }'
```

### 4. Create a Meeting

```bash
curl -X POST "http://localhost:8000/api/meetings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Team Standup",
    "project_id": "PROJECT_ID_HERE",
    "meeting_date": "2026-02-07",
    "meeting_time": "10:00:00",
    "meeting_type": "Standup",
    "attendees": ["Alice", "Bob"]
  }'
```

### 5. Upload Audio and Process

```bash
# Upload audio
curl -X POST "http://localhost:8000/api/meetings/MEETING_ID/audio" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@path/to/audio.mp3"

# Process meeting (transcribe + AI extraction)
curl -X POST "http://localhost:8000/api/meetings/MEETING_ID/process" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Project Structure

```
backend/
├── app/
│   ├── core/
│   │   ├── config.py          # Configuration settings
│   │   ├── database.py        # Supabase client
│   │   ├── security.py        # JWT & password hashing
│   │   └── dependencies.py    # FastAPI dependencies
│   ├── models/
│   │   ├── user.py           # User models
│   │   ├── project.py        # Project models
│   │   └── meeting.py        # Meeting models
│   ├── routers/
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── projects.py       # Project endpoints
│   │   ├── meetings.py       # Meeting endpoints
│   │   ├── actions.py        # Action workflow endpoints
│   │   └── emails.py         # Email endpoints
│   ├── services/
│   │   ├── storage.py        # Supabase Storage service
│   │   ├── transcription.py  # Whisper transcription
│   │   ├── intelligence.py   # Groq API LLM extraction
│   │   └── email_service.py  # SMTP email sending
│   └── main.py               # FastAPI application
├── database/
│   └── schema.sql            # Database schema
├── .env                      # Environment variables
├── .env.example              # Environment template
└── requirements.txt          # Python dependencies
```

## Groq API Models Available

You can change the model in `.env` by updating `GROQ_MODEL`:

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| `llama-3.1-70b-versatile` | ⚡⚡⚡ Fast | ⭐⭐⭐⭐⭐ Excellent | **Recommended** - Best balance |
| `llama-3.1-8b-instant` | ⚡⚡⚡⚡⚡ Fastest | ⭐⭐⭐ Good | Quick responses, simple tasks |
| `mixtral-8x7b-32768` | ⚡⚡⚡ Fast | ⭐⭐⭐⭐ Very Good | Long context (32k tokens) |
| `gemma2-9b-it` | ⚡⚡⚡⚡ Very Fast | ⭐⭐⭐ Good | Lightweight, efficient |

**Recommendation**: Stick with `llama-3.1-70b-versatile` for best results!

## Troubleshooting

### Whisper Model Download
First time running transcription will download the Whisper model (~140MB for 'base'). This is normal and happens automatically.

### Groq API Error: "Invalid API Key"
- Make sure you copied the full API key from https://console.groq.com
- API key should start with `gsk_`
- Check that there are no extra spaces in your `.env` file

### Groq API Error: "Rate Limit Exceeded"
- Free tier: 30 requests/minute, 14,400/day
- Wait a minute and try again
- For production, consider Groq's paid tier (still very cheap!)

### SMTP Authentication Error
Use Gmail App Password, not your regular password.

### Supabase Storage Error
Ensure the `meeting-audio` bucket exists and is public (or configure signed URLs).

## Comparison: Ollama vs Groq

| Feature | Ollama (Old) | Groq (New) |
|---------|-------------|-----------|
| **Installation** | 4-8 GB download | 0 GB (cloud-based) |
| **Disk Space** | 4-8 GB | 0 GB |
| **Setup Time** | 15-30 minutes | 30 seconds |
| **Speed** | Slow (depends on CPU/GPU) | ⚡ Blazing fast |
| **Cost** | Free | Free (14,400 req/day) |
| **Maintenance** | Manual updates | Auto-updated |
| **Best For** | Privacy-critical apps | Production apps |

**Winner**: Groq API! 🎉

## Next Steps

1. ✅ **Get Groq API Key**: Visit https://console.groq.com (30 seconds)
2. ✅ **Set up database**: Execute `database/schema.sql` in Supabase
3. ✅ **Configure environment**: Update `.env` with Groq API key and SMTP credentials
4. ✅ **Install dependencies**: `pip install -r requirements.txt`
5. ✅ **Start server**: `uvicorn app.main:app --reload`
6. ✅ **Test API**: Visit http://localhost:8000/docs
7. ✅ **Integrate frontend**: Update frontend to use this API

## License

Proprietary - Meeting Intelligence Platform
