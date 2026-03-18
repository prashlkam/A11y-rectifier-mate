# 🌈 A11y rectifier mate

**A11y rectifier mate** is an automated accessibility auditing tool designed specifically for "vibe-coded" applications. It transforms raw, AI-generated codebases into inclusive, accessible experiences by simulating real-world usage, identifying barriers, and generating the exact prompts needed to fix them.

## 🚀 How it Works
1. **Analyze:** You point the tool to your app's URL.
2. **Simulate:** It automatically boots up a headless browser.
3. **Audit:** It runs deep-scan accessibility tests using `axe-core` and Playwright.
4. **Categorize:** Issues are grouped by disability (Blind, Mobility, Cognitive, etc.).
5. **Remediate:** It generates AI-ready prompts to fix every identified issue.

## 🛠 Features
- **Auto-Environment Detection:** Supports Vite, Next.js, Create React App, and static HTML.
- **Disability-Centric Reporting:** View your app's performance through the lens of specific user needs.
- **Severity Scoring:** Issues are flagged as `Critical`, `Serious`, `Moderate`, or `Minor`.
- **Prompt Engineering:** Get copy-pasteable prompts to give back to your Vibe-Coding tool (Cursor, Lovable, Bolt, etc.) to apply fixes.

## 📋 Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/a11y-rectifier-mate.git

# Install dependencies
cd a11y-rectifier-mate
npm install

# Set up your AI API Key (for prompt generation)
export GEMINI_API_KEY='your_key_here'
```

## 📖 Usage

Run the web interface to scan your vibe-coded app:

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser and enter the URL of your app.

### Generated Outputs:
- `A11Y_AUDIT.md`: A comprehensive breakdown of your app's accessibility status.
- `FIX_PROMPTS.md`: A list of prompts formatted for AI code editors to fix the bugs.

## 🗂 Report Structure
The generated **Accessibility Audit Report** includes:
- **Blind & Visually Impaired:** Screen reader compatibility, ARIA patterns, and alt-text.
- **Hearing Impaired:** Media captions and visual cues for audio events.
- **Mobility & Physical:** Keyboard traps, focus management, and touch target sizes.
- **Neurodiversity & Cognitive:** Reduced motion, clear labeling, and layout consistency.

## 🤖 Example Fix Prompt
From your `FIX_PROMPTS.md`:
> **Issue:** "Search button has no accessible name."
> **Prompt for AI:** *"The search button in the Navbar component is currently an icon-only button without a label. Please add an `aria-label="Search"` attribute and ensure the focus state is visually distinct using a high-contrast outline."*

## ⚖️ License
MIT
