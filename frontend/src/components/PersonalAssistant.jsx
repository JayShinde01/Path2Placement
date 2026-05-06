import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { ML_API_URL } from "../api";
import "../page_style/assistant.css";

const ASSISTANT_CACHE_KEY = "placementai:assistant-state:v1";

const readCache = () => {
  try {
    const raw = localStorage.getItem(ASSISTANT_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const updateCache = (patch) => {
  try {
    const current = readCache() || {};
    const nextValue = typeof patch === "function" ? patch(current) : { ...current, ...patch };
    localStorage.setItem(ASSISTANT_CACHE_KEY, JSON.stringify(nextValue));
  } catch {
    // Ignore storage failures so chat still works.
  }
};

const cachedAssistant = readCache();
const fallbackInsight = "I'm ready to help! Tell me about your career goals or ask for a quick progress review.";

export default function PersonalAssistant({ token }) {
  const [messages, setMessages] = useState(() => cachedAssistant?.messages || []);
  const [insights, setInsights] = useState(() => cachedAssistant?.insights || fallbackInsight);
  const [input, setInput] = useState(() => cachedAssistant?.draft || "");
  const [loading, setLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(() => !cachedAssistant?.insights);
  const [insightsRefreshing, setInsightsRefreshing] = useState(false);
  const [insightsError, setInsightsError] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    updateCache({
      messages,
      insights,
      draft: input,
      savedAt: Date.now(),
    });
  }, [messages, insights, input]);

  const loadInsights = async (background = false) => {
    try {
      setInsightsError("");
      if (!background) {
        setInsightsLoading(true);
      } else {
        setInsightsRefreshing(true);
      }
      const res = await axios.get(`${ML_API_URL}api/assistant/insights`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const nextInsight = (res.data.insights || "").trim() || fallbackInsight;
      setInsights(nextInsight);
      updateCache({
        insights: nextInsight,
        savedAt: Date.now(),
      });
    } catch (err) {
      console.error("Failed to load insights:", err);
      setInsights(fallbackInsight);
      setInsightsError("Live insights could not be loaded right now, so a default insight is shown.");
    } finally {
      if (!background) {
        setInsightsLoading(false);
      } else {
        setInsightsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    if (cachedAssistant?.insights) {
      loadInsights(true);
      return;
    }
    loadInsights(false);
  }, [token]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const res = await axios.post(
        `${ML_API_URL}api/assistant/chat`,
        { message: userMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => {
        const nextMessages = [...prev, { role: "assistant", text: res.data.reply }];
        updateCache({
          messages: nextMessages,
          insights,
          draft: "",
          savedAt: Date.now(),
        });
        return nextMessages;
      });
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="assistant-container"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.65 }}
    >
      <div className="assistant-wrapper">
        {/* Header */}
        <div className="assistant-header">
          <div className="assistant-title-group">
            <h2 className="assistant-title">🤖 Personal Career Assistant</h2>
            <p className="assistant-subtitle">
              Personalized coaching based on your data
            </p>
          </div>
        </div>

        {/* Two-column layout: Insights + Chat */}
        <div className="assistant-body">
          {/* Left: Insights Panel */}
          <div className="insights-panel">
            <h3 className="insights-heading">💡 Your Insights</h3>
            {insightsLoading ? (
              <div className="insight-loading">
                <div className="spinner"></div>
                <p>Analyzing your progress...</p>
              </div>
            ) : (
              <div className="insight-content">
                <p className="insight-text">{insights}</p>
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => loadInsights(false)}
                  disabled={insightsRefreshing}
                >
                  {insightsRefreshing ? "Refreshing..." : "↻ Refresh Insights"}
                </button>
                {insightsError && <p className="insight-error">{insightsError}</p>}
              </div>
            )}
          </div>

          {/* Right: Chat Panel */}
          <div className="chat-panel">
            <div className="messages-container">
              {messages.length === 0 && !insightsLoading ? (
                <div className="empty-messages">
                  <div className="empty-icon">👋</div>
                  <p>Start chatting to get personalized advice!</p>
                  <p className="empty-hint">
                    Ask me about interview prep, coding skills, resume, or your career path.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    className={`message message-${msg.role}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="message-avatar">
                      {msg.role === "user" ? "👤" : "🤖"}
                    </div>
                    <div className="message-content">{msg.text}</div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form className="chat-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="chat-input"
                placeholder="Ask me anything about your career..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="btn btn-primary btn-send"
                disabled={loading || !input.trim()}
              >
                {loading ? "..." : "→"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
