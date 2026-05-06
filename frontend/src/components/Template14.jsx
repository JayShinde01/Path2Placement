import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Template14() {
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
    <div style={{ background: "#f5f3ff", minHeight: "100vh", padding: "30px 20px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto 20px", display: "flex", gap: 12 }}>
        <button onClick={() => navigate(-1)} style={btnStyle("#7c3aed")}>← Back</button>
        <button onClick={() => setEditing(true)} style={btnStyle("#7c3aed")}>✏️ Edit</button>
        <button onClick={handleDownload} style={btnStyle("#7c3aed")}>⬇️ Download</button>
      </div>

      {editing && editData && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ color: "#7c3aed" }}>Edit Information</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {Object.keys(editData.personal).map((k) => (
                <div key={k}>
                  <label style={labelStyle}>{k}</label>
                  <input style={inputStyle} value={editData.personal[k]} onChange={(e) => updatePersonal(k, e.target.value)} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={saveEdit} style={btnStyle("#7c3aed")}>Save</button>
              <button onClick={() => setEditing(false)} style={btnStyle("#999")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div ref={printRef} style={{ maxWidth: 900, margin: "0 auto", background: "#fff", padding: "50px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ margin: "0 0 6px", fontSize: 32, fontWeight: 700, color: "#7c3aed" }}>{data.personal.name}</h1>
          <p style={{ margin: "0 0 12px", fontSize: 15, color: "#666" }}>{data.personal.title}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{[data.personal.email, data.personal.phone].filter(Boolean).join(" • ")}</p>
        </div>

        {data.personal.summary && (
          <div style={{ background: "#f5f3ff", padding: 18, borderRadius: 8, marginBottom: 30, borderLeft: "4px solid #7c3aed" }}>
            <p style={{ margin: 0, fontSize: 12, color: "#555", lineHeight: 1.6 }}>{data.personal.summary}</p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, marginBottom: 30 }}>
          {data.experience?.filter(e => e.role).length > 0 && (
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#7c3aed", marginBottom: 16, letterSpacing: 1 }}>📊 Experience</h3>
              {data.experience.filter(e => e.role).map((e, i) => (
                <div key={i} style={{ background: "#f9f7ff", padding: 14, borderRadius: 6, marginBottom: 12, border: "1px solid #e9d5ff" }}>
                  <strong style={{ fontSize: 11, color: "#7c3aed" }}>{e.role}</strong>
                  <p style={{ fontSize: 10, margin: "4px 0", color: "#666" }}>{e.company} • {e.duration}</p>
                  <p style={{ fontSize: 10, margin: 0, color: "#555" }}>{e.description}</p>
                </div>
              ))}
            </div>
          )}

          {data.education?.filter(e => e.degree).length > 0 && (
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#7c3aed", marginBottom: 16, letterSpacing: 1 }}>🎓 Education</h3>
              {data.education.filter(e => e.degree).map((e, i) => (
                <div key={i} style={{ background: "#f9f7ff", padding: 14, borderRadius: 6, marginBottom: 12, border: "1px solid #e9d5ff" }}>
                  <strong style={{ fontSize: 11, color: "#7c3aed" }}>{e.degree}</strong>
                  <p style={{ fontSize: 10, margin: "4px 0 0", color: "#666" }}>{e.institute} {e.year && `(${e.year})`}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {data.skills?.filter(Boolean).length > 0 && (
          <div style={{ marginBottom: 30 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#7c3aed", marginBottom: 14, letterSpacing: 1 }}>💡 Skills</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {data.skills.filter(Boolean).map((s, i) => (
                <div key={i} style={{ background: "#f9f7ff", padding: 10, borderRadius: 4, fontSize: 11, color: "#7c3aed", fontWeight: 600, textAlign: "center", border: "1px solid #e9d5ff" }}>
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.projects?.filter(p => p.title).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#7c3aed", marginBottom: 12, letterSpacing: 1 }}>🚀 Projects</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {data.projects.filter(p => p.title).map((p, i) => (
                <div key={i} style={{ background: "#f9f7ff", padding: 12, borderRadius: 6, border: "1px solid #e9d5ff" }}>
                  <strong style={{ fontSize: 10, color: "#7c3aed" }}>{p.title}</strong>
                  <p style={{ fontSize: 9, margin: "4px 0 0", color: "#555" }}>{p.description}</p>
                </div>
              ))}
            </div>
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
