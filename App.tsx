import React, { useState } from 'react';
import { analyzeErrorLog } from './services/geminiService';
import { AnalysisState } from './types';
import { AnalysisView } from './components/AnalysisView';
import { Button, Card } from './components/ui';
import { AlertCircle, Sparkles, Activity, Command } from 'lucide-react';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [state, setState] = useState<AnalysisState>({ status: 'idle', data: null });

  const handleAnalyze = async () => {
    if (!input.trim()) return;

    setState({ status: 'loading', data: null });
    try {
      const result = await analyzeErrorLog(input);
      setState({ status: 'success', data: result });
    } catch (error) {
      setState({ 
        status: 'error', 
        data: null, 
        errorMessage: error instanceof Error ? error.message : "An unexpected error occurred." 
      });
    }
  };

  const handleReset = () => {
    setInput('');
    setState({ status: 'idle', data: null });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Navigation / Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center">
              <Activity className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">AutoFix Assistant</span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
              Internal Tool v1.2
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900">Documentation</a>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>System Operational</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {state.status === 'idle' || state.status === 'loading' || state.status === 'error' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Diagnose errors in seconds
              </h1>
              <p className="text-lg text-slate-600">
                Paste your stack trace, log output, or error description below. Our AI will analyze the root cause and suggest a fix.
              </p>
            </div>

            <Card className="max-w-3xl mx-auto shadow-md border-slate-300">
              <div className="p-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste error logs here... (e.g. Uncaught TypeError: Cannot read properties of undefined)"
                  className="w-full h-64 p-4 text-sm font-mono text-slate-800 placeholder:text-slate-400 bg-white border-0 resize-none focus:ring-0 focus:outline-none rounded-md"
                  spellCheck={false}
                />
              </div>
              <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between rounded-b-lg">
                <div className="text-xs text-slate-500 flex items-center">
                  <Command className="w-3 h-3 mr-1" /> Supports JS, Python, Go, Rust logs
                </div>
                <div className="flex space-x-3">
                  <Button variant="ghost" onClick={() => setInput('')} disabled={!input || state.status === 'loading'}>
                    Clear
                  </Button>
                  <Button onClick={handleAnalyze} isLoading={state.status === 'loading'} disabled={!input.trim()}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Error
                  </Button>
                </div>
              </div>
            </Card>

            {/* Error Message Display */}
            {state.status === 'error' && (
               <div className="max-w-3xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-md flex items-start">
                 <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 mr-3 flex-shrink-0" />
                 <div>
                   <h3 className="text-sm font-medium text-rose-800">Analysis Failed</h3>
                   <p className="text-sm text-rose-700 mt-1">{state.errorMessage}</p>
                 </div>
               </div>
            )}
            
            {/* Empty State / Suggestions */}
            {state.status === 'idle' && (
              <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                 {[
                   "React hydration mismatch",
                   "PostgreSQL connection timeout", 
                   "Docker container OOM kill"
                 ].map((sample) => (
                   <button 
                    key={sample}
                    onClick={() => setInput(sample)}
                    className="p-3 text-left text-sm text-slate-600 bg-white border border-slate-200 rounded hover:border-slate-300 hover:shadow-sm transition-all"
                   >
                     <span className="block text-xs font-semibold text-slate-400 mb-1">Example</span>
                     {sample}
                   </button>
                 ))}
              </div>
            )}

          </div>
        ) : (
          state.data && <AnalysisView result={state.data} onReset={handleReset} />
        )}

      </main>
    </div>
  );
};

export default App;