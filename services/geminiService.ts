import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ErrorCategory, SeverityLevel } from "../types";

// Helper to get API key safely in both AI Studio (process.env) and local Vite (import.meta.env)
const getApiKey = () => {
  if (typeof process !== "undefined" && process.env?.API_KEY) {
    return process.env.API_KEY;
  }
  // @ts-ignore - Handle Vite environment
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }
  return "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

const SYSTEM_INSTRUCTION = `
You are a Senior Staff Reliability Engineer at a SaaS company. 
Your job is to analyze error logs, stack traces, and specifically CODE SNIPPETS provided by developers.

**Goals:**
1. **Analyze:** Identify bugs, logical errors, or performance issues.
2. **Explain:** Provide a "Technical Analysis" that is **HUMAN-READABLE**. 
   - Write in clear, concise paragraphs.
   - Use bullet points for distinct issues.
   - Use **bold** for emphasis on key terms or variable names.
   - Avoid dense academic language; be practical and direct.
3. **Fix:** 
   - If the user provides code, you MUST detect the errors and provide the COMPLETE, CORRECTED version of the code in the 'fixedCode' field.
   - Do not truncate the fixed code; provide the full working block.
   - If the input is just an error log (no code), leave 'fixedCode' empty.

**Tone:** Professional, direct, but easy to read. Like a senior engineer explaining to a junior peer.
`;

const schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A short, concise title for the issue (max 60 chars).",
    },
    severity: {
      type: Type.STRING,
      enum: [
        SeverityLevel.LOW,
        SeverityLevel.MEDIUM,
        SeverityLevel.HIGH,
        SeverityLevel.CRITICAL
      ],
      description: "The estimated impact severity of this error.",
    },
    category: {
      type: Type.STRING,
      enum: [
        ErrorCategory.FRONTEND,
        ErrorCategory.BACKEND,
        ErrorCategory.DATABASE,
        ErrorCategory.NETWORK,
        ErrorCategory.DEVOPS,
        ErrorCategory.UNKNOWN
      ],
      description: "The technical domain of the error.",
    },
    summary: {
      type: Type.STRING,
      description: "A plain English explanation suitable for a non-technical project manager. Keep it simple.",
    },
    technicalAnalysis: {
      type: Type.STRING,
      description: "A detailed but readable technical explanation. Use Markdown (bullet points * item, **bold**) to structure the text nicely.",
    },
    fixedCode: {
      type: Type.STRING,
      description: "The complete, corrected code block if input was code. Include comments explaining changes.",
    },
    suggestedFixes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of concrete steps to resolve the issue.",
    },
    cliCommand: {
      type: Type.STRING,
      description: "A specific terminal command to fix or debug the issue, if applicable.",
    },
  },
  required: ["title", "severity", "category", "summary", "technicalAnalysis", "suggestedFixes"],
};

export const analyzeErrorLog = async (input: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: input,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response received from AI service.");
    }

    const data = JSON.parse(text) as AnalysisResult;
    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};