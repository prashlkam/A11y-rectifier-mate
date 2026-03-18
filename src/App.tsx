import React, { useState } from 'react';
import { Search, Activity, Download, AlertTriangle, CheckCircle, ShieldAlert, FileText, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';

export default function App() {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<{
    violations: any[];
    auditReport: string;
    fixPrompts: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    setIsScanning(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan URL');
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsScanning(false);
    }
  };

  const downloadMarkdown = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">A11y rectifier mate</span>
          </div>
          <div className="text-sm font-medium text-zinc-500">
            Automated Accessibility Auditor
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 mb-6">
            Make your vibe-coded apps <span className="text-indigo-600">accessible to everyone.</span>
          </h1>
          <p className="text-lg text-zinc-600 mb-8">
            Enter a URL to run a deep-scan accessibility test using axe-core and Playwright. 
            Get human-centric reports and AI-ready prompts to fix your code.
          </p>

          <form onSubmit={handleScan} className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-vibe-app.com"
                className="w-full pl-12 pr-32 py-4 bg-white border border-zinc-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg transition-shadow"
                required
              />
              <button
                type="submit"
                disabled={isScanning}
                className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isScanning ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    Scanning
                  </>
                ) : (
                  'Scan Now'
                )}
              </button>
            </div>
          </form>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-3 text-left"
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">Scan Failed</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Section */}
        {results && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
                <div className="bg-red-100 p-3 rounded-xl">
                  <ShieldAlert className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-zinc-900">{results.violations.length}</div>
                  <div className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Total Violations</div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4 md:col-span-2">
                <div className="bg-emerald-100 p-3 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-zinc-900">Scan Complete</div>
                  <div className="text-sm text-zinc-500">
                    Axe-core analyzed the DOM and Gemini categorized the issues by disability profile.
                  </div>
                </div>
              </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Audit Report */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
                <div className="border-b border-zinc-200 p-4 sm:p-6 bg-zinc-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-bold text-zinc-900">Accessibility Audit</h2>
                  </div>
                  <button
                    onClick={() => downloadMarkdown(results.auditReport, 'A11Y_AUDIT.md')}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download .md
                  </button>
                </div>
                <div className="p-6 prose prose-zinc max-w-none overflow-y-auto max-h-[600px] custom-scrollbar">
                  <ReactMarkdown>{results.auditReport}</ReactMarkdown>
                </div>
              </div>

              {/* Fix Prompts */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
                <div className="border-b border-zinc-200 p-4 sm:p-6 bg-zinc-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Code className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-lg font-bold text-zinc-900">AI Fix Prompts</h2>
                  </div>
                  <button
                    onClick={() => downloadMarkdown(results.fixPrompts, 'FIX_PROMPTS.md')}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download .md
                  </button>
                </div>
                <div className="p-6 prose prose-zinc max-w-none overflow-y-auto max-h-[600px] custom-scrollbar">
                  <ReactMarkdown>{results.fixPrompts}</ReactMarkdown>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
