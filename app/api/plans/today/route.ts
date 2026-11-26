import "server-only";
import { NextRequest } from "next/server";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { planService } from "@/server/services/plan.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/plans/today
 * Retrieves today's active plan for the user, auto-generating one if not present.
 */
export const GET = withApiHandler(async (_req: NextRequest, _ctx, user) => {
  const plan = await planService.getTodayPlan(user?.id);

  return apiSuccess(plan, {
    message: "Today's personalized daily plan retrieved",
  });
}, { requireAuth: true });
