import React, { useState, useEffect } from 'react';
import { Search, Activity, Download, AlertTriangle, CheckCircle, ShieldAlert, FileText, Code, Moon, Sun, LogOut, LogIn, Mail, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import { onAuthStateChanged, signOut, signIn, signUp, User } from './auth';


export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<{
    violations: any[];
    auditReport: string;
    fixPrompts: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      if (isLoginMode) {
        const result = await signIn(email, password);
        if (result.error) {
          setAuthError(result.error);
        } else if (result.user) {
          // User is already logged in, auth state will update via onAuthStateChanged
          setEmail('');
          setPassword('');
        }
      } else {
        const result = await signUp(email, password);
        if (result.error) {
          setAuthError(result.error);
        } else if (result.user) {
          // User is already logged in after signup
          setEmail('');
          setPassword('');
        }
      }
    } catch (error: any) {
      console.error("Email auth failed", error);
      setAuthError(error.message || 'An error occurred during authentication.');
    }
  };


  const handleLogout = () => {
    signOut();
    setResults(null);
    setUrl('');
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Activity className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/50 selection:text-indigo-900 dark:selection:text-indigo-100 transition-colors flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full text-center"
        >
          <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/20">
            <Activity className="w-8 h-8 text-white" />
          </div>
          
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl mb-8">
            <button
              onClick={() => { setIsLoginMode(true); setAuthError(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${isLoginMode ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLoginMode(false); setAuthError(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${!isLoginMode ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
            >
              Register
            </button>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {isLoginMode ? 'Welcome to A11y Rectifier Mate' : 'Create Account'}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8">
            {isLoginMode
              ? 'Sign in to access the A11y rectifier mate and start auditing your applications.'
              : 'Sign up to access the A11y rectifier mate and start auditing your applications.'}
          </p>
          
          {authError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-700 dark:text-red-400 text-sm flex items-start gap-2 text-left"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </motion.div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow dark:text-zinc-100"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow dark:text-zinc-100"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              {isLoginMode ? 'Sign In' : 'Register'}
            </button>
          </form>


          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setAuthError(null);
              }}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              {isLoginMode ? 'Register' : 'Sign in'}
            </button>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/50 selection:text-indigo-900 dark:selection:text-indigo-100 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-100">A11y rectifier mate</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Automated Accessibility Auditor
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium hidden md:block">{user.displayName || user.email}</span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                aria-label="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">
            Make your vibe-coded apps <span className="text-indigo-600 dark:text-indigo-400">accessible to everyone.</span>
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
            Enter a URL to run a deep-scan accessibility test using axe-core and Playwright. 
            Get human-centric reports and AI-ready prompts to fix your code.
          </p>

          <form onSubmit={handleScan} className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-vibe-app.com"
                className="w-full pl-12 pr-32 py-4 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg transition-shadow dark:text-zinc-100 dark:placeholder-zinc-500"
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
              className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-700 dark:text-red-400 flex items-start gap-3 text-left"
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
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 transition-colors">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-xl">
                  <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{results.violations.length}</div>
                  <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Violations</div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 md:col-span-2 transition-colors">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Scan Complete</div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    Axe-core analyzed the DOM and Gemini categorized the issues by disability profile.
                  </div>
                </div>
              </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Audit Report */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col transition-colors">
                <div className="border-b border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Accessibility Audit</h2>
                  </div>
                  <button
                    onClick={() => downloadMarkdown(results.auditReport, 'A11Y_AUDIT.md')}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download .md
                  </button>
                </div>
                <div className="p-6 prose prose-zinc dark:prose-invert max-w-none overflow-y-auto max-h-[600px] custom-scrollbar">
                  <ReactMarkdown>{results.auditReport}</ReactMarkdown>
                </div>
              </div>

              {/* Fix Prompts */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col transition-colors">
                <div className="border-b border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <Code className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">AI Fix Prompts</h2>
                  </div>
                  <button
                    onClick={() => downloadMarkdown(results.fixPrompts, 'FIX_PROMPTS.md')}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download .md
                  </button>
                </div>
                <div className="p-6 prose prose-zinc dark:prose-invert max-w-none overflow-y-auto max-h-[600px] custom-scrollbar">
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
