import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { aiService } from "@/server/services/ai.service";
import { RATE_LIMIT } from "@/server/config/constants";

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
 */
export const POST = withApiHandler(
  async (req: NextRequest) => {
    const body = await validateBody(req, aiPromptSchema);
    const result = await aiService.generateAdvice(body);

    return apiSuccess(result, {
      message: "AI recommendation generated",
    });
  },
  {
    rateLimit: {
      maxRequests: RATE_LIMIT.AI_MAX_REQUESTS,
      windowMs: RATE_LIMIT.AI_WINDOW_MS,
      keyPrefix: "ai-buddy",
    },
  }
);
