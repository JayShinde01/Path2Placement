import React from "react";
import { useLocation } from "react-router-dom";

const Template2 = () => {
  const location = useLocation();
  
  // ✅ safely handle default data if no state is passed
  const defaultData = {
    personal: {
      name: "PRATIK SATPUTE",
      title: "Full Stack Developer (MERN)",
      email: "pratik@example.com",
      phone: "+91 9876543210",
      address: "Satara, Maharashtra",
      github: "github.com/pratik",
      linkedin: "linkedin.com/in/pratik",
      summary:
        "MERN Stack developer with hands-on experience in real projects. Skilled in REST APIs, UI/UX, and cloud deployments."
    },
    skills: [
      "JavaScript (ES6+)",
      "React / Node / Express",
      "MongoDB / Mongoose",
      "REST API / JWT Auth",
      "Git / GitHub / CI/CD"
    ],
    experience: [
      {
        role: "MERN Intern",
        company: "Remote Startup",
        duration: "2024 – Present",
        description:
          "Built reusable components, designed APIs, integrated JWT authentication, and used Cloudinary for media."
      },
      {
        role: "Freelance Developer",
        duration: "2023 – 2024",
        description:
          "Delivered full-stack CRUD apps, payment sandbox integrations, and admin dashboards."
      }
    ],
    education: [
      {
        degree: "B.Tech in Computer Science and Engineering",
        institute: "KBP College of Engineering, Satara",
        year: "2022 – 2026",
        grade: "Pursuing"
      }
    ],
    projects: [
      {
        title: "CultiKure — AI Crop Disease Detector",
        tech: "CNN, Flask, JavaScript",
        description: "Detects plant diseases using AI and shows treatments."
      },
      {
        title: "Hospital Bed Booking System",
        tech: "Node.js, MongoDB, Cloudinary, JWT",
        description:
          "Allows hospitals and users to manage and book beds online securely."
      }
    ],
    certifications: [
      "Meta Frontend Developer — Coursera",
      "AWS Cloud Practitioner — Basics",
      "Google Data Analytics — Basics"
    ],
    achievements: [
      "Top 5 in College Level Hackathon 2024",
      "Built and deployed 3+ full stack apps",
      "Maintainer of a GitHub repo with 100+ stars"
    ],
    activities: [
      "Core Member — Coding Club",
      "Workshop Volunteer — Web Dev Mentor",
      "Led 4-member team in major project"
    ],
    languages: ["English — Fluent", "Hindi — Fluent", "Marathi — Native"]
  };

  // ✅ Use location data if available, otherwise fallback to defaultData
  const data = location.state?.data || defaultData;

  const {
    personal,
    skills,
    experience,
    education,
    projects,
    certifications,
    achievements,
    activities,
    languages
  } = data;

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "900px",
        margin: "40px auto",
        border: "2px solid #333",
        padding: "30px",
        borderRadius: "10px",
        lineHeight: 1.5
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          borderBottom: "2px solid #333",
          paddingBottom: "10px"
        }}
      >
        <h1 style={{ margin: "0" }}>{personal.name}</h1>
        <h3 style={{ margin: "5px 0", color: "#555" }}>{personal.title}</h3>
        <p style={{ margin: "5px 0" }}>
          📞 {personal.phone} | ✉️ {personal.email} | 📍 {personal.address}
        </p>
        <p style={{ margin: "5px 0" }}>
          🌐{" "}
          <a
            href={`https://${personal.github}`}
            target="_blank"
            rel="noreferrer"
          >
            {personal.github}
          </a>{" "}
          | 🔗{" "}
          <a
            href={`https://${personal.linkedin}`}
            target="_blank"
            rel="noreferrer"
          >
            {personal.linkedin}
          </a>
        </p>
      </div>

      {/* Summary */}
      <section style={{ marginTop: "20px" }}>
        <h2 style={{ borderBottom: "2px solid #000" }}>Summary</h2>
        <p>{personal.summary}</p>
      </section>

      {/* Skills */}
      <section style={{ marginTop: "20px" }}>
        <h2 style={{ borderBottom: "2px solid #000" }}>Skills</h2>
        <ul>
          {skills.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </section>

      {/* Experience */}
      <section style={{ marginTop: "20px" }}>
        <h2 style={{ borderBottom: "2px solid #000" }}>Experience</h2>
        {experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            <strong>{exp.role}</strong> — {exp.company} <br />
            <em>{exp.duration}</em>
            <p>{exp.description}</p>
          </div>
        ))}
      </section>

      {/* Projects */}
      <section style={{ marginTop: "20px" }}>
        <h2 style={{ borderBottom: "2px solid #000" }}>Projects</h2>
        {projects.map((proj, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            <strong>{proj.title}</strong> <br />
            <em>{proj.tech}</em>
            <p>{proj.description}</p>
          </div>
        ))}
      </section>

      {/* Education */}
      <section style={{ marginTop: "20px" }}>
        <h2 style={{ borderBottom: "2px solid #000" }}>Education</h2>
        {education.map((edu, i) => (
          <p key={i}>
            <strong>{edu.degree}</strong> <br />
            {edu.institute} ({edu.year}) — {edu.grade}
          </p>
        ))}
      </section>

      {/* Certifications */}
      <section style={{ marginTop: "20px" }}>
        <h2 style={{ borderBottom: "2px solid #000" }}>Certifications</h2>
        <ul>
          {certifications.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </section>

      {/* Achievements */}
      <section style={{ marginTop: "20px" }}>
        <h2 style={{ borderBottom: "2px solid #000" }}>Achievements</h2>
        <ul>
          {achievements.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </section>

      {/* Activities */}
      <section style={{ marginTop: "20px" }}>
        <h2 style={{ borderBottom: "2px solid #000" }}>Activities</h2>
        <ul>
          {activities.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </section>

      {/* Languages */}
      <section style={{ marginTop: "20px" }}>
        <h2 style={{ borderBottom: "2px solid #000" }}>Languages</h2>
        <ul>
          {languages.map((lang, i) => (
            <li key={i}>{lang}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Template2;
