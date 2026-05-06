import logging
import re
from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel

from auth import get_current_user
from database import get_db
from resume_matcher import GOOGLE_GEMINI_API_KEY, GEMINI_MODEL

logger = logging.getLogger(__name__)

router = APIRouter(tags=["interview"])


class InterviewRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    role: Optional[str] = None


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _normalize_role(role: str) -> str:
    cleaned = re.sub(r"\s+", " ", role or "").strip()
    return cleaned[:80]


def _infer_role(message: str) -> Optional[str]:
    text = (message or "").lower()
    if not text:
        return None
    if "core java" in text:
        return "Core Java"
    if "java" in text:
        return "Java"
    if "python" in text:
        return "Python Developer"
    if "react" in text:
        return "React Developer"
    if "frontend" in text or "front-end" in text:
        return "Frontend Developer"
    if "backend" in text or "back-end" in text:
        return "Backend Developer"
    if "data analyst" in text or "data analysis" in text:
        return "Data Analyst"
    if "devops" in text:
        return "DevOps Engineer"
    if "software engineer" in text:
        return "Software Engineer"
    return None


def _question_bank_for_role(role: str) -> list[str]:
    role_key = (role or "").lower()
    if "java" in role_key:
        return [
            "Explain the difference between JDK, JRE, and JVM.",
            "What are the core principles of OOP, and how are they applied in Java?",
            "How does Java handle memory management and garbage collection?",
            "What is the difference between ArrayList and LinkedList?",
            "Explain HashMap internals and how hashing works in Java.",
            "What is the difference between checked and unchecked exceptions?",
            "How do threads and synchronization work in Java?",
            "What are streams in Java, and when would you use them?",
            "What is the difference between == and .equals() in Java?",
            "Describe one Java project or problem where you used these concepts in practice.",
        ]

    return [
        f"Tell me about your experience as a {role}. What kind of work have you done recently?",
        f"Which technical skill is most important for a strong {role} candidate, and why?",
        f"Describe a project where you solved a difficult problem in a role like {role}.",
        f"How do you prioritize quality, speed, and communication in a {role} interview?",
        f"What tools, frameworks, or concepts should every {role} know well?",
        f"How do you handle a situation where requirements are unclear for a {role} task?",
        f"Tell me about a mistake you made in a project and what you learned from it.",
        f"How do you stay current with best practices in {role} work?",
        f"What would your teammates say is your strongest skill in a {role} setting?",
        f"If I hired you for a {role} role, what would you focus on in your first 30 days?",
    ]


async def _get_or_create_interview_session(
    db: AsyncIOMotorDatabase,
    user_id: str,
    session_id: Optional[str],
) -> dict:
    sessions = db["interview_sessions"]
    session = None
    if session_id:
        session = await sessions.find_one({"session_id": session_id, "user_id": user_id})

    if session:
        return session

    session_id = session_id or str(uuid4())
    session = {
        "session_id": session_id,
        "user_id": user_id,
        "role": None,
        "status": "awaiting_role",
        "question_index": 0,
        "turn_count": 0,
        "created_at": _now_utc(),
        "updated_at": _now_utc(),
    }
    await sessions.insert_one(session)
    return session


async def _store_interview_turn(
    db: AsyncIOMotorDatabase,
    *,
    user_id: str,
    session_id: str,
    role: Optional[str],
    question_index: int,
    stage: str,
    user_message: str,
    ai_reply: str,
    question: Optional[str] = None,
    is_feedback: bool = False,
) -> None:
    await db["interview_reviews"].insert_one(
        {
            "user_id": user_id,
            "session_id": session_id,
            "role": role,
            "question_index": question_index,
            "stage": stage,
            "question": question,
            "message": user_message,
            "user_message": user_message,
            "ai_reply": ai_reply,
            "is_feedback": is_feedback,
            "created_at": _now_utc(),
        }
    )


