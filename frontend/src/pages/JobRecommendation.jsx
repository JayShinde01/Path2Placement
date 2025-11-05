import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "../page_style/jobrecommendation.css";
import { ML_API_URL } from "../api";

export default function JobRecommendation() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("python");
  const [location, setLocation] = useState("");
  const [source, setSource] = useState("all");

  // fetch job data from your FastAPI backend
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${ML_API_URL}jobs?query=${query}&location=${location}`
      );
      const data = await response.json();
      setJobs(data.results || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // filtered jobs
  const filteredJobs = jobs.filter((job) =>
    source === "all" ? true : job.source?.toLowerCase() === source.toLowerCase()
  );

  return (
    <motion.div
      className="jobrec-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <header className="jobrec-header">
        <Link to="/" className="back-btn">← Back</Link>
        <div className="brand">Placement<span>AI</span></div>
      </header>

      {/* Filter section */}
      <section className="filters-section">
        <input
          type="text"
          placeholder="Search by keyword (e.g., Python, React)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location (optional)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <select value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="all">All Sources</option>
          <option value="adzuna">Adzuna</option>
          <option value="linkedin">LinkedIn</option>
          <option value="indeed">Indeed</option>
          <option value="jooble">Jooble</option>
          <option value="jsearch">JSearch</option>  
          
        </select>
        <button onClick={fetchJobs}>🔍 Search</button>
      </section>

      {/* Job List */}
      <main className="jobrec-main">
        {loading ? (
          <div className="loader"></div>
        ) : filteredJobs.length === 0 ? (
          <motion.div
            className="jobrec-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2>No jobs found 😕</h2>
            <p>Try changing filters or keywords!</p>
          </motion.div>
        ) : (
          <motion.div
            className="job-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h1>💼 Recommended Jobs ({filteredJobs.length})</h1>
            <div className="job-grid">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={index}
                  className="job-card"
                  whileHover={{ scale: 1.03, y: -5 }}
                >
                  <div className="job-card-header">
                    <h3>{job.title}</h3>
                    <span className="badge">{job.source}</span>
                  </div>
                  <p className="company">{job.company}</p>
                  <p className="location">📍 {job.location}</p>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="apply-btn"
                  >
                    View Job →
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      <footer className="footer-note">© 2025 PlacementAI – Smart Career Match</footer>
    </motion.div>
  );
}
