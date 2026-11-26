import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { planService } from "@/server/services/plan.service";

export const dynamic = "force-dynamic";

const generatePlanSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional(),
  forceRegenerate: z.boolean().default(false),
  currentAqi: z.number().optional(),
  city: z.string().optional(),
});

/**
 * POST /api/plans/generate
 * Generates or regenerates a personalized daily plan using AI & deterministic rules.
 */
export const POST = withApiHandler(async (req: NextRequest, _ctx, user) => {
  let body = {};
  try {
    body = await validateBody(req, generatePlanSchema);
  } catch {
    body = { forceRegenerate: true };
  }

  const plan = await planService.generatePlan({
    userId: user?.id,
    ...(body as any),
  });

  return apiSuccess(plan, {
    message: "Personalized daily air quality plan generated successfully",
  });
});
