import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { problems } from "@/data/problems";
import { ProblemDescription } from "@/components/ProblemDescription";
import { CodeEditor, Language } from "@/components/CodeEditor";
import { TestResults } from "@/components/TestResults";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  error?: string;
}

const Problem = () => {
  const { id } = useParams();
  const problem = problems.find((p) => p.id === id);

  if (!problem) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Problem not found</h1>
          <Link to="/">
            <Button>Back to Problems</Button>
          </Link>
        </div>
      </div>
    );
  }

  const [language, setLanguage] = useState<Language>("javascript");
  const [code, setCode] = useState(problem.starterCode.javascript);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [allPassed, setAllPassed] = useState(false);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setCode(problem.starterCode[newLanguage]);
    setTestResults(null);
    setAllPassed(false);
  };

  const handleReset = () => {
    setCode(problem.starterCode[language]);
    setTestResults(null);
    setAllPassed(false);
    toast.info("Code reset to starter template");
  };

  const handleRunCode = () => {
    if (language !== "javascript") {
      toast.error("Code execution is only supported for JavaScript in the browser");
      return;
    }

    try {
      // Extract function name from the starter code
      const funcMatch = code.match(/function\s+(\w+)/);
      if (!funcMatch) {
        toast.error("Could not find function definition");
        return;
      }

      const funcName = funcMatch[1];
      
      // Create a function from the user's code
      const userFunction = new Function(`
        ${code}
        return ${funcName};
      `)();

      // Run test cases
      const results: TestResult[] = problem.testCases.map((testCase) => {
        try {
          const result = userFunction(...testCase.input);
          const resultStr = JSON.stringify(result);
          const expectedStr = JSON.stringify(testCase.expected);
          
          return {
            passed: resultStr === expectedStr,
            input: JSON.stringify(testCase.input),
            expected: expectedStr,
            actual: resultStr,
          };
        } catch (error) {
          return {
            passed: false,
            input: JSON.stringify(testCase.input),
            expected: JSON.stringify(testCase.expected),
            actual: "Error",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      });

      const allTestsPassed = results.every((r) => r.passed);
      setTestResults(results);
      setAllPassed(allTestsPassed);

      if (allTestsPassed) {
        toast.success("All tests passed! Great job!");
      } else {
        toast.error("Some tests failed. Keep trying!");
      }
    } catch (error) {
      toast.error("Error running code: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Problems
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-73px)]">
        <div className="overflow-y-auto p-6 border-r border-border">
          <ProblemDescription problem={problem} />
        </div>

        <div className="flex flex-col">
          <div className="flex-1 min-h-0">
            <CodeEditor
              code={code}
              language={language}
              onChange={(value) => setCode(value || "")}
              onLanguageChange={handleLanguageChange}
              onRun={handleRunCode}
              onReset={handleReset}
            />
          </div>

          <div className="border-t border-border p-6 max-h-[40vh] overflow-y-auto bg-background">
            <TestResults results={testResults} allPassed={allPassed} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Problem;
