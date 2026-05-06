"""
analytics.py — MongoDB-backed analytics system for Path2Placement.

Collections (all scoped to user_id):
  resume_scores     — every resume match result
  coding_activity   — every problem run/solve event
  interview_reviews — every AI interview session message
  job_applications  — job saves/applications

Endpoints (all under /api/analytics, all require auth):
  POST /resume-score          — save a resume match result
  POST /coding-activity       — save a coding problem attempt
  POST /interview-review      — save an interview message/feedback
  POST /job-application       — save a job application event
  GET  /summary               — compute + return full analytics summary
  GET  /market-skills         — return market demand skill list
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, Field

from auth import get_current_user
from database import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _now() -> datetime:
    return datetime.now(timezone.utc)

def _uid(user: dict) -> str:
    return str(user["_id"])

def safe_date(val):
    """Synchronous helper for sorting by date."""
    if isinstance(val, datetime):
        return val

    if isinstance(val, str):
        try:
            return datetime.fromisoformat(val)
        except ValueError:
            return datetime.min.replace(tzinfo=timezone.utc)

    return datetime.min.replace(tzinfo=timezone.utc)

def _build_recommendations(
    avg_resume: int,
    coding_acc: int,
    interview_sessions: int,
    missing_skills: list[str],
    user_skills: set[str],
) -> list[dict]:
    """Generate actionable recommendations based on user data."""
    recs = []

    if avg_resume < 60:
        recs.append({
            "area": "Resume",
            "priority": "high",
            "action": "Your resume match score is below 60%. Upload your resume against more job descriptions and add the missing skills highlighted in the gap analysis.",
        })
    elif avg_resume < 80:
        recs.append({
            "area": "Resume",
            "priority": "medium",
            "action": f"Resume score is {avg_resume}%. Focus on adding: {', '.join(missing_skills[:4]) or 'the skills shown in the gap analysis'}.",
        })

    if coding_acc < 50:
        recs.append({
            "area": "Coding",
            "priority": "high",
            "action": "Coding accuracy is below 50%. Practice Easy problems daily to build confidence before attempting Medium difficulty.",
        })
    elif coding_acc < 75:
        recs.append({
            "area": "Coding",
            "priority": "medium",
            "action": "Good coding progress! Push to Medium and Hard problems to stand out in technical interviews.",
        })

    if interview_sessions < 3:
        recs.append({
            "area": "Interview",
            "priority": "high",
            "action": "You've done fewer than 3 mock interview sessions. Practice daily — consistency is the fastest way to improve communication and confidence.",
        })

    # High-demand skills the user doesn't have
    high_demand_missing = [
        ms["skill"] for ms in MARKET_SKILLS
        if ms["demand"] >= 80 and ms["skill"].lower() not in user_skills
    ][:4]
    if high_demand_missing:
        recs.append({
            "area": "Skills",
            "priority": "high",
            "action": f"High-demand skills you're missing: {', '.join(high_demand_missing)}. Adding even one of these significantly improves your market value.",
        })

    if not recs:
        recs.append({
            "area": "General",
            "priority": "low",
            "action": "Great progress! Keep practicing coding, run more resume scans against real job descriptions, and do mock interviews weekly.",
        })

    return recs


# ---------------------------------------------------------------------------
# Pydantic models — inbound
# ---------------------------------------------------------------------------

class ResumeScoreIn(BaseModel):
    match_score: int
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    suggestions: str = ""
    job_title: Optional[str] = None   # optional context

class CodingActivityIn(BaseModel):
    problem_id: str
    problem_title: str
    language: str
    passed: bool
    difficulty: Optional[str] = None  # Easy / Medium / Hard

class InterviewReviewIn(BaseModel):
    session_id: Optional[str] = None
    role: Optional[str] = None
    message: str                       # user message
    ai_reply: str                      # AI response
    is_feedback: bool = False          # True when AI gave final feedback
    stage: Optional[str] = None
    question_index: Optional[int] = None
    question: Optional[str] = None

class JobApplicationIn(BaseModel):
    job_title: str
    company: Optional[str] = None
    source: Optional[str] = None
    url: Optional[str] = None

# ---------------------------------------------------------------------------
# Market demand — static seed (extend via DB later)
# ---------------------------------------------------------------------------

MARKET_SKILLS = [
    {"skill": "Python",          "demand": 95, "category": "Language"},
    {"skill": "JavaScript",      "demand": 92, "category": "Language"},
    {"skill": "React",           "demand": 88, "category": "Frontend"},
    {"skill": "Node.js",         "demand": 82, "category": "Backend"},
    {"skill": "SQL",             "demand": 85, "category": "Database"},
    {"skill": "MongoDB",         "demand": 72, "category": "Database"},
    {"skill": "Docker",          "demand": 80, "category": "DevOps"},
    {"skill": "AWS",             "demand": 85, "category": "Cloud"},
    {"skill": "System Design",   "demand": 78, "category": "Architecture"},
    {"skill": "REST APIs",       "demand": 88, "category": "Backend"},
    {"skill": "Git",             "demand": 90, "category": "Tools"},
    {"skill": "TypeScript",      "demand": 75, "category": "Language"},
    {"skill": "Kubernetes",      "demand": 65, "category": "DevOps"},
    {"skill": "GraphQL",         "demand": 60, "category": "API"},
    {"skill": "Machine Learning","demand": 70, "category": "AI/ML"},
    {"skill": "FastAPI",         "demand": 58, "category": "Backend"},
    {"skill": "Java",            "demand": 80, "category": "Language"},
    {"skill": "Spring Boot",     "demand": 72, "category": "Backend"},
    {"skill": "Redis",           "demand": 62, "category": "Database"},
    {"skill": "CI/CD",           "demand": 75, "category": "DevOps"},
]

# ---------------------------------------------------------------------------
# Save endpoints
# ---------------------------------------------------------------------------

@router.post("/resume-score", status_code=status.HTTP_201_CREATED)
async def save_resume_score(
    body: ResumeScoreIn,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Save a resume match result for the authenticated user."""
    doc = {
        "user_id": _uid(current_user),
        "match_score": body.match_score,
        "matched_skills": body.matched_skills,
        "missing_skills": body.missing_skills,
        "suggestions": body.suggestions,
        "job_title": body.job_title,
        "created_at": _now(),
    }
    await db["resume_scores"].insert_one(doc)
    logger.info(f"Saved resume score {body.match_score} for user {_uid(current_user)}")
    return {"msg": "Resume score saved"}


