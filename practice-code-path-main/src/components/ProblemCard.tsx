import { Problem } from "@/data/problems";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Code2 } from "lucide-react";

interface ProblemCardProps {
  problem: Problem;
}

export const ProblemCard = ({ problem }: ProblemCardProps) => {
  const difficultyColor = {
    Easy: "bg-easy text-success-foreground",
    Medium: "bg-medium text-foreground",
    Hard: "bg-hard text-destructive-foreground",
  };

  return (
    <Link to={`/problem/${problem.id}`}>
      <Card className="p-6 hover:border-primary transition-all duration-200 cursor-pointer group">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <Code2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                {problem.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {problem.description.split('\n')[0]}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {problem.category}
              </Badge>
              <Badge className={`text-xs ${difficultyColor[problem.difficulty]}`}>
                {problem.difficulty}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
