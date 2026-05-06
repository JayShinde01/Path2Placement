import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../page_style/login.css";
import { AUTH_API_URL } from "../api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic client-side validation
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    setLoading(true);
    try {
      await axios.post(`${AUTH_API_URL}api/auth/register`, form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Background blobs */}
      <div className="bg-shape s1"></div>
      <div className="bg-shape s2"></div>
      <div className="bg-shape s3"></div>

      {/* LEFT SIDE */}
      <div className="auth-left">
        <div className="brand">
          <h1>Join Path<span>2</span>Placement</h1>
          <p>Create an account and start your AI-powered career journey</p>
        </div>

        <div className="features">
          <div className="feature-item"><span role="img" aria-label="rocket">🚀</span> Resume Builder</div>
          <div className="feature-item"><span role="img" aria-label="target">🎯</span> Smart Job Matching</div>
          <div className="feature-item"><span role="img" aria-label="brain">🧠</span> AI Mock Interviews</div>
          <div className="feature-item"><span role="img" aria-label="chart">📊</span> Skill Analytics</div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right">
        <div className="glass-card">
          <div className="logo">Path<span>2</span>Placement</div>

          <h2>Create Account</h2>
          <p className="sub">Start your placement journey</p>

          {error && (
            <div className="error" aria-live="polite">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                name="name"
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group password-group">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 6 chars)"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <span className="loader"></span> : "Create Account"}
            </button>
          </form>

          <p className="footer">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}