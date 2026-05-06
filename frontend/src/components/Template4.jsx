import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Template4() {
  const navigate = useNavigate();
  const printRef = useRef();
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("resumeData");
    if (stored) {
      const parsed = JSON.parse(stored);
      setData(parsed);
      setEditData(JSON.parse(stored));
    }
  }, []);

  const handleDownload = () => {
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Resume</title>
      <style>body{margin:0;font-family:'Helvetica Neue',sans-serif;}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style>
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

  const accent = "#7c3aed";

  return (
    <div style={{ background: "#faf5ff", minHeight: "100vh", padding: "30px 20px" }}>
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
              <div key={i} style={{ background: "#f5f3ff", padding: 10, borderRadius: 6, marginBottom: 8 }}>
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

      {/* Resume — Creative Purple Minimal */}
      <div ref={printRef} style={{ maxWidth: 860, margin: "0 auto", background: "#fff", boxShadow: "0 8px 32px rgba(124,58,237,0.15)", fontFamily: "'Helvetica Neue', Arial, sans-serif", color: "#1a1a1a", lineHeight: 1.6 }}>
        {/* Header */}
        <div style={{ padding: "40px 44px 28px", borderBottom: `4px solid ${accent}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800, color: "#111" }}>{data.personal.name}</h1>
            <p style={{ margin: "6px 0 0", fontSize: 16, color: accent, fontWeight: 500 }}>{data.personal.title}</p>
          </div>
          <div style={{ textAlign: "right", fontSize: 13, color: "#555", lineHeight: 1.9 }}>
            {data.personal.phone && <div>📞 {data.personal.phone}</div>}
            {data.personal.email && <div>✉ {data.personal.email}</div>}
            {data.personal.address && <div>📍 {data.personal.address}</div>}
            {data.personal.github && <div>🔗 {data.personal.github}</div>}
            {data.personal.linkedin && <div>💼 {data.personal.linkedin}</div>}
          </div>
        </div>

        <div style={{ padding: "28px 44px" }}>
          {data.personal.summary && (
            <Block title="Summary" accent={accent}>
              <p style={{ fontSize: 14, color: "#444", margin: 0 }}>{data.personal.summary}</p>
            </Block>
          )}

          {data.skills?.filter(Boolean).length > 0 && (
            <Block title="Technical Skills" accent={accent}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {data.skills.filter(Boolean).map((s, i) => (
                  <span key={i} style={{ background: "#f5f3ff", border: `1px solid ${accent}`, color: accent, padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500 }}>{s}</span>
                ))}
              </div>
            </Block>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
            <div>
              {data.experience?.filter(e => e.role).length > 0 && (
                <Block title="Experience" accent={accent}>
                  {data.experience.filter(e => e.role).map((exp, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong style={{ fontSize: 14 }}>{exp.role}</strong>
                        <span style={{ fontSize: 12, color: "#999" }}>{exp.duration}</span>
                      </div>
                      {exp.company && <div style={{ fontSize: 13, color: accent }}>{exp.company}</div>}
                      <p style={{ fontSize: 13, color: "#555", margin: "4px 0 0" }}>{exp.description}</p>
                    </div>
                  ))}
                </Block>
              )}
              {data.education?.filter(e => e.degree).length > 0 && (
                <Block title="Education" accent={accent}>
                  {data.education.filter(e => e.degree).map((e, i) => (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <strong style={{ fontSize: 14 }}>{e.degree}</strong>
                      <div style={{ fontSize: 13, color: "#666" }}>{e.institute}</div>
                      <div style={{ fontSize: 12, color: "#999" }}>{e.year} {e.grade && `· ${e.grade}`}</div>
                    </div>
                  ))}
                </Block>
              )}
            </div>
            <div>
              {data.projects?.filter(p => p.title).length > 0 && (
                <Block title="Projects" accent={accent}>
                  {data.projects.filter(p => p.title).map((p, i) => (
                    <div key={i} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: `3px solid ${accent}` }}>
                      <strong style={{ fontSize: 14 }}>{p.title}</strong>
                      {p.tech && <div style={{ fontSize: 12, color: accent }}>{p.tech}</div>}
                      <p style={{ fontSize: 13, color: "#555", margin: "2px 0 0" }}>{p.description}</p>
                    </div>
                  ))}
                </Block>
              )}
              {data.certifications?.filter(Boolean).length > 0 && (
                <Block title="Certifications" accent={accent}>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#444" }}>
                    {data.certifications.filter(Boolean).map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </Block>
              )}
              {data.achievements?.filter(Boolean).length > 0 && (
                <Block title="Achievements" accent={accent}>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#444" }}>
                    {data.achievements.filter(Boolean).map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </Block>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Block({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 4, height: 20, background: accent, borderRadius: 2 }} />
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#111" }}>{title}</h3>
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
