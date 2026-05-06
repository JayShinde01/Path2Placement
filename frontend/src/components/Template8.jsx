import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Template8() {
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
    win.document.write(`<html><head><title>Resume</title><style>body { margin: 0; font-family: 'Georgia', serif; } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }</style></head><body>${printContents}</body></html>`);
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

  if (!data) return <div style={{ padding: 40, textAlign: "center" }}>Loading…</div>;

  return (
    <div style={{ background: "#f5f5f0", minHeight: "100vh", padding: "30px 20px" }}>
      <div style={{ maxWidth: 850, margin: "0 auto 20px", display: "flex", gap: 12 }}>
        <button onClick={() => navigate(-1)} style={btnStyle("#654321")}>← Back</button>
        <button onClick={() => setEditing(true)} style={btnStyle("#8b6f47")}>✏️ Edit</button>
        <button onClick={handleDownload} style={btnStyle("#6b4423")}>⬇️ Download</button>
      </div>

      {editing && editData && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2>Edit Information</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {Object.keys(editData.personal).map((k) => (
                <div key={k}>
                  <label style={labelStyle}>{k}</label>
                  <input style={inputStyle} value={editData.personal[k]} onChange={(e) => updatePersonal(k, e.target.value)} />
                </div>
              ))}
            </div>
            <h3>Skills</h3>
            {editData.skills.map((s, i) => (
              <input key={i} style={{ ...inputStyle, marginBottom: 4 }} value={s} onChange={(e) => updateArray("skills", i, e.target.value)} />
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={saveEdit} style={btnStyle("#6b4423")}>Save</button>
              <button onClick={() => setEditing(false)} style={btnStyle("#999")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div ref={printRef} style={{ maxWidth: 850, margin: "0 auto", background: "#fefdf7", padding: "50px 60px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontFamily: "'Georgia', serif", color: "#2c2c2c", lineHeight: 1.8 }}>
        <div style={{ borderBottom: "3px solid #7c2d12", paddingBottom: 20, marginBottom: 25 }}>
          <h1 style={{ margin: "0 0 2px", fontSize: 32, fontWeight: 700, color: "#7c2d12" }}>{data.personal.name}</h1>
          <p style={{ margin: "0 0 8px", fontSize: 15, color: "#666", fontStyle: "italic" }}>{data.personal.title}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#777" }}>{[data.personal.email, data.personal.phone].filter(Boolean).join(" | ")}</p>
        </div>

        {data.education?.filter(e => e.degree).length > 0 && (
          <div style={{ marginBottom: 25 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", color: "#7c2d12", borderBottom: "2px solid #e8d5c4", paddingBottom: 6, marginBottom: 12 }}>ACADEMIC BACKGROUND</h3>
            {data.education.filter(e => e.degree).map((e, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#2c2c2c" }}>{e.degree}</div>
                <div style={{ fontSize: 13, color: "#666" }}>{e.institute}</div>
                {e.year && <div style={{ fontSize: 12, color: "#999" }}>{e.year}</div>}
              </div>
            ))}
          </div>
        )}

        {data.experience?.filter(e => e.role).length > 0 && (
          <div style={{ marginBottom: 25 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", color: "#7c2d12", borderBottom: "2px solid #e8d5c4", paddingBottom: 6, marginBottom: 12 }}>PROFESSIONAL EXPERIENCE</h3>
            {data.experience.filter(e => e.role).map((e, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <strong style={{ fontSize: 13 }}>{e.role}</strong>
                  <span style={{ fontSize: 12, color: "#999" }}>{e.duration}</span>
                </div>
                <div style={{ fontSize: 13, color: "#7c2d12", fontWeight: 600, marginBottom: 4 }}>{e.company}</div>
                <p style={{ fontSize: 12, margin: 0, color: "#555" }}>{e.description}</p>
              </div>
            ))}
          </div>
        )}

        {data.projects?.filter(p => p.title).length > 0 && (
          <div style={{ marginBottom: 25 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", color: "#7c2d12", borderBottom: "2px solid #e8d5c4", paddingBottom: 6, marginBottom: 12 }}>RESEARCH & PROJECTS</h3>
            {data.projects.filter(p => p.title).map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <strong style={{ fontSize: 12, display: "block", marginBottom: 2 }}>{p.title}</strong>
                <p style={{ fontSize: 12, margin: 0, color: "#555" }}>{p.description}</p>
              </div>
            ))}
          </div>
        )}

        {data.skills?.filter(Boolean).length > 0 && (
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", color: "#7c2d12", borderBottom: "2px solid #e8d5c4", paddingBottom: 6, marginBottom: 8 }}>COMPETENCIES</h3>
            <p style={{ fontSize: 12, margin: 0, color: "#555", lineHeight: 1.6 }}>{data.skills.filter(Boolean).join(" • ")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const btnStyle = (bg) => ({ background: bg, color: "#fff", border: "none", padding: "8px 16px", borderRadius: 3, cursor: "pointer", fontSize: 12, fontWeight: 600 });
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" };
const modalBox = { background: "#fff", borderRadius: 6, padding: 28, maxWidth: 600, width: "100%", maxHeight: "85vh", overflowY: "auto" };
const labelStyle = { fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 4, display: "block" };
const inputStyle = { width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 4, fontSize: 12, boxSizing: "border-box" };
