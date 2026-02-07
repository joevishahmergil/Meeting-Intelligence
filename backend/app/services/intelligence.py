from groq import Groq
from app.core.database import get_supabase
from app.core.config import settings
from typing import List, Dict
import json

# Initialize Groq client
groq_client = Groq(api_key=settings.GROQ_API_KEY)


async def extract_intelligence(meeting_id: str, transcript_id: str):
    """
    Extract intelligence from meeting transcript using LLaMA 3.2
    
    Args:
        meeting_id: Meeting ID
        transcript_id: Transcript ID
    """
    supabase = get_supabase()
    
    # Get transcript
    transcript_response = supabase.table("transcripts").select("*").eq("id", transcript_id).execute()
    
    if not transcript_response.data:
        raise Exception("Transcript not found")
    
    transcript = transcript_response.data[0]["cleaned_transcript"]
    
    if not transcript:
        raise Exception("No transcript available")
    
    # Extract different types of intelligence
    decisions = await extract_decisions(transcript)
    action_items = await extract_action_items(transcript, meeting_id)
    follow_ups = await extract_follow_ups(transcript, meeting_id)
    problem_statements = await extract_problem_statements(transcript)
    
    # Store extracted data
    await store_decisions(meeting_id, decisions)
    await store_action_items(meeting_id, action_items)
    await store_follow_ups(meeting_id, follow_ups)
    await store_problem_statements(meeting_id, problem_statements)


async def extract_decisions(transcript: str) -> List[Dict]:
    """Extract decisions from transcript"""
    prompt = f"""
You are an AI assistant analyzing meeting transcripts. Extract all decisions made during the meeting.

For each decision, provide:
- The decision text
- A confidence score (0.0 to 1.0)

Return ONLY a JSON array of decisions in this exact format:
[
  {{"decision": "Decision text here", "confidence": 0.95}}
]

If no decisions are found, return an empty array: []

Meeting Transcript:
{transcript}

JSON Response:
"""
    
    try:
        response = groq_client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are an AI assistant that extracts structured information from meeting transcripts. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2000
        )
        
        # Parse response
        result = json.loads(response.choices[0].message.content)
        return result if isinstance(result, list) else []
    except Exception as e:
        print(f"Error extracting decisions: {e}")
        return []


async def extract_action_items(transcript: str, meeting_id: str) -> List[Dict]:
    """Extract action items from transcript"""
    prompt = f"""
You are an AI assistant analyzing meeting transcripts. Extract all action items, tasks, and commitments.

For each action item, provide:
- action_type: "Email", "Meeting", or "Task"
- description: What needs to be done
- assigned_to: Person responsible (if mentioned)
- due_date: Due date if mentioned (YYYY-MM-DD format, or null)
- confidence: Confidence score (0.0 to 1.0)

Return ONLY a JSON array in this exact format:
[
  {{
    "action_type": "Task",
    "description": "Complete technical specifications",
    "assigned_to": "Mike Johnson",
    "due_date": "2026-02-07",
    "confidence": 0.90
  }}
]

If no action items are found, return an empty array: []

Meeting Transcript:
{transcript}

JSON Response:
"""
    
    try:
        response = groq_client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are an AI assistant that extracts structured information from meeting transcripts. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2000
        )
        
        result = json.loads(response.choices[0].message.content)
        return result if isinstance(result, list) else []
    except Exception as e:
        print(f"Error extracting action items: {e}")
        return []


async def extract_follow_ups(transcript: str, meeting_id: str) -> List[Dict]:
    """Extract follow-up items from transcript"""
    prompt = f"""
You are an AI assistant analyzing meeting transcripts. Extract all follow-up items that need tracking.

For each follow-up, provide:
- description: What needs to be followed up on
- confidence: Confidence score (0.0 to 1.0)

Return ONLY a JSON array in this exact format:
[
  {{
    "description": "Check with design team on mockup timeline",
    "confidence": 0.85
  }}
]

If no follow-ups are found, return an empty array: []

Meeting Transcript:
{transcript}

JSON Response:
"""
    
    try:
        response = groq_client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are an AI assistant that extracts structured information from meeting transcripts. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2000
        )
        
        result = json.loads(response.choices[0].message.content)
        return result if isinstance(result, list) else []
    except Exception as e:
        print(f"Error extracting follow-ups: {e}")
        return []


async def extract_problem_statements(transcript: str) -> List[Dict]:
    """Extract problem statements and concerns from transcript"""
    prompt = f"""
You are an AI assistant analyzing meeting transcripts. Extract all problem statements, concerns, or issues raised.

For each problem, provide:
- statement: The problem or concern
- confidence: Confidence score (0.0 to 1.0)

Return ONLY a JSON array in this exact format:
[
  {{
    "statement": "Current dashboard performance is slow with large datasets",
    "confidence": 0.92
  }}
]

If no problems are found, return an empty array: []

Meeting Transcript:
{transcript}

JSON Response:
"""
    
    try:
        response = groq_client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are an AI assistant that extracts structured information from meeting transcripts. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2000
        )
        
        result = json.loads(response.choices[0].message.content)
        return result if isinstance(result, list) else []
    except Exception as e:
        print(f"Error extracting problems: {e}")
        return []


async def store_decisions(meeting_id: str, decisions: List[Dict]):
    """Store extracted decisions in database"""
    supabase = get_supabase()
    
    for decision in decisions:
        decision_data = {
            "meeting_id": meeting_id,
            "decision_text": decision.get("decision", ""),
            "confidence_score": decision.get("confidence", 0.0)
        }
        supabase.table("decisions").insert(decision_data).execute()


async def store_action_items(meeting_id: str, action_items: List[Dict]):
    """Store extracted action items in database"""
    supabase = get_supabase()
    
    for item in action_items:
        action_data = {
            "meeting_id": meeting_id,
            "action_type": item.get("action_type", "Task"),
            "description": item.get("description", ""),
            "assigned_to": item.get("assigned_to"),
            "due_date": item.get("due_date"),
            "status": "PENDING",
            "confidence_score": item.get("confidence", 0.0)
        }
        supabase.table("action_items").insert(action_data).execute()


async def store_follow_ups(meeting_id: str, follow_ups: List[Dict]):
    """Store extracted follow-ups in database"""
    supabase = get_supabase()
    
    for item in follow_ups:
        followup_data = {
            "meeting_id": meeting_id,
            "description": item.get("description", ""),
            "status": "Tracked",
            "confidence_score": item.get("confidence", 0.0)
        }
        supabase.table("follow_ups").insert(followup_data).execute()


async def store_problem_statements(meeting_id: str, problems: List[Dict]):
    """Store extracted problem statements in database"""
    supabase = get_supabase()
    
    for problem in problems:
        problem_data = {
            "meeting_id": meeting_id,
            "statement": problem.get("statement", ""),
            "confidence_score": problem.get("confidence", 0.0)
        }
        supabase.table("problem_statements").insert(problem_data).execute()
