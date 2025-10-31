import { useState, useEffect } from "react";

export default function Template1() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch stored resume data from localStorage
    const stored = localStorage.getItem("resumeData");

    if (stored) {
      const parsed = JSON.parse(stored);

      // You can map it into the left/right structure used here
      setData({
        left: {
          contact: [parsed.personal.phone, parsed.personal.email, parsed.personal.address],
          skills: parsed.skills,
          certs: parsed.certifications,
          languages: parsed.languages,
        },
        right: {
          name: parsed.personal.name,
          title: parsed.personal.title,
          tagline: `${parsed.personal.address} · ${parsed.personal.email} · ${parsed.personal.github} / ${parsed.personal.linkedin}`,
          summary: parsed.personal.summary,
          experience: parsed.experience.map((exp) => ({
            role: `${exp.role} — ${exp.company}`,
            year: exp.duration,
            desc: exp.description,
          })),
          projects: parsed.projects.map(
            (p) => `${p.title} (${p.tech}) — ${p.description}`
          ),
          achievements: parsed.achievements,
          activities: parsed.activities,
          education: parsed.education.map(
            (e) => `${e.degree} — ${e.institute} (${e.year})`
          ),
        },
      });
    }
  }, []);

  if (!data) return <p>Loading resume...</p>;

  const line = { borderBottom: "2px solid #000", margin: "18px 0" };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "28% 72%",
        width: "850px",
        minHeight: "1150px",
        margin: "0 auto",
        fontFamily: "Calibri, Arial, sans-serif",
        color: "#222",
        lineHeight: "1.5",
        border: "1px solid #ccc",
      }}
    >
      {/* LEFT */}
      <div
        style={{
          background: "#f3f5f7",
          padding: "20px",
          borderRight: "4px solid #1f4e8c",
        }}
      >
        <h3 style={{ fontSize: "15px", color: "#1f4e8c", marginTop: 0 }}>
          CONTACT
        </h3>
        {data.left.contact.map((c, i) => (
          <p key={i} style={{ fontSize: "13px", margin: "2px 0" }}>
            {c}
          </p>
        ))}
        <div style={{ borderBottom: "1px solid #bbb", margin: "14px 0" }} />

        <h3 style={{ fontSize: "15px", color: "#1f4e8c" }}>SKILLS</h3>
        <ul style={{ fontSize: "13px", paddingLeft: "16px" }}>
          {data.left.skills.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
        <div style={{ borderBottom: "1px solid #bbb", margin: "14px 0" }} />

        <h3 style={{ fontSize: "15px", color: "#1f4e8c" }}>CERTIFICATIONS</h3>
        <ul style={{ fontSize: "13px", paddingLeft: "16px" }}>
          {data.left.certs.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
        <div style={{ borderBottom: "1px solid #bbb", margin: "14px 0" }} />

        <h3 style={{ fontSize: "15px", color: "#1f4e8c" }}>LANGUAGES</h3>
        <ul style={{ fontSize: "13px", paddingLeft: "16px" }}>
          {data.left.languages.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </div>

      {/* RIGHT */}
      <div style={{ padding: "30px" }}>
        <h1 style={{ margin: "0", fontSize: "28px" }}>{data.right.name}</h1>
        <p style={{ fontSize: "15px", margin: "4px 0 12px", color: "#1f4e8c" }}>
          {data.right.title}
        </p>
        <p style={{ fontSize: "13px", margin: "0 0 10px" }}>
          {data.right.tagline}
        </p>
        <div style={line} />

        <h3 style={{ fontSize: "15px", letterSpacing: "1px" }}>SUMMARY</h3>
        <p style={{ fontSize: "14px" }}>{data.right.summary}</p>
        <div style={line} />

        <h3 style={{ fontSize: "15px", letterSpacing: "1px" }}>EXPERIENCE</h3>
        {data.right.experience.map((e, i) => (
          <div key={i} style={{ marginBottom: "16px" }}>
            <b>{e.role}</b>
            <span style={{ float: "right" }}>{e.year}</span>
            <p style={{ fontSize: "13px", marginTop: "4px" }}>{e.desc}</p>
          </div>
        ))}
        <div style={line} />

        <h3 style={{ fontSize: "15px", letterSpacing: "1px" }}>PROJECTS</h3>
        <ul style={{ fontSize: "14px" }}>
          {data.right.projects.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
        <div style={line} />

        <h3 style={{ fontSize: "15px", letterSpacing: "1px" }}>ACHIEVEMENTS</h3>
        <ul style={{ fontSize: "14px" }}>
          {data.right.achievements.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
        <div style={line} />

        <h3 style={{ fontSize: "15px", letterSpacing: "1px" }}>
          ACTIVITIES & RESPONSIBILITIES
        </h3>
        <ul style={{ fontSize: "14px" }}>
          {data.right.activities.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
        <div style={line} />

        <h3 style={{ fontSize: "15px", letterSpacing: "1px" }}>EDUCATION</h3>
        {data.right.education.map((e, i) => (
          <p key={i} style={{ fontSize: "14px" }}>
            {e}
          </p>
        ))}
      </div>
    </div>
  );
}
