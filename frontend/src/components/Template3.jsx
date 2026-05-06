import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Template3() {
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
      <style>body{margin:0;font-family:'Segoe UI',sans-serif;}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style>
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

  const accent = "#0f766e";

  return (
    <div style={{ background: "#f0fdf4", minHeight: "100vh", padding: "30px 20px" }}>
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
            <h3 style={{ color: accent }}>Projects</h3>
            {editData.projects.map((proj, i) => (
              <div key={i} style={{ background: "#f0fdf4", padding: 10, borderRadius: 6, marginBottom: 8 }}>
                {Object.keys(proj).map((k) => (
                  <div key={k}><label style={labelStyle}>{k}</label>
                    <input style={inputStyle} value={proj[k]} onChange={(e) => updateObjArray("projects", i, k, e.target.value)} />
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

      {/* Resume — Modern Teal Two-Column */}
      <div ref={printRef} style={{ maxWidth: 900, margin: "0 auto", fontFamily: "'Segoe UI', Arial, sans-serif", color: "#1a1a1a", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", overflow: "hidden" }}>
        {/* Top Banner */}
        <div style={{ background: `linear-gradient(135deg, ${accent} 0%, #134e4a 100%)`, padding: "36px 40px", color: "#fff" }}>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700 }}>{data.personal.name}</h1>
          <p style={{ margin: "6px 0 16px", fontSize: 15, opacity: 0.9, fontWeight: 300 }}>{data.personal.title}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", fontSize: 13, opacity: 0.85 }}>
            {data.personal.phone && <span>📞 {data.personal.phone}</span>}
            {data.personal.email && <span>✉ {data.personal.email}</span>}
            {data.personal.address && <span>📍 {data.personal.address}</span>}
            {data.personal.github && <span>🔗 {data.personal.github}</span>}
            {data.personal.linkedin && <span>💼 {data.personal.linkedin}</span>}
          </div>
        </div>

        {/* Body */}
        <div style={{ display: "grid", gridTemplateColumns: "38% 62%", background: "#fff" }}>
          {/* LEFT */}
          <div style={{ background: "#f8fffe", padding: "28px 22px", borderRight: `3px solid ${accent}` }}>
            {data.personal.summary && (
              <LeftSection title="About Me" accent={accent}>
                <p style={{ fontSize: 13, color: "#444", lineHeight: 1.7, margin: 0 }}>{data.personal.summary}</p>
              </LeftSection>
            )}
            {data.skills?.filter(Boolean).length > 0 && (
              <LeftSection title="Skills" accent={accent}>
                {data.skills.filter(Boolean).map((s, i) => (
                  <div key={i} style={{ marginBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 2 }}>
                      <span>{s}</span>
                    </div>
                    <div style={{ height: 5, background: "#e2e8f0", borderRadius: 3 }}>
                      <div style={{ height: "100%", width: `${70 + (i % 3) * 10}%`, background: accent, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </LeftSection>
            )}
            {data.education?.filter(e => e.degree).length > 0 && (
              <LeftSection title="Education" accent={accent}>
                {data.education.filter(e => e.degree).map((e, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <strong style={{ fontSize: 13 }}>{e.degree}</strong>
                    <div style={{ fontSize: 12, color: "#666" }}>{e.institute}</div>
                    <div style={{ fontSize: 12, color: "#999" }}>{e.year} {e.grade && `· ${e.grade}`}</div>
                  </div>
                ))}
              </LeftSection>
            )}
            {data.certifications?.filter(Boolean).length > 0 && (
              <LeftSection title="Certifications" accent={accent}>
                {data.certifications.filter(Boolean).map((c, i) => (
                  <div key={i} style={{ fontSize: 12, color: "#444", marginBottom: 4, paddingLeft: 10, borderLeft: `2px solid ${accent}` }}>{c}</div>
                ))}
              </LeftSection>
            )}
            {data.languages?.filter(Boolean).length > 0 && (
              <LeftSection title="Languages" accent={accent}>
                {data.languages.filter(Boolean).map((l, i) => (
                  <span key={i} style={{ display: "inline-block", background: "#ccfbf1", color: accent, fontSize: 12, padding: "2px 10px", borderRadius: 12, margin: "2px 4px 2px 0" }}>{l}</span>
                ))}
              </LeftSection>
            )}
          </div>

          {/* RIGHT */}
          <div style={{ padding: "28px 28px" }}>
            {data.experience?.filter(e => e.role).length > 0 && (
              <RightSection title="Experience" accent={accent}>
                {data.experience.filter(e => e.role).map((exp, i) => (
                  <div key={i} style={{ marginBottom: 18, position: "relative", paddingLeft: 20 }}>
                    <div style={{ position: "absolute", left: 0, top: 5, width: 10, height: 10, borderRadius: "50%", background: accent }} />
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                      <strong style={{ fontSize: 14 }}>{exp.role}</strong>
                      <span style={{ fontSize: 12, color: "#888", background: "#f0fdf4", padding: "1px 8px", borderRadius: 10 }}>{exp.duration}</span>
                    </div>
                    {exp.company && <div style={{ fontSize: 13, color: accent, marginBottom: 3 }}>{exp.company}</div>}
                    <p style={{ fontSize: 13, color: "#555", margin: 0 }}>{exp.description}</p>
                  </div>
                ))}
              </RightSection>
            )}
            {data.projects?.filter(p => p.title).length > 0 && (
              <RightSection title="Projects" accent={accent}>
                {data.projects.filter(p => p.title).map((p, i) => (
                  <div key={i} style={{ marginBottom: 14, background: "#f0fdf4", padding: "10px 14px", borderRadius: 8, borderLeft: `3px solid ${accent}` }}>
                    <strong style={{ fontSize: 14 }}>{p.title}</strong>
                    {p.tech && <span style={{ fontSize: 12, color: accent, marginLeft: 8 }}>• {p.tech}</span>}
                    <p style={{ fontSize: 13, color: "#555", margin: "4px 0 0" }}>{p.description}</p>
                  </div>
                ))}
              </RightSection>
            )}
            {data.achievements?.filter(Boolean).length > 0 && (
              <RightSection title="Achievements" accent={accent}>
                {data.achievements.filter(Boolean).map((a, i) => (
                  <div key={i} style={{ fontSize: 13, color: "#444", marginBottom: 6, display: "flex", gap: 8 }}>
                    <span style={{ color: accent, fontWeight: 700 }}>✓</span>{a}
                  </div>
                ))}
              </RightSection>
            )}
            {data.activities?.filter(Boolean).length > 0 && (
              <RightSection title="Activities" accent={accent}>
                {data.activities.filter(Boolean).map((a, i) => (
                  <div key={i} style={{ fontSize: 13, color: "#444", marginBottom: 6, display: "flex", gap: 8 }}>
                    <span style={{ color: accent }}>▸</span>{a}
                  </div>
                ))}
              </RightSection>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LeftSection({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 18, height: 3, background: accent, borderRadius: 2 }} />
        <h4 style={{ margin: 0, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: accent }}>{title}</h4>
      </div>
      {children}
    </div>
  );
}
function RightSection({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h3 style={{ margin: "0 0 12px", fontSize: 14, letterSpacing: 1, textTransform: "uppercase", color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: 6 }}>{title}</h3>
      {children}
    </div>
  );
}

const btnStyle = (bg) => ({ background: bg, color: "#fff", border: "none", padding: "9px 18px", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 600 });
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
const modalBox = { background: "#fff", borderRadius: 12, padding: 28, maxWidth: 700, width: "100%", maxHeight: "85vh", overflowY: "auto" };
const labelStyle = { fontSize: 11, color: "#666", display: "block", marginBottom: 2, textTransform: "capitalize" };
const inputStyle = { width: "100%", padding: "6px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, boxSizing: "border-box" };
