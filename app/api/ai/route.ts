import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { aiService } from "@/server/services/ai.service";
import { RATE_LIMIT } from "@/server/config/constants";
import { connectToDatabase } from "@/server/db";
import { ChatSession } from "@/models";

export const dynamic = "force-dynamic";

const aiPromptSchema = z.object({
  prompt: z.string().min(2, "Prompt is too short"),
  persona: z
    .enum(["pediatric_advisor", "daily_planner", "indoor_specialist"])
    .default("daily_planner"),
  currentAqi: z.number().default(185),
  city: z.string().default("New Delhi"),
  hasSensitiveMembers: z.boolean().default(false),
});

/**
 * POST /api/ai
 * Query the Aero AI Urban Assistant with AQI context & tailored persona
 * Automatically stores conversation turns in ChatSession model when authenticated.
 */
export const POST = withApiHandler(
  async (req: NextRequest, _ctx, user) => {
    const body = await validateBody(req, aiPromptSchema);
    const result = await aiService.generateAdvice(body);

    if (user?.id) {
      try {
        await connectToDatabase();
        await ChatSession.create({
          userId: user.id,
          title: body.prompt.slice(0, 50),
          persona: body.persona === "indoor_specialist" ? "daily_planner" : body.persona,
          messages: [
            {
              messageId: `msg_${Date.now()}_u`,
              role: "user",
              content: body.prompt,
              timestamp: new Date(),
              aqiContext: { aqi: body.currentAqi, category: "Moderate", city: body.city },
            },
            {
              messageId: `msg_${Date.now()}_a`,
              role: "assistant",
              content: result.reply,
              timestamp: new Date(),
              aqiContext: { aqi: body.currentAqi, category: "Moderate", city: body.city },
            },
          ],
          sessionMetadata: {
            initialAqi: body.currentAqi,
            city: body.city,
            clientPlatform: "web",
            messageCount: 2,
          },
        });
      } catch {
        // Non-blocking chat session logging
      }
    }

    return apiSuccess(result, {
      message: "AI recommendation generated",
    });
  },
  {
    requireAuth: true,
    rateLimit: {
      maxRequests: RATE_LIMIT.AI_MAX_REQUESTS,
      windowMs: RATE_LIMIT.AI_WINDOW_MS,
      keyPrefix: "ai-buddy",
    },
  }
);
