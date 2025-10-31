import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, RotateCcw } from "lucide-react";

export type Language = "javascript" | "python" | "java" | "cpp";

interface CodeEditorProps {
  code: string;
  language: Language;
  onChange: (value: string | undefined) => void;
  onLanguageChange: (language: Language) => void;
  onRun: () => void;
  onReset: () => void;
}

const languageMap: Record<Language, string> = {
  javascript: "javascript",
  python: "python",
  java: "java",
  cpp: "cpp"
};

export const CodeEditor = ({ code, language, onChange, onLanguageChange, onRun, onReset }: CodeEditorProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold">Code Editor</h3>
          <Select value={language} onValueChange={(value) => onLanguageChange(value as Language)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={onRun}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Play className="w-4 h-4" />
            Run Code
          </Button>
        </div>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language={languageMap[language]}
          value={code}
          onChange={onChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
};
