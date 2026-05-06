import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ML_API_URL } from "../api";
import "../page_style/templates.css";

const TEMPLATE_META = {
  Template1: { label: "Navy Sidebar",       color: "#1f4e8c", tag: "Professional", desc: "Two-column layout with bold navy sidebar. Corporate roles." },
  Template2: { label: "Classic Elegant",    color: "#b45309", tag: "Executive",    desc: "Black header with gold accents. Senior executive positions." },
  Template3: { label: "Modern Teal",        color: "#0f766e", tag: "Modern",       desc: "Gradient banner with skill bars. Tech & design professionals." },
  Template4: { label: "Creative Purple",    color: "#7c3aed", tag: "Creative",     desc: "Purple accents with grid layout. Creative fields." },
  Template5: { label: "Bold Red",           color: "#dc2626", tag: "Dynamic",      desc: "Red sidebar with project cards. Energetic profiles." },
  Template6: { label: "Dark Tech",          color: "#0ea5e9", tag: "Developer",    desc: "Dark developer theme with code formatting. Engineers." },
  Template7: { label: "Minimalist Clean",   color: "#334155", tag: "Minimalist",   desc: "Ultra-clean single column. Left-aligned, no frills." },
  Template8: { label: "Academic Scholar",   color: "#7c2d12", tag: "Education",    desc: "Research-focused with publications. Academic & research roles." },
  Template9: { label: "Executive Premium",  color: "#1e40af", tag: "Leadership",   desc: "Achievement-focused with metrics. C-level & management." },
  Template10: { label: "Creative Portfolio", color: "#c026d3", tag: "Designer",     desc: "Visual portfolio layout with project showcase. Designers." },
  Template11: { label: "Timeline Progress",  color: "#059669", tag: "Growth",      desc: "Chronological timeline visualization. Career progression." },
  Template12: { label: "Functional Skills",  color: "#d97706", tag: "Versatile",   desc: "Skills-first layout. Career changers & diverse roles." },
  Template13: { label: "Modern Grid",        color: "#0891b2", tag: "Contemporary", desc: "Contemporary grid-based layout. Tech startups." },
  Template14: { label: "Card Section",       color: "#7c3aed", tag: "Organized",   desc: "Card-style sections with icons. Well-organized info." },
  Template15: { label: "Hybrid Balanced",    color: "#0f766e", tag: "Balanced",    desc: "Sidebar + modern mix. Technical & creative balance." },
};

const TEMPLATE_COUNT = Object.keys(TEMPLATE_META).length;

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [resumeData, setResumeData] = useState(null); // ✅ Added state to hold DB data
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 1. Fetch Templates list
    axios
      .get(`${ML_API_URL}api/templates`)
      .then((res) => setTemplates(res.data))
      .catch(() => {
        // Fallback to local list if API is down
        setTemplates(Object.keys(TEMPLATE_META).map((id) => ({ _id: id, name: TEMPLATE_META[id].label })));
      })
      .finally(() => setLoading(false));

    // 2. ✅ Fetch the User's Resume Data directly from the database
    if (token) {
      axios
        .get("http://localhost:8000/api/resumes", { // Note: Update URL if needed to match your backend
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          // If the user has saved a resume, store it in state
          if (res.data && res.data.length > 0) {
            setResumeData(res.data[0].data);
          }
        })
        .catch((err) => console.error("Error loading resume data:", err));
    }
  }, []);

  const handleSelect = async (templateId) => {
    const token = localStorage.getItem("token");

    if (!token) return alert("Please login first");
    if (!resumeData) return alert("Please fill in your resume details first (go to Dashboard)");

    setSaving(templateId);
    try {
      await axios.post(
        `${ML_API_URL}api/resumes`,
        { templateId, data: resumeData },
        { headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" } }
      );
      // ✅ Pass the fetched data to the next page
      navigate(`/template/${templateId}`, { state: { data: resumeData } });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        navigate("/login");
      } else {
        navigate(`/template/${templateId}`, { state: { data: resumeData } });
      }
    } finally {
      setSaving(null);
    }
  };

  const handlePreview = (templateId) => {
    // ✅ Check if we actually have data before letting them preview
    if (!resumeData) {
      return alert("No resume data found! Please go to the Dashboard and save your details first.");
    }
    navigate(`/template/${templateId}`, { state: { data: resumeData } });
  };

  return (
    <>
      <Navbar />
      <div className="templates-page">
        <div className="templates-hero">
          <h1 className="templates-hero-title">Choose Your Resume Template</h1>
          <p className="templates-hero-sub">{TEMPLATE_COUNT} professionally designed templates. Pick one, preview it, and download instantly.</p>
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