import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Template10() {
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
    win.document.write(`<html><head><title>Resume</title><style>body { margin: 0; font-family: 'Segoe UI', sans-serif; } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }</style></head><body>${printContents}</body></html>`);
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
    <div style={{ background: "#f0f0f0", minHeight: "100vh", padding: "30px 20px" }}>
      <div style={{ maxWidth: 950, margin: "0 auto 20px", display: "flex", gap: 12 }}>
        <button onClick={() => navigate(-1)} style={btnStyle("#666")}>← Back</button>
        <button onClick={() => setEditing(true)} style={btnStyle("#c026d3")}>✏️ Edit</button>
        <button onClick={handleDownload} style={btnStyle("#c026d3")}>⬇️ Download</button>
      </div>

      {editing && editData && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ color: "#c026d3" }}>Edit Information</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {Object.keys(editData.personal).map((k) => (
                <div key={k}>
                  <label style={labelStyle}>{k}</label>
                  <input style={inputStyle} value={editData.personal[k]} onChange={(e) => updatePersonal(k, e.target.value)} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={saveEdit} style={btnStyle("#c026d3")}>Save</button>
              <button onClick={() => setEditing(false)} style={btnStyle("#999")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div ref={printRef} style={{ maxWidth: 950, margin: "0 auto", background: "#fff", padding: "60px", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", fontFamily: "'Segoe UI', sans-serif" }}>
        {/* Header with colored block */}
        <div style={{ display: "flex", gap: 30, marginBottom: 40, alignItems: "flex-start" }}>
          <div style={{ background: "linear-gradient(135deg, #c026d3 0%, #a21caf 100%)", width: 120, height: 120, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 48, fontWeight: 700, flexShrink: 0 }}>
            {data.personal.name?.charAt(0) || "?"}
          </div>
          <div>
            <h1 style={{ margin: "0 0 8px", fontSize: 36, fontWeight: 700, color: "#1a1a1a" }}>{data.personal.name}</h1>
            <p style={{ margin: "0 0 12px", fontSize: 16, color: "#c026d3", fontWeight: 600 }}>{data.personal.title}</p>
            <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{[data.personal.email, data.personal.phone].filter(Boolean).join(" • ")}</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginBottom: 40 }}>
          {/* Left Column */}
          <div>
            {data.experience?.filter(e => e.role).length > 0 && (
              <div style={{ marginBottom: 30 }}>
                <h2 style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", color: "#c026d3", marginBottom: 16, letterSpacing: 1.5 }}>Experience</h2>
                {data.experience.filter(e => e.role).map((e, i) => (
                  <div key={i} style={{ marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid #f0f0f0" }}>
                    <h3 style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{e.role}</h3>
                    <p style={{ margin: "0 0 6px", fontSize: 12, color: "#c026d3", fontWeight: 600 }}>{e.company}</p>
                    <p style={{ margin: "0 0 8px", fontSize: 11, color: "#888" }}>{e.duration}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#555", lineHeight: 1.5 }}>{e.description}</p>
                  </div>
                ))}
              </div>
            )}

            {data.projects?.filter(p => p.title).length > 0 && (
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", color: "#c026d3", marginBottom: 16, letterSpacing: 1.5 }}>Portfolio</h2>
                <div style={{ display: "grid", gap: 14 }}>
                  {data.projects.filter(p => p.title).map((p, i) => (
                    <div key={i} style={{ background: "#faf5ff", padding: 14, borderRadius: 6, borderLeft: "4px solid #c026d3" }}>
                      <h4 style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: "#c026d3" }}>{p.title}</h4>
                      <p style={{ margin: 0, fontSize: 11, color: "#555" }}>{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div>
            {data.education?.filter(e => e.degree).length > 0 && (
              <div style={{ marginBottom: 30 }}>
                <h2 style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", color: "#c026d3", marginBottom: 16, letterSpacing: 1.5 }}>Education</h2>
                {data.education.filter(e => e.degree).map((e, i) => (
                  <div key={i} style={{ marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #f0f0f0" }}>
                    <h3 style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>{e.degree}</h3>
                    <p style={{ margin: "0 0 2px", fontSize: 11, color: "#666" }}>{e.institute}</p>
                    {e.year && <p style={{ margin: 0, fontSize: 10, color: "#c026d3", fontWeight: 600 }}>{e.year}</p>}
                  </div>
                ))}
              </div>
            )}

            {data.skills?.filter(Boolean).length > 0 && (
              <div style={{ marginBottom: 30 }}>
                <h2 style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", color: "#c026d3", marginBottom: 12, letterSpacing: 1.5 }}>Skills</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {data.skills.filter(Boolean).map((s, i) => (
                    <span key={i} style={{ fontSize: 11, background: "#faf5ff", color: "#c026d3", padding: "6px 12px", borderRadius: 20, fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {data.certifications?.filter(Boolean).length > 0 && (
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", color: "#c026d3", marginBottom: 12, letterSpacing: 1.5 }}>Certifications</h2>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11 }}>
                  {data.certifications.filter(Boolean).map((c, i) => <li key={i} style={{ marginBottom: 6, color: "#555" }}>{c}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>

        {data.personal.summary && (
          <div style={{ background: "#faf5ff", padding: 20, borderRadius: 8, borderLeft: "4px solid #c026d3" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: "#c026d3" }}>About</h3>
            <p style={{ margin: 0, fontSize: 12, color: "#555", lineHeight: 1.6 }}>{data.personal.summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const btnStyle = (bg) => ({ background: bg, color: "#fff", border: "none", padding: "8px 16px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 600 });
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" };
const modalBox = { background: "#fff", borderRadius: 8, padding: 28, maxWidth: 600, width: "100%", maxHeight: "85vh", overflowY: "auto" };
const labelStyle = { fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 4, display: "block" };
const inputStyle = { width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 4, fontSize: 12, boxSizing: "border-box" };
