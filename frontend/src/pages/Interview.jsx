import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../page_style/interview.css";
import { ML_API_URL } from "../api";

export default function Interview() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const storedSessionId = localStorage.getItem("interviewSessionId") || "";

  const [messages, setMessages] = useState([
    { role: "system", text: "Hi there — I'm your AI interviewer. Say hi or start answering." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [sessionId, setSessionId] = useState(storedSessionId);
  const [sessionList, setSessionList] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const recognitionRef = useRef(null);
  const bottomRef = useRef(null);

  const loadSessionHistory = async (focusSessionId = sessionId) => {
    if (!token) return;
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const listRes = await fetch(`${ML_API_URL}api/interview/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!listRes.ok) {
        throw new Error("Could not load interview history");
      }

      const listData = await listRes.json();
      setSessionList(listData.sessions || []);

      const activeId = focusSessionId || listData.sessions?.[0]?.session_id;
      if (activeId) {
        const detailRes = await fetch(`${ML_API_URL}api/interview/sessions/${activeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (detailRes.ok) {
          const detailData = await detailRes.json();
          setSelectedSession(detailData);
          if (detailData.session?.session_id) {
            setSessionId(detailData.session.session_id);
            localStorage.setItem("interviewSessionId", detailData.session.session_id);
          }
        }
      } else {
        setSelectedSession(null);
      }
    } catch (err) {
      console.error("Interview history error:", err);
      setHistoryError("Could not load previous interview sessions right now.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadSessionHistory(storedSessionId || sessionId);
    }
  }, [token]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  // TTS speak
  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 1;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  };

  // Start/stop SpeechRecognition
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = (e) => {
      console.error("Speech recognition error", e);
      setListening(false);
    };

    rec.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognitionRef.current = rec;
    rec.start();
  };

  // Send message to backend
  const sendMessage = async (overrideText) => {
    const text = overrideText ?? input.trim();
    if (!text) return;

    const newMsgUser = { role: "user", text };
    setMessages((m) => [...m, newMsgUser]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${ML_API_URL}interview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          session_id: sessionId || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Server error" }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const botReply = data.reply || "No response from AI.";
      setMessages((m) => [...m, { role: "bot", text: botReply }]);
      speak(botReply);

      if (data.session_id && data.session_id !== sessionId) {
        setSessionId(data.session_id);
        localStorage.setItem("interviewSessionId", data.session_id);
      }

      await loadSessionHistory(data.session_id || sessionId);
    } catch (err) {
      console.error("Send message error:", err);
      setMessages((m) => [...m, { role: "bot", text: "⚠️ Couldn't reach the AI. Try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) sendMessage();
    }
  };

  // small typing indicator animation for AI
  const TypingIndicator = () => (
    <div className="typing-indicator" aria-hidden>
      <span /><span /><span />
    </div>
  );

  return (
    <div className="page-wrapper">
      <Navbar />
      {!token ? (
        <div className="interview-page" style={{ justifyContent: "center", alignItems: "center" }}>
          <div className="auth-banner">
            <h3>🔒 Login required</h3>
            <p>Please log in to use the AI Interview feature.</p>
            <button className="btn btn-primary" onClick={() => navigate("/login")}>Go to Login</button>
          </div>
        </div>
      ) : (
      <div className="interview-page">
        <motion.header
          className="interview-header"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate(-1)} title="Go back">
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="brand">AI Interviewer</div>
          </div>
          <div className="header-actions">
            <button className="icon-btn" title="Voice help" onClick={() => speak("Ask me anything. I'm ready to interview you.")}>🔊</button>
          </div>
        </motion.header>

        <section className="history-panel">
          <div className="history-panel-header">
            <div>
              <h3>Session History</h3>
              <p>Review earlier mock interviews and the feedback captured at the end of each session.</p>
            </div>
            <button className="history-refresh-btn" onClick={() => loadSessionHistory()} disabled={historyLoading}>
              {historyLoading ? "Loading…" : "Refresh"}
            </button>
          </div>

          {historyError && <div className="history-error">{historyError}</div>}

          <div className="history-session-list">
            {sessionList.length === 0 ? (
              <div className="history-empty">No saved interview sessions yet.</div>
            ) : (
              sessionList.slice(0, 6).map((session) => (
                <button
                  key={session.session_id}
                  className={`history-chip ${selectedSession?.session?.session_id === session.session_id ? "active" : ""}`}
                  onClick={() => loadSessionHistory(session.session_id)}
                >
                  <span>{session.role || "Role pending"}</span>
                  <small>{session.status}</small>
                </button>
              ))
            )}
          </div>

          {selectedSession?.session && (
            <div className="history-analysis">
              <div className="history-analysis-header">
                <div>
                  <strong>{selectedSession.session.role || "Unassigned role"}</strong>
                  <p>
                    {selectedSession.session.status === "completed"
                      ? "Completed interview session"
                      : "Live interview in progress"}
                  </p>
                </div>
                <div className="history-score">{selectedSession.session.question_index}/10</div>
              </div>

              {selectedSession.session.final_feedback && (
                <div className="history-feedback">{selectedSession.session.final_feedback}</div>
              )}

              <div className="history-transcript">
                {selectedSession.transcript?.slice(-2).map((turn, index) => (
                  <div key={index} className="history-turn">
                    <div className="history-turn-label">Question {turn.question_index || index + 1}</div>
                    {turn.question && <div className="history-turn-question">{turn.question}</div>}
                    <div className="history-turn-answer">{turn.message}</div>
                    <div className="history-turn-reply">{turn.ai_reply}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <main className="interview-main">
          <div className="conversation-shell">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`message-row ${m.role === "user" ? "user" : m.role === "bot" ? "bot" : "system"}`}
                >
                  <div className="avatar">{m.role === "user" ? "You" : m.role === "bot" ? "AI" : ""}</div>
                  <div className="bubble-wrap">
                    <div className={`bubble ${m.role}`}>{m.text}</div>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="message-row bot">
                  <div className="avatar">AI</div>
                  <div className="bubble-wrap">
                    <div className="bubble bot"><TypingIndicator /></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        </main>

        <footer className="interview-footer">
          <div className="input-bar">
            <button className={`mic-circle ${listening ? "listening" : ""}`} onClick={startListening} aria-label="Start voice input" title="Voice input">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="white" d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM19 11a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V22h-3a1 1 0 1 0 0 2h8a1 1 0 0 0 0-2h-3v-4.08A7 7 0 0 0 19 11z"/></svg>
            </button>
            <textarea
              className="chat-input"
              placeholder="Type or press 🎤 to speak — then press Enter to send"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button className="send-circle" onClick={() => sendMessage()} disabled={loading} aria-label="Send message">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="white" d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
            </button>
          </div>
          <div className="footer-note">Train Smarter for Every Interview</div>
        </footer>
      </div>
      )}
    </div>
  );
}
