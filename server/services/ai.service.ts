import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { serverConfig } from "@/server/config/env";
import { AssistantPersona } from "@/types";

export interface AiPromptContext {
  prompt: string;
  persona?: AssistantPersona;
  currentAqi?: number;
  city?: string;
  hasSensitiveMembers?: boolean;
}

export interface AiResponseResult {
  reply: string;
  suggestedActions: string[];
  recommendedWindows?: Array<{
    startTime: string;
    endTime: string;
    safetyLevel: "safe" | "caution" | "avoid";
    notes: string;
  }>;
}

export class AiService {
  private client: GoogleGenerativeAI | null = null;

  constructor() {
    if (
      serverConfig.GEMINI_API_KEY &&
      serverConfig.GEMINI_API_KEY !== "dummy_gemini_key_for_dev"
    ) {
      try {
        this.client = new GoogleGenerativeAI(serverConfig.GEMINI_API_KEY);
      } catch {
        this.client = null;
      }
    }
  }

  async generateAdvice(ctx: AiPromptContext): Promise<AiResponseResult> {
    const persona = ctx.persona ?? "daily_planner";
    const aqi = ctx.currentAqi ?? 185;
    const city = ctx.city ?? "New Delhi";

    if (this.client) {
      try {
        const model = this.client.getGenerativeModel({ model: "gemini-1.5-flash" });
        const systemInstruction = `You are Aero, a friendly, encouraging, and deeply knowledgeable urban air quality assistant for families living in ${city}.
Current AQI is ${aqi}. Persona: ${persona}.
Provide clear, protective, non-alarmist, scientifically accurate advice. Format response concisely.`;

        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemInstruction}\n\nUser Question: ${ctx.prompt}` }],
            },
          ],
        });

        const reply = result.response.text();
        return {
          reply,
          suggestedActions: [
            "Check indoor HEPA filter status",
            "Keep bedroom windows closed during peak traffic hours",
            "Carry an N95 mask for afternoon errands",
          ],
          recommendedWindows: [
            {
              startTime: "12:00 PM",
              endTime: "03:00 PM",
              safetyLevel: "caution",
              notes: "Lowest particulate dip of the day",
            },
          ],
        };
      } catch (err) {
        console.warn("Gemini generation failed; falling back to curated intelligence:", err);
      }
    }

    // Curated contextual fallback
    return this.getFallbackAdvice(ctx);
  }

  private getFallbackAdvice(ctx: AiPromptContext): AiResponseResult {
    const aqi = ctx.currentAqi ?? 185;
    const isHigh = aqi > 150;

    if (ctx.persona === "pediatric_advisor") {
      return {
        reply: `Hi! Aero here. With current AQI around ${aqi}, children's developing lungs absorb up to 50% more air per pound of body weight. For outdoor recess or playtime, we recommend indoor creative play between 7 AM and 11 AM when ground inversion traps particulate matter. If leaving home, ensure an snug-fitting KF94 or child-size N95 mask is worn.`,
        suggestedActions: [
          "Swap outdoor soccer with indoor obstacle courses",
          "Set bedroom air purifier to medium-high speed 1 hour before bedtime",
          "Rinse eyes and face with cool water after school commute",
        ],
        recommendedWindows: [
          {
            startTime: "01:00 PM",
            endTime: "03:30 PM",
            safetyLevel: "caution",
            notes: "Best thermal dispersion period",
          },
        ],
      };
    }

    return {
      reply: `Hello! I'm Aero. Today's AQI in ${ctx.city || "your area"} is ${aqi} (${isHigh ? "Unhealthy" : "Moderate"}). ${
        isHigh
          ? "Fine particulates (PM2.5) are currently elevated. The cleanest air window today is expected in early afternoon when atmospheric mixing peaks."
          : "Air quality is manageable today, with moderate pollution levels."
      }`,
      suggestedActions: [
        "Plan outdoor runs or groceries for the afternoon window",
        "Keep windows shut; rely on mechanical filtration",
        "Turn on kitchen exhaust while cooking to prevent indoor PM spikes",
      ],
      recommendedWindows: [
        {
          startTime: "12:30 PM",
          endTime: "03:30 PM",
          safetyLevel: isHigh ? "caution" : "safe",
          notes: "Lower ground pollution concentrations",
        },
      ],
    };
  }
}

export const aiService = new AiService();
