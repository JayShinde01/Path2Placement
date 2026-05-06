import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Template9() {
  const location = useLocation();
  const navigate = useNavigate();
  const printRef = useRef();
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    if (location.state?.data) {
      setData(location.state.data);
      setEditData(location.state.data);
    } else {
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
    win.document.write(`<html><head><title>Resume</title><style>body { margin: 0; font-family: 'Arial', sans-serif; } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }</style></head><body>${printContents}</body></html>`);
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

  if (!data) return <div style={{ padding: 40, textAlign: "center" }}>Loading…</div>;

  return (
    <div style={{ background: "#1e3a5f", minHeight: "100vh", padding: "30px 20px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto 20px", display: "flex", gap: 12 }}>
        <button onClick={() => navigate(-1)} style={btnStyle("#fff", "#1e3a5f")}>← Back</button>
        <button onClick={() => setEditing(true)} style={btnStyle("#1e3a5f", "#fff")}>✏️ Edit</button>
        <button onClick={handleDownload} style={btnStyle("#1e3a5f", "#fff")}>⬇️ Download</button>
      </div>

      {editing && editData && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ color: "#1e3a5f" }}>Edit Details</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {Object.keys(editData.personal).map((k) => (
                <div key={k}>
                  <label style={labelStyle}>{k}</label>
                  <input style={inputStyle} value={editData.personal[k]} onChange={(e) => updatePersonal(k, e.target.value)} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={saveEdit} style={btnStyle("#1e3a5f", "#fff")}>Save</button>
              <button onClick={() => setEditing(false)} style={btnStyle("#999", "#fff")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div ref={printRef} style={{ maxWidth: 900, margin: "0 auto", background: "#fff" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%)", color: "#fff", padding: "40px", textAlign: "center" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: 36, fontWeight: 800 }}>{data.personal.name}</h1>
          <p style={{ margin: "0 0 12px", fontSize: 18, opacity: 0.9 }}>{data.personal.title}</p>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>{[data.personal.email, data.personal.phone, data.personal.address].filter(Boolean).join(" • ")}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "60% 40%", minHeight: 1200 }}>
          <div style={{ padding: "40px 35px" }}>
            {data.personal.summary && (
              <div style={{ marginBottom: 30 }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", color: "#1e3a5f", marginBottom: 12, letterSpacing: 1 }}>EXECUTIVE SUMMARY</h3>
                <p style={{ fontSize: 12, lineHeight: 1.7, color: "#333", margin: 0 }}>{data.personal.summary}</p>
              </div>
            )}

            {data.experience?.filter(e => e.role).length > 0 && (
              <div style={{ marginBottom: 30 }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", color: "#1e3a5f", marginBottom: 16, letterSpacing: 1 }}>CAREER HIGHLIGHTS</h3>
                {data.experience.filter(e => e.role).map((e, i) => (
                  <div key={i} style={{ marginBottom: 16, paddingLeft: 12, borderLeft: "3px solid #1e3a5f" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <strong style={{ fontSize: 12, color: "#1e3a5f" }}>{e.role}</strong>
                      <span style={{ fontSize: 11, color: "#999" }}>{e.duration}</span>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 6 }}>{e.company}</div>
                    <p style={{ fontSize: 11, margin: 0, color: "#555", lineHeight: 1.6 }}>{e.description}</p>
                  </div>
                ))}
              </div>
            )}

            {data.projects?.filter(p => p.title).length > 0 && (
              <div style={{ marginBottom: 30 }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", color: "#1e3a5f", marginBottom: 12, letterSpacing: 1 }}>KEY PROJECTS</h3>
                {data.projects.filter(p => p.title).map((p, i) => (
                  <div key={i} style={{ marginBottom: 8, paddingBottom: 8 }}>
                    <strong style={{ fontSize: 11, color: "#1e3a5f" }}>{p.title}</strong>
                    <p style={{ fontSize: 10, margin: "2px 0 0", color: "#555" }}>{p.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: "#f8f9fa", padding: "40px 35px", borderLeft: "1px solid #e0e0e0" }}>
            {data.education?.filter(e => e.degree).length > 0 && (
              <div style={{ marginBottom: 30 }}>
                <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#1e3a5f", marginBottom: 12, letterSpacing: 1 }}>EDUCATION</h3>
                {data.education.filter(e => e.degree).map((e, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <strong style={{ fontSize: 11, display: "block", color: "#1e3a5f" }}>{e.degree}</strong>
                    <p style={{ fontSize: 10, margin: "3px 0 0", color: "#666" }}>{e.institute} {e.year && `(${e.year})`}</p>
                  </div>
                ))}
              </div>
            )}

            {data.skills?.filter(Boolean).length > 0 && (
              <div style={{ marginBottom: 30 }}>
                <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#1e3a5f", marginBottom: 10, letterSpacing: 1 }}>CORE COMPETENCIES</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {data.skills.filter(Boolean).map((s, i) => (
                    <span key={i} style={{ fontSize: 10, background: "#1e3a5f", color: "#fff", padding: "4px 8px", borderRadius: 3, fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {data.certifications?.filter(Boolean).length > 0 && (
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#1e3a5f", marginBottom: 10, letterSpacing: 1 }}>CERTIFICATIONS</h3>
                <ul style={{ margin: 0, paddingLeft: 14, fontSize: 10 }}>
                  {data.certifications.filter(Boolean).map((c, i) => <li key={i} style={{ marginBottom: 4, color: "#555" }}>{c}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const btnStyle = (bg, text) => ({ background: bg, color: text, border: `2px solid ${text}`, padding: "8px 16px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 600 });
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" };
const modalBox = { background: "#fff", borderRadius: 8, padding: 28, maxWidth: 600, width: "100%", maxHeight: "85vh", overflowY: "auto" };
const labelStyle = { fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 4, display: "block" };
const inputStyle = { width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 4, fontSize: 12, boxSizing: "border-box" };
