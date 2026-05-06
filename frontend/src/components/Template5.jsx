import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Template5() {
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
      <style>body{margin:0;font-family:'Trebuchet MS',sans-serif;}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style>
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

  const accent = "#dc2626";

  return (
    <div style={{ background: "#fff5f5", minHeight: "100vh", padding: "30px 20px" }}>
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
              <div key={i} style={{ background: "#fff5f5", padding: 10, borderRadius: 6, marginBottom: 8 }}>
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

      {/* Resume — Bold Red Sidebar */}
      <div ref={printRef} style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "30% 70%", fontFamily: "'Trebuchet MS', Arial, sans-serif", color: "#1a1a1a", boxShadow: "0 8px 32px rgba(220,38,38,0.15)", overflow: "hidden" }}>
        {/* LEFT SIDEBAR */}
        <div style={{ background: accent, color: "#fff", padding: "36px 20px" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.2)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, border: "3px solid rgba(255,255,255,0.5)" }}>
            {data.personal.name?.charAt(0) || "?"}
          </div>
          <h2 style={{ textAlign: "center", fontSize: 15, margin: "0 0 4px", letterSpacing: 1 }}>{data.personal.name}</h2>
          <p style={{ textAlign: "center", fontSize: 11, opacity: 0.85, margin: "0 0 24px", lineHeight: 1.4 }}>{data.personal.title}</p>

          <SideBlock title="Contact">
            {data.personal.phone && <SideItem icon="📞">{data.personal.phone}</SideItem>}
            {data.personal.email && <SideItem icon="✉">{data.personal.email}</SideItem>}
            {data.personal.address && <SideItem icon="📍">{data.personal.address}</SideItem>}
            {data.personal.github && <SideItem icon="🔗">{data.personal.github}</SideItem>}
            {data.personal.linkedin && <SideItem icon="💼">{data.personal.linkedin}</SideItem>}
          </SideBlock>

          {data.skills?.filter(Boolean).length > 0 && (
            <SideBlock title="Skills">
              {data.skills.filter(Boolean).map((s, i) => (
                <div key={i} style={{ marginBottom: 7 }}>
                  <div style={{ fontSize: 12, marginBottom: 3 }}>{s}</div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.25)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${65 + (i % 4) * 8}%`, background: "#fff", borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </SideBlock>
          )}

          {data.languages?.filter(Boolean).length > 0 && (
            <SideBlock title="Languages">
              {data.languages.filter(Boolean).map((l, i) => <SideItem key={i} icon="🌐">{l}</SideItem>)}
            </SideBlock>
          )}

          {data.certifications?.filter(Boolean).length > 0 && (
            <SideBlock title="Certifications">
              {data.certifications.filter(Boolean).map((c, i) => <SideItem key={i} icon="🏅">{c}</SideItem>)}
            </SideBlock>
          )}
        </div>

        {/* RIGHT MAIN */}
        <div style={{ background: "#fff", padding: "36px 32px" }}>
          {data.personal.summary && (
            <MainBlock title="Profile" accent={accent}>
              <p style={{ fontSize: 13, color: "#444", margin: 0, lineHeight: 1.7 }}>{data.personal.summary}</p>
            </MainBlock>
          )}

          {data.experience?.filter(e => e.role).length > 0 && (
            <MainBlock title="Work Experience" accent={accent}>
              {data.experience.filter(e => e.role).map((exp, i) => (
                <div key={i} style={{ marginBottom: 16, paddingLeft: 14, borderLeft: `3px solid ${accent}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 14 }}>{exp.role}</strong>
                    <span style={{ fontSize: 12, color: "#888", background: "#fff5f5", padding: "1px 8px", borderRadius: 10 }}>{exp.duration}</span>
                  </div>
                  {exp.company && <div style={{ fontSize: 13, color: accent, marginBottom: 3 }}>{exp.company}</div>}
                  <p style={{ fontSize: 13, color: "#555", margin: 0 }}>{exp.description}</p>
                </div>
              ))}
            </MainBlock>
          )}

          {data.projects?.filter(p => p.title).length > 0 && (
            <MainBlock title="Projects" accent={accent}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {data.projects.filter(p => p.title).map((p, i) => (
                  <div key={i} style={{ background: "#fff5f5", padding: "10px 14px", borderRadius: 8, borderTop: `3px solid ${accent}` }}>
                    <strong style={{ fontSize: 13 }}>{p.title}</strong>
                    {p.tech && <div style={{ fontSize: 11, color: accent, marginBottom: 4 }}>{p.tech}</div>}
                    <p style={{ fontSize: 12, color: "#555", margin: 0 }}>{p.description}</p>
                  </div>
                ))}
              </div>
            </MainBlock>
          )}

          {data.education?.filter(e => e.degree).length > 0 && (
            <MainBlock title="Education" accent={accent}>
              {data.education.filter(e => e.degree).map((e, i) => (
                <div key={i} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{e.degree}</strong>
                    <div style={{ fontSize: 13, color: "#666" }}>{e.institute}</div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: 12, color: "#999" }}>
                    <div>{e.year}</div>
                    {e.grade && <div>{e.grade}</div>}
                  </div>
                </div>
              ))}
            </MainBlock>
          )}

          {data.achievements?.filter(Boolean).length > 0 && (
            <MainBlock title="Achievements" accent={accent}>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#444" }}>
                {data.achievements.filter(Boolean).map((a, i) => <li key={i} style={{ marginBottom: 4 }}>{a}</li>)}
              </ul>
            </MainBlock>
          )}
        </div>
      </div>
    </div>
  );
}

function SideBlock({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h4 style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 8px", color: "rgba(255,255,255,0.7)", borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: 4 }}>{title}</h4>
      {children}
    </div>
  );
}
function SideItem({ icon, children }) {
  return <div style={{ fontSize: 12, margin: "3px 0", display: "flex", gap: 6, alignItems: "flex-start" }}><span>{icon}</span><span style={{ opacity: 0.9 }}>{children}</span></div>;
}
function MainBlock({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: accent }}>{title}</h3>
        <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg, ${accent}, transparent)` }} />
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
