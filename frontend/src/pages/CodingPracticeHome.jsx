import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function CodingPracticeHome() {
  return (
    <div className="page-wrapper page-dark">
      <Navbar />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "60px 24px",
          color: "var(--dark-text)",
        }}
      >
        <h1 style={{ fontSize: "2.2rem", marginBottom: "16px" }}>
          💻 Welcome to Coding Practice
        </h1>
        <p style={{ color: "var(--dark-muted)", maxWidth: "560px", marginBottom: "40px", fontSize: "1.05rem", lineHeight: 1.6 }}>
          Improve your coding skills with real-world algorithm problems.
          Choose a problem, write your solution, and test your logic instantly.
        </p>
        <Link to="/coding" className="btn btn-primary" style={{ fontSize: "1rem", padding: "12px 32px" }}>
          🚀 Start Practicing
        </Link>
      </div>
    </div>
  );
}

export default CodingPracticeHome;
