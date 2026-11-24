import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, apiCreated } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { planService } from "@/server/services/plan.service";

export const dynamic = "force-dynamic";

const addActivitySchema = z.object({
  title: z.string().min(2),
  scheduledTime: z.string().min(1),
  durationMinutes: z.number().min(5).max(480).default(30),
  activityType: z.enum([
    "outdoor_exercise",
    "commute",
    "school_run",
    "indoor_rest",
    "errands",
  ]),
  airRiskLevel: z.enum(["low", "moderate", "high", "severe"]).default("moderate"),
  recommendedMask: z.boolean().default(true),
  notes: z.string().default(""),
});

/**
 * GET /api/plans
 * Retrieve daily schedule and safest outdoor windows
 */
export const GET = withApiHandler(async () => {
  const plan = await planService.getTodayPlan();
  return apiSuccess(plan, {
    message: "Today's air quality activity plan retrieved",
  });
});

/**
 * POST /api/plans
 * Add a new scheduled activity to today's plan
 */
export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await validateBody(req, addActivitySchema);
  const activity = await planService.addActivity({
    title: body.title,
    scheduledTime: body.scheduledTime,
    durationMinutes: body.durationMinutes ?? 30,
    activityType: body.activityType,
    airRiskLevel: body.airRiskLevel ?? "moderate",
    recommendedMask: body.recommendedMask ?? true,
    notes: body.notes ?? "",
  });

  return apiCreated(activity, {
    message: "Activity added to daily plan",
  });
});
