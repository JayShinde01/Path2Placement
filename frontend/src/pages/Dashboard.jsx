import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../page_style/dashboard.css";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const navigate = useNavigate();

  // ✅ Default structure
  const defaultData = {
    personal: {
      name: "",
      title: "",
      email: "",
      phone: "",
      address: "",
      github: "",
      linkedin: "",
      summary: "",
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

  // ✅ Check login and load saved data
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    } else {
      const saved = localStorage.getItem("resumeData");
      console.log(saved);
      
      if (saved) {
        try {
          setData(JSON.parse(saved));
        } catch {
          setData(defaultData);
        }
      }
    }
  }, [navigate]);

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [name]: value },
    }));
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
      Object.keys(data[section][0]).forEach((key) => (emptyObject[key] = ""));
      setData({
        ...data,
        [section]: [...data[section], emptyObject],
      });
    } else {
      setData({
        ...data,
        [section]: [...data[section], ""],
      });
    }
  };

  // ✅ Save & update localStorage
  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("resumeData", JSON.stringify(data));
    navigate("/templates");
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1 className="dashboard-title">Resume Builder Dashboard</h1>

        <form onSubmit={handleSubmit} className="dashboard-form">
          {/* PERSONAL INFO */}
          <section className="form-section">
            <h2>Personal Information</h2>
            <div className="form-grid">
              {Object.keys(data.personal).map((key) => (
                <input
                  key={key}
                  type="text"
                  name={key}
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={data.personal[key]}
                  onChange={handlePersonalChange}
                />
              ))}
            </div>
          </section>

          {/* SKILLS */}
          <section className="form-section">
            <h2>Skills</h2>
            {data.skills.map((skill, i) => (
              <input
                key={i}
                type="text"
                placeholder={`Skill ${i + 1}`}
                value={skill}
                onChange={(e) =>
                  handleArrayChange("skills", i, e.target.value)
                }
              />
            ))}
            <button
              type="button"
              onClick={() => addField("skills")}
              className="add-btn"
            >
              + Add Skill
            </button>
          </section>

          {/* EXPERIENCE */}
          <section className="form-section">
            <h2>Experience</h2>
            {data.experience.map((exp, i) => (
              <div key={i} className="nested-card">
                {Object.keys(exp).map((key) => (
                  <input
                    key={key}
                    type="text"
                    placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={exp[key]}
                    onChange={(e) =>
                      handleObjectArrayChange("experience", i, key, e.target.value)
                    }
                  />
                ))}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addField("experience", "object")}
              className="add-btn"
            >
              + Add Experience
            </button>
          </section>

          {/* EDUCATION */}
          <section className="form-section">
            <h2>Education</h2>
            {data.education.map((edu, i) => (
              <div key={i} className="nested-card">
                {Object.keys(edu).map((key) => (
                  <input
                    key={key}
                    type="text"
                    placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={edu[key]}
                    onChange={(e) =>
                      handleObjectArrayChange("education", i, key, e.target.value)
                    }
                  />
                ))}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addField("education", "object")}
              className="add-btn"
            >
              + Add Education
            </button>
          </section>

          {/* PROJECTS */}
          <section className="form-section">
            <h2>Projects</h2>
            {data.projects.map((proj, i) => (
              <div key={i} className="nested-card">
                {Object.keys(proj).map((key) => (
                  <input
                    key={key}
                    type="text"
                    placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={proj[key]}
                    onChange={(e) =>
                      handleObjectArrayChange("projects", i, key, e.target.value)
                    }
                  />
                ))}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addField("projects", "object")}
              className="add-btn"
            >
              + Add Project
            </button>
          </section>

          {/* OTHER SECTIONS */}
          {["certifications", "achievements", "activities", "languages"].map(
            (section) => (
              <section key={section} className="form-section">
                <h2>
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </h2>
                {data[section].map((item, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`${section.slice(0, -1)} ${i + 1}`}
                    value={item}
                    onChange={(e) =>
                      handleArrayChange(section, i, e.target.value)
                    }
                  />
                ))}
                <button
                  type="button"
                  onClick={() => addField(section)}
                  className="add-btn"
                >
                  + Add {section.slice(0, -1)}
                </button>
              </section>
            )
          )}

          <button type="submit" className="submit-btn">
            Save & Continue to Templates
          </button>
        </form>
      </div>
    </>
  );
}
