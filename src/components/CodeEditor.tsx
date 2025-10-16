import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Code } from "lucide-react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const CodeEditor = ({ value, onChange }: CodeEditorProps) => {
  return (
    <Card className="p-6 bg-card shadow-card border-border/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Code className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-card-foreground">Python Code</h2>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your Python code here..."
        className="font-mono text-sm min-h-[500px] resize-none bg-muted/30 border-border/50 text-foreground placeholder:text-muted-foreground focus:ring-primary/50"
        spellCheck={false}
      />
      <div className="mt-3 text-xs text-muted-foreground">
        <p>Paste your Python code to analyze its structure</p>
      </div>
    </Card>
  );
};
