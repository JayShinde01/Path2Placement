import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../page_style/login.css";
import { AUTH_API_URL } from "../api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Path<span>2</span>Place</div>
        <h2 className="auth-title">Create Your Account 🚀</h2>
        <p className="auth-subtitle">Join PlacementAI and start your placement journey</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Create Password (min 6 chars)" value={form.password} onChange={handleChange} required minLength={6} />
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Login here</Link>
        </p>
      </div>
    </div>
  );
}
