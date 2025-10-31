import { problems } from "@/data/problems";
import { ProblemCard } from "@/components/ProblemCard";
import { Code2 } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Code2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">CodePractice</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Master coding problems and ace your interviews
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">All Problems</h2>
          <p className="text-muted-foreground">
            {problems.length} problems to practice
          </p>
        </div>

        <div className="grid gap-4">
          {problems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
