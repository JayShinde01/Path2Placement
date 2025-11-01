import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "../page_style/reports.css";

export default function Reports() {
  return (
    <motion.div
      className="reports-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className="reports-header">
        <Link to="/" className="back-btn">
          ← Back
        </Link>
        <div className="brand">PlacementAI</div>
      </header>

      <main className="reports-main">
        <motion.div
          className="reports-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h1>📊 Reports & Analytics</h1>
          <p>
            This section will soon display your performance trends, coding scores, and AI interview insights.
          </p>
          <div className="loader"></div>
          <Link to="/" className="home-btn">
            Back to Dashboard
          </Link>
        </motion.div>
      </main>

      <footer className="footer-note">PlacementAI © 2025</footer>
    </motion.div>
  );
}
