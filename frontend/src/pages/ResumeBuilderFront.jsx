import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../page_style/resumehome.css";
import {
  CircularProgress,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Card,
  CardContent,
  Typography,
  Divider,
} from "@mui/material";
import { ML_API_URL } from "../api";

export default function ResumeBuilderFront() {
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [jd, setJd] = useState(null);
  const [jdText, setJdText] = useState("");
  const [jdTextMode, setJdTextMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [resumeStyle, setResumeStyle] = useState("Chronological");
  const [generatedResumeUrl, setGeneratedResumeUrl] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  const handleStart = () => navigate("/dashboard");

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const handleCheckMatch = async () => {
    if (!resume || (!jd && !jdText)) {
      showSnackbar("Please upload a resume and job description.", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    jdTextMode ? formData.append("jd_text", jdText) : formData.append("jd", jd);

    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(`${ML_API_URl}match`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      showSnackbar("Resume analyzed successfully using AI!", "success");
    } catch (err) {
      console.error(err);
      showSnackbar("Error analyzing resume. Check backend.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateResume = async () => {
    if (!resume || (!jd && !jdText)) {
      showSnackbar("Please upload resume and JD first.", "warning");
      return;
    }

    setLoading(true);
    setGeneratedResumeUrl(null);

    try {
      const formData = new FormData();
      formData.append("resume_file", resume);
      jdTextMode
        ? formData.append("jd_text_input", jdText)
        : formData.append("jd_file", jd);
      formData.append("resume_style", resumeStyle);

      const res = await axios.post(
        `${ML_API_URL}generate_tailored_resume`,
        formData,
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = window.URL.createObjectURL(blob);
      setGeneratedResumeUrl(url);
      showSnackbar("AI tailored resume generated successfully!", "success");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to generate resume.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (generatedResumeUrl) window.URL.revokeObjectURL(generatedResumeUrl);
    };
  }, [generatedResumeUrl]);

  return (
    <>
      <Navbar />
      <div className="modern-home">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">AI Resume Builder</h1>
            <p className="hero-subtitle">
              Craft a perfect resume in minutes — smart, polished, and powered by AI.
            </p>
            <div className="button-group">
              <button onClick={handleStart} className="btn primary-btn">
                Start Building
              </button>
              <button
                onClick={() => navigate("/templates")}
                className="btn secondary-btn"
              >
                View Templates
              </button>
            </div>
          </div>
        </section>

        <Divider className="divider" />

        {/* AI Resume Match Section */}
        <section className="ai-container">
          <Typography variant="h5" className="section-title">
            🤖 AI Resume Match & Tailored Resume Generator
          </Typography>
          <Typography variant="body1" className="section-desc">
            Upload your resume and job description to get your AI match score,
            missing skills, and generate a customized resume instantly.
          </Typography>

          <Card className="upload-card" elevation={4}>
            <CardContent>
              <div className="upload-group">
                <label className="upload-label">
                  Upload Resume (PDF/DOCX)
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => setResume(e.target.files[0])}
                  />
                </label>
                {resume && <p className="file-name">📄 {resume.name}</p>}

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={jdTextMode}
                    onChange={(e) => {
                      setJdTextMode(e.target.checked);
                      setJd(null);
                    }}
                  />
                  Paste JD as text instead of uploading
                </label>

                {jdTextMode ? (
                  <textarea
                    placeholder="Paste Job Description here..."
                    rows="5"
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                  ></textarea>
                ) : (
                  <>
                    <label className="upload-label">
                      Upload JD (PDF/DOCX)
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={(e) => setJd(e.target.files[0])}
                      />
                    </label>
                    {jd && <p className="file-name">📄 {jd.name}</p>}
                  </>
                )}

                <button
                  className="btn primary-btn"
                  onClick={handleCheckMatch}
                  disabled={loading}
                >
                  {loading ? "Analyzing..." : "Check Match Score"}
                </button>
              </div>

              {result && (
                <div className="result-section">
                  <h3>
                    Match Score:{" "}
                    <span
                      className={
                        result.match_score >= 75
                          ? "score-high"
                          : result.match_score >= 50
                          ? "score-medium"
                          : "score-low"
                      }
                    >
                      {result.match_score}%
                    </span>
                  </h3>

                  <p>
                    <strong>✅ Matched Skills:</strong>{" "}
                    {result.matched_skills?.join(", ") || "None"}
                  </p>
                  <p>
                    <strong>⚠️ Missing Skills:</strong>{" "}
                    {result.missing_skills?.join(", ") || "None"}
                  </p>
                  <p>
                    <strong>💡 Suggestions:</strong> {result.suggestions}
                  </p>

                  <div className="resume-style">
                    <FormControl fullWidth>
                      <InputLabel id="style-label">Resume Style</InputLabel>
                      <Select
                        labelId="style-label"
                        value={resumeStyle}
                        onChange={(e) => setResumeStyle(e.target.value)}
                      >
                        <MenuItem value="Chronological">Chronological</MenuItem>
                        <MenuItem value="Functional">Functional</MenuItem>
                        <MenuItem value="Hybrid">Hybrid</MenuItem>
                      </Select>
                    </FormControl>
                  </div>

                  <button
                    className="btn secondary-btn"
                    onClick={handleGenerateResume}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={20} />
                    ) : (
                      "Generate Tailored Resume"
                    )}
                  </button>

                  {generatedResumeUrl && (
                    <div className="download-section">
                      <a
                        href={generatedResumeUrl}
                        download="AI_Tailored_Resume.docx"
                        className="btn success-btn"
                      >
                        Download Resume
                      </a>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
