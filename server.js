import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/analyze-code', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code is required and must be a string' });
    }

    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured' });
    }

    console.log('Analyzing code with Claude Haiku 4.5...');

    const systemPrompt = `You are a flowchart generator that creates SIMPLE, HIGH-LEVEL flowcharts for NON-TECHNICAL users from Python code.

SHOW:
1. INPUTS: Data going IN (function parameters, required data) - if any data is going in
2. OUTPUTS: Data coming OUT (return values, results) - ALWAYS DISPLAY
3. PARAMETERS: Settings/config that change behavior - If they exist
   - **CRITICAL**: ALWAYS show parameter values (e.g., "threshold=0.5")
4. PROCESSES: High-level operations in PLAIN LANGUAGE (what it DOES, not technical how) - if any processing is done

IGNORE TECHNICAL DETAILS:
- Skip ALL imports, modules, libraries
- Skip error handling, logging, validation
- Skip loops, conditions, variable assignments
- Skip technical implementation details
- Keep ONLY the core business logic
- Use simple, non-technical language

STYLING RULES:
- Inputs: Use (()) - Example: INPUT1((Input: user_data))
- Parameters: Use {{}} - Example: PARAM1{{Parameter: limit=100}}
- Processes: Use [] - Example: PROC1[Calculate average]
- Outputs: Use [()] - Example: OUT1[(Output: final_result)]

**ALWAYS SHOW PARAMETER VALUES**:
- CORRECT: {{max_size=50}}
- WRONG: {{max_size}}

KEEP IT MINIMAL - Show 3-7 nodes maximum. Focus on the main story, not every detail.

Example (SIMPLE):
graph TD
    INPUT1((Input: data))
    PARAM1{{Parameter: threshold=0.5}}
    PROC1[Filter and calculate]
    OUT1[(Output: result)]

    INPUT1 --> PROC1
    PARAM1 -.-> PROC1
    PROC1 --> OUT1

IMPORTANT:
- Maximum 7 nodes total - be ruthlessly minimalist
- Use plain English, no technical jargon
- Combine multiple technical steps into one process
- Return ONLY raw mermaid code starting with "graph TD"
- NO markdown code blocks, NO backticks, NO \`\`\`mermaid wrapper
- Just the plain mermaid syntax, nothing else

VERY IMPORTANT:
- If the code does not perform any processing, show only the output node, and input node if input exists. For example - code that only does display, will have a single output node.
- Stick to what the code explicitly does. A cell that uses data processed in the past and just displays it, is not performing processing.`;

    const userPrompt = `Create a flowchart from this Python code:

\`\`\`python
${code}
\`\`\``;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: userPrompt
        }]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      return res.status(response.status).json({ error: `Anthropic API error: ${response.status}` });
    }

    const data = await response.json();
    const diagram = data.content[0].text;

    console.log('Diagram generated successfully');

    res.json({ diagram });

  } catch (error) {
    console.error('Error in analyze-code:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 API server running on http://localhost:${port}`);
});
