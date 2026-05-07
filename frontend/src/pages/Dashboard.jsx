import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../page_style/dashboard.css";
import Navbar from "../components/Navbar";
import { syncLatestResumeData } from "../utils/resumeCache";

// Helper function to capitalize placeholders
const formatLabel = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export default function Dashboard() {
  const navigate = useNavigate();

  const defaultData = {
    personal: {
      name: "", title: "", email: "", phone: "", address: "", github: "", linkedin: "", summary: "",
    },
    skills: [""],
    experience: [{ role: "", company: "", duration: "", description: "" }],
    education: [{ degree: "", institute: "", year: "", grade: "" }],
    projects: [{ title: "", tech: "", description: "" }],
    certifications: [""],
    achievements: [""],
    activities: [""],
    languages: [""],
  };

  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchResume = async () => {
      try {
        const resumeData = await syncLatestResumeData(token);
        if (resumeData) {
          setData(resumeData);
        }
      } catch (err) {
        console.error("Error loading resume:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [navigate, token]);

  // 🟢 Handlers
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, personal: { ...prev.personal, [name]: value } }));
  };

  const handleArrayChange = (section, index, value) => {
    const updated = [...data[section]];
    updated[index] = value;
    setData({ ...data, [section]: updated });
  };

  const handleObjectArrayChange = (section, index, field, value) => {
    const updated = [...data[section]];
    updated[index][field] = value;
    setData({ ...data, [section]: updated });
  };

  const addField = (section, type = "string") => {
    if (type === "object") {
      let emptyObject = {};
      Object.keys(data[section][0] || defaultData[section][0]).forEach((key) => (emptyObject[key] = ""));
      setData({ ...data, [section]: [...data[section], emptyObject] });
    } else {
      setData({ ...data, [section]: [...data[section], ""] });
    }
  };

  // ✅ New: Remove Field Handler
  const removeField = (section, index) => {
    const updated = [...data[section]];
    updated.splice(index, 1);
    setData({ ...data, [section]: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("http://localhost:8000/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          templateId: "Template1", 
          data: data,
        }),
      });
      localStorage.setItem("resumeData", JSON.stringify(data));
      navigate("/templates");
    } catch (err) {
      console.error("Error saving resume:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div>Loading Dashboard...</div>;

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Resume Builder</h1>
          <p>Fill in your details below. The AI will help optimize your resume later.</p>
        </div>

        <form onSubmit={handleSubmit} className="dashboard-form">

          {/* PERSONAL */}
          <section className="form-section">
            <h2>Personal Information</h2>
            <div className="form-grid">
              {Object.keys(data.personal).map((key) => (
                <div key={key} className={key === "summary" ? "full-width" : ""}>
                  <label>{formatLabel(key)}</label>
                  {key === "summary" ? (
                    <textarea
                      name={key}
                      placeholder={`Enter your professional ${key}...`}
                      value={data.personal[key]}
                      onChange={handlePersonalChange}
                      rows="4"
                    />
                  ) : (
                    <input
                      type={key === "email" ? "email" : "text"}
                      name={key}
                      placeholder={`e.g. ${formatLabel(key)}`}
                      value={data.personal[key]}
                      onChange={handlePersonalChange}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* SKILLS */}
          <section className="form-section">
            <h2>Skills</h2>
            <div className="dynamic-list">
              {data.skills.map((skill, i) => (
                <div key={i} className="dynamic-input-row">
                  <input
                    placeholder="e.g. JavaScript, React, Python"
                    value={skill}
                    onChange={(e) => handleArrayChange("skills", i, e.target.value)}
                  />
                  <button type="button" className="remove-btn" onClick={() => removeField("skills", i)}>✕</button>
                </div>
              ))}
            </div>
            <button type="button" className="add-btn" onClick={() => addField("skills")}>+ Add Skill</button>
          </section>

          {/* EXPERIENCE, EDUCATION, PROJECTS */}
          {["experience", "education", "projects"].map((section) => (
            <section key={section} className="form-section">
              <h2>{formatLabel(section)}</h2>
              {data[section].map((item, i) => (
                <div key={i} className="nested-card">
                  <div className="card-header">
                    <span>Entry #{i + 1}</span>
                    <button type="button" className="remove-btn text-remove" onClick={() => removeField(section, i)}>Remove</button>
                  </div>
                  <div className="form-grid">
                    {Object.keys(item).map((key) => (
                      <div key={key} className={key === "description" ? "full-width" : ""}>
                        <label>{formatLabel(key)}</label>
                        {key === "description" ? (
                          <textarea
                            placeholder={`Describe your ${key}...`}
                            value={item[key]}
                            onChange={(e) => handleObjectArrayChange(section, i, key, e.target.value)}
                            rows="3"
                          />
                        ) : (
                          <input
                            placeholder={`e.g. ${formatLabel(key)}`}
                            value={item[key]}
                            onChange={(e) => handleObjectArrayChange(section, i, key, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button type="button" className="add-btn" onClick={() => addField(section, "object")}>
                + Add {formatLabel(section)}
              </button>
            </section>
          ))}

          {/* OTHER SIMPLE ARRAYS */}
          {["certifications", "achievements", "activities", "languages"].map((section) => (
            <section key={section} className="form-section half-section">
              <h2>{formatLabel(section)}</h2>
              <div className="dynamic-list">
                {data[section].map((item, i) => (
                  <div key={i} className="dynamic-input-row">
                    <input
                      placeholder={`e.g. ${formatLabel(section)} details`}
                      value={item}
                      onChange={(e) => handleArrayChange(section, i, e.target.value)}
                    />
                    <button type="button" className="remove-btn" onClick={() => removeField(section, i)}>✕</button>
                  </div>
                ))}
              </div>
              <button type="button" className="add-btn" onClick={() => addField(section)}>+ Add</button>
            </section>
          ))}

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={saving}>
              {saving ? "Saving..." : "Save & Continue to Templates"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}