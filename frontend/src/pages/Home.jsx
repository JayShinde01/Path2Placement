import { Link } from "react-router-dom";
import "../page_style/home.css";
import Navbar from "../components/Navbar";   // ⬅️ Import Navbar

export default function Home() {
  return (
    <div className="home-page">
      <Navbar />   {/* ⬅️ Add Navbar here */}

      <div className="home-container">
        <h1 className="home-title">AI-Powered Placement Preparation System</h1>
        <p className="home-subtitle">
          Optimize your resume, practice coding, and simulate interviews — all in one intelligent platform.
        </p>

       
      </div>
    </div>
  );
}
