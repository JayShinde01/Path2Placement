import React, { useState } from "react";
import axios from "axios";
import { Container, Typography, Button, Box, CircularProgress, Paper } from "@mui/material";
import { API_BASE_URL } from "../api";

export default function ResumeMatcher() {
  const [resume, setResume] = useState(null);
  const [jd, setJd] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resume || !jd) return alert("Please upload both resume and JD");

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("jd", jd);

    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/resume-match`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.response?.data?.message || "Server error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: "12px" }}>
        <Typography variant="h5" align="center" gutterBottom>
          AI Resume Matcher
        </Typography>

        <form onSubmit={handleSubmit}>
          <Button variant="contained" component="label" sx={{ mb: 2 }}>
            Upload Resume
            <input type="file" hidden accept=".pdf,.docx" onChange={(e) => setResume(e.target.files[0])} />
          </Button>
          <Button variant="contained" component="label" sx={{ mb: 2 }}>
            Upload Job Description
            <input type="file" hidden accept=".pdf,.docx" onChange={(e) => setJd(e.target.files[0])} />
          </Button>

          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Check Match"}
          </Button>
        </form>

        {result && (
          <Box mt={4}>
            <Typography variant="h6" color="primary">Match Score: {result.match_score}%</Typography>
            <Typography>Suggestions: {result.suggestions}</Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
