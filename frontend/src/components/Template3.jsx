import React, { useEffect, useState } from "react";

export default function Template3() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("resumeData");
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);

  if (!data) return <p>Loading resume...</p>;

  return (
    <div
      style={{
        width: "850px",
        minHeight: "1100px",
        margin: "40px auto",
        border: "2px solid #1b3a57",
        fontFamily: "Poppins, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          background: "#1b3a57",
          color: "#fff",
          padding: "30px",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: "0", fontSize: "30px" }}>{data.personal.name}</h1>
        <h3 style={{ margin: "8px 0", fontWeight: "400" }}>
          {data.personal.title}
        </h3>
        <p style={{ fontSize: "14px", margin: "5px 0" }}>
          📧 {data.personal.email} | 📞 {data.personal.phone} | 📍{" "}
          {data.personal.address}
        </p>
        <p style={{ fontSize: "14px" }}>
          🔗{" "}
          <a
            href={`https://${data.personal.github}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#ffb703" }}
          >
            {data.personal.github}
          </a>{" "}
          | 💼{" "}
          <a
            href={`https://${data.personal.linkedin}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#ffb703" }}
          >
            {data.personal.linkedin}
          </a>
        </p>
      </div>

      {/* Content */}
      <div style={{ display: "grid", gridTemplateColumns: "35% 65%" }}>
        {/* LEFT COLUMN */}
        <div
          style={{
            background: "#f5f7fa",
            padding: "25px 20px",
            borderRight: "2px solid #1b3a57",
          }}
        >
          <h3 style={{ color: "#1b3a57" }}>SKILLS</h3>
          <ul style={{ fontSize: "14px" }}>
            {data.skills.map((skill, i) => (
              <li key={i}>{skill}</li>
            ))}
          </ul>

          <h3 style={{ color: "#1b3a57", marginTop: "25px" }}>EDUCATION</h3>
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <strong>{edu.degree}</strong>
              <p style={{ margin: 0, fontSize: "14px" }}>{edu.institute}</p>
              <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>
                {edu.year} — {edu.grade}
              </p>
            </div>
          ))}

          <h3 style={{ color: "#1b3a57", marginTop: "25px" }}>CERTIFICATIONS</h3>
          <ul style={{ fontSize: "14px" }}>
            {data.certifications.map((cert, i) => (
              <li key={i}>{cert}</li>
            ))}
          </ul>

          <h3 style={{ color: "#1b3a57", marginTop: "25px" }}>LANGUAGES</h3>
          <ul style={{ fontSize: "14px" }}>
            {data.languages.map((lang, i) => (
              <li key={i}>{lang}</li>
            ))}
          </ul>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ padding: "25px" }}>
          <h3
            style={{
              borderBottom: "2px solid #1b3a57",
              paddingBottom: "4px",
              marginBottom: "10px",
            }}
          >
            PROFILE SUMMARY
          </h3>
          <p style={{ fontSize: "14px" }}>{data.personal.summary}</p>

          <h3
            style={{
              borderBottom: "2px solid #1b3a57",
              paddingBottom: "4px",
              marginTop: "25px",
            }}
          >
            EXPERIENCE
          </h3>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "14px" }}>
              <strong>{exp.role}</strong> — {exp.company} <br />
              <em style={{ fontSize: "13px", color: "#555" }}>
                {exp.duration}
              </em>
              <p style={{ fontSize: "14px" }}>{exp.description}</p>
            </div>
          ))}

          <h3
            style={{
              borderBottom: "2px solid #1b3a57",
              paddingBottom: "4px",
              marginTop: "25px",
            }}
          >
            PROJECTS
          </h3>
          {data.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: "12px" }}>
              <strong>{proj.title}</strong> ({proj.tech})
              <p style={{ fontSize: "14px", margin: "4px 0" }}>
                {proj.description}
              </p>
            </div>
          ))}

          <h3
            style={{
              borderBottom: "2px solid #1b3a57",
              paddingBottom: "4px",
              marginTop: "25px",
            }}
          >
            ACHIEVEMENTS
          </h3>
          <ul style={{ fontSize: "14px" }}>
            {data.achievements.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>

          <h3
            style={{
              borderBottom: "2px solid #1b3a57",
              paddingBottom: "4px",
              marginTop: "25px",
            }}
          >
            ACTIVITIES
          </h3>
          <ul style={{ fontSize: "14px" }}>
            {data.activities.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
