import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Template15() {
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
    <div style={{ background: "#f0fdf4", minHeight: "100vh", padding: "30px 20px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto 20px", display: "flex", gap: 12 }}>
        <button onClick={() => navigate(-1)} style={btnStyle("#0f766e")}>← Back</button>
        <button onClick={() => setEditing(true)} style={btnStyle("#0f766e")}>✏️ Edit</button>
        <button onClick={handleDownload} style={btnStyle("#0f766e")}>⬇️ Download</button>
      </div>

      {editing && editData && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ color: "#0f766e" }}>Edit Information</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {Object.keys(editData.personal).map((k) => (
                <div key={k}>
                  <label style={labelStyle}>{k}</label>
                  <input style={inputStyle} value={editData.personal[k]} onChange={(e) => updatePersonal(k, e.target.value)} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={saveEdit} style={btnStyle("#0f766e")}>Save</button>
              <button onClick={() => setEditing(false)} style={btnStyle("#999")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div ref={printRef} style={{ maxWidth: 920, margin: "0 auto", display: "grid", gridTemplateColumns: "25% 75%", minHeight: 1100, background: "#fff", boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }}>
        {/* Left Sidebar */}
        <div style={{ background: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)", color: "#fff", padding: "40px 25px" }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={{ width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.2)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700 }}>
              {data.personal.name?.charAt(0) || "?"}
            </div>
            <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>{data.personal.name}</h3>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.85 }}>{data.personal.title}</p>
          </div>

          {[data.personal.email, data.personal.phone, data.personal.address].filter(Boolean).length > 0 && (
            <div style={{ marginBottom: 25, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
              <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", margin: "0 0 10px", letterSpacing: 1, opacity: 0.9 }}>Contact</h4>
              {[data.personal.email, data.personal.phone, data.personal.address].filter(Boolean).map((c, i) => (
                <p key={i} style={{ fontSize: 10, margin: "6px 0", opacity: 0.85, lineHeight: 1.4 }}>{c}</p>
              ))}
            </div>
          )}

          {data.skills?.filter(Boolean).length > 0 && (
            <div style={{ marginBottom: 25, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
              <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", margin: "0 0 10px", letterSpacing: 1, opacity: 0.9 }}>Skills</h4>
              {data.skills.filter(Boolean).map((s, i) => (
                <div key={i} style={{ fontSize: 10, margin: "6px 0", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 4, height: 4, background: "#fff", borderRadius: "50%" }} />
                  {s}
                </div>
              ))}
            </div>
          )}

          {data.certifications?.filter(Boolean).length > 0 && (
            <div>
              <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", margin: "0 0 8px", letterSpacing: 1, opacity: 0.9 }}>Certifications</h4>
              {data.certifications.filter(Boolean).map((c, i) => (
                <p key={i} style={{ fontSize: 9, margin: "4px 0", opacity: 0.8 }}>• {c}</p>
              ))}
            </div>
          )}
        </div>

        {/* Right Content */}
        <div style={{ padding: "40px 35px" }}>
          {data.personal.summary && (
            <div style={{ marginBottom: 30 }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#0f766e", marginBottom: 10, letterSpacing: 1 }}>About</h2>
              <p style={{ fontSize: 12, margin: 0, color: "#555", lineHeight: 1.6 }}>{data.personal.summary}</p>
            </div>
          )}

          {data.experience?.filter(e => e.role).length > 0 && (
            <div style={{ marginBottom: 30 }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#0f766e", marginBottom: 14, letterSpacing: 1 }}>Experience</h2>
              {data.experience.filter(e => e.role).map((e, i) => (
                <div key={i} style={{ marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid #e5e5e5" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <strong style={{ fontSize: 12, color: "#0f766e" }}>{e.role}</strong>
                    <span style={{ fontSize: 10, color: "#999" }}>{e.duration}</span>
                  </div>
                  <p style={{ fontSize: 11, margin: "0 0 6px", color: "#0f766e", fontWeight: 600 }}>{e.company}</p>
                  <p style={{ fontSize: 11, margin: 0, color: "#555" }}>{e.description}</p>
                </div>
              ))}
            </div>
          )}

          {data.education?.filter(e => e.degree).length > 0 && (
            <div style={{ marginBottom: 30 }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#0f766e", marginBottom: 12, letterSpacing: 1 }}>Education</h2>
              {data.education.filter(e => e.degree).map((e, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <strong style={{ fontSize: 11, color: "#1a1a1a" }}>{e.degree}</strong>
                  <p style={{ fontSize: 10, margin: "2px 0 0", color: "#666" }}>{e.institute} {e.year && `(${e.year})`}</p>
                </div>
              ))}
            </div>
          )}

          {data.projects?.filter(p => p.title).length > 0 && (
            <div>
              <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#0f766e", marginBottom: 12, letterSpacing: 1 }}>Projects</h2>
              {data.projects.filter(p => p.title).map((p, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <strong style={{ fontSize: 11, color: "#1a1a1a" }}>{p.title}</strong>
                  <p style={{ fontSize: 10, margin: "2px 0 0", color: "#555" }}>{p.description}</p>
                </div>
              ))}
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
