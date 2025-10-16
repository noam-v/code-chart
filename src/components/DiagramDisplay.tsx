import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Sparkles, FileQuestion, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import mermaid from "mermaid";

interface DiagramDisplayProps {
  diagram: string;
  isLoading: boolean;
}

export const DiagramDisplay = ({ diagram, isLoading }: DiagramDisplayProps) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
      themeVariables: {
        primaryColor: '#3b82f6',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#2563eb',
        secondaryColor: '#10b981',
        secondaryTextColor: '#ffffff',
        secondaryBorderColor: '#059669',
        tertiaryColor: '#f59e0b',
        tertiaryTextColor: '#000000',
        tertiaryBorderColor: '#d97706',
        noteBkgColor: '#8b5cf6',
        noteTextColor: '#ffffff',
        noteBorderColor: '#7c3aed',
        lineColor: '#64748b',
        textColor: '#e2e8f0',
        mainBkg: '#1e293b',
        nodeBorder: '#475569',
        clusterBkg: '#0f172a',
        clusterBorder: '#334155',
        defaultLinkColor: '#64748b',
        titleColor: '#f1f5f9',
        edgeLabelBackground: '#1e293b',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: '16px',
      },
      flowchart: {
        nodeSpacing: 80,
        rankSpacing: 100,
        curve: 'basis',
        padding: 25,
        useMaxWidth: false,
      },
    });
  }, []);

  useEffect(() => {
    if (diagram && mermaidRef.current) {
      const renderDiagram = async () => {
        try {
          mermaidRef.current!.innerHTML = '';
          const cleanDiagram = diagram.trim();
          const id = `mermaid-${Date.now()}`;
          const { svg } = await mermaid.render(id, cleanDiagram);
          mermaidRef.current!.innerHTML = svg;
          
          const svgElement = mermaidRef.current!.querySelector('svg');
          if (svgElement) {
            svgElement.style.maxWidth = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.minWidth = '';
          }
          
          // Apply semantic coloring and fit-to-container by default
          requestAnimationFrame(() => {
            applyNodeStyling();
            fitToContainer();
          });
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          console.error('Diagram syntax:', diagram);
          mermaidRef.current!.innerHTML = `
            <div class="text-destructive p-4 space-y-2">
              <p class="font-semibold">Error rendering diagram</p>
              <p class="text-sm">The diagram syntax may be invalid or too complex.</p>
              <details class="text-xs">
                <summary class="cursor-pointer">View error details</summary>
                <pre class="mt-2 p-2 bg-muted/50 rounded overflow-auto">${error}</pre>
              </details>
            </div>
          `;
        }
      };
      renderDiagram();
    }
  }, [diagram]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => {
    fitToContainer();
    setPosition({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setScale(prev => Math.min(Math.max(prev + delta, 0.5), 3));
  };

  const fitToContainer = () => {
    const container = containerRef.current;
    const svg = mermaidRef.current?.querySelector('svg') as SVGGraphicsElement | null;
    if (!container || !svg) return;
    try {
      const bbox = svg.getBBox();
      const padding = 32;
      const cw = Math.max(100, container.clientWidth - padding);
      const ch = Math.max(100, container.clientHeight - padding);
      if (bbox.width === 0 || bbox.height === 0) return;
      const nextScale = Math.min(3, Math.max(0.5, Math.min(cw / bbox.width, ch / bbox.height)));
      setScale(nextScale);
      setPosition({ x: 0, y: 0 });
    } catch (e) {
      console.warn('fitToContainer failed', e);
    }
  };

  const applyNodeStyling = () => {
    const svg = mermaidRef.current?.querySelector('svg');
    if (!svg) return;

    // Get computed CSS variable values
    const getColorValue = (varName: string) => {
      const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      return `hsl(${value})`;
    };

    const nodes = svg.querySelectorAll<SVGGElement>('g.node');

    nodes.forEach((node) => {
      // Get text from foreignObject which is where Mermaid stores the text in modern versions
      const foreignObjects = node.querySelectorAll('foreignObject');
      const textElements = node.querySelectorAll('text');
      const tspans = node.querySelectorAll('tspan');

      // Try to get text from foreignObject first (modern Mermaid), then fallback to tspan
      let label = '';
      if (foreignObjects.length > 0) {
        label = Array.from(foreignObjects).map(f => f.textContent || '').join(' ');
      } else if (tspans.length > 0) {
        label = Array.from(tspans).map(t => t.textContent || '').join(' ');
      } else if (textElements.length > 0) {
        label = Array.from(textElements).map(t => t.textContent || '').join(' ');
      }

      label = label.toLowerCase().trim();

      // Get all shape elements - Mermaid uses .label-container for shapes
      const labelContainer = node.querySelector<SVGElement>('.label-container');
      if (!labelContainer) return;

      const shapes: SVGElement[] = [];

      // Case 1: The label-container itself is a shape (circle, rect, path)
      if (labelContainer.tagName === 'circle' || labelContainer.tagName === 'rect' ||
          labelContainer.tagName === 'ellipse' || labelContainer.tagName === 'path' ||
          labelContainer.tagName === 'polygon') {
        shapes.push(labelContainer);
      }

      // Case 2: The label-container is a <g> containing shapes
      if (labelContainer.tagName === 'g') {
        const childShapes = labelContainer.querySelectorAll<SVGElement>('rect, circle, ellipse, polygon, path');
        childShapes.forEach(s => shapes.push(s));
      }

      if (shapes.length === 0) return;

      const setStyles = (fillColor: string, strokeColor: string, textColor: string) => {
        // Apply to all shapes using inline styles (higher priority)
        shapes.forEach(shape => {
          const currentFill = shape.getAttribute('fill');

          // Use inline style for fill (higher priority than attributes)
          if (currentFill && currentFill !== 'none') {
            shape.style.fill = fillColor;
          }

          // Use inline style for stroke
          shape.style.stroke = strokeColor;
          shape.style.strokeWidth = '2px';
        });

        // Style text elements (for older Mermaid versions)
        textElements.forEach(textEl => {
          textEl.setAttribute('fill', textColor);
          textEl.style.fontWeight = '500';
        });

        // Style text inside foreignObject (for modern Mermaid versions)
        foreignObjects.forEach(fo => {
          const divs = fo.querySelectorAll('div');
          const spans = fo.querySelectorAll('span');
          const paragraphs = fo.querySelectorAll('p');

          // Remove type prefixes from paragraphs
          paragraphs.forEach(p => {
            const text = p.textContent || '';
            // Remove "Input:", "Parameter:", "Output:", "Process:" prefixes (case-insensitive)
            const cleanedText = text.replace(/^(Input|Parameter|Output|Process):\s*/i, '');
            if (cleanedText !== text) {
              p.textContent = cleanedText;
            }
            (p as HTMLElement).style.color = textColor;
            (p as HTMLElement).style.margin = '0';
            (p as HTMLElement).style.whiteSpace = 'normal';
            (p as HTMLElement).style.textAlign = 'center';
          });

          // Ensure proper text wrapping and centering in the container divs
          divs.forEach(div => {
            (div as HTMLElement).style.whiteSpace = 'normal';
            (div as HTMLElement).style.wordWrap = 'break-word';
            (div as HTMLElement).style.overflow = 'visible';
            (div as HTMLElement).style.textAlign = 'center';
            (div as HTMLElement).style.display = 'flex';
            (div as HTMLElement).style.alignItems = 'center';
            (div as HTMLElement).style.justifyContent = 'center';
          });

          spans.forEach(span => {
            (span as HTMLElement).style.color = textColor;
            (span as HTMLElement).style.whiteSpace = 'normal';
            (span as HTMLElement).style.textAlign = 'center';
          });
        });
      };

      // Detect node type by shape AND label
      // Mermaid shapes: (()) = circle/ellipse/stadium, {{}} = hexagon/polygon, [] = rect, [()] = cylinder/path
      const hasCircle = shapes.some(s => s.tagName === 'circle' || s.tagName === 'ellipse');
      const hasPolygon = shapes.some(s => s.tagName === 'polygon');
      const hasRect = shapes.some(s => s.tagName === 'rect');
      const hasPath = shapes.some(s => s.tagName === 'path');

      // Priority: label text first, then shape detection as fallback
      if (label.includes('input')) {
        setStyles(getColorValue('--primary'), getColorValue('--primary'), '#ffffff');
      } else if (label.includes('parameter')) {
        setStyles(getColorValue('--secondary'), getColorValue('--secondary'), '#ffffff');
      } else if (label.includes('output')) {
        setStyles(getColorValue('--warning'), getColorValue('--warning'), getColorValue('--foreground'));
      } else if (label.includes('process')) {
        setStyles(getColorValue('--success'), getColorValue('--success'), '#ffffff');
      } else if (hasCircle || (hasPath && !hasPolygon && !hasRect)) {
        // Stadium/Circle shape (()) = Input
        setStyles(getColorValue('--primary'), getColorValue('--primary'), '#ffffff');
      } else if (hasPolygon && !hasCircle) {
        // Hexagon shape {{}} = Parameter
        setStyles(getColorValue('--secondary'), getColorValue('--secondary'), '#ffffff');
      } else if (hasRect && !hasPath && !hasPolygon && !hasCircle) {
        // Rectangle shape [] = Process
        setStyles(getColorValue('--success'), getColorValue('--success'), '#ffffff');
      } else if (hasPath && hasRect) {
        // Cylinder/path with rect [()] = Output
        setStyles(getColorValue('--warning'), getColorValue('--warning'), getColorValue('--foreground'));
      }
    });
  };

  useEffect(() => {
    const onResize = () => fitToContainer();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isFullscreen, diagram]);
  return (
    <Card className={`p-6 bg-card shadow-card border-border/50 backdrop-blur-sm ${isFullscreen ? 'fixed inset-4 z-50 flex flex-col' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-secondary" />
          <h2 className="text-xl font-semibold text-card-foreground">Diagram</h2>
        </div>
        
        {diagram && !isLoading && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[4rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={scale >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetZoom}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant={isFullscreen ? "default" : "secondary"}
              size="sm"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </div>
      
      <div 
        ref={containerRef}
        className={`rounded-lg bg-muted/30 border border-border/50 overflow-hidden relative ${isFullscreen ? 'flex-1' : 'min-h-[900px]'}`}
        style={{ cursor: isDragging ? 'grabbing' : diagram ? 'grab' : 'default' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary"></div>
              <p className="text-muted-foreground">Analyzing code with Claude Haiku 4.5...</p>
            </div>
          </div>
        ) : diagram ? (
          <div 
            className="w-full h-full flex items-center justify-center p-8"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            <div ref={mermaidRef} className="mermaid">
              {diagram}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3">
              <FileQuestion className="h-16 w-16 text-muted-foreground/50 mx-auto" />
              <p className="text-muted-foreground">
                Your diagram will appear here after analysis
              </p>
              <p className="text-sm text-muted-foreground/70">
                Click "Generate Diagram" to start
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <p>AI-generated flowchart showing inputs, outputs, and parameters</p>
        {diagram && (
          <p className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--primary))' }}></span>
              Input
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--secondary))' }}></span>
              Parameter
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--warning))' }}></span>
              Output
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--success))' }}></span>
              Process
            </span>
          </p>
        )}
      </div>
    </Card>
  );
};
