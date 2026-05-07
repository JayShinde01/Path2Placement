import os
import re
import requests
from dotenv import load_dotenv

load_dotenv()

JSEARCH_API_KEY = os.getenv("JSEARCH_API_KEY")
ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY")
JOOBLE_API_KEY = os.getenv("JOOBLE_API_KEY")
MAX_RECOMMENDED_JOBS = 80


def _clean_location(value, default="India"):
    location = (value or "").strip()
    if not location:
        return default

    hostel_like = [
        "hostel",
        "boys hostel",
        "girls hostel",
        "pg",
        "room",
        "near",
        "chowk",
        "road",
    ]
    lowered = location.lower()
    if any(token in lowered for token in hostel_like):
        return default

    return location


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


def fetch_jobs(query, location="India", profile=None, include_meta=False):
    all_jobs = []
    search_query = _build_search_query(query, profile)
    normalized_location = _clean_location(location)
    provider_status = {
        "JSearch": {"enabled": bool(JSEARCH_API_KEY), "fetched": 0, "error": ""},
        "Adzuna": {"enabled": bool(ADZUNA_APP_ID and ADZUNA_APP_KEY), "fetched": 0, "error": ""},
        "Jooble": {"enabled": bool(JOOBLE_API_KEY), "fetched": 0, "error": ""},
    }

    # --- JSearch ---
    if JSEARCH_API_KEY:
        try:
            url = "https://jsearch.p.rapidapi.com/search"
            headers = {
                "x-rapidapi-key": JSEARCH_API_KEY,
                "x-rapidapi-host": "jsearch.p.rapidapi.com"
            }
            for page in range(1, 4):
                params = {
                    "query": f"{search_query} in {normalized_location}",
                    "page": page,
                    "num_pages": 1,
                }
                try:
                    res = requests.get(url, headers=headers, params=params, timeout=7)
                except requests.exceptions.RequestException:
                    fallback_params = {
                        "query": search_query,
                        "page": page,
                        "num_pages": 1,
                    }
                    res = requests.get(url, headers=headers, params=fallback_params, timeout=7)

                if res.status_code != 200:
                    provider_status["JSearch"]["error"] = f"HTTP {res.status_code}"
                    continue

                for job in res.json().get("data", []):
                    all_jobs.append({
                        "source": "JSearch",
                        "title": job.get("job_title", ""),
                        "company": job.get("employer_name", ""),
                        "location": job.get("job_city", "") or normalized_location,
                        "description": job.get("job_description", ""),
                        "url": job.get("job_apply_link")
                    })
                    provider_status["JSearch"]["fetched"] += 1
        except Exception as e:
            print("JSearch Error:", e)
            provider_status["JSearch"]["error"] = str(e)
    else:
        provider_status["JSearch"]["error"] = "Missing JSEARCH_API_KEY"

    # --- Adzuna ---
    if ADZUNA_APP_ID and ADZUNA_APP_KEY:
        try:
            for page in range(1, 5):
                url = f"https://api.adzuna.com/v1/api/jobs/in/search/{page}"
                params = {
                    "app_id": ADZUNA_APP_ID,
                    "app_key": ADZUNA_APP_KEY,
                    "what": search_query,
                    "where": normalized_location
                }
                res = requests.get(url, params=params, timeout=12)

                if res.status_code != 200:
                    provider_status["Adzuna"]["error"] = f"HTTP {res.status_code}"
                    continue

                for job in res.json().get("results", []):
                    all_jobs.append({
                        "source": "Adzuna",
                        "title": job.get("title", ""),
                        "company": job.get("company", {}).get("display_name", ""),
                        "location": job.get("location", {}).get("display_name", "") or normalized_location,
                        "description": job.get("description", ""),
                        "url": job.get("redirect_url")
                    })
                    provider_status["Adzuna"]["fetched"] += 1
        except Exception as e:
            print("Adzuna Error:", e)
            provider_status["Adzuna"]["error"] = str(e)
    else:
        provider_status["Adzuna"]["error"] = "Missing ADZUNA_APP_ID or ADZUNA_APP_KEY"

    # --- Jooble ---
    if JOOBLE_API_KEY:
        try:
            url = f"https://jooble.org/api/{JOOBLE_API_KEY}"
            for page in range(1, 5):
                payload = {
                    "keywords": search_query,
                    "location": normalized_location,
                    "page": page,
                }
                res = requests.post(url, json=payload, timeout=12)

                if res.status_code != 200:
                    provider_status["Jooble"]["error"] = f"HTTP {res.status_code}"
                    continue

                for job in res.json().get("jobs", []):
                    all_jobs.append({
                        "source": "Jooble",
                        "title": job.get("title", ""),
                        "company": job.get("company", ""),
                        "location": job.get("location", "") or normalized_location,
                        "description": job.get("snippet", ""),
                        "url": job.get("link")
                    })
                    provider_status["Jooble"]["fetched"] += 1
        except Exception as e:
            print("Jooble Error:", e)
            provider_status["Jooble"]["error"] = str(e)
    else:
        provider_status["Jooble"]["error"] = "Missing JOOBLE_API_KEY"

    jobs = all_jobs or _fallback_jobs(search_query, normalized_location)
    if include_meta:
        return jobs, {
            "provider_status": provider_status,
            "normalized_location": normalized_location,
            "search_query": search_query,
        }
    return jobs


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


