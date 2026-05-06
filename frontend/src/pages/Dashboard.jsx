import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../page_style/dashboard.css";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const navigate = useNavigate();

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
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // ✅ Load resume from backend
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchResume = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/resumes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();

        // 👉 If user already has resume, load latest
        if (result.length > 0) {
          setData(result[0].data);
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

  // ✅ Save to backend (NOT localStorage)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await fetch("http://localhost:8000/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          templateId: "Template1", // later dynamic
          data: data,
        }),
      });

      navigate("/templates");
    } catch (err) {
      console.error("Error saving resume:", err);
    }
  };

  if (loading) return <h2>Loading...</h2>;

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1 className="dashboard-title">Resume Builder Dashboard</h1>

        <form onSubmit={handleSubmit} className="dashboard-form">

          {/* PERSONAL */}
          <section className="form-section">
            <h2>Personal Information</h2>
            <div className="form-grid">
              {Object.keys(data.personal).map((key) => (
                <input
                  key={key}
                  type="text"
                  name={key}
                  placeholder={key}
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
                value={skill}
                onChange={(e) =>
                  handleArrayChange("skills", i, e.target.value)
                }
              />
            ))}
            <button type="button" onClick={() => addField("skills")}>
              + Add Skill
            </button>
          </section>

          {/* EXPERIENCE */}
          <section className="form-section">
            <h2>Experience</h2>
            {data.experience.map((exp, i) => (
              <div key={i}>
                {Object.keys(exp).map((key) => (
                  <input
                    key={key}
                    value={exp[key]}
                    placeholder={key}
                    onChange={(e) =>
                      handleObjectArrayChange("experience", i, key, e.target.value)
                    }
                  />
                ))}
              </div>
            ))}
            <button type="button" onClick={() => addField("experience", "object")}>
              + Add Experience
            </button>
          </section>

          {/* EDUCATION */}
          <section className="form-section">
            <h2>Education</h2>
            {data.education.map((edu, i) => (
              <div key={i}>
                {Object.keys(edu).map((key) => (
                  <input
                    key={key}
                    value={edu[key]}
                    placeholder={key}
                    onChange={(e) =>
                      handleObjectArrayChange("education", i, key, e.target.value)
                    }
                  />
                ))}
              </div>
            ))}
            <button type="button" onClick={() => addField("education", "object")}>
              + Add Education
            </button>
          </section>

          {/* PROJECTS */}
          <section className="form-section">
            <h2>Projects</h2>
            {data.projects.map((proj, i) => (
              <div key={i}>
                {Object.keys(proj).map((key) => (
                  <input
                    key={key}
                    value={proj[key]}
                    placeholder={key}
                    onChange={(e) =>
                      handleObjectArrayChange("projects", i, key, e.target.value)
                    }
                  />
                ))}
              </div>
            ))}
            <button type="button" onClick={() => addField("projects", "object")}>
              + Add Project
            </button>
          </section>

          {/* OTHER */}
          {["certifications", "achievements", "activities", "languages"].map(
            (section) => (
              <section key={section}>
                <h2>{section}</h2>
                {data[section].map((item, i) => (
                  <input
                    key={i}
                    value={item}
                    onChange={(e) =>
                      handleArrayChange(section, i, e.target.value)
                    }
                  />
                ))}
                <button type="button" onClick={() => addField(section)}>
                  + Add
                </button>
              </section>
            )
          )}

          <button type="submit">Save & Continue</button>
        </form>
      </div>
    </>
  );
}