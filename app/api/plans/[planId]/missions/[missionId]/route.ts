import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { planService } from "@/server/services/plan.service";

export const dynamic = "force-dynamic";

const missionActionSchema = z.object({
  action: z.enum(["complete", "skip", "reschedule"]),
  rescheduledTime: z.string().optional(),
});

interface RouteContext {
  params: Promise<{ planId: string; missionId: string }>;
}

/**
 * PATCH /api/plans/[planId]/missions/[missionId]
 * Updates a plan mission status (complete, skip, reschedule).
 * Guarantees that completed missions cannot award XP multiple times.
 */
export const PATCH = withApiHandler<RouteContext>(async (req: NextRequest, ctx, user) => {
  const { planId, missionId } = await ctx.params;
  const body = await validateBody(req, missionActionSchema);

  const result = await planService.updateMission(planId, missionId, user?.id, body);

  return apiSuccess(result, {
    message: result.message,
  });
});
