import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Template12() {
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
    win.document.write(`<html><head><title>Resume</title><style>body { margin: 0; font-family: sans-serif; } @media print { body { -webkit-print-color-adjust: exact; } }</style></head><body>${printContents}</body></html>`);
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
    <div style={{ background: "#fafafa", minHeight: "100vh", padding: "30px 20px" }}>
      <div style={{ maxWidth: 850, margin: "0 auto 20px", display: "flex", gap: 12 }}>
        <button onClick={() => navigate(-1)} style={btnStyle("#d97706")}>← Back</button>
        <button onClick={() => setEditing(true)} style={btnStyle("#d97706")}>✏️ Edit</button>
        <button onClick={handleDownload} style={btnStyle("#d97706")}>⬇️ Download</button>
      </div>

      {editing && editData && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ color: "#d97706" }}>Edit Details</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {Object.keys(editData.personal).map((k) => (
                <div key={k}>
                  <label style={labelStyle}>{k}</label>
                  <input style={inputStyle} value={editData.personal[k]} onChange={(e) => updatePersonal(k, e.target.value)} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={saveEdit} style={btnStyle("#d97706")}>Save</button>
              <button onClick={() => setEditing(false)} style={btnStyle("#999")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div ref={printRef} style={{ maxWidth: 850, margin: "0 auto", background: "#fff", padding: "45px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <div style={{ marginBottom: 35 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: 32, fontWeight: 700, color: "#1a1a1a" }}>{data.personal.name}</h1>
          <p style={{ margin: "0 0 10px", fontSize: 14, color: "#d97706", fontWeight: 600 }}>{data.personal.title}</p>
          <p style={{ margin: 0, fontSize: 11, color: "#666" }}>{[data.personal.email, data.personal.phone, data.personal.address].filter(Boolean).join(" • ")}</p>
        </div>

        {data.skills?.filter(Boolean).length > 0 && (
          <div style={{ marginBottom: 30, padding: "20px", background: "#fff9e6", borderRadius: 6 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#d97706", margin: "0 0 12px", letterSpacing: 1 }}>Core Skills</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {data.skills.filter(Boolean).map((s, i) => (
                <div key={i} style={{ fontSize: 11, color: "#555", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 4, height: 4, background: "#d97706", borderRadius: "50%", flexShrink: 0 }} />
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.experience?.filter(e => e.role).length > 0 && (
          <div style={{ marginBottom: 30 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#d97706", marginBottom: 14, letterSpacing: 1 }}>Professional Experience</h3>
            {data.experience.filter(e => e.role).map((e, i) => (
              <div key={i} style={{ marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid #f0f0f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <strong style={{ fontSize: 12, color: "#1a1a1a" }}>{e.role}</strong>
                  <span style={{ fontSize: 11, color: "#999" }}>{e.duration}</span>
                </div>
                <p style={{ fontSize: 11, margin: "0 0 6px", color: "#d97706", fontWeight: 600 }}>{e.company}</p>
                <p style={{ fontSize: 11, margin: 0, color: "#555", lineHeight: 1.5 }}>{e.description}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
          {data.education?.filter(e => e.degree).length > 0 && (
            <div>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#d97706", marginBottom: 12, letterSpacing: 1 }}>Education</h3>
              {data.education.filter(e => e.degree).map((e, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <strong style={{ fontSize: 11, color: "#1a1a1a" }}>{e.degree}</strong>
                  <p style={{ fontSize: 10, margin: "2px 0 0", color: "#666" }}>{e.institute} {e.year && `(${e.year})`}</p>
                </div>
              ))}
            </div>
          )}

          {data.certifications?.filter(Boolean).length > 0 && (
            <div>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#d97706", marginBottom: 12, letterSpacing: 1 }}>Certifications</h3>
              <ul style={{ margin: 0, paddingLeft: 14, fontSize: 10 }}>
                {data.certifications.filter(Boolean).map((c, i) => <li key={i} style={{ marginBottom: 6, color: "#555" }}>{c}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const btnStyle = (bg) => ({ background: bg, color: "#fff", border: "none", padding: "8px 16px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 600 });
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" };
const modalBox = { background: "#fff", borderRadius: 8, padding: 28, maxWidth: 600, width: "100%", maxHeight: "85vh", overflowY: "auto" };
const labelStyle = { fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 4, display: "block" };
const inputStyle = { width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 4, fontSize: 12, boxSizing: "border-box" };
