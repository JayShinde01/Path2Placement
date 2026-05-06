import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Template7() {
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
    win.document.write(`
      <html><head><title>Resume</title>
      <style>
        body { margin: 0; font-family: 'Segoe UI', sans-serif; }
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

  return (
    <div style={{ background: "#fafafa", minHeight: "100vh", padding: "30px 20px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto 20px", display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button onClick={() => navigate(-1)} style={btnStyle("#6b7280")}>← Back</button>
        <button onClick={() => { setEditing(true); setEditData(JSON.parse(localStorage.getItem("resumeData"))); }} style={btnStyle("#7c3aed")}>✏️ Edit</button>
        <button onClick={handleDownload} style={btnStyle("#059669")}>⬇️ Download</button>
      </div>

      {editing && editData && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ marginTop: 0 }}>Edit Resume</h2>
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
              <button onClick={saveEdit} style={btnStyle("#059669")}>💾 Save</button>
              <button onClick={() => setEditing(false)} style={btnStyle("#6b7280")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div ref={printRef} style={{ width: "100%", maxWidth: 800, margin: "0 auto", background: "#fff", padding: "40px 50px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontFamily: "'Segoe UI', sans-serif", lineHeight: 1.6, color: "#1a1a1a" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 700 }}>{data.personal.name}</h1>
          <p style={{ margin: "0 0 8px", fontSize: 14, color: "#666" }}>{data.personal.title}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
            {[data.personal.email, data.personal.phone, data.personal.address].filter(Boolean).join(" • ")}
          </p>
        </div>

        {data.personal.summary && (
          <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #e5e5e5" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 8px" }}>PROFILE</h3>
            <p style={{ fontSize: 13, margin: 0, color: "#555" }}>{data.personal.summary}</p>
          </div>
        )}

        {data.experience?.filter(e => e.role).length > 0 && (
          <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #e5e5e5" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 12px" }}>EXPERIENCE</h3>
            {data.experience.filter(e => e.role).map((e, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <strong style={{ fontSize: 13 }}>{e.role}</strong>
                  <span style={{ fontSize: 12, color: "#888" }}>{e.duration}</span>
                </div>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>{e.company}</div>
                <p style={{ fontSize: 12, margin: 0, color: "#555" }}>{e.description}</p>
              </div>
            ))}
          </div>
        )}

        {data.education?.filter(e => e.degree).length > 0 && (
          <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #e5e5e5" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 12px" }}>EDUCATION</h3>
            {data.education.filter(e => e.degree).map((e, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <strong style={{ fontSize: 13 }}>{e.degree}</strong>
                <p style={{ fontSize: 12, margin: "2px 0", color: "#666" }}>{e.institute} {e.year && `(${e.year})`}</p>
              </div>
            ))}
          </div>
        )}

        {data.skills?.filter(Boolean).length > 0 && (
          <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #e5e5e5" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 8px" }}>SKILLS</h3>
            <p style={{ fontSize: 12, margin: 0, color: "#555", lineHeight: 1.8 }}>{data.skills.filter(Boolean).join(" • ")}</p>
          </div>
        )}

        {data.certifications?.filter(Boolean).length > 0 && (
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 8px" }}>CERTIFICATIONS</h3>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12 }}>
              {data.certifications.filter(Boolean).map((c, i) => <li key={i} style={{ marginBottom: 4 }}>{c}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

const btnStyle = (bg) => ({ background: bg, color: "#fff", border: "none", padding: "9px 18px", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 600 });
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" };
const modalBox = { background: "#fff", borderRadius: 8, padding: 28, maxWidth: 600, width: "100%", maxHeight: "85vh", overflowY: "auto" };
const labelStyle = { fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 4, display: "block" };
const inputStyle = { width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 4, fontSize: 13, boxSizing: "border-box" };
