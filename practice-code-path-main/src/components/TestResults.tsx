import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  error?: string;
}

interface TestResultsProps {
  results: TestResult[] | null;
  allPassed: boolean;
}

export const TestResults = ({ results, allPassed }: TestResultsProps) => {
  if (!results) {
    return (
      <Card className="p-6 bg-muted/50">
        <div className="flex items-center gap-2 text-muted-foreground">
          <AlertCircle className="w-5 h-5" />
          <p>Run your code to see test results</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Test Results</h3>
        {allPassed ? (
          <Badge className="bg-success text-success-foreground gap-2">
            <CheckCircle2 className="w-4 h-4" />
            All Tests Passed
          </Badge>
        ) : (
          <Badge variant="destructive" className="gap-2">
            <XCircle className="w-4 h-4" />
            Some Tests Failed
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {results.map((result, index) => (
          <Card
            key={index}
            className={`p-4 ${
              result.passed
                ? "border-success/50 bg-success/5"
                : "border-destructive/50 bg-destructive/5"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.passed ? (
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Test Case {index + 1}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Input: </span>
                  <code className="text-foreground bg-muted px-2 py-1 rounded">
                    {result.input}
                  </code>
                </div>
                <div>
                  <span className="text-muted-foreground">Expected: </span>
                  <code className="text-foreground bg-muted px-2 py-1 rounded">
                    {result.expected}
                  </code>
                </div>
                <div>
                  <span className="text-muted-foreground">Your Output: </span>
                  <code
                    className={`px-2 py-1 rounded ${
                      result.passed
                        ? "text-success bg-success/10"
                        : "text-destructive bg-destructive/10"
                    }`}
                  >
                    {result.actual}
                  </code>
                </div>
                {result.error && (
                  <div className="text-destructive">
                    <span className="font-medium">Error: </span>
                    {result.error}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
