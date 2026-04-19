var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_vite = require("vite");
var import_playwright = require("playwright");
var import_playwright2 = __toESM(require("@axe-core/playwright"), 1);
var import_genai = require("@google/genai");
var import_path = __toESM(require("path"), 1);
var ai = new import_genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = process.env.PORT || 3e3;
  app.use(import_express.default.json());
  app.post("/api/scan", async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }
    let browser;
    try {
      console.log(`Scanning URL: ${url}`);
      browser = await import_playwright.chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
      });
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle", timeout: 3e4 });
      const results = await new import_playwright2.default({ page }).analyze();
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
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              auditReport: { type: import_genai.Type.STRING },
              fixPrompts: { type: import_genai.Type.STRING }
            },
            required: ["auditReport", "fixPrompts"]
          }
        }
      });
      const jsonStr = aiResponse.text?.trim() || "{}";
      const parsed = JSON.parse(jsonStr);
      res.json({
        violations: results.violations,
        auditReport: parsed.auditReport,
        fixPrompts: parsed.fixPrompts
      });
    } catch (error) {
      console.error("Scan error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
