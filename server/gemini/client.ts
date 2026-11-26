import "server-only";
import { GoogleGenAI, type GenerateContentConfig } from "@google/genai";
import { env } from "@/lib/env";

let geminiClientInstance: GoogleGenAI | null = null;

/**
 * Returns a server-only singleton instance of GoogleGenerativeAI client.
 */
export function getGeminiClient(): GoogleGenAI {
  if (!geminiClientInstance) {
    if (!env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured on the server.");
    }
    geminiClientInstance = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY
    });
  }
  return geminiClientInstance;
}

/**
 * Returns the default generative model configured for AirAware assistant tasks.
 */
export function getGeminiModel(modelName = "gemini-3.8-flash") {
  // const client = getGeminiClient();
  const config: GenerateContentConfig = {
    temperature: 0.3,
    topP: 0.8,
    maxOutputTokens: 2048,
  }
  return {
    model: modelName,
    config
  };
}
