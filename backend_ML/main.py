import os

import uvicorn
from dotenv import load_dotenv

load_dotenv()

from analytics import router as analytics_router
from auth import router as auth_router
from interview_api import router as interview_router
from assistant_api import router as assistant_router
from resume_matcher import app
from job_routes import router as job_router

app.include_router(auth_router)
app.include_router(analytics_router)
app.include_router(interview_router)
app.include_router(assistant_router)
app.include_router(job_router)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
