import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import "../page_style/jobrecommendation.css";
import { ML_API_URL } from "../api";

export default function JobRecommendation() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("Python");
  const [apiLocation, setApiLocation] = useState("");

  const [filters, setFilters] = useState({
    source: "all",
    workMode: "all",
    jobType: "all",
    experience: "all",
    skillSearch: "",
    locationSearch: "",
    salaryOnly: false,
  });

  const handleFilterChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFilters((f) => ({ ...f, [e.target.name]: value }));
  };

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${ML_API_URL}jobs?query=${encodeURIComponent(query)}&location=${encodeURIComponent(apiLocation)}`
      );
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setJobs(data.results || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Could not load jobs. Make sure the ML service is running.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced auto-fetch on query/location change
  useEffect(() => {
    const t = setTimeout(fetchJobs, 600);
    return () => clearTimeout(t);
  }, [query, apiLocation]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const t   = (job.title    || "").toLowerCase();
      const l   = (job.location || "").toLowerCase();
      const s   = (job.source   || "").toLowerCase();
      const desc = (job.description || "").toLowerCase();

      if (filters.source !== "all" && s !== filters.source) return false;
      if (filters.workMode === "remote" && !t.includes("remote") && !l.includes("remote")) return false;
      if (filters.workMode === "onsite" && (t.includes("remote") || l.includes("remote") || l.includes("hybrid"))) return false;
      if (filters.jobType === "internship" && !t.includes("intern") && !t.includes("fresher")) return false;
      if (filters.jobType === "fulltime" && (t.includes("intern") || t.includes("contract"))) return false;
      if (filters.experience === "fresher" && !t.includes("fresher") && !t.includes("junior") && !t.includes("entry")) return false;
      if (filters.experience === "senior" && !t.includes("senior") && !t.includes("lead") && !t.includes("manager")) return false;
      if (filters.skillSearch) {
        const sk = filters.skillSearch.toLowerCase();
        if (!t.includes(sk) && !desc.includes(sk)) return false;
      }
      if (filters.locationSearch && !l.includes(filters.locationSearch.toLowerCase())) return false;
      if (filters.salaryOnly && !job.salary && !desc.includes("₹") && !desc.includes("$")) return false;
      return true;
    });
  }, [jobs, filters]);

  const clearFilters = () =>
    setFilters({ source: "all", workMode: "all", jobType: "all", experience: "all",
                 skillSearch: "", locationSearch: "", salaryOnly: false });

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="jobrec-page">
        {/* Search bar */}
        <section className="jobrec-search">
          <input
            type="text"
            className="jobrec-input"
            placeholder="Search by job title, skill or company…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <input
            type="text"
            className="jobrec-input jobrec-input-location"
            placeholder="Location (e.g. Pune, India)…"
            value={apiLocation}
            onChange={(e) => setApiLocation(e.target.value)}
          />
        </section>

        {/* Filters */}
        <section className="jobrec-filters">
          <div className="jobrec-filter-row">
            <input
              type="text"
              name="skillSearch"
              className="jobrec-input"
              placeholder="🔍 Narrow by skill…"
              value={filters.skillSearch}
              onChange={handleFilterChange}
            />
            <input
              type="text"
              name="locationSearch"
              className="jobrec-input"
              placeholder="📍 Narrow by city…"
              value={filters.locationSearch}
              onChange={handleFilterChange}
            />
            <label className="jobrec-checkbox">
              <input type="checkbox" name="salaryOnly" checked={filters.salaryOnly} onChange={handleFilterChange} />
              💰 Salary disclosed
            </label>
          </div>

          <div className="jobrec-filter-row">
            {[
              { name: "workMode",   options: [["all","🌍 All Modes"],["remote","🏠 Remote"],["onsite","🏢 On-site"]] },
              { name: "jobType",    options: [["all","🎓 All Types"],["internship","🌱 Internship"],["fulltime","💼 Full-Time"]] },
              { name: "experience", options: [["all","📈 All Levels"],["fresher","👶 Fresher"],["senior","👑 Senior"]] },
              { name: "source",     options: [["all","🌐 All Sources"],["adzuna","Adzuna"],["jsearch","JSearch"]] },
            ].map(({ name, options }) => (
              <select key={name} name={name} className="jobrec-select" value={filters[name]} onChange={handleFilterChange}>
                {options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            ))}
            <button className="btn btn-danger btn-sm" onClick={clearFilters}>❌ Reset</button>
          </div>
        </section>

        {/* Results */}
        <main className="jobrec-main">
          {loading ? (
            <div className="empty-state">
              <div className="spinner" />
              <p style={{ marginTop: 16 }}>Searching for <strong>{query || "jobs"}</strong>…</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <h3>⚠️ {error}</h3>
              <button className="btn btn-primary btn-sm" onClick={fetchJobs} style={{ marginTop: 12 }}>Retry</button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="empty-state">
              <h3>No jobs match these filters 😕</h3>
              <button className="btn btn-primary btn-sm" onClick={clearFilters} style={{ marginTop: 12 }}>Clear Filters</button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="jobrec-count">💼 {filteredJobs.length} jobs found</p>
              <div className="job-grid">
                {filteredJobs.map((job, i) => (
                  <motion.div
                    key={i}
                    className="job-card"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.4) }}
                  >
                    <div className="job-card-badges">
                      <span className="badge badge-source">{job.source}</span>
                      {(job.title?.toLowerCase().includes("remote") || job.location?.toLowerCase().includes("remote")) &&
                        <span className="badge badge-remote">Remote</span>}
                      {(job.title?.toLowerCase().includes("fresher") || job.title?.toLowerCase().includes("intern")) &&
                        <span className="badge badge-fresher">Fresher</span>}
                    </div>
                    <h3 className="job-title">{job.title}</h3>
                    <p className="job-company">🏢 {job.company}</p>
                    <p className="job-location">📍 {job.location}</p>
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ marginTop: "auto", width: "100%", borderRadius: 8 }}
                      onClick={() => {
                        const token = localStorage.getItem("token");
                        if (token) {
                          fetch(`${ML_API_URL}api/analytics/job-application`, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              job_title: job.title,
                              company:   job.company,
                              source:    job.source,
                              url:       job.url,
                            }),
                          }).catch(() => {});
                        }
                      }}
                    >
                      Apply Now ↗
                    </a>
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
