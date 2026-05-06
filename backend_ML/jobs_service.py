import os
import requests
from dotenv import load_dotenv

load_dotenv()

JSEARCH_API_KEY = os.getenv("JSEARCH_API_KEY")
ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY")
JOOBLE_API_KEY = os.getenv("JOOBLE_API_KEY")


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
        res = requests.get(url, headers=headers, params=params)

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
        res = requests.get(url, params=params)

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
        res = requests.post(url, json=payload)

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

    return all_jobs


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


# 🔥 Score jobs using skills
def score_job(job, skills):
    text = (job["title"] + " " + job.get("description", "")).lower()
    score = 0
    matched = 0

    for skill in skills:
        if skill.lower() in text:
            score += 2
            matched += 1

    if "fresher" in text or "junior" in text:
        score += 1

    total = len(skills) if skills else 1
    match_percent = int((matched / total) * 100)

    return score, match_percent


# 🔥 Main function
def recommend_jobs(query, location, skills):
    jobs = fetch_jobs(query, location)
    jobs = deduplicate_jobs(jobs)

    scored_jobs = []

    for job in jobs:
        score, match = score_job(job, skills)
        job["score"] = score
        job["match"] = match
        scored_jobs.append(job)

    scored_jobs.sort(key=lambda x: x["score"], reverse=True)

    return scored_jobs[:30]