async def _build_answer_feedback(role: str, question: str, answer: str) -> str:
    if not GOOGLE_GEMINI_API_KEY:
        return "Good answer. Keep it focused and add one concrete example to make it stronger."

    genai.configure(api_key=GOOGLE_GEMINI_API_KEY)
    prompt = f"""
You are a calm, human-like interview coach.
Write 1-2 sentences of brief encouraging feedback on the candidate's answer.
Keep it specific, natural, and avoid repeating the question.
Do not use bullet points.

Role: {role}
Question: {question}
Candidate answer: {answer}
"""
    model = genai.GenerativeModel(GEMINI_MODEL)
    response = model.generate_content(prompt)
    text = response.text.strip() if hasattr(response, "text") and response.text else ""
    return text or "Good answer. Keep it focused and add one concrete example to make it stronger."


async def _build_final_feedback(role: str, transcript: list[dict]) -> str:
    if not GOOGLE_GEMINI_API_KEY:
        return (
            f"You completed the {role} mock interview. Strong areas: clarity and consistency. "
            "Improve by giving more concrete examples and structuring answers with impact. Final rating: 7/10."
        )

    genai.configure(api_key=GOOGLE_GEMINI_API_KEY)
    transcript_text = "\n".join(
        f"Q{i + 1}: {item.get('question', '')}\nA{i + 1}: {item.get('message', '')}"
        for i, item in enumerate(transcript)
        if item.get("question") or item.get("message")
    )
    prompt = f"""
You are a professional interviewer giving final mock interview feedback.
Return a concise but useful summary in 5-6 lines.
Include:
1. strengths
2. weaknesses or gaps
3. communication rating out of 10
4. technical rating out of 10
5. final rating out of 10
6. one short next-step suggestion

Tone: professional, encouraging, and direct.

Role: {role}
Transcript:
{transcript_text}
"""
    model = genai.GenerativeModel(GEMINI_MODEL)
    response = model.generate_content(prompt)
    text = response.text.strip() if hasattr(response, "text") and response.text else ""
    return text or (
        f"You completed the {role} mock interview. Strong areas: clarity and consistency. "
        "Improve by giving more concrete examples and structuring answers with impact. Final rating: 7/10."
    )


