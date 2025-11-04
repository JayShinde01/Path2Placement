import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "../page_style/jobrecommendation.css";

export default function JobRecommendation() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch job data from your FastAPI backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/jobs?query=python");
        const data = await response.json();
        setJobs(data.results || []);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <motion.div
      className="jobrec-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className="jobrec-header">
        <Link to="/" className="back-btn">
          ← Back
        </Link>
        <div className="brand">PlacementAI</div>
      </header>

      <main className="jobrec-main">
        {loading ? (
          <div className="loader"></div>
        ) : jobs.length === 0 ? (
          <motion.div
            className="jobrec-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2>No jobs found 😕</h2>
            <p>Try searching with a different keyword!</p>
          </motion.div>
        ) : (
          <motion.div
            className="job-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h1>💼 Recommended Jobs ({jobs.length})</h1>
            <div className="job-grid">
              {jobs.map((job, index) => (
                <motion.div
                  key={index}
                  className="job-card"
                  whileHover={{ scale: 1.05 }}
                >
                  <h3>{job.title}</h3>
                  <p className="company">{job.company}</p>
                  <p className="location">{job.location}</p>
                  <p className="source">Source: {job.source}</p>
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

      <footer className="footer-note">PlacementAI © 2025</footer>
    </motion.div>
  );
}
