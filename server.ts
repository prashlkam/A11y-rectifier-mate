import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  app.post('/api/scan', async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    let browser;
    try {
      console.log(`Scanning URL: ${url}`);
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      const context = await browser.newContext();
      const page = await context.newPage();
      
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      const results = await new AxeBuilder({ page }).analyze();
      
      console.log(`Found ${results.violations.length} violations.`);
      
      const prompt = `You are an A11y Expert. Based on these Axe-core errors, categorize them by disability, explain why they matter, and provide a 'vibe-coding' prompt the user can paste back into their AI builder to fix the code.

Here is a mapping guide to help you categorize the issues:
\`\`\`json
{
  "color-contrast": "Low Vision / Color Blindness",
  "label": "Blind / Screen Reader Users",
  "tabindex": "Mobility Impaired / Keyboard Users",
  "screen-reader-focusable": "Blind",
  "marquee": "Cognitive / Autism / ADHD",
  "blink": "Cognitive / Epilepsy",
  "scrollable-region-focusable": "Mobility / Keyboard Users"
}
\`\`\`

Raw Axe-core JSON Results:
${JSON.stringify(results.violations, null, 2)}

Please return the response in JSON format with two properties:
1. "auditReport": A comprehensive markdown string breaking down the app's accessibility status, grouped by disability (Blind, Mobility, Cognitive, etc.).
2. "fixPrompts": A markdown string containing a list of prompts formatted for AI code editors to fix the bugs.`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              auditReport: { type: Type.STRING },
              fixPrompts: { type: Type.STRING },
            },
            required: ['auditReport', 'fixPrompts'],
          },
        },
      });

      const jsonStr = aiResponse.text?.trim() || '{}';
      const parsed = JSON.parse(jsonStr);

      res.json({
        violations: results.violations,
        auditReport: parsed.auditReport,
        fixPrompts: parsed.fixPrompts,
      });
    } catch (error) {
      console.error('Scan error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
