import { Link } from "react-router-dom";
import "../page_style/home.css";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="home-page">
      <Navbar />

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            AI-Powered <span>Placement Preparation</span> System
          </h1>
          <p className="hero-subtitle">
            Optimize your resume, sharpen coding skills, and ace interviews —
            all with the power of Artificial Intelligence.
          </p>

          <div className="button-group">
            <Link to="/resume" className="btn primary-btn">
              🚀 Smart Resume Builder
            </Link>
            <Link to="/coding" className="btn secondary-btn">
              💻 Coding Practice
            </Link>
            <Link to="/interview" className="btn success-btn">
              🎯 Mock Interviews
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">What Makes Path2Placement Special?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>🧠 AI Resume Scoring</h3>
            <p>
              Get personalized resume feedback and improve your chances of
              shortlisting instantly.
            </p>
          </div>
          <div className="feature-card">
            <h3>👨‍💻 Real Coding Problems</h3>
            <p>
              Solve curated coding challenges and build logic like top software
              engineers.
            </p>
          </div>
          <div className="feature-card">
            <h3>🎤 Interview Simulator</h3>
            <p>
              Practice AI-driven mock interviews with performance analysis and
              improvement tips.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
