import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import problems from "../data/problems";
import { TestResults } from "../components/TestResults";

function ProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const problem = problems.find((p) => p.id === id);

  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState(problem?.starterCode?.java || "");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [allPassed, setAllPassed] = useState(false);

  if (!problem) return <h2 style={{ color: "white" }}>❌ Problem not found</h2>;

  const languageMap = {
    javascript: { name: "javascript", version: "18.15.0", ext: "js" },
    python: { name: "python", version: "3.10.0", ext: "py" },
    java: { name: "java", version: "15.0.2", ext: "java" },
    cpp: { name: "cpp", version: "10.2.0", ext: "cpp" },
  };

  // ✅ MAIN LOGIC: Run user's full code directly
  const runCode = async () => {
    setIsRunning(true);
    setTestResults(null);

    const selected = languageMap[language];
    let results = [];

    for (const testCase of problem.testCases) {
      const inputStr = Array.isArray(testCase.input)
        ? testCase.input.join(" ")
        : testCase.input;

      const body = {
        language: selected.name,
        version: selected.version,
        files: [{ name: `Main.${selected.ext}`, content: code }],
        stdin: inputStr.toString(),
      };

      try {
        const res = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json();

        const actualOutput =
          data?.run?.stdout?.trim() ||
          data?.run?.stderr?.trim() ||
          data?.compile?.stderr?.trim() ||
          "";

        const expected = testCase.expected.toString().trim();
        const actual = actualOutput.replace(/\n/g, "").trim();
        const isPass = actual === expected;

        results.push({
          passed: isPass,
          input: inputStr,
          expected,
          actual: actualOutput,
          error:
            data.run?.stderr || data.compile?.stderr
              ? data.run?.stderr || data.compile?.stderr
              : null,
        });
      } catch (err) {
        results.push({
          passed: false,
          input: inputStr,
          expected: testCase.expected.toString(),
          actual: "",
          error: "Error executing code",
        });
      }
    }

    setTestResults(results);
    setAllPassed(results.every((r) => r.passed));
    setIsRunning(false);
  };

  const resetCode = () => {
    setCode(problem?.starterCode?.[language] || "");
    setTestResults(null);
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(problem?.starterCode?.[lang] || "");
  };

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#0d1117",
        color: "white",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      {/* LEFT SIDE: Problem Description */}
      <div
        style={{
          width: "50%",
          padding: "30px",
          overflowY: "auto",
          borderRight: "1px solid #30363d",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "transparent",
            color: "#58a6ff",
            border: "none",
            cursor: "pointer",
            fontSize: "15px",
            marginBottom: "15px",
          }}
        >
          ← Back to Problems
        </button>

        <h1>{problem.title}</h1>

        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <span
            style={{
              background: "#22c55e33",
              color: "#22c55e",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "13px",
            }}
          >
            {problem.difficulty}
          </span>
          <span
            style={{
              background: "#1e293b",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "13px",
            }}
          >
            {problem.category}
          </span>
        </div>

        <h3>Description</h3>
        <p
          style={{
            background: "#161b22",
            padding: "15px",
            borderRadius: "8px",
            fontSize: "15px",
            color: "#c9d1d9",
          }}
        >
          {problem.description}
        </p>

        <h3>Examples</h3>
        {problem.examples.map((ex, i) => (
          <div
            key={i}
            style={{
              background: "#161b22",
              padding: "15px",
              borderRadius: "8px",
              marginTop: "10px",
            }}
          >
            <p>
              <strong>Example {i + 1}:</strong>
            </p>
            <p>
              <strong>Input:</strong> {ex.input}
            </p>
            <p>
              <strong>Output:</strong> {ex.output}
            </p>
          </div>
        ))}
      </div>

      {/* RIGHT SIDE: Editor + Results */}
      <div
        style={{
          width: "50%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0d1117",
        }}
      >
        {/* Header Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "15px 25px",
            borderBottom: "1px solid #30363d",
            alignItems: "center",
          }}
        >
          <div>
            <label style={{ marginRight: "10px" }}>Language:</label>
            <select
              value={language}
              onChange={handleLanguageChange}
              style={{
                background: "#161b22",
                color: "white",
                border: "1px solid #30363d",
                padding: "6px 12px",
                borderRadius: "6px",
              }}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={resetCode}
              style={{
                background: "#21262d",
                color: "white",
                border: "1px solid #30363d",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              🔄 Reset
            </button>
            <button
              onClick={runCode}
              disabled={isRunning}
              style={{
                background: "#2ea043",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                opacity: isRunning ? 0.7 : 1,
              }}
            >
              ▶️ {isRunning ? "Running..." : "Run Code"}
            </button>
          </div>
        </div>

        {/* Code Editor */}
        <div style={{ flex: 1, borderBottom: "1px solid #30363d" }}>
          <Editor
            height="100%"
            language={language}
            value={code}
            theme="vs-dark"
            onChange={(value) => setCode(value)}
            options={{
              fontSize: 15,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 10 },
            }}
          />
        </div>

        {/* Output */}
        <div style={{ padding: "20px 25px", background: "#161b22" }}>
          <h4 style={{ color: "#79c0ff", marginBottom: "10px" }}>
            🧪 Test Results
          </h4>
          <TestResults results={testResults} allPassed={allPassed} />
        </div>
      </div>
    </div>
  );
}

export default ProblemPage;
