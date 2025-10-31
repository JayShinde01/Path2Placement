import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../page_style/register.css";
import Navbar from "../components/Navbar"

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", form);
      console.log(res.data);
      alert("Registered Successfully!");
      navigate("/login");
    } catch (err) {
      alert("Registration Failed!");
    }
  };

  return (
    <>
    <Navbar/>
<div className="register-page">
      <div className="register-container">
        <h2 className="register-title">Create Your Account 🚀</h2>
        <p className="register-subtitle">Join PlacementAI and start your placement journey</p>

        <form onSubmit={handleSubmit} className="register-form">
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Create Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="register-btn">
            Create Account
          </button>
        </form>

        <p className="login-text">
          Already have an account?{" "}
          <Link to="/login" className="login-link">Login here</Link>
        </p>
      </div>
    </div>
    </>
    
  );
}
