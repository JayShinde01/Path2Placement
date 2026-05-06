import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import Navbar from "../components/Navbar";
import axios from "axios";
import { ML_API_URL } from "../api";
import "../page_style/reports.css";

// ─── colour palette ───────────────────────────────────────────────────────
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];
const TOOLTIP = {
  backgroundColor: "#1e293b",
  border: "1px solid #334155",
  color: "#f8fafc",
  borderRadius: "8px",
  fontSize: "13px",
};
const REPORTS_CACHE_KEY = "placementai:reports-summary:v1";

const readCache = () => {
  try {
    const raw = localStorage.getItem(REPORTS_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeCache = (value) => {
  try {
    localStorage.setItem(REPORTS_CACHE_KEY, JSON.stringify(value));
  } catch {
    // Ignore storage quota / privacy mode issues.
  }
};

const emptyReportsData = {
  readiness_score: 0,
  resume: { avg_score: 0, trend: [], total_scans: 0, top_missing: [], top_matched: [], last_suggestions: "" },
  coding: { accuracy_pct: 0, lang_chart: [], total_solved: 0, total_attempts: 0 },
  interview: { total_sessions: 0, roles_practiced: [], feedback_count: 0, recent_feedback: [] },
  jobs: { total_saved: 0, source_counts: [], recent: [] },
  skill_gap: [],
  recommendations: [],
};

const normalizeReportsData = (value) => {
  const source = value?.data ?? value ?? {};
  return {
    ...emptyReportsData,
    ...source,
    resume: { ...emptyReportsData.resume, ...(source.resume || {}) },
    coding: { ...emptyReportsData.coding, ...(source.coding || {}) },
    interview: { ...emptyReportsData.interview, ...(source.interview || {}) },
    jobs: { ...emptyReportsData.jobs, ...(source.jobs || {}) },
    skill_gap: Array.isArray(source.skill_gap) ? source.skill_gap : [],
    recommendations: Array.isArray(source.recommendations) ? source.recommendations : [],
  };
};

// ─── tiny helpers ─────────────────────────────────────────────────────────
const pct = (n) => `${n}%`;
const priorityColor = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };

function EmptyCard({ label }) {
  return (
    <div className="empty-card">
      <span>📭</span>
      <p>No {label} data yet.<br />Start using the app to see insights here.</p>
    </div>
  );
}

function StatRow({ label, value, color }) {
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <span className="stat-value" style={color ? { color } : {}}>
        {value}
      </span>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────
export default function Reports() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [data, setData] = useState(() => normalizeReportsData(readCache()));
  const [loading, setLoading] = useState(() => !readCache());
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = async (background = false) => {
    if (!token) return;
    const hasCachedData = Boolean(readCache());
    if (background && hasCachedData) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await axios.get(`${ML_API_URL}api/analytics/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const nextData = normalizeReportsData(res.data);
      setData(nextData);
      writeCache({ data: nextData, savedAt: Date.now() });
    } catch (err) {
      console.error(err);
      if (!hasCachedData) {
        setError(
          err.response?.status === 401
            ? "Session expired. Please login again."
            : "Could not load analytics. Make sure the ML service is running."
        );
      } else {
        setError(
          err.response?.status === 401
            ? "Using saved analytics. Sign in again to refresh live data."
            : "Using saved analytics while the live refresh is unavailable."
        );
      }
    } finally {
      if (background && hasCachedData) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchSummary(Boolean(readCache()));
  }, []);

  // ── auth gate ────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="page-wrapper page-dark">
        <Navbar />
        <div className="reports-page">
          <div className="auth-banner">
            <h3>🔒 Login required</h3>
            <p>Please log in to view your analytics report.</p>
            <button className="btn btn-primary" onClick={() => navigate("/login")}>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── loading ──────────────────────────────────────────────────────────
  if (loading && !data) {
    return (
      <div className="page-wrapper page-dark">
        <Navbar />
        <div className="reports-page" style={{ justifyContent: "center", alignItems: "center" }}>
          <div className="spinner" style={{ marginTop: 80 }} />
          <p style={{ color: "var(--dark-muted)", marginTop: 16, textAlign: "center" }}>
            Loading your analytics…
          </p>
        </div>
      </div>
    );
  }

  // ── error ────────────────────────────────────────────────────────────
  if (error && !data) {
    return (
      <div className="page-wrapper page-dark">
        <Navbar />
        <div className="reports-page">
          <div className="empty-state">
            <h3>⚠️ {error}</h3>
            <button className="btn btn-primary btn-sm" onClick={fetchSummary} style={{ marginTop: 16 }}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { readiness_score, resume, coding, interview, jobs, skill_gap, recommendations } = normalizeReportsData(data);

  // ── skill gap chart data ─────────────────────────────────────────────
  const gapChartData = skill_gap
    .filter((s) => !s.have)
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 10)
    .map((s) => ({ name: s.skill, demand: s.demand }));

  const radarData = skill_gap
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 8)
    .map((s) => ({
      skill: s.skill,
      market: s.demand,
      you: s.have ? Math.min(s.demand, 85) : 20,
    }));

  return (
    <div className="page-wrapper page-dark">
      <Navbar />

      <div className="reports-page">
        <motion.div className="reports-dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

          {/* ── Header ── */}
          <div className="dashboard-title">
            <h1>📊 Your Performance Analytics</h1>
            <p>All data is pulled live from your activity — resume scans, coding practice, and mock interviews.</p>
            {refreshing && <p className="reports-cache-note">Refreshing from the server while showing your latest saved snapshot.</p>}
            {error && data && <p className="reports-cache-note">Showing saved analytics because the latest refresh failed.</p>}
          </div>

          {/* ── Row 1: Readiness + Resume Trend ── */}
          <div className="top-grid">
            <motion.div className="stat-card score-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
              <h2>Readiness Score</h2>
              <div className="score-number">{readiness_score}%</div>
              <p className="score-note">
                Resume {resume.avg_score}% · Coding {coding.accuracy_pct}% · Interviews {interview.total_sessions}
              </p>
              <div className="readiness-bar-wrap">
                <div className="readiness-bar" style={{ width: pct(readiness_score) }} />
              </div>
            </motion.div>

            <motion.div className="stat-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
              <h3 className="card-heading blue">📈 Resume Score Trend</h3>
              {resume.trend.length === 0 ? (
                <EmptyCard label="resume scan" />
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
                    <LineChart data={resume.trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="label" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[0, 100]} />
                      <Tooltip contentStyle={TOOLTIP} />
                      <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3}
                        dot={{ r: 4, fill: "#3b82f6" }} activeDot={{ r: 7 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="card-footer">
                <StatRow label="Total Scans"   value={resume.total_scans} />
                <StatRow label="Avg ATS Score" value={pct(resume.avg_score)} color="#3b82f6" />
              </div>
            </motion.div>
          </div>

          {/* ── Row 2: Coding + Interview + Jobs ── */}
          <div className="stats-grid">

            {/* Coding */}
            <motion.div className="stat-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <h3 className="card-heading blue">💻 Coding Activity</h3>
              {coding.lang_chart.length === 0 ? (
                <EmptyCard label="coding" />
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
                    <PieChart>
                      <Pie data={coding.lang_chart} innerRadius={36} outerRadius={65} paddingAngle={4} dataKey="value">
                        {coding.lang_chart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP} />
                      <Legend iconSize={10} wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="card-footer">
                <StatRow label="Solved / Attempted" value={`${coding.total_solved} / ${coding.total_attempts}`} />
                <StatRow label="Accuracy"           value={pct(coding.accuracy_pct)} color="#10b981" />
              </div>
            </motion.div>

            {/* Interview */}
            <motion.div className="stat-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
              <h3 className="card-heading purple">🎙️ Interview Practice</h3>
              {interview.total_sessions === 0 ? (
                <EmptyCard label="interview" />
              ) : (
                <div className="interview-stats-body">
                  <div className="big-stat">{interview.total_sessions}</div>
                  <div className="big-stat-label">Sessions</div>
                  {interview.roles_practiced.length > 0 && (
                    <div className="tag-container" style={{ marginTop: 12 }}>
                      {interview.roles_practiced.slice(0, 4).map((r, i) => (
                        <span key={i} className="tag tag-purple">{r}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="card-footer">
                <StatRow label="Feedback Received" value={interview.feedback_count} />
                {interview.recent_feedback[0] && (
                  <p className="feedback-snippet">
                    💬 "{interview.recent_feedback[0].slice(0, 100)}…"
                  </p>
                )}
              </div>
            </motion.div>

            {/* Jobs */}
            <motion.div className="stat-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <h3 className="card-heading green">💼 Job Activity</h3>
              {jobs.total_saved === 0 ? (
                <EmptyCard label="job application" />
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
                    <BarChart data={jobs.source_counts} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={TOOLTIP} cursor={{ fill: "#334155", opacity: 0.4 }} />
                      <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="card-footer">
                <StatRow label="Jobs Saved" value={jobs.total_saved} />
                {jobs.recent[0] && (
                  <p className="feedback-snippet">
                    🏢 {jobs.recent[0].title} @ {jobs.recent[0].company || "—"}
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* ── Row 3: Skill Gap ── */}
          <div className="full-row-grid">

            {/* Missing skills bar chart */}
            <motion.div className="stat-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
              <h3 className="card-heading pink">🎯 Market Demand vs Your Skills</h3>
              <p className="card-sub">Skills you're missing that employers want most</p>
              {gapChartData.length === 0 ? (
                <div className="empty-card">
                  <span>🏆</span>
                  <p>You have all the top market skills! Keep it up.</p>
                </div>
              ) : (
                <div className="chart-container-tall">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260}>
                    <BarChart data={gapChartData} layout="vertical" margin={{ top: 4, right: 20, left: 80, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 12 }} width={76} />
                      <Tooltip contentStyle={TOOLTIP} formatter={(v) => [`${v}% demand`, "Market"]} />
                      <Bar dataKey="demand" fill="#f472b6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>

            {/* Radar: you vs market */}
            <motion.div className="stat-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
              <h3 className="card-heading blue">🕸️ Skill Coverage Radar</h3>
              <p className="card-sub">Your coverage vs market demand (top 8 skills)</p>
              <div className="chart-container-tall">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Radar name="Market" dataKey="market" stroke="#f472b6" fill="#f472b6" fillOpacity={0.15} />
                    <Radar name="You"    dataKey="you"    stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                    <Tooltip contentStyle={TOOLTIP} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* ── Row 4: Missing skills tags + Matched skills ── */}
          <div className="stats-grid">
            <motion.div className="stat-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }}>
              <h3 className="card-heading pink">⚠️ Most Frequent Missing Skills</h3>
              {resume.top_missing.length === 0 ? (
                <EmptyCard label="missing skill" />
              ) : (
                <div className="tag-container" style={{ marginTop: 8 }}>
                  {resume.top_missing.map((s, i) => (
                    <span key={i} className="tag tag-red">
                      + {s.skill} <span className="tag-count">×{s.count}</span>
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div className="stat-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
              <h3 className="card-heading green">✅ Your Strongest Skills</h3>
              {resume.top_matched.length === 0 ? (
                <EmptyCard label="matched skill" />
              ) : (
                <div className="tag-container" style={{ marginTop: 8 }}>
                  {resume.top_matched.map((s, i) => (
                    <span key={i} className="tag tag-green">
                      {s.skill} <span className="tag-count">×{s.count}</span>
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div className="stat-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.55 }}>
              <h3 className="card-heading blue">💡 Last AI Suggestion</h3>
              {resume.last_suggestions ? (
                <p className="suggestion-text">{resume.last_suggestions}</p>
              ) : (
                <EmptyCard label="suggestion" />
              )}
            </motion.div>
          </div>

          {/* ── Row 5: AI Recommendations ── */}
          <motion.div className="stat-card recs-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
            <h3 className="card-heading blue">🤖 AI-Powered Recommendations</h3>
            <div className="recs-grid">
              {recommendations.map((rec, i) => (
                <div key={i} className="rec-item" style={{ borderLeftColor: priorityColor[rec.priority] }}>
                  <div className="rec-header">
                    <span className="rec-area">{rec.area}</span>
                    <span className="rec-priority" style={{ color: priorityColor[rec.priority] }}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="rec-action">{rec.action}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </motion.div>

        <footer className="reports-footer">PlacementAI © 2026</footer>
      </div>
    </div>
  );
}
