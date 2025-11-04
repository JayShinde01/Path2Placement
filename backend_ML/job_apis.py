import os
import requests
from dotenv import load_dotenv

# Load keys from .env
load_dotenv()

JSEARCH_API_KEY = os.getenv("JSEARCH_API_KEY")
ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY")
JOOBLE_API_KEY = os.getenv("JOOBLE_API_KEY")


def fetch_jobs(query, location="India"):
    all_jobs = []

    # --- 1️⃣ JSearch (RapidAPI) ---
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
                    "title": job.get("job_title"),
                    "company": job.get("employer_name"),
                    "location": job.get("job_city"),
                    "url": job.get("job_apply_link")
                })
    except Exception as e:
        print("JSearch Error:", e)

    # --- 2️⃣ Adzuna ---
    try:
        url = f"https://api.adzuna.com/v1/api/jobs/in/search/1"
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
                    "title": job.get("title"),
                    "company": job.get("company", {}).get("display_name"),
                    "location": job.get("location", {}).get("display_name"),
                    "url": job.get("redirect_url")
                })
    except Exception as e:
        print("Adzuna Error:", e)

    # --- 3️⃣ Jooble ---
    try:
        url = f"https://jooble.org/api/{JOOBLE_API_KEY}"
        payload = {"keywords": query, "location": location}
        res = requests.post(url, json=payload)
        if res.status_code == 200:
            for job in res.json().get("jobs", []):
                all_jobs.append({
                    "source": "Jooble",
                    "title": job.get("title"),
                    "company": job.get("company"),
                    "location": job.get("location"),
                    "url": job.get("link")
                })
    except Exception as e:
        print("Jooble Error:", e)

    return all_jobs
