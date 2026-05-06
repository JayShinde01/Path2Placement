import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ML_API_URL } from "../api";
import "../page_style/templates.css";

const TEMPLATE_META = {
  Template1: { label: "Navy Sidebar",    color: "#1f4e8c", tag: "Professional", desc: "Clean two-column layout with a bold navy sidebar. Perfect for corporate roles." },
  Template2: { label: "Classic Elegant", color: "#b45309", tag: "Executive",    desc: "Timeless black header with gold accents. Ideal for senior and executive positions." },
  Template3: { label: "Modern Teal",     color: "#0f766e", tag: "Modern",       desc: "Gradient banner with skill bars. Great for tech and design professionals." },
  Template4: { label: "Creative Purple", color: "#7c3aed", tag: "Creative",     desc: "Bold purple accents with a clean grid layout. Stand out in creative fields." },
  Template5: { label: "Bold Red",        color: "#dc2626", tag: "Dynamic",      desc: "High-contrast red sidebar with project cards. Perfect for energetic profiles." },
  Template6: { label: "Dark Tech",       color: "#0ea5e9", tag: "Developer",    desc: "Dark developer-themed resume with code-style formatting. Built for engineers." },
};

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${ML_API_URL}api/templates`)
      .then((res) => setTemplates(res.data))
      .catch(() => {
        // Fallback to local list if API is down
        setTemplates(Object.keys(TEMPLATE_META).map((id) => ({ _id: id, name: TEMPLATE_META[id].label })));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (templateId) => {
    const token = localStorage.getItem("token");
    const resumeData = JSON.parse(localStorage.getItem("resumeData"));

    if (!token) return alert("Please login first");
    if (!resumeData) return alert("Please fill in your resume details first (go to Dashboard)");

    setSaving(templateId);
    try {
      await axios.post(
        `${ML_API_URL}api/resumes`,
        { templateId, data: resumeData },
        { headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" } }
      );
      navigate(`/template/${templateId}`, { state: { data: resumeData } });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        navigate("/login");
      } else {
        // Still navigate even if save fails — resume data is in localStorage
        navigate(`/template/${templateId}`, { state: { data: resumeData } });
      }
    } finally {
      setSaving(null);
    }
  };

  const handlePreview = (templateId) => {
    const resumeData = JSON.parse(localStorage.getItem("resumeData"));
    navigate(`/template/${templateId}`, { state: { data: resumeData } });
  };

  return (
    <>
      <Navbar />
      <div className="templates-page">
        <div className="templates-hero">
          <h1 className="templates-hero-title">Choose Your Resume Template</h1>
          <p className="templates-hero-sub">6 professionally designed templates. Pick one, preview it, and download instantly.</p>
        </div>

        {loading ? (
          <div className="templates-loading">
            <div className="tpl-spinner" />
            <p>Loading templates…</p>
          </div>
        ) : (
          <div className="templates-grid-new">
            {Object.entries(TEMPLATE_META).map(([id, meta]) => (
              <div key={id} className="template-card-new" style={{ "--accent": meta.color }}>
                <div className="tpl-preview-area" style={{ background: `linear-gradient(135deg, ${meta.color}22 0%, ${meta.color}08 100%)`, borderBottom: `3px solid ${meta.color}` }}>
                  <div className="tpl-mock">
                    <div className="tpl-mock-header" style={{ background: meta.color }} />
                    <div className="tpl-mock-body">
                      <div className="tpl-mock-sidebar" style={{ background: `${meta.color}22` }} />
                      <div className="tpl-mock-content">
                        {[80, 60, 90, 50, 70].map((w, i) => (
                          <div key={i} className="tpl-mock-line" style={{ width: `${w}%`, background: i === 0 ? meta.color : "#e2e8f0" }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="tpl-tag" style={{ background: meta.color }}>{meta.tag}</span>
                </div>

                <div className="tpl-card-body">
                  <h3 className="tpl-name">{meta.label}</h3>
                  <p className="tpl-desc">{meta.desc}</p>
                  <div className="tpl-actions">
                    <button className="tpl-btn-preview" onClick={() => handlePreview(id)}>
                      👁 Preview
                    </button>
                    <button
                      className="tpl-btn-use"
                      style={{ background: meta.color }}
                      onClick={() => handleSelect(id)}
                      disabled={saving === id}
                    >
                      {saving === id ? "Saving…" : "Use This →"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
