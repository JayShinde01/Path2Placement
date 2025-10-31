import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../page_style/templates.css"; // 👈 custom CSS file
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../api";

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}api/templates`)
      .then((res) => setTemplates(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handleSelect = async (templateId) => {
    const token = localStorage.getItem("token");
    const resumeData = JSON.parse(localStorage.getItem("resumeData"));

    if (!token) return alert("Please login first");
    if (!resumeData) return alert("Please fill resume details first");

    try {
      await axios.post(
        `${API_BASE_URL}api/resumes`,
        { templateId, data: resumeData },
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );

      navigate(`/template/${templateId}`, { state: { data: resumeData } });
    } catch (err) {
      console.error(err);
      alert("Error while creating resume");
    }
  };

  return (
     <>
    <Navbar/>
    <div className="templates-container">
      <h1 className="templates-title">Choose a Resume Template</h1>

      <div className="templates-grid">
        <div className="template-card">
          <img src="/t1.jpg" alt="Template 1" className="template-image" />
          <button
            onClick={() => handleSelect("Template1")}
            className="template-btn"
          >
            Use Template 1
          </button>
        </div>

        <div className="template-card">
          <img src="/t2.jpg" alt="Template 2" className="template-image" />
          <button
            onClick={() => handleSelect("Template2")}
            className="template-btn"
          >
            Use Template 2
          </button>
        </div>

        <div className="template-card">
          <img src="/t3.jpg" alt="Template 3" className="template-image" />
          <button
            onClick={() => handleSelect("Template3")}
            className="template-btn"
          >
            Use Template 3
          </button>
        </div>
      </div>
    </div>
  
    </>
  );
}
