import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Template2() {
  const location = useLocation();
  const navigate = useNavigate();
  const printRef = useRef();
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    // First check if data was passed via navigation (location.state)
    if (location.state?.data) {
      setData(location.state.data);
      setEditData(location.state.data);
    } else {
      // Fallback to localStorage
      const stored = localStorage.getItem("resumeData");
      if (stored) {
        const parsed = JSON.parse(stored);
        setData(parsed);
        setEditData(JSON.parse(stored));
      }
    }
  }, [location.state?.data]);

  const handleDownload = () => {
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Resume</title>
      <style>body{margin:0;font-family:Georgia,serif;}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style>
      </head><body>${printRef.current.innerHTML}</body></html>`);
    win.document.close(); win.focus(); win.print(); win.close();
  };

  const saveEdit = () => {
    localStorage.setItem("resumeData", JSON.stringify(editData));
    setData(editData);
    setEditing(false);
  };

  const updatePersonal = (key, val) => setEditData((p) => ({ ...p, personal: { ...p.personal, [key]: val } }));
  const updateArray = (section, idx, val) => { const arr = [...editData[section]]; arr[idx] = val; setEditData((p) => ({ ...p, [section]: arr })); };
  const updateObjArray = (section, idx, key, val) => { const arr = [...editData[section]]; arr[idx] = { ...arr[idx], [key]: val }; setEditData((p) => ({ ...p, [section]: arr })); };

  if (!data) return <div style={{ padding: 40, textAlign: "center" }}>Loading resume…</div>;

  const accent = "#b45309";

  return (
    <div style={{ background: "#faf7f2", minHeight: "100vh", padding: "30px 20px" }}>
      {/* Toolbar */}
      <div style={{ maxWidth: 900, margin: "0 auto 20px", display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button onClick={() => navigate(-1)} style={btnStyle("#6b7280")}>← Back</button>
        <button onClick={() => { setEditing(true); setEditData(JSON.parse(localStorage.getItem("resumeData"))); }} style={btnStyle("#7c3aed")}>✏️ Edit Info</button>
        <button onClick={handleDownload} style={btnStyle("#059669")}>⬇️ Download / Print</button>
      </div>

      {editing && editData && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ marginTop: 0, color: accent }}>Edit Resume Info</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {Object.keys(editData.personal).map((k) => (
                <div key={k}><label style={labelStyle}>{k}</label>
                  <input style={inputStyle} value={editData.personal[k]} onChange={(e) => updatePersonal(k, e.target.value)} />
                </div>
              ))}
            </div>
            <h3 style={{ color: accent }}>Skills</h3>
            {editData.skills.map((s, i) => <input key={i} style={{ ...inputStyle, marginBottom: 4 }} value={s} onChange={(e) => updateArray("skills", i, e.target.value)} />)}
            <h3 style={{ color: accent }}>Experience</h3>
            {editData.experience.map((exp, i) => (
              <div key={i} style={{ background: "#fef3c7", padding: 10, borderRadius: 6, marginBottom: 8 }}>
                {Object.keys(exp).map((k) => (
                  <div key={k}><label style={labelStyle}>{k}</label>
                    <input style={inputStyle} value={exp[k]} onChange={(e) => updateObjArray("experience", i, k, e.target.value)} />
                  </div>
                ))}
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={saveEdit} style={btnStyle("#059669")}>💾 Save Changes</button>
              <button onClick={() => setEditing(false)} style={btnStyle("#6b7280")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Resume — Classic Elegant */}
      <div ref={printRef} style={{ maxWidth: 860, margin: "0 auto", background: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", fontFamily: "Georgia, 'Times New Roman', serif", color: "#1a1a1a", lineHeight: 1.7 }}>
        {/* Header */}
        <div style={{ background: "#1a1a1a", color: "#fff", padding: "36px 40px", textAlign: "center" }}>
          <h1 style={{ margin: 0, fontSize: 32, letterSpacing: 4, fontWeight: 400, textTransform: "uppercase" }}>{data.personal.name}</h1>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "#d4a853", letterSpacing: 2, textTransform: "uppercase" }}>{data.personal.title}</p>
          <div style={{ marginTop: 14, fontSize: 13, color: "#ccc", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "6px 20px" }}>
            {data.personal.phone && <span>📞 {data.personal.phone}</span>}
            {data.personal.email && <span>✉ {data.personal.email}</span>}
            {data.personal.address && <span>📍 {data.personal.address}</span>}
            {data.personal.github && <span>🔗 {data.personal.github}</span>}
            {data.personal.linkedin && <span>💼 {data.personal.linkedin}</span>}
          </div>
        </div>

        <div style={{ padding: "32px 40px" }}>
          {/* Gold divider */}
          <div style={{ height: 3, background: "linear-gradient(90deg,#d4a853,#b45309,#d4a853)", marginBottom: 28 }} />

          {data.personal.summary && (
            <Section title="Professional Summary" accent={accent}>
              <p style={{ fontSize: 14, color: "#444", margin: 0, fontStyle: "italic" }}>{data.personal.summary}</p>
            </Section>
          )}

          {data.skills?.filter(Boolean).length > 0 && (
            <Section title="Core Competencies" accent={accent}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {data.skills.filter(Boolean).map((s, i) => (
                  <span key={i} style={{ background: "#fef3c7", border: "1px solid #d4a853", color: "#92400e", padding: "3px 12px", borderRadius: 20, fontSize: 13 }}>{s}</span>
                ))}
              </div>
            </Section>
          )}

          {data.experience?.filter(e => e.role).length > 0 && (
            <Section title="Professional Experience" accent={accent}>
              {data.experience.filter(e => e.role).map((exp, i) => (
                <div key={i} style={{ marginBottom: 18, paddingLeft: 16, borderLeft: `3px solid ${accent}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 15 }}>{exp.role}</strong>
                    <span style={{ fontSize: 13, color: "#888" }}>{exp.duration}</span>
                  </div>
                  {exp.company && <div style={{ fontSize: 13, color: accent, marginBottom: 4 }}>{exp.company}</div>}
                  <p style={{ fontSize: 13, color: "#555", margin: 0 }}>{exp.description}</p>
                </div>
              ))}
            </Section>
          )}

          {data.projects?.filter(p => p.title).length > 0 && (
            <Section title="Key Projects" accent={accent}>
              {data.projects.filter(p => p.title).map((p, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <strong style={{ fontSize: 14 }}>{p.title}</strong>
                  {p.tech && <span style={{ fontSize: 12, color: accent, marginLeft: 8 }}>[ {p.tech} ]</span>}
                  <p style={{ fontSize: 13, color: "#555", margin: "3px 0 0" }}>{p.description}</p>
                </div>
              ))}
            </Section>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {data.education?.filter(e => e.degree).length > 0 && (
              <Section title="Education" accent={accent}>
                {data.education.filter(e => e.degree).map((e, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <strong style={{ fontSize: 14 }}>{e.degree}</strong>
                    <div style={{ fontSize: 13, color: "#666" }}>{e.institute}</div>
                    <div style={{ fontSize: 12, color: "#999" }}>{e.year} {e.grade && `— ${e.grade}`}</div>
                  </div>
                ))}
              </Section>
            )}
            {data.certifications?.filter(Boolean).length > 0 && (
              <Section title="Certifications" accent={accent}>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#444" }}>
                  {data.certifications.filter(Boolean).map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </Section>
            )}
          </div>

          {data.achievements?.filter(Boolean).length > 0 && (
            <Section title="Achievements" accent={accent}>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#444" }}>
                {data.achievements.filter(Boolean).map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: accent }}>{title}</h3>
        <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
      </div>
      {children}
    </div>
  );
}

const btnStyle = (bg) => ({ background: bg, color: "#fff", border: "none", padding: "9px 18px", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 600 });
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
const modalBox = { background: "#fff", borderRadius: 12, padding: 28, maxWidth: 700, width: "100%", maxHeight: "85vh", overflowY: "auto" };
const labelStyle = { fontSize: 11, color: "#666", display: "block", marginBottom: 2, textTransform: "capitalize" };
const inputStyle = { width: "100%", padding: "6px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, boxSizing: "border-box" };
