import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, apiNotFound } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { planService } from "@/server/services/plan.service";

export const dynamic = "force-dynamic";

const dateParamSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD");

interface RouteContext {
  params: Promise<{ date: string }>;
}

/**
 * GET /api/plans/[date]
 * Retrieves the daily air quality plan for a specific date (YYYY-MM-DD).
 */
export const GET = withApiHandler<RouteContext>(async (_req: NextRequest, ctx, user) => {
  const { date } = await ctx.params;
  const parsedDate = dateParamSchema.parse(date);

  const plan = await planService.getPlanByDate(user?.id, parsedDate);

  if (!plan) {
    return apiNotFound(`No air quality plan found for date ${parsedDate}`);
  }

  return apiSuccess(plan, {
    message: `Air quality plan for ${parsedDate} retrieved successfully`,
  });
});
