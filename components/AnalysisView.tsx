import React from 'react';
import { AnalysisResult } from '../types';
import { Card, SeverityBadge, CategoryBadge, Button, MarkdownText, CodeBlock } from './ui';
import { Check, Copy, Terminal, FileCode, Wrench } from 'lucide-react';

interface AnalysisViewProps {
  result: AnalysisResult;
  onReset: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ result, onReset }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.technicalAnalysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      
      {/* Header Summary Card */}
      <Card className="border-l-4 border-l-slate-900">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <SeverityBadge level={result.severity} />
              <CategoryBadge category={result.category} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">{result.title}</h2>
            <p className="text-slate-500 text-sm">AI-Generated Diagnosis</p>
          </div>
          <div className="flex space-x-2 shrink-0">
             <Button variant="secondary" onClick={handleCopy} className="text-xs">
              {copied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
              {copied ? 'Copied' : 'Copy Analysis'}
            </Button>
            <Button variant="secondary" onClick={onReset} className="text-xs">
              New Analysis
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Technical Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Technical Analysis">
             <MarkdownText content={result.technicalAnalysis} />
          </Card>

          {/* New: Fixed Code Section */}
          {result.fixedCode && (
            <Card 
              title="Recommended Code Fix" 
              className="border-emerald-200 ring-4 ring-emerald-50/50"
              action={<FileCode className="w-4 h-4 text-emerald-600" />}
            >
              <div className="mb-3 text-sm text-slate-600">
                The following code implements the suggested fixes.
              </div>
              <CodeBlock code={result.fixedCode} label="Fixed Source Code" />
            </Card>
          )}

          <Card title="Suggested Remediation" action={<Wrench className="w-4 h-4 text-slate-400" />}>
             <ul className="space-y-4">
              {result.suggestedFixes.map((fix, idx) => (
                <li key={idx} className="flex items-start bg-slate-50 p-3 rounded-md border border-slate-100">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-white text-slate-600 text-xs font-bold mt-0.5 mr-3 border border-slate-200 shadow-sm">
                    {idx + 1}
                  </span>
                  <span className="text-slate-700 text-sm leading-relaxed pt-0.5">{fix}</span>
                </li>
              ))}
            </ul>
          </Card>

          {result.cliCommand && (
            <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shadow-md">
              <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700 flex items-center">
                 <Terminal className="w-4 h-4 text-slate-400 mr-2" />
                 <span className="text-xs text-slate-400 font-mono">Suggested Command</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <code className="text-sm font-mono text-emerald-400">{result.cliCommand}</code>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Context & Summary */}
        <div className="space-y-6">
          <Card title="Executive Summary" className="bg-slate-50/50">
             <p className="text-sm text-slate-600 leading-relaxed">
               {result.summary}
             </p>
          </Card>

          <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
            <h4 className="text-blue-900 font-medium text-sm mb-2">Why this matters</h4>
            <p className="text-blue-700 text-sm leading-relaxed">
              Based on the <strong>{result.severity.toLowerCase()}</strong> severity, this issue should be addressed 
              {result.severity === 'CRITICAL' || result.severity === 'HIGH' ? ' immediately to prevent service degradation.' : ' in the next maintenance cycle.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};