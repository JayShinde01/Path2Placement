import { Problem } from "@/data/problems";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ProblemDescriptionProps {
  problem: Problem;
}

export const ProblemDescription = ({ problem }: ProblemDescriptionProps) => {
  const difficultyColor = {
    Easy: "bg-easy text-success-foreground",
    Medium: "bg-medium text-foreground",
    Hard: "bg-hard text-destructive-foreground",
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-2xl font-bold">{problem.title}</h1>
          <Badge className={`${difficultyColor[problem.difficulty]}`}>
            {problem.difficulty}
          </Badge>
          <Badge variant="secondary">{problem.category}</Badge>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Description</h2>
        <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
          {problem.description}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Examples</h2>
        <div className="space-y-4">
          {problem.examples.map((example, index) => (
            <div key={index} className="space-y-2">
              <p className="font-medium text-sm">Example {index + 1}:</p>
              <div className="bg-muted p-3 rounded-lg space-y-1 text-sm font-mono">
                <div>
                  <span className="text-muted-foreground">Input: </span>
                  <span>{example.input}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Output: </span>
                  <span>{example.output}</span>
                </div>
                {example.explanation && (
                  <div className="pt-2 text-xs text-muted-foreground">
                    {example.explanation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
