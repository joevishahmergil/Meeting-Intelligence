# Quick Setup Guide - Meeting Intelligence Backend

## 🚀 5-Minute Setup

### Step 1: Get Your FREE Groq API Key (30 seconds)

1. Visit: https://console.groq.com
2. Click **"Sign Up"** (use Google/GitHub)
3. Go to **"API Keys"** in the left sidebar
4. Click **"Create API Key"**
5. Copy your key (starts with `gsk_...`)

**Free Tier:**
- ✅ 14,400 requests/day
- ✅ 30 requests/minute
- ✅ No credit card required!

---

### Step 2: Install Dependencies (2 minutes)

```bash
cd backend
pip install -r requirements.txt
```

**What gets installed:**
- FastAPI (web framework)
- Groq API client (LLM - 0 GB!)
- OpenAI Whisper (speech-to-text)
- Supabase client
- Other utilities

---

### Step 3: Configure Environment Variables (1 minute)

Open `.env` and update:

```env
# 1. Add your Groq API key
GROQ_API_KEY=gsk_your_actual_key_here

# 2. Add Gmail credentials (for email sending)
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM_EMAIL=your-email@gmail.com

# 3. (Optional) Change JWT secret for production
JWT_SECRET_KEY=your-random-secret-min-32-chars
```

**How to get Gmail App Password:**
1. Google Account → Security
2. Enable 2-Step Verification
3. Search "App passwords"
4. Generate new password
5. Copy the 16-character code

---

### Step 4: Set Up Supabase Database (1 minute)

1. Go to: https://hpjwdvxdgqthqudoglel.supabase.co
2. Click **SQL Editor**
3. Copy contents from `database/schema.sql`
4. Paste and click **"Run"**

**Create Storage Bucket:**
1. Go to **Storage** tab
2. Click **"New bucket"**
3. Name: `meeting-audio`
4. Make it **Public**
5. Click **"Create"**

---

### Step 5: Start the Server (30 seconds)

```bash
uvicorn app.main:app --reload --port 8000
```

**Server will start at:**
- API: http://localhost:8000
- Docs: http://localhost:8000/docs

---

## ✅ Verification Checklist

- [ ] Groq API key added to `.env`
- [ ] Gmail credentials configured
- [ ] Database schema executed in Supabase
- [ ] Storage bucket `meeting-audio` created
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Server running (`uvicorn app.main:app --reload`)
- [ ] Can access http://localhost:8000/docs

---

## 🧪 Quick Test

### 1. Register a User

Go to http://localhost:8000/docs and try:

**POST /api/auth/register**
```json
{
  "email": "test@example.com",
  "password": "password123",
  "full_name": "Test User"
}
```

### 2. Login

**POST /api/auth/login**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

Copy the `access_token` from the response.

### 3. Create a Project

**POST /api/projects**
- Click the lock icon 🔒 and paste your token
- Create a project:
```json
{
  "name": "Test Project",
  "description": "My first project",
  "color": "#3b82f6"
}
```

---

## 🎯 What Changed from Ollama?

| Before (Ollama) | After (Groq) |
|-----------------|--------------|
| Download 4-8 GB model | 0 GB download |
| Install Ollama locally | Just get API key |
| Run `ollama serve` | Nothing to run |
| Slow inference | ⚡ Blazing fast |
| Manual updates | Auto-updated |

**Result:** Saved 4-8 GB of disk space! 🎉

---

## 🔧 Troubleshooting

### "Invalid API Key" Error
- Check that key starts with `gsk_`
- No extra spaces in `.env`
- Get new key from https://console.groq.com

### "Rate Limit Exceeded"
- Free tier: 30 req/min, 14,400/day
- Wait 1 minute and retry
- Enough for development!

### "SMTP Authentication Failed"
- Use Gmail **App Password**, not regular password
- Enable 2-Step Verification first

### "Bucket not found"
- Create `meeting-audio` bucket in Supabase Storage
- Make it public or configure signed URLs

---

## 📚 Next Steps

1. **Test the API**: Use http://localhost:8000/docs
2. **Upload audio**: Test transcription with a sample meeting
3. **Check AI extraction**: See how Groq extracts action items
4. **Integrate frontend**: Connect your React app
5. **Deploy**: Deploy to production when ready

---

## 🆘 Need Help?

- **Groq Docs**: https://console.groq.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Supabase Docs**: https://supabase.com/docs

---

## 🎉 You're All Set!

Your backend is now running with:
- ✅ Zero disk space for LLM (cloud-based Groq)
- ✅ Blazing fast AI inference
- ✅ 14,400 free requests/day
- ✅ Production-ready architecture

Happy coding! 🚀
