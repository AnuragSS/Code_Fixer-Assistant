export enum SeverityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ErrorCategory {
  FRONTEND = 'FRONTEND',
  BACKEND = 'BACKEND',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  DEVOPS = 'DEVOPS',
  UNKNOWN = 'UNKNOWN'
}

export interface AnalysisResult {
  title: string;
  severity: SeverityLevel;
  category: ErrorCategory;
  summary: string; // Non-technical
  technicalAnalysis: string; // Detailed analysis (Markdown supported)
  fixedCode?: string; // The complete fixed code block
  suggestedFixes: string[];
  cliCommand?: string; // Optional command to run
}

export interface AnalysisState {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: AnalysisResult | null;
  errorMessage?: string;
}