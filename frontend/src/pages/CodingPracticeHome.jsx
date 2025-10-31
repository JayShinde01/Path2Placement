import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function CodingPracticeHome() {
  return (
   <>
   <Navbar/>
    <div
      style={{
        backgroundColor: "#0f172a",
        minHeight: "100vh",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px",
      }}
    >
      <h1 style={{ fontSize: "36px", marginBottom: "20px" }}>Welcome to Coding Practice</h1>
      <p style={{ color: "#94a3b8", maxWidth: "600px", marginBottom: "40px", fontSize: "18px" }}>
        Improve your coding skills with real-world algorithm problems.
        Choose a problem, write your solution, and test your logic instantly.
      </p>

      <Link
        to="/coding"
        style={{
          backgroundColor: "#2563eb",
          color: "white",
          padding: "14px 30px",
          fontSize: "16px",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "bold",
          transition: "0.3s",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#2563eb")}
      >
        🚀 Start Practicing
      </Link>
    </div>
   </>
  );
}

export default CodingPracticeHome;
