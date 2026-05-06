import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "../page_style/navbar.css";
import { FaBars, FaTimes } from "react-icons/fa";

const NAV_LINKS = [
  { to: "/",                label: "Home" },
  { to: "/resume",          label: "Resume Builder" },
  { to: "/job-recommendation", label: "Job Roles" },
  { to: "/codinghome",      label: "Coding Practice" },
  { to: "/interview",       label: "AI Interview" },
  { to: "/reports",         label: "Reports" },
];

export default function Navbar() {
  const [userName, setUserName] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  // Re-read auth state whenever the route changes (covers login/logout navigation)
  useEffect(() => {
    const name = localStorage.getItem("userName");
    setUserName(name || null);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setUserName(null);
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <Link to="/" className="logo" onClick={closeMenu} aria-label="Path2Placement home">
        <h2>Path<span>2</span>Place</h2>
      </Link>

      {/* Hamburger */}
      <button
        className="menu-icon"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Links */}
      <ul className={`nav-links ${menuOpen ? "active" : ""}`} role="list">
        {NAV_LINKS.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              onClick={closeMenu}
              className={location.pathname === to ? "active-link" : ""}
            >
              {label}
            </Link>
          </li>
        ))}

        {/* Mobile auth buttons inside menu */}
        {menuOpen && (
          <li className="mobile-buttons">
            {!userName ? (
              <>
                <Link to="/login"    className="btn btn-sm btn-outline" onClick={closeMenu}>Login</Link>
                <Link to="/register" className="btn btn-sm btn-primary"  onClick={closeMenu}>Register</Link>
              </>
            ) : (
              <button onClick={handleLogout} className="btn btn-sm btn-danger">Logout</button>
            )}
          </li>
        )}
      </ul>

      {/* Desktop auth buttons */}
      <div className="nav-buttons">
        {!userName ? (
          <>
            <Link to="/login"    className="btn btn-sm btn-outline">Login</Link>
            <Link to="/register" className="btn btn-sm btn-primary">Register</Link>
          </>
        ) : (
          <div className="user-section">
            <span className="user-name">👋 {userName}</span>
            <button onClick={handleLogout} className="btn btn-sm btn-danger">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}
