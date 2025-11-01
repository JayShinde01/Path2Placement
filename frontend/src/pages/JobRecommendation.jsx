import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "../page_style/jobrecommendation.css";

export default function JobRecommendation() {
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
        <motion.div
          className="jobrec-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h1>🚧 Job Recommendation</h1>
          <p>
            We’re building this feature to suggest the best job roles for you
            based on your resume and coding performance.
          </p>
          <div className="loader"></div>
          <Link to="/" className="home-btn">
            Go to Home
          </Link>
        </motion.div>
      </main>

      <footer className="footer-note">PlacementAI © 2025</footer>
    </motion.div>
  );
}
