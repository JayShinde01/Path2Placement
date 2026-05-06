import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Template6() {
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
      <style>body{margin:0;font-family:'Courier New',monospace;}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style>
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

  const accent = "#0ea5e9";
  const dark = "#0f172a";

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", padding: "30px 20px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto 20px", display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button onClick={() => navigate(-1)} style={btnStyle("#475569")}>← Back</button>
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
              <div key={i} style={{ background: "#f8fafc", padding: 10, borderRadius: 6, marginBottom: 8 }}>
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

      {/* Resume — Dark Tech / Developer Theme */}
      <div ref={printRef} style={{ maxWidth: 900, margin: "0 auto", background: dark, color: "#e2e8f0", fontFamily: "'Courier New', monospace", boxShadow: "0 0 40px rgba(14,165,233,0.2)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "36px 40px", borderBottom: `2px solid ${accent}`, background: "#1e293b" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: accent, letterSpacing: 3, marginBottom: 6 }}>// RESUME</div>
              <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, color: "#f8fafc" }}>{data.personal.name}</h1>
              <p style={{ margin: "6px 0 0", fontSize: 14, color: accent }}>{data.personal.title}</p>
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 2, textAlign: "right" }}>
              {data.personal.phone && <div><span style={{ color: accent }}>phone:</span> {data.personal.phone}</div>}
              {data.personal.email && <div><span style={{ color: accent }}>email:</span> {data.personal.email}</div>}
              {data.personal.github && <div><span style={{ color: accent }}>github:</span> {data.personal.github}</div>}
              {data.personal.linkedin && <div><span style={{ color: accent }}>linkedin:</span> {data.personal.linkedin}</div>}
              {data.personal.address && <div><span style={{ color: accent }}>location:</span> {data.personal.address}</div>}
            </div>
          </div>
        </div>

        <div style={{ padding: "28px 40px" }}>
          {data.personal.summary && (
            <DevBlock title="about" accent={accent}>
              <p style={{ fontSize: 13, color: "#cbd5e1", margin: 0, lineHeight: 1.8 }}>{data.personal.summary}</p>
            </DevBlock>
          )}

          {data.skills?.filter(Boolean).length > 0 && (
            <DevBlock title="skills" accent={accent}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {data.skills.filter(Boolean).map((s, i) => (
                  <span key={i} style={{ background: "#1e293b", border: `1px solid ${accent}`, color: accent, padding: "3px 12px", borderRadius: 4, fontSize: 12, fontFamily: "monospace" }}>{s}</span>
                ))}
              </div>
            </DevBlock>
          )}

          {data.experience?.filter(e => e.role).length > 0 && (
            <DevBlock title="experience" accent={accent}>
              {data.experience.filter(e => e.role).map((exp, i) => (
                <div key={i} style={{ marginBottom: 18, paddingLeft: 16, borderLeft: `2px solid ${accent}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 14, color: "#f1f5f9" }}>{exp.role}</strong>
                    <span style={{ fontSize: 12, color: "#64748b", background: "#1e293b", padding: "1px 8px", borderRadius: 4 }}>{exp.duration}</span>
                  </div>
                  {exp.company && <div style={{ fontSize: 13, color: accent, marginBottom: 4 }}>{exp.company}</div>}
                  <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>{exp.description}</p>
                </div>
              ))}
            </DevBlock>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
            <div>
              {data.projects?.filter(p => p.title).length > 0 && (
                <DevBlock title="projects" accent={accent}>
                  {data.projects.filter(p => p.title).map((p, i) => (
                    <div key={i} style={{ marginBottom: 14, background: "#1e293b", padding: "10px 14px", borderRadius: 6, borderLeft: `3px solid ${accent}` }}>
                      <strong style={{ fontSize: 13, color: "#f1f5f9" }}>{p.title}</strong>
                      {p.tech && <div style={{ fontSize: 11, color: accent, marginBottom: 4 }}>[{p.tech}]</div>}
                      <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{p.description}</p>
                    </div>
                  ))}
                </DevBlock>
              )}
            </div>
            <div>
              {data.education?.filter(e => e.degree).length > 0 && (
                <DevBlock title="education" accent={accent}>
                  {data.education.filter(e => e.degree).map((e, i) => (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <strong style={{ fontSize: 13, color: "#f1f5f9" }}>{e.degree}</strong>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{e.institute}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{e.year} {e.grade && `· ${e.grade}`}</div>
                    </div>
                  ))}
                </DevBlock>
              )}
              {data.certifications?.filter(Boolean).length > 0 && (
                <DevBlock title="certifications" accent={accent}>
                  {data.certifications.filter(Boolean).map((c, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
                      <span style={{ color: accent }}>→</span> {c}
                    </div>
                  ))}
                </DevBlock>
              )}
              {data.achievements?.filter(Boolean).length > 0 && (
                <DevBlock title="achievements" accent={accent}>
                  {data.achievements.filter(Boolean).map((a, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
                      <span style={{ color: "#22c55e" }}>✓</span> {a}
                    </div>
                  ))}
                </DevBlock>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding: "12px 40px", background: "#1e293b", borderTop: `1px solid #334155`, fontSize: 11, color: "#475569", textAlign: "center" }}>
          {`/* Generated with Path2Placement Resume Builder */`}
        </div>
      </div>
    </div>
  );
}

function DevBlock({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ color: "#64748b", fontSize: 13 }}>const</span>
        <span style={{ color: accent, fontSize: 13, fontWeight: 700 }}>{title}</span>
        <span style={{ color: "#64748b", fontSize: 13 }}>= {"{"}</span>
      </div>
      <div style={{ paddingLeft: 16 }}>{children}</div>
      <div style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>{"}"}</div>
    </div>
  );
}

const btnStyle = (bg) => ({ background: bg, color: "#fff", border: "none", padding: "9px 18px", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 600 });
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
const modalBox = { background: "#fff", borderRadius: 12, padding: 28, maxWidth: 700, width: "100%", maxHeight: "85vh", overflowY: "auto" };
const labelStyle = { fontSize: 11, color: "#666", display: "block", marginBottom: 2, textTransform: "capitalize" };
const inputStyle = { width: "100%", padding: "6px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, boxSizing: "border-box" };