@router.post("/coding-activity", status_code=status.HTTP_201_CREATED)
async def save_coding_activity(
    body: CodingActivityIn,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Save a coding problem attempt."""
    doc = {
        "user_id": _uid(current_user),
        "problem_id": body.problem_id,
        "problem_title": body.problem_title,
        "language": body.language,
        "passed": body.passed,
        "difficulty": body.difficulty,
        "created_at": _now(),
    }
    await db["coding_activity"].insert_one(doc)
    return {"msg": "Coding activity saved"}


@router.post("/interview-review", status_code=status.HTTP_201_CREATED)
async def save_interview_review(
    body: InterviewReviewIn,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Save an interview message exchange."""
    doc = {
        "user_id": _uid(current_user),
        "session_id": body.session_id,
        "role": body.role,
        "stage": body.stage,
        "question_index": body.question_index,
        "question": body.question,
        "message": body.message,
        "user_message": body.message,
        "ai_reply": body.ai_reply,
        "is_feedback": body.is_feedback,
        "created_at": _now(),
    }
    await db["interview_reviews"].insert_one(doc)
    return {"msg": "Interview review saved"}


@router.post("/job-application", status_code=status.HTTP_201_CREATED)
async def save_job_application(
    body: JobApplicationIn,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Save a job application event."""
    doc = {
        "user_id": _uid(current_user),
        "job_title": body.job_title,
        "company": body.company,
        "source": body.source,
        "url": body.url,
        "created_at": _now(),
    }
    await db["job_applications"].insert_one(doc)
    return {"msg": "Job application saved"}


# ---------------------------------------------------------------------------
# Analytics summary endpoint
# ---------------------------------------------------------------------------

@router.get("/summary")
async def get_analytics_summary(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Compute and return a full analytics summary for the authenticated user.
    All values are derived from MongoDB — no hardcoded data.
    """
    uid = _uid(current_user)

    # ── 1. Resume scores ──────────────────────────────────────────────────
    resume_cursor = db["resume_scores"].find(
        {"user_id": uid}, sort=[("created_at", 1)]
    )
    resume_docs = await resume_cursor.to_list(length=200)

    resume_scores_list = [d["match_score"] for d in resume_docs]
    avg_resume_score = (
        round(sum(resume_scores_list) / len(resume_scores_list))
        if resume_scores_list else 0
    )

    # Trend: last 8 entries labelled by index
    resume_trend = [
        {"label": f"Scan {i+1}", "score": s}
        for i, s in enumerate(resume_scores_list[-8:])
    ]

    # Aggregate missing skills across all scans
    missing_skill_counts: dict[str, int] = {}
    matched_skill_counts: dict[str, int] = {}
    for d in resume_docs:
        for sk in d.get("missing_skills", []):
            missing_skill_counts[sk] = missing_skill_counts.get(sk, 0) + 1
        for sk in d.get("matched_skills", []):
            matched_skill_counts[sk] = matched_skill_counts.get(sk, 0) + 1

    top_missing = sorted(missing_skill_counts.items(), key=lambda x: -x[1])[:8]
    top_matched = sorted(matched_skill_counts.items(), key=lambda x: -x[1])[:8]

    # ── 2. Coding activity ────────────────────────────────────────────────
    coding_cursor = db["coding_activity"].find({"user_id": uid})
    coding_docs = await coding_cursor.to_list(length=1000)

    total_attempts = len(coding_docs)
    total_solved   = sum(1 for d in coding_docs if d.get("passed"))
    accuracy_pct   = (
        round(total_solved / total_attempts * 100) if total_attempts else 0
    )

    lang_counts: dict[str, int] = {}
    diff_counts: dict[str, int] = {"Easy": 0, "Medium": 0, "Hard": 0}
    for d in coding_docs:
        lang = d.get("language", "Unknown")
        lang_counts[lang] = lang_counts.get(lang, 0) + 1
        diff = d.get("difficulty", "")
        if diff in diff_counts:
            diff_counts[diff] += 1

    lang_chart = [{"name": k, "value": v} for k, v in lang_counts.items()]
    diff_chart = [{"name": k, "value": v} for k, v in diff_counts.items() if v > 0]

    # ── 3. Interview reviews ──────────────────────────────────────────────
    sessions_cursor = db["interview_sessions"].find(
        {"user_id": uid}, sort=[("updated_at", -1)]
    )
    session_docs = await sessions_cursor.to_list(length=200)

    if session_docs:
        total_sessions = len(session_docs)
        roles_practiced = list({d["role"] for d in session_docs if d.get("role")})
    else:
        interview_cursor = db["interview_reviews"].find(
            {"user_id": uid}, sort=[("created_at", 1)]
        )
        interview_docs = await interview_cursor.to_list(length=500)
        total_sessions = len({
            d.get("session_id") or d["created_at"].strftime("%Y-%m-%d") for d in interview_docs
        }) if interview_docs else 0
        roles_practiced = list({
            d["role"] for d in interview_docs if d.get("role")
        })

    # ── 4. Job applications ───────────────────────────────────────────────
    jobs_docs = await db["job_applications"].find({"user_id": uid}).to_list(length=500)

    total_jobs_saved = len(jobs_docs)
    source_counts: dict[str, int] = {}
    for d in jobs_docs:
        src = d.get("source", "Unknown")
        source_counts[src] = source_counts.get(src, 0) + 1

    # Sort using the synchronous helper
    sorted_jobs = sorted(
        jobs_docs,
        key=lambda x: safe_date(x.get("created_at")),
        reverse=True
    )

    recent_jobs = [
        {
            "title": d.get("job_title", ""),
            "company": d.get("company", ""),
            "source": d.get("source", ""),
        }
        for d in sorted_jobs[:5]
    ]

    # ── 5. Generate Recommendations & Return ──────────────────────────────
    user_skills_set = {sk.lower() for sk in matched_skill_counts.keys()}
    
    recs = _build_recommendations(
        avg_resume=avg_resume_score,
        coding_acc=accuracy_pct,
        interview_sessions=total_sessions,
        missing_skills=[sk for sk, _ in top_missing],
        user_skills=user_skills_set
    )

    return {
        "resume": {
            "avg_score": avg_resume_score,
            "trend": resume_trend,
            "top_missing": top_missing,
            "top_matched": top_matched
        },
        "coding": {
            "total_attempts": total_attempts,
            "total_solved": total_solved,
            "accuracy_pct": accuracy_pct,
            "lang_chart": lang_chart,
            "diff_chart": diff_chart
        },
        "interviews": {
            "total_sessions": total_sessions,
            "roles_practiced": roles_practiced
        },
        "jobs": {
            "total_saved": total_jobs_saved,
            "source_counts": source_counts,
            "recent": recent_jobs
        },
        "recommendations": recs
    }

# ---------------------------------------------------------------------------
# Market skills endpoint (public — no auth needed for the chart)
# ---------------------------------------------------------------------------

@router.get("/market-skills")
async def get_market_skills():
    """Return the market demand skill list for the skill gap chart."""
    return {"skills": MARKET_SKILLS}