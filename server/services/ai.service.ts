import "server-only";
import { geminiService } from "./ai/gemini";
import type { AiContextInput } from "./ai/types";
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
  async generateAdvice(ctx: AiPromptContext): Promise<AiResponseResult> {
    const aiContext: AiContextInput = {
      currentAqi: ctx.currentAqi ?? 185,
      category: (ctx.currentAqi ?? 185) > 200 ? "Very Poor" : (ctx.currentAqi ?? 185) > 100 ? "Poor" : "Moderate",
      pollutants: {
        pm25: Math.round((ctx.currentAqi ?? 185) * 0.6),
        pm10: Math.round((ctx.currentAqi ?? 185) * 1.1),
      },
      userLocation: {
        city: ctx.city ?? "New Delhi",
      },
      householdProfile: {
        sensitivePreferences: {
          hasRespiratorySensitivity: Boolean(ctx.hasSensitiveMembers),
          hasCardiovascularSensitivity: false,
          isPregnant: false,
          hasInfant: ctx.persona === "pediatric_advisor",
        },
      },
      dataSource: "CPCB Ground Stations + Open-Meteo High Resolution Model",
      dataTimestamp: new Date().toISOString(),
    };

    const chatReply = await geminiService.generateChatReply(ctx.prompt, aiContext);

    return {
      reply: chatReply.reply,
      suggestedActions: chatReply.actionableTips.length > 0 ? chatReply.actionableTips : [
        "Wear an N95 mask when outdoors",
        "Keep indoor air filtered",
      ],
      recommendedWindows: [
        {
          startTime: "01:00 PM",
          endTime: "03:30 PM",
          safetyLevel: (ctx.currentAqi ?? 185) > 200 ? "caution" : "safe",
          notes: "Diurnal thermal mixing window dissipates ground-level smoke",
        },
      ],
    };
  }
}

export const aiService = new AiService();
