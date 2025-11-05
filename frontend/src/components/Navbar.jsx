import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../page_style/navbar.css";
import { FaBars, FaTimes } from "react-icons/fa"; // 👈 Add react-icons

export default function Navbar() {
  const [userName, setUserName] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
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
          Path<span>2</span>Place
        </h2>
      </div>

      {/* Hamburger Icon */}
      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>

      <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
        <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
        <li><Link to="/resume" onClick={() => setMenuOpen(false)}>Resume Builder</Link></li>
        <li><Link to="/job-recommendation" onClick={() => setMenuOpen(false)}>Job Roles</Link></li>
        <li><Link to="/codinghome" onClick={() => setMenuOpen(false)}>Coding Practice</Link></li>
        <li><Link to="/interview" onClick={() => setMenuOpen(false)}>AI Interview</Link></li>
        <li><Link to="/reports" onClick={() => setMenuOpen(false)}>Reports</Link></li>

        {/* Show buttons inside menu on mobile */}
        {menuOpen && (
          <div className="mobile-buttons">
            {!userName ? (
              <>
                <Link to="/login" className="small-btn">Login</Link>
                <Link to="/register" className="small-btn outline">Register</Link>
              </>
            ) : (
              <button onClick={handleLogout} className="small-btn logout-btn">
                Logout
              </button>
            )}
          </div>
        )}
      </ul>

      {/* Desktop buttons */}
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
