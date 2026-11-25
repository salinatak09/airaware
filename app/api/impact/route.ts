import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { impactService } from "@/server/services/impact.service";

export const dynamic = "force-dynamic";

const completeMissionSchema = z.object({
  missionId: z.string().min(1),
});

/**
 * GET /api/impact
 * Retrieve user XP, streak, health impact metrics, and active daily missions
 */
export const GET = withApiHandler(async (_req: NextRequest, _ctx, user) => {
  const stats = await impactService.getImpactStats(user?.id);
  return apiSuccess(stats, {
    message: "Impact and gamification statistics retrieved",
  });
});

/**
 * POST /api/impact
 * Mark a daily clean air mission as completed to claim XP
 */
export const POST = withApiHandler(async (req: NextRequest, _ctx, user) => {
  const body = await validateBody(req, completeMissionSchema);
  const updatedStats = await impactService.completeMission(body.missionId, user?.id);

  return apiSuccess(updatedStats, {
    message: "Mission completed! XP awarded.",
  });
});
