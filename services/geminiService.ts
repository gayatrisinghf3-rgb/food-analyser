import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserPreferences, AnalysisResult, SafetyStatus, DietType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    status: {
      type: Type.STRING,
      enum: [SafetyStatus.SAFE, SafetyStatus.CAUTION, SafetyStatus.UNSAFE, SafetyStatus.UNKNOWN],
      description: "Overall safety verdict based on user preferences.",
    },
    veganStatus: {
      type: Type.STRING,
      enum: ['COMPLIANT', 'NON_COMPLIANT', 'UNCERTAIN', 'NOT_APPLICABLE'],
      description: "Specific status regarding vegan/vegetarian compliance if relevant.",
    },
    summary: {
      type: Type.STRING,
      description: "A concise summary (1-2 sentences) of the analysis.",
    },
    flaggedIngredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          reason: { type: Type.STRING, description: "Why this ingredient is flagged (e.g., 'Contains Milk', 'Derived from insects')." },
          severity: { type: Type.STRING, enum: ['HIGH', 'MEDIUM', 'LOW'] }
        }
      }
    },
    technicalTerms: {
      type: Type.ARRAY,
      description: "Explain scientific or chemical names in simple terms.",
      items: {
        type: Type.OBJECT,
        properties: {
          term: { type: Type.STRING },
          explanation: { type: Type.STRING, description: "Simple explanation of what this is (e.g., 'A preservative', 'Vitamin C')." },
          commonName: { type: Type.STRING }
        }
      }
    }
  },
  required: ["status", "summary", "flaggedIngredients", "technicalTerms", "veganStatus"]
};

export const analyzeIngredients = async (
  input: string,
  inputType: 'TEXT' | 'IMAGE',
  preferences: UserPreferences
): Promise<AnalysisResult> => {
  
  const promptText = `
    Analyze the following product ingredients based on these user preferences:
    - Diet: ${preferences.diet}
    - Allergies: ${preferences.allergies.join(', ') || 'None'}
    - Custom Avoidances: ${preferences.customAvoidances || 'None'}

    Your goal is to:
    1. Identify any ingredients that violate the diet or allergies (Flag as UNSAFE or CAUTION).
    2. Identify any technical/chemical terms that a layman might find confusing and explain them simply.
    3. Determine if the product is safe for this specific user.

    If input is an image, extract text first then analyze.
  `;

  try {
    let contentParts: any[] = [];
    
    if (inputType === 'IMAGE') {
      // Remove data URL prefix if present
      const base64Data = input.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
      contentParts = [
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg' 
          }
        },
        { text: promptText }
      ];
    } else {
      contentParts = [
        { text: `Ingredients to analyze: "${input}"\n\n${promptText}` }
      ];
    }

    const response = await ai.models.generateContent({
      model: inputType === 'IMAGE' ? 'gemini-2.5-flash' : 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: contentParts
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are an expert food scientist and nutritionist. Be strict about allergies. Be educational about chemical additives."
      }
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(response.text) as AnalysisResult;

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};
