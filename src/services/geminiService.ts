import { GoogleGenAI, Type } from "@google/genai";
import { ROUND_SCHEMA } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeRound(notes: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following healthcare rounding notes for authenticity and sentiment. 
      Notes: "${notes}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: ROUND_SCHEMA,
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      authenticityScore: 50,
      sentimentScore: 0,
      detectedMood: "Neutral",
      summary: "Analysis unavailable",
      suggestedActions: []
    };
  }
}

export async function analyzeManagerGaps(managerName: string, rounds: any[], satisfactionData: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the performance of manager ${managerName} based on their rounding data and unit satisfaction scores.
      
      Rounding Data (last 10 rounds): ${JSON.stringify(rounds.slice(0, 10))}
      Unit Satisfaction (HCAHPS): ${JSON.stringify(satisfactionData)}
      
      Identify specific gaps where the manager's rounding behavior (authenticity, frequency, focus) might be failing to drive patient satisfaction. Provide a rating from 1-10 and 3 actionable "Critical Gaps".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            performanceRating: { type: Type.NUMBER },
            gapAnalysis: { type: Type.STRING },
            criticalGaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  impact: { type: Type.STRING },
                  remedy: { type: Type.STRING }
                }
              }
            }
          },
          required: ["performanceRating", "gapAnalysis", "criticalGaps"]
        }
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gap analysis failed:", error);
    return null;
  }
}
