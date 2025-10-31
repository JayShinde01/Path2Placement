import React from "react";
import { Card } from "antd";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export const TestResults = ({ results, allPassed }) => {
  if (!results) {
    return (
      <div style={{ color: "#aaa", fontStyle: "italic" }}>
        Run your code to see results...
      </div>
    );
  }

  return (
    <div>
      {results.map((r, i) => (
        <Card
          key={i}
          style={{
            backgroundColor: "#0d1117",
            border: `1px solid ${r.passed ? "#238636" : "#da3633"}`,
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            {r.passed ? (
              <CheckCircle2 color="#22c55e" size={20} />
            ) : (
              <XCircle color="#ef4444" size={20} />
            )}
            <strong style={{ color: r.passed ? "#22c55e" : "#ef4444" }}>
              Test {i + 1}: {r.passed ? "Passed" : "Failed"}
            </strong>
          </div>

          <p style={{ margin: "4px 0", color: "#c9d1d9" }}>
            <strong>Input:</strong> {r.input}
          </p>
          <p style={{ margin: "4px 0", color: "#c9d1d9" }}>
            <strong>Expected:</strong> {r.expected}
          </p>
          <p style={{ margin: "4px 0", color: "#c9d1d9" }}>
            <strong>Output:</strong> {r.actual}
          </p>

          {r.error && (
            <div
              style={{
                color: "#f87171",
                background: "#1e293b",
                padding: "6px 10px",
                borderRadius: "6px",
                marginTop: "8px",
              }}
            >
              <AlertCircle size={16} style={{ marginRight: "6px" }} />
              {r.error}
            </div>
          )}
        </Card>
      ))}

      {allPassed && (
        <div
          style={{
            marginTop: "15px",
            color: "#22c55e",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          ✅ All test cases passed!
        </div>
      )}
    </div>
  );
};