@router.post("/interview")
async def interview(
    req: InterviewRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        user_id = str(current_user["_id"])
        message = req.message.strip()
        session = await _get_or_create_interview_session(db, user_id, req.session_id)

        inferred_role = _normalize_role(req.role or _infer_role(message) or "") or None
        role = _normalize_role(session.get("role") or inferred_role or "") or None

        if role and role != session.get("role"):
            await db["interview_sessions"].update_one(
                {"session_id": session["session_id"], "user_id": user_id},
                {"$set": {"role": role, "updated_at": _now_utc()}},
            )
            session["role"] = role

        if not role:
            ai_reply = (
                "Which role or position would you like to prepare for? Tell me the target role "
                "and I’ll tailor the mock interview to it."
            )
            await _store_interview_turn(
                db,
                user_id=user_id,
                session_id=session["session_id"],
                role=None,
                question_index=0,
                stage="awaiting_role",
                user_message=message,
                ai_reply=ai_reply,
                is_feedback=False,
            )
            await db["interview_sessions"].update_one(
                {"session_id": session["session_id"], "user_id": user_id},
                {
                    "$set": {
                        "status": "awaiting_role",
                        "turn_count": session.get("turn_count", 0) + 1,
                        "updated_at": _now_utc(),
                    }
                },
            )
            return {
                "reply": ai_reply,
                "session_id": session["session_id"],
                "status": "awaiting_role",
                "role": None,
                "question_index": 0,
            }

        question_bank = _question_bank_for_role(role)
        question_index = int(session.get("question_index", 0))

        if question_index <= 0:
            next_question = question_bank[0]
            ai_reply = f"Great. Let’s begin your {role} mock interview. Question 1: {next_question}"
            await _store_interview_turn(
                db,
                user_id=user_id,
                session_id=session["session_id"],
                role=role,
                question_index=1,
                stage="question",
                user_message=message,
                ai_reply=ai_reply,
                question=next_question,
                is_feedback=False,
            )
            await db["interview_sessions"].update_one(
                {"session_id": session["session_id"], "user_id": user_id},
                {
                    "$set": {
                        "status": "in_progress",
                        "role": role,
                        "question_index": 1,
                        "turn_count": session.get("turn_count", 0) + 1,
                        "updated_at": _now_utc(),
                    }
                },
            )
            return {
                "reply": ai_reply,
                "session_id": session["session_id"],
                "status": "in_progress",
                "role": role,
                "question_index": 1,
            }

        transcript_cursor = db["interview_reviews"].find(
            {"session_id": session["session_id"], "user_id": user_id},
            sort=[("created_at", 1)],
        )
        transcript_docs = await transcript_cursor.to_list(length=200)
        last_question = next(
            (doc.get("question") for doc in reversed(transcript_docs) if doc.get("question")),
            question_bank[min(max(question_index - 1, 0), len(question_bank) - 1)],
        )

        if question_index >= len(question_bank):
            final_feedback = await _build_final_feedback(role, transcript_docs)
            await _store_interview_turn(
                db,
                user_id=user_id,
                session_id=session["session_id"],
                role=role,
                question_index=question_index,
                stage="final_feedback",
                user_message=message,
                ai_reply=final_feedback,
                question=last_question,
                is_feedback=True,
            )
            await db["interview_sessions"].update_one(
                {"session_id": session["session_id"], "user_id": user_id},
                {
                    "$set": {
                        "status": "completed",
                        "final_feedback": final_feedback,
                        "completed_at": _now_utc(),
                        "turn_count": session.get("turn_count", 0) + 1,
                        "updated_at": _now_utc(),
                    }
                },
            )
            return {
                "reply": final_feedback,
                "session_id": session["session_id"],
                "status": "completed",
                "role": role,
                "question_index": question_index,
                "final_feedback": final_feedback,
            }

        feedback = await _build_answer_feedback(role, last_question, message)
        next_question = question_bank[question_index]
        ai_reply = f"{feedback}\n\nQuestion {question_index + 1}: {next_question}"
        await _store_interview_turn(
            db,
            user_id=user_id,
            session_id=session["session_id"],
            role=role,
            question_index=question_index + 1,
            stage="feedback_and_question",
            user_message=message,
            ai_reply=ai_reply,
            question=next_question,
            is_feedback=True,
        )
        await db["interview_sessions"].update_one(
            {"session_id": session["session_id"], "user_id": user_id},
            {
                "$set": {
                    "status": "in_progress",
                    "role": role,
                    "question_index": question_index + 1,
                    "turn_count": session.get("turn_count", 0) + 1,
                    "updated_at": _now_utc(),
                }
            },
        )
        return {
            "reply": ai_reply,
            "session_id": session["session_id"],
            "status": "in_progress",
            "role": role,
            "question_index": question_index + 1,
        }
    except Exception as e:
        logger.error(f"Interview route error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/interview/sessions")
async def list_interview_sessions(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    user_id = str(current_user["_id"])
    cursor = db["interview_sessions"].find(
        {"user_id": user_id},
        sort=[("updated_at", -1)],
    )
    sessions = await cursor.to_list(length=50)

    payload = []
    for session in sessions:
        payload.append(
            {
                "session_id": session.get("session_id"),
                "role": session.get("role"),
                "status": session.get("status"),
                "question_index": session.get("question_index", 0),
                "turn_count": session.get("turn_count", 0),
                "created_at": session.get("created_at"),
                "updated_at": session.get("updated_at"),
                "has_feedback": bool(session.get("final_feedback")),
                "final_feedback": session.get("final_feedback"),
            }
        )
    return {"sessions": payload}


@router.get("/api/interview/sessions/{session_id}")
async def get_interview_session_detail(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    user_id = str(current_user["_id"])
    session = await db["interview_sessions"].find_one(
        {"session_id": session_id, "user_id": user_id}
    )
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    cursor = db["interview_reviews"].find(
        {"session_id": session_id, "user_id": user_id},
        sort=[("created_at", 1)],
    )
    turns = await cursor.to_list(length=200)
    return {
        "session": {
            "session_id": session.get("session_id"),
            "role": session.get("role"),
            "status": session.get("status"),
            "question_index": session.get("question_index", 0),
            "turn_count": session.get("turn_count", 0),
            "final_feedback": session.get("final_feedback"),
            "created_at": session.get("created_at"),
            "updated_at": session.get("updated_at"),
            "completed_at": session.get("completed_at"),
        },
        "transcript": turns,
    }
