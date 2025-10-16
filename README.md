# Code Chart

AI-powered Python code visualizer that generates minimalistic, user-friendly flowcharts using Claude Haiku 4.5.

![Code Chart Banner](https://img.shields.io/badge/AI-Powered-blue) ![Claude](https://img.shields.io/badge/Claude-Haiku%204.5-orange) ![React](https://img.shields.io/badge/React-18-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Overview

Code Chart transforms Python code into simple, high-level flowcharts designed for non-technical users. It focuses on what the code *does* rather than *how* it does it, making complex code easier to understand at a glance.

### Key Features

- **AI-Powered Analysis**: Uses Claude Haiku 4.5 to intelligently analyze Python code
- **Minimalistic Design**: Shows only 3-7 nodes maximum - inputs, outputs, parameters, and core processes
- **Semantic Coloring**: Color-coded nodes for easy identification
  - 🔵 Cyan: Inputs
  - 🟣 Hot Pink: Parameters (with values!)
  - 🟢 Green: Processes
  - 🟠 Orange: Outputs
- **Interactive Diagrams**: Pan, zoom, and fullscreen support
- **Local Storage**: Your code and diagrams persist across sessions
- **Fast & Responsive**: Built with Vite and React for optimal performance
- **Auto-Reload Backend**: Development server automatically restarts on changes

## Demo

```python
def process_data(input_data, threshold=0.5):
    """Process input data with a threshold."""
    filtered = [x for x in input_data if x > threshold]
    result = sum(filtered) / len(filtered) if filtered else 0
    return result
```

Generates a clean flowchart showing:
- Input: `input_data`
- Parameter: `threshold=0.5`
- Process: "Filter and calculate average"
- Output: `result`

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Mermaid.js** for diagram rendering
- **shadcn/ui** for beautiful components
- **Tailwind CSS** for styling

### Backend
- **Express.js** for API server
- **Node.js** runtime
- **Claude Haiku 4.5 API** for code analysis
- **Nodemon** for auto-reload during development

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- An Anthropic API key ([get one here](https://console.anthropic.com/))

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/noam-v/code-chart.git
   cd code-chart
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_actual_api_key_here
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

   This starts:
   - Frontend dev server on `http://localhost:8080`
   - Backend API server on `http://localhost:3001`

5. **Open your browser**

   Navigate to `http://localhost:8080`

## Usage

1. Paste your Python code into the editor on the left
2. Click "Generate Diagram"
3. Watch as Claude analyzes your code and generates a flowchart
4. Interact with the diagram:
   - Pan by dragging
   - Zoom with mouse wheel or controls
   - Fullscreen for detailed view
   - Auto-saves to local storage

## Architecture

The application uses a clean separation of concerns:

- **Frontend** (`src/`): React components for the UI
  - `pages/Index.tsx`: Main application page
  - `components/CodeEditor.tsx`: Code input interface
  - `components/DiagramDisplay.tsx`: Mermaid diagram renderer with interactive controls

- **Backend** (`server.js`): Express API that communicates with Claude
  - System prompt: Instructions for Claude on how to generate diagrams
  - User prompt: The Python code to analyze
  - Streaming response handling

- **Storage**: LocalStorage for persistence
  - Code is saved as you type
  - Generated diagrams are cached

## Prompt Engineering

The system uses a carefully crafted prompt that instructs Claude to:
- Focus on business logic, not technical implementation
- Skip imports, error handling, and boilerplate
- Use plain English descriptions
- Limit diagrams to 3-7 nodes maximum
- Always show parameter values
- Handle display-only code (outputs only)

See `server.js` for the full system prompt.

## Development

### Commands

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only the frontend
- `npm run dev:backend` - Start only the backend (with nodemon)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Project Structure

```
code-chart/
├── src/
│   ├── components/
│   │   ├── CodeEditor.tsx
│   │   ├── DiagramDisplay.tsx
│   │   └── ui/                # shadcn/ui components
│   ├── pages/
│   │   ├── Index.tsx          # Main page
│   │   └── NotFound.tsx       # 404 page
│   ├── lib/
│   │   └── utils.ts           # Utility functions
│   ├── hooks/                 # Custom React hooks
│   └── index.css              # Global styles & design system
├── server.js                  # Express API server
├── public/                    # Static assets
└── package.json
```

## Design System

The app uses a dark theme with carefully chosen semantic colors defined in `src/index.css`:

```css
--primary: 180 100% 50%;      /* Cyan for inputs */
--secondary: 330 100% 65%;    /* Hot pink for parameters */
--success: 160 84% 39%;       /* Green for processes */
--warning: 38 92% 50%;        /* Orange for outputs */
```

All colors use HSL for consistency and easy customization.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for any purpose.

## Acknowledgments

- Built with [Claude Code](https://claude.com/claude-code)
- Powered by [Anthropic's Claude API](https://www.anthropic.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Diagrams rendered with [Mermaid.js](https://mermaid.js.org/)

## Support

If you find this project helpful, please give it a ⭐ on GitHub!

For issues or questions, please [open an issue](https://github.com/noam-v/code-chart/issues).
