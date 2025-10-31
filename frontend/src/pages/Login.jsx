import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../page_style/login.css";
import Navbar from "../components/Navbar"


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
console.log(res.data.user.name);
      localStorage.setItem("userName", res.data.user.name);
      localStorage.setItem("token", res.data.token);
      alert("Login successful");
      navigate("/dashboard");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <>
    <Navbar/>
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Welcome Back 👋</h2>
        <p className="login-subtitle">Login to your PlacementAI account</p>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="login-btn">Login</button>
        </form>

        <p className="signup-text">
          Don’t have an account?{" "}
          <Link to="/register" className="signup-link">Register here</Link>
        </p>
      </div>
    </div>
    </>
  );
}
