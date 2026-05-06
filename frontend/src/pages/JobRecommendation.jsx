import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import "../page_style/jobrecommendation.css";
import { ML_API_URL } from "../api";

export default function JobRecommendation() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [skills, setSkills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("Java");
  const [apiLocation, setApiLocation] = useState("");

  const token = localStorage.getItem("token");

  // ⏱ Cache duration (10 min)
  const CACHE_DURATION = 1000 * 60 * 10;

  // 🔑 Unique cache key
  const getCacheKey = () =>
    `jobs_${query}_${apiLocation}_${skills.join(",")}`;

  // ================================
  // 🔥 Load resume (skills + location)
  // ================================
  useEffect(() => {
    const saved = localStorage.getItem("resumeData");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        // ✅ Load skills
        setSkills(parsed.skills || []);

        // ✅ Extract location (if user not typed)
        if (parsed.personal?.address && !apiLocation) {
          const address = parsed.personal.address;

          // 👉 Extract city (first part)
          const city = address.split(",")[0]?.trim();

          if (city) {
            setApiLocation(city);
          }
        }

      } catch (err) {
        console.error("Resume parse error:", err);
      }
    }
  }, []);

  // ================================
  // 🔥 Load applied jobs (local)
  // ================================
  useEffect(() => {
    const saved = localStorage.getItem("appliedJobs");
    if (saved) {
      setAppliedJobs(JSON.parse(saved));
    }
  }, []);

  // ================================
  // 🔥 Sync applied jobs from API
  // ================================
  useEffect(() => {
    const fetchApplied = async () => {
      if (!token) return;

      try {
        const res = await fetch(`${ML_API_URL}api/analytics/applied-jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        const urls = data.map((j) => j.job_url);

        setAppliedJobs(urls);
        localStorage.setItem("appliedJobs", JSON.stringify(urls));
      } catch (err) {
        console.error("Applied jobs API error:", err);
      }
    };

    fetchApplied();
  }, [token]);

  // ================================
  // 🔥 Instant cache load
  // ================================
  useEffect(() => {
    const key = getCacheKey();
    const cached = localStorage.getItem(key);

    if (cached) {
      console.log("⚡ Instant cache load");
      setJobs(JSON.parse(cached));
      setLoading(false);
    }
  }, []);

  // ================================
  // 🔥 Fetch jobs (smart cache)
  // ================================
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const key = getCacheKey();
      const cached = localStorage.getItem(key);
      const cachedTime = localStorage.getItem(key + "_time");

      // ✅ Use cache if valid
      if (cached && cachedTime) {
        const isValid =
          Date.now() - Number(cachedTime) < CACHE_DURATION;

        if (isValid) {
          console.log("⚡ Using cached jobs");
          setJobs(JSON.parse(cached));
          setLoading(false);
          return;
        }
      }

      // 🌐 API call
      console.log("🌐 Fetching from API");

      const res = await fetch(`${ML_API_URL}jobs/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          location: apiLocation || "India",
          skills,
        }),
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      const results = data.results || [];

      setJobs(results);

      // ✅ Save cache
      localStorage.setItem(key, JSON.stringify(results));
      localStorage.setItem(key + "_time", Date.now().toString());

    } catch (err) {
      console.error(err);
      setError("Failed to fetch jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // 🔥 Debounce fetch
  // ================================
  useEffect(() => {
    const t = setTimeout(fetchJobs, 600);
    return () => clearTimeout(t);
  }, [query, apiLocation, skills]);

  // ================================
  // 🔥 Apply job
  // ================================
  const handleApply = async (job) => {
    if (!token) return;

    try {
      await fetch(`${ML_API_URL}api/analytics/job-application`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          job_title: job.title,
          company: job.company,
          source: job.source,
          url: job.url,
        }),
      });

      const updated = [...appliedJobs, job.url];
      setAppliedJobs(updated);

      localStorage.setItem("appliedJobs", JSON.stringify(updated));

      window.open(job.url, "_blank");

    } catch (err) {
      console.error("Apply error:", err);
    }
  };

  const isApplied = (url) => appliedJobs.includes(url);

  // ================================
  // 🎨 UI
  // ================================
  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="jobrec-page">

        {/* 🔍 Search */}
        <section className="jobrec-search">
          <input
            className="jobrec-input"
            placeholder="Search job / skill..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <input
            className="jobrec-input"
            placeholder="Location (e.g Pune)"
            value={apiLocation}
            onChange={(e) => setApiLocation(e.target.value)}
          />
        </section>

        {/* 📍 Showing current location */}
        <p style={{ fontSize: 12, color: "gray", marginLeft: 10 }}>
          📍 Searching in: {apiLocation || "India"}
        </p>

        {/* 🔥 Results */}
        <main className="jobrec-main">
          {loading ? (
            <div className="empty-state">
              <div className="spinner" />
              <p>Finding best jobs for you...</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <h3>{error}</h3>
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <h3>No jobs found 😕</h3>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="jobrec-count">💼 {jobs.length} recommended jobs</p>

              <div className="job-grid">
                {jobs.map((job, i) => (
                  <motion.div
                    key={i}
                    className="job-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >

                    {/* 🔥 Badges */}
                    <div className="job-card-badges">
                      <span className="badge badge-source">{job.source}</span>

                      {job.match && (
                        <span className="badge badge-match">
                          🔥 {job.match}% Match
                        </span>
                      )}
                    </div>

                    <h3>{job.title}</h3>
                    <p>🏢 {job.company}</p>
                    <p>📍 {job.location}</p>

                    {/* 🔥 Apply */}
                    {isApplied(job.url) ? (
                      <button className="btn btn-success" disabled>
                        ✅ Applied
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleApply(job)}
                      >
                        Apply Now ↗
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}