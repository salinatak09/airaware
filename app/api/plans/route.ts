import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, apiCreated } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { planService } from "@/server/services/plan.service";
import { connectToDatabase } from "@/server/db";
import { DailyPlan, UserAction } from "@/models";

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
 * Retrieve daily schedule, missions, and safest outdoor windows from MongoDB with fallback
 */
export const GET = withApiHandler(async (_req: NextRequest, _ctx, user) => {
  const todayStr = new Date().toISOString().split("T")[0];

  try {
    await connectToDatabase();
    const filter = user?.id ? { userId: user.id, date: todayStr } : { date: todayStr };
    const dbPlan = await DailyPlan.findOne(filter).lean().exec();

    if (dbPlan) {
      return apiSuccess(
        {
          date: dbPlan.date,
          overallSuitability: dbPlan.aqiContext.expectedAqi > 200 ? "caution" : "good",
          safestOutdoorWindow: dbPlan.aqiContext.safestWindow || {
            start: "12:30 PM",
            end: "03:30 PM",
            reason: "Diurnal atmospheric boundary layer expansion",
          },
          missions: dbPlan.missions,
          recommendations: dbPlan.recommendations,
          activities: dbPlan.missions,
        },
        {
          message: "Today's air quality activity plan retrieved from database",
        }
      );
    }
  } catch {
    // Fallback
  }

  const plan = await planService.getTodayPlan();
  return apiSuccess(plan, {
    message: "Today's air quality activity plan retrieved",
  });
});

/**
 * POST /api/plans
 * Add a new scheduled activity to today's plan and log UserAction
 */
export const POST = withApiHandler(async (req: NextRequest, _ctx, user) => {
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

  // Log user action if user is authenticated
  if (user?.id) {
    try {
      await connectToDatabase();
      await UserAction.create({
        userId: user.id,
        actionType: "route_adjusted",
        xpEarned: 15,
        metadata: {
          activityTitle: activity.title,
          scheduledTime: activity.scheduledTime,
        },
      });
    } catch {
      // Non-blocking action logging
    }
  }

  return apiCreated(activity, {
    message: "Activity added to daily plan",
  });
});
