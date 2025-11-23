import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ErrorCategory, SeverityLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a Senior Staff Reliability Engineer at a SaaS company. 
Your job is to analyze error logs, stack traces, and specifically CODE SNIPPETS provided by developers.

**Goals:**
1. **Analyze:** Identify bugs, logical errors, or performance issues.
2. **Explain:** Provide a "Technical Analysis" that is HUMAN-READABLE. 
   - Use short paragraphs.
   - Use bullet points for multiple issues.
   - Use bolding for key terms.
   - Avoid dense walls of text.
3. **Fix:** If the user provides code, you MUST provide the COMPLETE fixed version of the code in the 'fixedCode' field.

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
      description: "A detailed but readable technical explanation. Use Markdown (bullet points, bolding) to structure the text nicely.",
    },
    fixedCode: {
      type: Type.STRING,
      description: "If input was code, provide the fully fixed code block here. If input was just a log, leave empty.",
    },
    suggestedFixes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of concrete steps to resolve the issue (if code fix is not enough).",
    },
    cliCommand: {
      type: Type.STRING,
      description: "A specific terminal command to fix or debug the issue, if applicable (e.g. npm install, docker restart).",
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