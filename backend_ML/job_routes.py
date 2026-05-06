from fastapi import APIRouter, Depends
from jobs_service import recommend_jobs
from database import get_db
from datetime import datetime
from bson import ObjectId
from auth import get_current_user
router = APIRouter()


# 🔥 1. Recommended jobs API
@router.post("/jobs/recommend")
async def get_recommended_jobs(body: dict):
    try:
        query = body.get("query", "developer")
        location = body.get("location", "India")
        skills = body.get("skills", [])

        jobs = recommend_jobs(query, location, skills)

        return {"results": jobs}
    except Exception as exc:
        print("Job recommendation endpoint fallback:", exc)
        return {"results": []}


# 🔥 2. Save applied job
@router.post("/api/analytics/job-application")
async def save_applied_job(
    body: dict,
    user=Depends(get_current_user),
    db=Depends(get_db)
):
    doc = {
        "user_id": str(user["_id"]),
        "job_title": body.get("job_title"),
        "company": body.get("company"),
        "source": body.get("source"),
        "job_url": body.get("url"),
        "created_at": datetime.utcnow()
    }

    await db["applied_jobs"].insert_one(doc)

    return {"msg": "Saved"}


# 🔥 3. Get applied jobs
@router.get("/api/analytics/applied-jobs")
async def get_applied_jobs(
    user=Depends(get_current_user),
    db=Depends(get_db)
):
    docs = await db["applied_jobs"].find(
        {"user_id": str(user["_id"])}
    ).to_list(100)

    return [
        {
            "job_url": d["job_url"]
        }
        for d in docs
    ]