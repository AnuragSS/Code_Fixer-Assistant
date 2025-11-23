import React from 'react';
import { SeverityLevel, ErrorCategory } from '../types';
import { Check, Copy } from 'lucide-react';

// --- Badge Component ---
interface BadgeProps {
  label: string;
  variant?: 'neutral' | 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral', className = '' }) => {
  const styles = {
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]} ${className}`}>
      {label}
    </span>
  );
};

export const SeverityBadge: React.FC<{ level: SeverityLevel }> = ({ level }) => {
  let variant: BadgeProps['variant'] = 'neutral';
  switch (level) {
    case SeverityLevel.LOW: variant = 'success'; break;
    case SeverityLevel.MEDIUM: variant = 'warning'; break;
    case SeverityLevel.HIGH: variant = 'error'; break;
    case SeverityLevel.CRITICAL: variant = 'error'; break;
  }
  return <Badge label={level} variant={variant} />;
};

export const CategoryBadge: React.FC<{ category: ErrorCategory }> = ({ category }) => {
  return <Badge label={category} variant="info" />;
};

// --- Button Component ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-900 shadow-sm",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 focus-visible:ring-slate-900 shadow-sm",
    ghost: "hover:bg-slate-100 hover:text-slate-900",
  };

  const sizes = "h-10 py-2 px-4";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes} ${className}`} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

// --- Card Component ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; action?: React.ReactNode }> = ({ children, className = '', title, action }) => {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          {title && <h3 className="text-sm font-semibold text-slate-900">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

// --- Markdown Text Renderer ---
// A simple rendered to parse **bold** and `code` without a heavy library
export const MarkdownText: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  // Split by newlines first to handle paragraphs
  const paragraphs = content.split('\n').filter(p => p.trim() !== '');

  return (
    <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
      {paragraphs.map((paragraph, pIdx) => {
        // Simple list detection
        const isList = paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('* ');
        const cleanText = isList ? paragraph.trim().substring(2) : paragraph;

        // Parse bold and code
        const parts = cleanText.split(/(\*\*.*?\*\*|`.*?`)/g);

        const renderedParts = parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={i} className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono text-xs border border-slate-200">{part.slice(1, -1)}</code>;
          }
          return part;
        });

        if (isList) {
          return (
            <div key={pIdx} className="flex items-start ml-2">
              <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-slate-400 rounded-full flex-shrink-0"></span>
              <span>{renderedParts}</span>
            </div>
          );
        }

        return <p key={pIdx}>{renderedParts}</p>;
      })}
    </div>
  );
};

// --- Code Block Component ---
interface CodeBlockProps {
  code: string;
  label?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, label = "Code" }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-900 shadow-md my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-xs font-mono text-slate-400">{label}</span>
        <button 
          onClick={handleCopy}
          className="text-xs text-slate-400 hover:text-white flex items-center transition-colors"
        >
          {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="overflow-x-auto p-4">
        <pre className="text-sm font-mono text-slate-50 leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};