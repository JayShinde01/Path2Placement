const RESUME_STORAGE_KEY = "resumeData";

export async function syncLatestResumeData(token) {
  if (!token) {
    localStorage.removeItem(RESUME_STORAGE_KEY);
    return null;
  }

  const response = await fetch("http://localhost:8000/api/resumes", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to load resume data (${response.status})`);
  }

  const result = await response.json();
  const resumeData = Array.isArray(result) ? result[0]?.data ?? null : result?.data ?? null;

  if (resumeData) {
    localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(resumeData));
  } else {
    localStorage.removeItem(RESUME_STORAGE_KEY);
  }

  return resumeData;
}
