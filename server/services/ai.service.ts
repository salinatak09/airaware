import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { serverConfig } from "@/server/config/env";
import { AssistantPersona } from "@/types";
import { safetyEngine } from "./safety";

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

    // 1. Evaluate safety deterministically FIRST.
    // The engine must NOT rely on Gemini for basic AQI safety decisions.
    const safety = safetyEngine.evaluateSafety({
      aqi,
      householdProfile: {
        hasChildren: ctx.persona === "pediatric_advisor" || ctx.hasSensitiveMembers,
        hasRespiratorySensitivity: ctx.hasSensitiveMembers,
      },
    });

    const deterministicSuggestedActions = [
      ...safety.recommendations.outdoorActivity.slice(0, 2),
      ...safety.recommendations.indoorEnvironment.slice(0, 2),
    ];

    if (this.client) {
      try {
        const model = this.client.getGenerativeModel({ model: "gemini-1.5-flash" });
        const systemInstruction = `You are Aero, a friendly, encouraging, and deeply knowledgeable urban air quality assistant for families living in ${city}.
Current Indian NAQI: ${aqi} (Category: ${safety.category}, Severity: ${safety.severity}).
Persona: ${persona}.

CRITICAL DETERMINISTIC SAFETY RULES (MUST BE STRICTLY FOLLOWED - NEVER OVERRIDE):
- Mask Requirement: ${safety.restrictions.maskRequired ? `Mandatory (${safety.restrictions.maskTypeRecommended})` : "Optional"}
- Outdoor Sports Allowed: ${!safety.restrictions.outdoorSportsRestricted}
- Window Ventilation: ${safety.restrictions.windowVentilationAllowed ? "Allowed during afternoon solar window" : "Prohibited (Keep windows tightly sealed)"}
- Prohibited Activities: ${safety.restrictions.prohibitedActivities.join("; ") || "None"}
- Active Warnings: ${safety.warnings.map(w => `${w.title}: ${w.message}`).join(" | ") || "None"}
- Medical Disclaimer: Non-diagnostic. Never diagnose conditions or guarantee that any environment is completely safe.

Provide clear, protective, non-alarmist, scientifically accurate advice adhering strictly to these safety constraints. Format response concisely.`;

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
          suggestedActions: deterministicSuggestedActions,
          recommendedWindows: [
            {
              startTime: "12:30 PM",
              endTime: "03:30 PM",
              safetyLevel: safety.severity === "low" ? "safe" : "caution",
              notes: "Thermal solar mixing dissipates ground particulate concentrations",
            },
          ],
        };
      } catch (err) {
        console.warn("Gemini generation failed; falling back to curated intelligence:", err);
      }
    }

    // Curated contextual fallback adhering to deterministic safety evaluation
    return this.getFallbackAdvice(ctx, safety);
  }

  private getFallbackAdvice(
    ctx: AiPromptContext,
    safety = safetyEngine.evaluateSafety({
      aqi: ctx.currentAqi ?? 185,
      householdProfile: {
        hasChildren: ctx.persona === "pediatric_advisor" || ctx.hasSensitiveMembers,
        hasRespiratorySensitivity: ctx.hasSensitiveMembers,
      },
    })
  ): AiResponseResult {
    const aqi = ctx.currentAqi ?? 185;
    const isSevere = safety.severity === "severe" || safety.severity === "critical";

    const actions = [
      ...safety.recommendations.outdoorActivity.slice(0, 2),
      ...safety.recommendations.indoorEnvironment.slice(0, 2),
    ];

    if (ctx.persona === "pediatric_advisor") {
      return {
        reply: `Hi! Aero here. With current Indian AQI around ${aqi} (${safety.category}), children's developing lungs absorb significantly more air per pound of body weight. ${
          safety.restrictions.maskRequired
            ? `If leaving home, ensure an airtight ${safety.restrictions.maskTypeRecommended} mask is worn.`
            : "Light outdoor activities are permissible during afternoon hours."
        } Keep indoor air filtration active.`,
        suggestedActions: actions,
        recommendedWindows: [
          {
            startTime: "01:00 PM",
            endTime: "03:30 PM",
            safetyLevel: isSevere ? "avoid" : "caution",
            notes: "Best thermal dispersion period of the day",
          },
        ],
      };
    }

    return {
      reply: `Hello! I'm Aero. Today's AQI in ${ctx.city || "your area"} is ${aqi} (${safety.category.toUpperCase()}). ${
        safety.restrictions.maskRequired
          ? `Elevated particulate levels detected. Wear an ${safety.restrictions.maskTypeRecommended} mask when outdoors and seal living quarters.`
          : "Air quality is currently manageable. Sensitive household members should monitor prolonged exertion."
      }`,
      suggestedActions: actions,
      recommendedWindows: [
        {
          startTime: "12:30 PM",
          endTime: "03:30 PM",
          safetyLevel: isSevere ? "avoid" : safety.severity === "low" ? "safe" : "caution",
          notes: "Lower ground pollution concentrations due to diurnal solar mixing",
        },
      ],
    };
  }
}

export const aiService = new AiService();
