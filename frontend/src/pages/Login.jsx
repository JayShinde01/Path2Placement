import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../page_style/login.css";
import { AUTH_API_URL } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${AUTH_API_URL}api/auth/login`, { email, password });
      localStorage.setItem("userName", res.data.user.name);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* BACKGROUND SHAPES */}
      <div className="bg-shape s1"></div>
      <div className="bg-shape s2"></div>
      <div className="bg-shape s3"></div>

      {/* LEFT */}
      <div className="auth-left">
        <div className="brand">
          <h1>Path<span>2</span>Placement</h1>
          <p>AI-powered career growth platform</p>
        </div>

        <div className="features">
          <div className="feature-item"><span role="img" aria-label="rocket">🚀</span> Smart Resume Analysis</div>
          <div className="feature-item"><span role="img" aria-label="target">🎯</span> Job Recommendations</div>
          <div className="feature-item"><span role="img" aria-label="brain">🧠</span> Mock Interviews</div>
          <div className="feature-item"><span role="img" aria-label="chart">📊</span> Skill Gap Tracking</div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="auth-right">
        <div className="glass-card">
          <div className="logo">Path<span>2</span>Placement</div>

          <h2>Welcome Back</h2>
          <p className="sub">Login to continue your journey</p>

          {error && (
            <div className="error" aria-live="polite">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? <span className="loader"></span> : "Login"}
            </button>
          </form>

          <p className="footer">
            New here? <Link to="/register">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
