import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Template11() {
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
    win.document.write(`<html><head><title>Resume</title><style>body { margin: 0; font-family: sans-serif; } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }</style></head><body>${printContents}</body></html>`);
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
    <div style={{ background: "#fff", minHeight: "100vh", padding: "30px 20px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto 20px", display: "flex", gap: 12 }}>
        <button onClick={() => navigate(-1)} style={btnStyle("#059669")}>← Back</button>
        <button onClick={() => setEditing(true)} style={btnStyle("#059669")}>✏️ Edit</button>
        <button onClick={handleDownload} style={btnStyle("#059669")}>⬇️ Download</button>
      </div>

      {editing && editData && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ color: "#059669" }}>Edit Information</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {Object.keys(editData.personal).map((k) => (
                <div key={k}>
                  <label style={labelStyle}>{k}</label>
                  <input style={inputStyle} value={editData.personal[k]} onChange={(e) => updatePersonal(k, e.target.value)} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={saveEdit} style={btnStyle("#059669")}>Save</button>
              <button onClick={() => setEditing(false)} style={btnStyle("#999")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div ref={printRef} style={{ maxWidth: 800, margin: "0 auto", background: "#fff", padding: "50px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 700, color: "#059669" }}>{data.personal.name}</h1>
          <p style={{ margin: "0 0 8px", fontSize: 14, color: "#666" }}>{data.personal.title}</p>
          <p style={{ margin: 0, fontSize: 11, color: "#888" }}>{[data.personal.email, data.personal.phone].filter(Boolean).join(" | ")}</p>
        </div>

        {data.personal.summary && (
          <div style={{ marginBottom: 35, paddingBottom: 20, borderBottom: "2px solid #059669" }}>
            <p style={{ fontSize: 12, color: "#555", margin: 0, lineHeight: 1.7 }}>{data.personal.summary}</p>
          </div>
        )}

        {data.experience?.filter(e => e.role).length > 0 && (
          <div style={{ marginBottom: 35 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#059669", marginBottom: 20, letterSpacing: 1 }}>Career Timeline</h3>
            {data.experience.filter(e => e.role).map((e, i) => (
              <div key={i} style={{ display: "flex", gap: 20, marginBottom: 24, position: "relative" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 80, flexShrink: 0 }}>
                  <div style={{ width: 16, height: 16, background: "#059669", borderRadius: "50%", border: "3px solid #fff", boxShadow: "0 0 0 2px #059669", position: "relative", zIndex: 2 }} />
                  {i < data.experience.length - 1 && <div style={{ width: 2, height: 60, background: "#059669", marginTop: 8 }} />}
                </div>
                <div style={{ paddingTop: 2 }}>
                  <strong style={{ fontSize: 13, color: "#1a1a1a" }}>{e.role}</strong>
                  <p style={{ fontSize: 11, margin: "2px 0 4px", color: "#059669", fontWeight: 600 }}>{e.company}</p>
                  <p style={{ fontSize: 11, margin: "0 0 6px", color: "#999" }}>{e.duration}</p>
                  <p style={{ fontSize: 11, color: "#555", margin: 0, lineHeight: 1.5 }}>{e.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.education?.filter(e => e.degree).length > 0 && (
          <div style={{ marginBottom: 35 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#059669", marginBottom: 16, letterSpacing: 1 }}>Education</h3>
            {data.education.filter(e => e.degree).map((e, i) => (
              <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #e5e5e5" }}>
                <strong style={{ fontSize: 12, color: "#1a1a1a" }}>{e.degree}</strong>
                <p style={{ fontSize: 11, margin: "2px 0 0", color: "#666" }}>{e.institute} {e.year && `(${e.year})`}</p>
              </div>
            ))}
          </div>
        )}

        {data.skills?.filter(Boolean).length > 0 && (
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#059669", marginBottom: 12, letterSpacing: 1 }}>Skills</h3>
            <p style={{ fontSize: 11, color: "#555", margin: 0, lineHeight: 1.8 }}>{data.skills.filter(Boolean).join(" • ")}</p>
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
