import { useState, useEffect } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { DiagramDisplay } from "@/components/DiagramDisplay";
import { Button } from "@/components/ui/button";
import { Sparkles, Code2 } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEYS = {
  CODE: 'code-analyzer-code',
  DIAGRAM: 'code-analyzer-diagram',
};

const DEFAULT_CODE = `def process_data(input_data, threshold=0.5):
    """Process input data with a threshold."""
    filtered = [x for x in input_data if x > threshold]
    result = sum(filtered) / len(filtered) if filtered else 0
    return result`;

const Index = () => {
  const [code, setCode] = useState(() => {
    // Load code from localStorage on initial render
    const savedCode = localStorage.getItem(STORAGE_KEYS.CODE);
    return savedCode || DEFAULT_CODE;
  });

  const [diagram, setDiagram] = useState(() => {
    // Load diagram from localStorage on initial render
    const savedDiagram = localStorage.getItem(STORAGE_KEYS.DIAGRAM);
    return savedDiagram || "";
  });

  const [isLoading, setIsLoading] = useState(false);

  // Save code to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CODE, code);
  }, [code]);

  // Save diagram to localStorage whenever it changes
  useEffect(() => {
    if (diagram) {
      localStorage.setItem(STORAGE_KEYS.DIAGRAM, diagram);
    }
  }, [diagram]);

  // Extract parameter defaults from Python code
  const extractParameterDefaults = (code: string): Map<string, string> => {
    const params = new Map<string, string>();

    // Match function definitions with parameters
    const funcRegex = /def\s+\w+\s*\((.*?)\)/gs;
    const matches = code.matchAll(funcRegex);

    for (const match of matches) {
      const paramsStr = match[1];
      // Match parameter with default value (e.g., "threshold=0.5")
      const paramRegex = /(\w+)\s*=\s*([^,)]+)/g;
      const paramMatches = paramsStr.matchAll(paramRegex);

      for (const paramMatch of paramMatches) {
        const paramName = paramMatch[1].trim();
        const defaultValue = paramMatch[2].trim();
        params.set(paramName, defaultValue);
      }
    }

    return params;
  };

  // Clean markdown code blocks from diagram
  const cleanDiagramSyntax = (diagram: string): string => {
    // Remove ```mermaid and ``` wrappers if present
    return diagram
      .replace(/^```mermaid\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/```\s*$/, '')
      .trim();
  };

  // Enhance diagram with parameter values
  const enhanceDiagramWithValues = (diagram: string, code: string): string => {
    const paramDefaults = extractParameterDefaults(code);
    let enhancedDiagram = diagram;

    // For each parameter found in the code, ensure it shows the value in the diagram
    paramDefaults.forEach((value, paramName) => {
      // Match parameter nodes that don't already have values
      // Pattern: {{Parameter: paramName}} or {{paramName}}
      const patterns = [
        new RegExp(`(\\{\\{Parameter:\\s*)(${paramName})(\\}\\})`, 'gi'),
        new RegExp(`(\\{\\{)(${paramName})(\\}\\})`, 'gi')
      ];

      patterns.forEach(pattern => {
        enhancedDiagram = enhancedDiagram.replace(pattern, (match, prefix, name, suffix) => {
          // Only add value if it's not already there
          if (!match.includes('=')) {
            return `${prefix}${name}=${value}${suffix}`;
          }
          return match;
        });
      });
    });

    return enhancedDiagram;
  };

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast.error("Please enter some Python code to analyze");
      return;
    }

    setIsLoading(true);
    setDiagram("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/analyze-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate diagram');
      }

      const data = await response.json();

      if (data?.diagram) {
        // Clean markdown syntax from the diagram
        const cleanedDiagram = cleanDiagramSyntax(data.diagram);
        // Enhance the diagram with parameter values from the code
        const enhancedDiagram = enhanceDiagramWithValues(cleanedDiagram, code);
        setDiagram(enhancedDiagram);
        toast.success("Diagram generated successfully");
      } else {
        throw new Error("No diagram returned");
      }
    } catch (error) {
      console.error('Error analyzing code:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate diagram. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Code2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Code Analyzer
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Visualize your Python code's inputs, outputs, and parameters with AI-powered diagrams
          </p>
        </header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Code Editor Panel */}
          <CodeEditor value={code} onChange={setCode} />
          
          {/* Diagram Panel */}
          <DiagramDisplay diagram={diagram} isLoading={isLoading} />
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button 
            onClick={handleAnalyze}
            disabled={isLoading}
            size="lg"
            className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow text-lg px-8 py-6 h-auto"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {isLoading ? "Analyzing..." : "Generate Diagram"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
