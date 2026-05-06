import os
import re
import requests
from dotenv import load_dotenv

load_dotenv()

JSEARCH_API_KEY = os.getenv("JSEARCH_API_KEY")
ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY")
JOOBLE_API_KEY = os.getenv("JOOBLE_API_KEY")


def _fallback_jobs(query, location):
    role = (query or "developer").strip() or "developer"
    title_base = role.title()
    return [
        {
            "source": "Fallback",
            "title": f"{title_base} Intern",
            "company": "Local Hiring Network",
            "location": location or "Remote",
            "description": f"Entry-level {role} role with mentorship, learning, and hands-on project work.",
            "url": "https://www.google.com/search?q=" + requests.utils.quote(f"{role} jobs {location or ''}".strip())
        },
        {
            "source": "Fallback",
            "title": f"Junior {title_base}",
            "company": "Career Growth Studio",
            "location": location or "Remote",
            "description": f"Junior {role} position focused on practical delivery, teamwork, and skill growth.",
            "url": "https://www.google.com/search?q=" + requests.utils.quote(f"{role} jobs {location or ''}".strip())
        },
        {
            "source": "Fallback",
            "title": f"{title_base} Associate",
            "company": "Opportunity Hub",
            "location": location or "Remote",
            "description": f"Associate-level {role} opportunity for candidates building a strong professional portfolio.",
            "url": "https://www.google.com/search?q=" + requests.utils.quote(f"{role} jobs {location or ''}".strip())
        },
    ]


def fetch_jobs(query, location="India"):
    all_jobs = []

    # --- JSearch ---
    try:
        url = "https://jsearch.p.rapidapi.com/search"
        headers = {
            "x-rapidapi-key": JSEARCH_API_KEY,
            "x-rapidapi-host": "jsearch.p.rapidapi.com"
        }
        params = {"query": f"{query} in {location}", "num_pages": 1}
        res = requests.get(url, headers=headers, params=params, timeout=12)

        if res.status_code == 200:
            for job in res.json().get("data", []):
                all_jobs.append({
                    "source": "JSearch",
                    "title": job.get("job_title", ""),
                    "company": job.get("employer_name", ""),
                    "location": job.get("job_city", ""),
                    "description": job.get("job_description", ""),
                    "url": job.get("job_apply_link")
                })
    except Exception as e:
        print("JSearch Error:", e)

    # --- Adzuna ---
    try:
        url = "https://api.adzuna.com/v1/api/jobs/in/search/1"
        params = {
            "app_id": ADZUNA_APP_ID,
            "app_key": ADZUNA_APP_KEY,
            "what": query,
            "where": location
        }
        res = requests.get(url, params=params, timeout=12)

        if res.status_code == 200:
            for job in res.json().get("results", []):
                all_jobs.append({
                    "source": "Adzuna",
                    "title": job.get("title", ""),
                    "company": job.get("company", {}).get("display_name", ""),
                    "location": job.get("location", {}).get("display_name", ""),
                    "description": job.get("description", ""),
                    "url": job.get("redirect_url")
                })
    except Exception as e:
        print("Adzuna Error:", e)

    # --- Jooble ---
    try:
        url = f"https://jooble.org/api/{JOOBLE_API_KEY}"
        payload = {"keywords": query, "location": location}
        res = requests.post(url, json=payload, timeout=12)

        if res.status_code == 200:
            for job in res.json().get("jobs", []):
                all_jobs.append({
                    "source": "Jooble",
                    "title": job.get("title", ""),
                    "company": job.get("company", ""),
                    "location": job.get("location", ""),
                    "description": job.get("snippet", ""),
                    "url": job.get("link")
                })
    except Exception as e:
        print("Jooble Error:", e)

    return all_jobs or _fallback_jobs(query, location)


# 🔥 Remove duplicates
def deduplicate_jobs(jobs):
    seen = set()
    unique = []

    for job in jobs:
        key = (job["title"], job["company"], job["location"])
        if key not in seen:
            seen.add(key)
            unique.append(job)

    return unique


def _normalize_terms(value):
    return [term for term in re.findall(r"[a-z0-9]+", (value or "").lower()) if len(term) > 1]


# 🔥 Score jobs using skills and query relevance
def score_job(job, query, skills):
    text = " ".join(
        [
            str(job.get("title") or ""),
            str(job.get("company") or ""),
            str(job.get("location") or ""),
            str(job.get("description") or ""),
            query or "",
        ]
    ).lower()

    normalized_skills = [skill.strip().lower() for skill in skills if skill and skill.strip()]
    query_terms = _normalize_terms(query)

    score = 0
    possible = 0

    for skill in normalized_skills:
        possible += 4
        skill_terms = _normalize_terms(skill)

        if skill in text:
            score += 4
        elif skill_terms and any(term in text for term in skill_terms):
            score += 2

    for term in query_terms:
        possible += 2
        if term in text:
            score += 2

    if "fresher" in text or "junior" in text:
        possible += 1
        score += 1

    if possible == 0:
        return 0, 0

    match_percent = int(round((score / possible) * 100))
    match_percent = max(0, min(match_percent, 100))

    return score, match_percent


# 🔥 Main function
def recommend_jobs(query, location, skills):
    try:
        jobs = fetch_jobs(query, location)
        jobs = deduplicate_jobs(jobs)
    except Exception as e:
        print("Job recommendation fallback triggered:", e)
        jobs = _fallback_jobs(query, location)

    scored_jobs = []

    for job in jobs:
        score, match = score_job(job, query, skills)
        job["score"] = score
        job["match"] = match
        scored_jobs.append(job)

    scored_jobs.sort(key=lambda x: x["score"], reverse=True)

    return scored_jobs[:30]