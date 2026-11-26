import "server-only";
import { GoogleGenAI, type GenerateContentConfig } from "@google/genai";
import { serverConfig } from "../config/env.ts";

let geminiClientInstance: GoogleGenAI | null = null;

/**
 * Returns a server-only singleton instance of GoogleGenerativeAI client.
 */
export function getGeminiClient(): GoogleGenAI {
  if (!geminiClientInstance) {
    const key = serverConfig.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not configured on the server.");
    }
    geminiClientInstance = new GoogleGenAI({
      apiKey: key,
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
