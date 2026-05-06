import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Template1() {
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
    const printContents = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Resume</title>
      <style>
        body { margin: 0; font-family: Calibri, Arial, sans-serif; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
      </head><body>${printContents}</body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const saveEdit = () => {
    localStorage.setItem("resumeData", JSON.stringify(editData));
    setData(editData);
    setEditing(false);
  };

  const updatePersonal = (key, val) =>
    setEditData((p) => ({ ...p, personal: { ...p.personal, [key]: val } }));

  const updateArray = (section, idx, val) => {
    const arr = [...editData[section]];
    arr[idx] = val;
    setEditData((p) => ({ ...p, [section]: arr }));
  };

  const updateObjArray = (section, idx, key, val) => {
    const arr = [...editData[section]];
    arr[idx] = { ...arr[idx], [key]: val };
    setEditData((p) => ({ ...p, [section]: arr }));
  };

  if (!data) return <div style={{ padding: 40, textAlign: "center" }}>Loading resume…</div>;

  const accent = "#1f4e8c";

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh", padding: "30px 20px" }}>
      {/* Toolbar */}
      <div style={{ maxWidth: 900, margin: "0 auto 20px", display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button onClick={() => navigate(-1)} style={btnStyle("#6b7280")}>← Back</button>
        <button onClick={() => { setEditing(true); setEditData(JSON.parse(localStorage.getItem("resumeData"))); }} style={btnStyle("#7c3aed")}>✏️ Edit Info</button>
        <button onClick={handleDownload} style={btnStyle("#059669")}>⬇️ Download / Print</button>
      </div>

      {/* Edit Modal */}
      {editing && editData && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ marginTop: 0, color: accent }}>Edit Resume Info</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {Object.keys(editData.personal).map((k) => (
                <div key={k}>
                  <label style={labelStyle}>{k}</label>
                  <input style={inputStyle} value={editData.personal[k]} onChange={(e) => updatePersonal(k, e.target.value)} />
                </div>
              ))}
            </div>
            <h3 style={{ color: accent }}>Skills</h3>
            {editData.skills.map((s, i) => (
              <input key={i} style={{ ...inputStyle, marginBottom: 4 }} value={s} onChange={(e) => updateArray("skills", i, e.target.value)} />
            ))}
            <h3 style={{ color: accent }}>Experience</h3>
            {editData.experience.map((exp, i) => (
              <div key={i} style={{ background: "#f8f9fa", padding: 10, borderRadius: 6, marginBottom: 8 }}>
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

      {/* Resume */}
      <div ref={printRef} style={{ display: "grid", gridTemplateColumns: "28% 72%", width: "100%", maxWidth: 900, minHeight: 1100, margin: "0 auto", fontFamily: "Calibri, Arial, sans-serif", color: "#111", lineHeight: 1.6, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", borderRadius: 4, overflow: "hidden" }}>
        {/* LEFT */}
        <div style={{ background: "#1f4e8c", padding: "30px 20px", color: "#fff" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#fff", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: accent, fontWeight: 700 }}>
            {data.personal.name?.charAt(0) || "?"}
          </div>
          <h2 style={{ textAlign: "center", fontSize: 16, margin: "0 0 4px", letterSpacing: 1 }}>{data.personal.name}</h2>
          <p style={{ textAlign: "center", fontSize: 12, opacity: 0.85, margin: "0 0 20px" }}>{data.personal.title}</p>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.3)", paddingTop: 16 }}>
            <SideHead>CONTACT</SideHead>
            {[data.personal.phone, data.personal.email, data.personal.address].filter(Boolean).map((c, i) => <p key={i} style={{ fontSize: 12, margin: "3px 0", opacity: 0.9 }}>{c}</p>)}
            {data.personal.github && <p style={{ fontSize: 12, margin: "3px 0", opacity: 0.9 }}>🔗 {data.personal.github}</p>}
            {data.personal.linkedin && <p style={{ fontSize: 12, margin: "3px 0", opacity: 0.9 }}>💼 {data.personal.linkedin}</p>}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.3)", paddingTop: 16, marginTop: 16 }}>
            <SideHead>SKILLS</SideHead>
            {data.skills.filter(Boolean).map((s, i) => (
              <div key={i} style={{ fontSize: 12, margin: "4px 0", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#90caf9", flexShrink: 0 }} />
                {s}
              </div>
            ))}
          </div>
          {data.certifications?.filter(Boolean).length > 0 && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.3)", paddingTop: 16, marginTop: 16 }}>
              <SideHead>CERTIFICATIONS</SideHead>
              {data.certifications.filter(Boolean).map((c, i) => <p key={i} style={{ fontSize: 12, margin: "3px 0", opacity: 0.9 }}>• {c}</p>)}
            </div>
          )}
          {data.languages?.filter(Boolean).length > 0 && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.3)", paddingTop: 16, marginTop: 16 }}>
              <SideHead>LANGUAGES</SideHead>
              {data.languages.filter(Boolean).map((l, i) => <p key={i} style={{ fontSize: 12, margin: "3px 0", opacity: 0.9 }}>• {l}</p>)}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ background: "#fff", padding: "30px 28px" }}>
          {data.personal.summary && <>
            <RightHead accent={accent}>PROFILE SUMMARY</RightHead>
            <p style={{ fontSize: 13, color: "#444", marginBottom: 20 }}>{data.personal.summary}</p>
          </>}
          {data.experience?.filter(e => e.role).length > 0 && <>
            <RightHead accent={accent}>EXPERIENCE</RightHead>
            {data.experience.filter(e => e.role).map((e, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ fontSize: 14 }}>{e.role}</strong>
                  <span style={{ fontSize: 12, color: "#888" }}>{e.duration}</span>
                </div>
                <div style={{ fontSize: 13, color: accent, marginBottom: 2 }}>{e.company}</div>
                <p style={{ fontSize: 13, color: "#555", margin: 0 }}>{e.description}</p>
              </div>
            ))}
          </>}
          {data.projects?.filter(p => p.title).length > 0 && <>
            <RightHead accent={accent}>PROJECTS</RightHead>
            {data.projects.filter(p => p.title).map((p, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <strong style={{ fontSize: 14 }}>{p.title}</strong>
                {p.tech && <span style={{ fontSize: 12, color: accent, marginLeft: 8 }}>({p.tech})</span>}
                <p style={{ fontSize: 13, color: "#555", margin: "2px 0 0" }}>{p.description}</p>
              </div>
            ))}
          </>}
          {data.education?.filter(e => e.degree).length > 0 && <>
            <RightHead accent={accent}>EDUCATION</RightHead>
            {data.education.filter(e => e.degree).map((e, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <strong style={{ fontSize: 14 }}>{e.degree}</strong>
                <div style={{ fontSize: 13, color: "#555" }}>{e.institute} {e.year && `(${e.year})`} {e.grade && `— ${e.grade}`}</div>
              </div>
            ))}
          </>}
          {data.achievements?.filter(Boolean).length > 0 && <>
            <RightHead accent={accent}>ACHIEVEMENTS</RightHead>
            <ul style={{ fontSize: 13, color: "#444", paddingLeft: 18, margin: "0 0 16px" }}>
              {data.achievements.filter(Boolean).map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </>}
          {data.activities?.filter(Boolean).length > 0 && <>
            <RightHead accent={accent}>ACTIVITIES</RightHead>
            <ul style={{ fontSize: 13, color: "#444", paddingLeft: 18, margin: 0 }}>
              {data.activities.filter(Boolean).map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </>}
        </div>
      </div>
    </div>
  );
}

function SideHead({ children }) {
  return <h4 style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 8px", color: "#90caf9" }}>{children}</h4>;
}
function RightHead({ children, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 10px" }}>
      <div style={{ width: 4, height: 18, background: accent, borderRadius: 2 }} />
      <h3 style={{ fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", margin: 0, color: accent }}>{children}</h3>
    </div>
  );
}

const btnStyle = (bg) => ({ background: bg, color: "#fff", border: "none", padding: "9px 18px", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 600 });
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
const modalBox = { background: "#fff", borderRadius: 12, padding: 28, maxWidth: 700, width: "100%", maxHeight: "85vh", overflowY: "auto" };
const labelStyle = { fontSize: 11, color: "#666", display: "block", marginBottom: 2, textTransform: "capitalize" };
const inputStyle = { width: "100%", padding: "6px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, boxSizing: "border-box" };
