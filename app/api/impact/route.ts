import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { impactService } from "@/server/services/impact.service";

export const dynamic = "force-dynamic";

const logActionSchema = z.object({
  actionType: z.string().default("air_check"),
  missionId: z.string().optional(),
  customTitle: z.string().optional(),
});

/**
 * GET /api/impact
 * Retrieve user XP dashboard, level progression, daily streak, weekly activity chart,
 * badges, achievements, household challenges, and honest behavioral impact metrics.
 */
export const GET = withApiHandler(async (_req: NextRequest, _ctx, user) => {
  const data = await impactService.getGamificationOverview(user?.id);
  return apiSuccess(data, {
    message: "Impact and gamification statistics retrieved",
  });
},{requireAuth: true});

/**
 * POST /api/impact
 * Log a verified clean air action / complete mission to earn XP (with anti-exploit guard)
 */
export const POST = withApiHandler(async (req: NextRequest, _ctx, user) => {
  const body = await validateBody(req, logActionSchema);
  const result = await impactService.logUserAction(
    user?.id,
    body.actionType,
    body.missionId,
    body.customTitle
  );

  return apiSuccess(result, {
    message: result.message,
  });
}, {requireAuth: true});