def _unique_terms(*groups):
    seen = set()
    ordered = []
    for group in groups:
        for term in group:
            normalized = (term or "").strip()
            if normalized and normalized.lower() not in seen:
                seen.add(normalized.lower())
                ordered.append(normalized)
    return ordered


def _profile_groups(profile):
    profile = profile or {}
    return {
        "skills": [term for term in profile.get("skills", []) if term],
        "role": _unique_terms([profile.get("title", "")], [profile.get("inferred_query", "")]),
        "summary": _normalize_terms(profile.get("summary", "") + " " + profile.get("bio", "")),
        "experience": _unique_terms(profile.get("experience_roles", [])),
        "education": _unique_terms(profile.get("education", [])),
        "projects": _unique_terms(profile.get("projects", [])),
        "certifications": _unique_terms(profile.get("certifications", [])),
        "achievements": _unique_terms(profile.get("achievements", [])),
        "activities": _unique_terms(profile.get("activities", [])),
        "languages": _unique_terms(profile.get("languages", [])),
        "location": [profile.get("location", "")],
        "address": [profile.get("address", "")],
        "search_terms": _unique_terms(profile.get("search_terms", [])),
    }


def _build_search_query(query, profile=None):
    profile = profile or {}
    groups = _profile_groups(profile)
    raw_query = (query or "").strip()
    fallback_role = groups["role"][0] if groups["role"] else "developer"

    if raw_query and raw_query.lower() not in {"developer", "job", "jobs"}:
        base_terms = [raw_query]
    else:
        base_terms = [fallback_role]

    skill_terms = groups["skills"][:2]
    if not skill_terms and groups["projects"]:
        skill_terms = groups["projects"][:1]

    seeds = _unique_terms(base_terms, skill_terms)
    return " ".join(seeds) if seeds else (fallback_role or raw_query or "developer")


# 🔥 Score jobs using skills and query relevance
def score_job(job, query, skills, profile=None):
    profile = profile or {}
    groups = _profile_groups(profile)
    text = " ".join(
        [
            str(job.get("title") or ""),
            str(job.get("company") or ""),
            str(job.get("location") or ""),
            str(job.get("description") or ""),
            query or "",
            profile.get("title", ""),
            profile.get("summary", ""),
            profile.get("bio", ""),
        ]
    ).lower()

    normalized_skills = [skill.strip().lower() for skill in skills if skill and skill.strip()]
    query_terms = _normalize_terms(query)

    score = 0
    possible = 0

    def add_group(terms, exact_weight, partial_weight=0):
        nonlocal score, possible
        for term in terms:
            normalized = (term or "").strip().lower()
            if not normalized:
                continue
            possible += exact_weight
            if normalized in text:
                score += exact_weight
            else:
                term_tokens = _normalize_terms(normalized)
                if term_tokens and any(token in text for token in term_tokens):
                    score += partial_weight or max(1, exact_weight // 2)

    add_group(normalized_skills, 5, 2)
    add_group(query_terms, 3, 1)
    add_group(groups["role"], 4, 2)
    add_group(groups["summary"], 1, 1)
    add_group(groups["experience"], 3, 2)
    add_group(groups["projects"], 3, 2)
    add_group(groups["education"], 2, 1)
    add_group(groups["certifications"], 2, 1)
    add_group(groups["achievements"], 2, 1)
    add_group(groups["activities"], 1, 1)
    add_group(groups["languages"], 1, 1)
    add_group(_unique_terms(groups["location"], groups["address"]), 1, 1)

    if "fresher" in text or "junior" in text or "entry level" in text:
        possible += 1
        score += 1

    if possible == 0:
        return 0, 0

    match_percent = int(round((score / possible) * 100))
    match_percent = max(0, min(match_percent, 100))

    return score, match_percent


# 🔥 Main function
def recommend_jobs(query, location, skills, profile=None, include_meta=False):
    debug_meta = {
        "provider_status": {},
        "normalized_location": _clean_location(location),
        "search_query": _build_search_query(query, profile),
    }
    try:
        if include_meta:
            jobs, debug_meta = fetch_jobs(query, location, profile, include_meta=True)
        else:
            jobs = fetch_jobs(query, location, profile)
        jobs = deduplicate_jobs(jobs)
    except Exception as e:
        print("Job recommendation fallback triggered:", e)
        jobs = _fallback_jobs(query, location)
        if include_meta:
            debug_meta["service_error"] = str(e)

    scored_jobs = []

    for job in jobs:
        score, match = score_job(job, query, skills, profile)
        job["score"] = score
        job["match"] = match
        scored_jobs.append(job)

    scored_jobs.sort(key=lambda x: x["score"], reverse=True)

    top_jobs = scored_jobs[:MAX_RECOMMENDED_JOBS]
    if include_meta:
        return top_jobs, debug_meta
    return top_jobs