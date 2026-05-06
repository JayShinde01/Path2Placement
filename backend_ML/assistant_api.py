"""
assistant_api.py — Personal AI Assistant for user data analysis and coaching.

Endpoints:
  POST /api/assistant/chat          — chat with assistant, get insights
  GET  /api/assistant/conversations — list all past conversations
  GET  /api/assistant/conversations/{conv_id} — get conversation + messages

Features:
  - Aggregates user's interview, coding, resume, and market data
  - Calls Gemini for personalized insights and recommendations
  - Persists conversation history in MongoDB
"""

import logging
from datetime import datetime, timezone
from typing import Any, Optional
from uuid import uuid4

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel

from auth import get_current_user
from database import get_db
from gemini_client import GOOGLE_GEMINI_API_KEY, generate_gemini_text

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/assistant", tags=["assistant"])


# ---------------------------------------------------------------------------
# Serialization helper — converts ObjectId → str, datetime → ISO string
# ---------------------------------------------------------------------------

def _serialize(value: Any) -> Any:
    """Recursively convert MongoDB BSON types to JSON-safe types."""
    if isinstance(value, dict):
        return {k: _serialize(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_serialize(v) for v in value]
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    return value


class AssistantMessage(BaseModel):
    message: str


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _uid(user: dict) -> str:
    return str(user["_id"])


async def _aggregate_user_data(
    db: AsyncIOMotorDatabase,
    user_id: str,
) -> dict:
    """
    Collect all analytics data for the user:
    - Interview sessions and performance
    - Coding activity and solved problems
    - Resume scores and match history
    - Job applications
    - Skills gaps
    """
    data = {
        "user_id": user_id,
        "interview_stats": {},
        "coding_stats": {},
        "resume_stats": {},
        "job_applications": [],
        "market_demand": {},
    }

    # Interview stats
    interview_sessions = await db["interview_sessions"].find(
        {"user_id": user_id}
    ).to_list(None)
    completed_interviews = [s for s in interview_sessions if s.get("status") == "completed"]
    data["interview_stats"] = {
        "total_sessions": len(interview_sessions),
        "completed_interviews": len(completed_interviews),
        "roles_practiced": list(set(s.get("role") for s in interview_sessions if s.get("role"))),
        "average_questions_per_session": (
            sum(s.get("question_index", 0) for s in interview_sessions) // len(interview_sessions)
            if interview_sessions else 0
        ),
    }

    # Coding stats
    coding_activities = await db["coding_activity"].find(
        {"user_id": user_id}
    ).to_list(None)
    solved_problems = [a for a in coding_activities if a.get("passed")]
    data["coding_stats"] = {
        "total_attempts": len(coding_activities),
        "problems_solved": len(solved_problems),
        "pass_rate": (
            (len(solved_problems) / len(coding_activities) * 100)
            if coding_activities else 0
        ),
        "languages_used": list(set(a.get("language") for a in coding_activities if a.get("language"))),
        "difficulty_breakdown": {
            "easy": len([a for a in coding_activities if a.get("difficulty") == "Easy"]),
            "medium": len([a for a in coding_activities if a.get("difficulty") == "Medium"]),
            "hard": len([a for a in coding_activities if a.get("difficulty") == "Hard"]),
        },
    }

    # Resume scores
    resume_scores = await db["resume_scores"].find(
        {"user_id": user_id}
    ).to_list(None)
    if resume_scores:
        avg_score = sum(r.get("match_score", 0) for r in resume_scores) / len(resume_scores)
        all_matched_skills = set()
        all_missing_skills = set()
        for r in resume_scores:
            all_matched_skills.update(r.get("matched_skills", []))
            all_missing_skills.update(r.get("missing_skills", []))
        data["resume_stats"] = {
            "average_match_score": round(avg_score, 1),
            "total_resumes_scored": len(resume_scores),
            "matched_skills": list(all_matched_skills),
            "missing_skills": list(all_missing_skills),
        }

    # Job applications
    job_applications = await db["job_applications"].find(
        {"user_id": user_id}
    ).to_list(None)
    data["job_applications"] = [
        {
            "job_title": j.get("job_title"),
            "company": j.get("company"),
            "applied_at": _serialize(j.get("created_at")),
        }
        for j in job_applications[:10]  # Last 10
    ]

    return data


async def _build_assistant_reply(
    user_data: dict,
    user_message: str,
) -> str:
    """
    Call Gemini to generate a personalized assistant response.
    """
    if not GOOGLE_GEMINI_API_KEY:
        return (
            "I'm your personal career assistant. I can help you analyze your progress, "
            "recommend next steps, and guide your career journey. "
            "Please enable Gemini API to get personalized insights."
        )

    # Format user data into a readable context
    context = f"""
User Profile Summary:
- Interview Practice: {user_data['interview_stats'].get('total_sessions', 0)} sessions, 
  {user_data['interview_stats'].get('completed_interviews', 0)} completed. 
  Roles: {', '.join(user_data['interview_stats'].get('roles_practiced', [])) or 'None yet'}
- Coding Activity: {user_data['coding_stats'].get('problems_solved', 0)}/{user_data['coding_stats'].get('total_attempts', 0)} problems solved 
  ({user_data['coding_stats'].get('pass_rate', 0):.0f}% pass rate). 
  Languages: {', '.join(user_data['coding_stats'].get('languages_used', [])) or 'Not started'}
- Resume: Avg match score {user_data['resume_stats'].get('average_match_score', 0)}/100. 
  Matched skills: {', '.join(user_data['resume_stats'].get('matched_skills', [])[:5]) or 'None'}. 
  Missing skills: {', '.join(user_data['resume_stats'].get('missing_skills', [])[:5]) or 'None'}
- Job Applications: {len(user_data.get('job_applications', []))} applications
"""

    prompt = f"""
You are a supportive career coach and personal assistant for a professional development platform.
Your job is to analyze the user's progress across interviews, coding practice, resume quality, and job search.
Provide personalized, actionable advice. Be encouraging, specific, and practical.

{context}

User message: {user_message}

Respond in 3-5 sentences. Be conversational, direct, and empowering. Focus on next steps and growth.
"""
    text = generate_gemini_text(prompt, task="assistant_chat")
    return text or "Great progress! Keep practicing and building your skills. What would you like to focus on next?"


async def _auto_generate_insights(
    db: AsyncIOMotorDatabase,
    user_data: dict,
) -> str:
    """
    Generate initial insights when the conversation starts (no message needed).
    """
    if not GOOGLE_GEMINI_API_KEY:
        return "Your assistant is ready to help you analyze your progress and guide your career."

    context = f"""
User Profile Summary:
- Interview Practice: {user_data['interview_stats'].get('total_sessions', 0)} sessions, 
  {user_data['interview_stats'].get('completed_interviews', 0)} completed.
- Coding Activity: {user_data['coding_stats'].get('problems_solved', 0)}/{user_data['coding_stats'].get('total_attempts', 0)} problems solved.
- Resume Quality: Avg match score {user_data['resume_stats'].get('average_match_score', 0)}/100.
- Job Applications: {len(user_data.get('job_applications', []))} applications
"""

    prompt = f"""
You are a career coach analyzing a professional development student's progress.
Generate a brief 3-4 sentence opening insight based on their data below.
Be encouraging, spot gaps, and suggest 1 priority action.

{context}

Provide a warm, personalized greeting + insight + next step.
"""
    text = generate_gemini_text(prompt, task="assistant_insights")
    return text or "Welcome! I'm here to help you succeed. Tell me about your goals and I'll guide your path."


@router.post("/chat", status_code=status.HTTP_201_CREATED)
async def chat_with_assistant(
    body: AssistantMessage,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Chat with the personal assistant.
    Aggregates user data, calls Gemini, stores conversation.
    """
    try:
        user_id = _uid(current_user)
        user_message = body.message.strip()

        # Aggregate user data
        user_data = await _aggregate_user_data(db, user_id)

        # Get assistant reply
        assistant_reply = await _build_assistant_reply(user_data, user_message)

        # Store conversation
        await db["assistant_conversations"].insert_one({
            "user_id": user_id,
            "conversation_id": str(uuid4()),
            "user_message": user_message,
            "assistant_reply": assistant_reply,
            "user_data_snapshot": user_data,
            "created_at": _now(),
        })

        return {
            "reply": assistant_reply,
            "user_message": user_message,
        }

    except Exception as e:
        logger.error(f"Assistant chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/insights")
async def get_auto_insights(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Get auto-generated insights based on current user data.
    """
    try:
        user_id = _uid(current_user)
        user_data = await _aggregate_user_data(db, user_id)
        insights = await _auto_generate_insights(db, user_data)
        return {
            "insights": insights,
            "user_data": user_data,
        }
    except Exception as e:
        logger.error(f"Auto insights error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations")
async def list_conversations(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    List all past conversations for the user.
    """
    try:
        user_id = _uid(current_user)
        cursor = db["assistant_conversations"].find(
            {"user_id": user_id},
            sort=[("created_at", -1)],
        )
        conversations = await cursor.to_list(length=100)
        
        # Group messages by conversation_id
        grouped = {}
        for msg in conversations:
            conv_id = msg.get("conversation_id")
            if conv_id not in grouped:
                grouped[conv_id] = {
                    "conversation_id": conv_id,
                    "created_at": _serialize(msg.get("created_at")),
                    "messages": [],
                }
            grouped[conv_id]["messages"].append({
                "user_message": msg.get("user_message"),
                "assistant_reply": msg.get("assistant_reply"),
                "created_at": _serialize(msg.get("created_at")),
            })
        
        return {"conversations": list(grouped.values())}
    except Exception as e:
        logger.error(f"List conversations error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Get a single conversation thread.
    """
    try:
        user_id = _uid(current_user)
        cursor = db["assistant_conversations"].find(
            {"user_id": user_id, "conversation_id": conversation_id},
            sort=[("created_at", 1)],
        )
        messages = await cursor.to_list(length=200)
        
        if not messages:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        return {
            "conversation_id": conversation_id,
            "created_at": _serialize(messages[0].get("created_at")),
            "messages": [
                {
                    "user_message": m.get("user_message"),
                    "assistant_reply": m.get("assistant_reply"),
                    "created_at": _serialize(m.get("created_at")),
                }
                for m in messages
            ],
        }
    except Exception as e:
        logger.error(f"Get conversation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
