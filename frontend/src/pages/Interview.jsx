import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../page_style/interview.css";
import { ML_API_URL } from "../api";

export default function Interview() {
  const [messages, setMessages] = useState([
    { role: "system", text: "Hi there — I'm your AI interviewer. Say hi or start answering." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const bottomRef = useRef(null);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Server error" }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const botReply = data.reply || "No response from AI.";
      setMessages((m) => [...m, { role: "bot", text: botReply }]);
      speak(botReply);
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
    <div className="interview-page">
      <motion.header
  className="interview-header"
  initial={{ opacity: 0, y: -8 }}
  animate={{ opacity: 1, y: 0 }}
>
  <div className="header-left">
    <button
      className="back-btn"
      onClick={() => window.history.back()}
      title="Go back"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15 18L9 12L15 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
    <div className="brand">PlacementAI</div>
  </div>

  <div className="header-actions">
    <button
      className="icon-btn"
      title="Voice help"
      onClick={() => speak("Ask me anything. I'm ready to interview you.")}
    >
      🔊
    </button>
  </div>
</motion.header>


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
                <div className="avatar">
                  {m.role === "user" ? "You" : m.role === "bot" ? "AI" : ""}
                </div>
                <div className="bubble-wrap">
                  <div className={`bubble ${m.role}`}>
                    {m.text}
                  </div>
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="message-row bot"
              >
                <div className="avatar">AI</div>
                <div className="bubble-wrap">
                  <div className="bubble bot">
                    <TypingIndicator />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>
      </main>

      <footer className="interview-footer">
        <div className="input-bar">
          <button
            className={`mic-circle ${listening ? "listening" : ""}`}
            onClick={startListening}
            aria-label="Start voice input"
            title="Voice input"
          >
            {listening ? (
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="white" d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM19 11a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V22h-3a1 1 0 1 0 0 2h8a1 1 0 0 0 0-2h-3v-4.08A7 7 0 0 0 19 11z"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="white" d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM19 11a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V22h-3a1 1 0 1 0 0 2h8a1 1 0 0 0 0-2h-3v-4.08A7 7 0 0 0 19 11z"/></svg>
            )}
          </button>

          <textarea
            className="chat-input"
            placeholder="Type or press 🎤 to speak — then press Enter to send"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />

          <button
            className="send-circle"
            onClick={() => sendMessage()}
            disabled={loading}
            aria-label="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="white" d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
          </button>
        </div>

        <div className="footer-note">Train Smarter for Every Interview</div>
      </footer>
    </div>
  );
}
