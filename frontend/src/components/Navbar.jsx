import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../page_style/navbar.css";

export default function Navbar() {
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setUserName(null);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <h2>
          Placement<span>AI</span>
        </h2>
      </div>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/resume">Resume Builder</Link></li>
        <li><Link to="/job-recommendation">Job Roles</Link></li>
        <li><Link to="/codinghome">Coding Practice</Link></li>
        <li><Link to="/interview">AI Interview</Link></li>
        <li><Link to="/reports">Reports</Link></li>
      </ul>

      <div className="nav-buttons">
        {!userName ? (
          <>
            <Link to="/login" className="btn small-btn">Login</Link>
            <Link to="/register" className="btn small-btn outline">Register</Link>
          </>
        ) : (
          <div className="user-section">
            <span className="user-name">👋 {userName}</span>
            <button onClick={handleLogout} className="btn small-btn logout-btn">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
