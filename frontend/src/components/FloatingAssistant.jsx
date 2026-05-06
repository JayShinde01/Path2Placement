import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PersonalAssistant from "./PersonalAssistant";
import "../page_style/floating-assistant.css";

export default function FloatingAssistant() {
  const token = localStorage.getItem("token");
  const [isOpen, setIsOpen] = useState(false);

  // Only show if user is logged in
  if (!token) return null;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="floating-assistant-btn"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <span className="fab-icon">🤖</span>
        <motion.div
          className="fab-pulse"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="assistant-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Content */}
            <motion.div
              className="assistant-modal"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Close Button */}
              <button
                className="modal-close-btn"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>

              {/* Assistant */}
              <PersonalAssistant token={token} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
