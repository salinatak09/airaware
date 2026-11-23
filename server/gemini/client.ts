import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";

let geminiClientInstance: GoogleGenerativeAI | null = null;

/**
 * Returns a server-only singleton instance of GoogleGenerativeAI client.
 */
export function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClientInstance) {
    if (!env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured on the server.");
    }
    geminiClientInstance = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return geminiClientInstance;
}

/**
 * Returns the default generative model configured for AirAware assistant tasks.
 */
export function getGeminiModel(modelName = "gemini-1.5-flash") {
  const client = getGeminiClient();
  return client.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
      maxOutputTokens: 1024,
    },
  });
}
