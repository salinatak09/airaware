import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { notificationService } from "@/server/services/notification.service";

export const dynamic = "force-dynamic";

const updatePreferencesSchema = z.object({
  aqi_deterioration: z.boolean().optional(),
  severe_aqi: z.boolean().optional(),
  daily_reminder: z.boolean().optional(),
  mission_reminder: z.boolean().optional(),
  streak_reminder: z.boolean().optional(),
  forecast_alert: z.boolean().optional(),
  community_update: z.boolean().optional(),
  browserNotificationsEnabled: z.boolean().optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
  aqiThreshold: z.number().optional(),
  minSeverity: z.enum(["info", "warning", "critical", "success"]).optional(),
});

/**
 * GET /api/notifications/preferences
 * Retrieve current user notification preferences
 */
export const GET = withApiHandler(async (_req: NextRequest, _ctx, user) => {
  const preferences = await notificationService.getUserPreferences(user?.id);
  return apiSuccess(
    { preferences },
    {
      message: "Notification preferences retrieved",
    }
  );
});

/**
 * PATCH /api/notifications/preferences
 * Update user notification preferences and category toggles
 */
export const PATCH = withApiHandler(async (req: NextRequest, _ctx, user) => {
  const body = await validateBody(req, updatePreferencesSchema);
  const updated = await notificationService.updateUserPreferences(user?.id, body);

  return apiSuccess(
    { preferences: updated },
    {
      message: "Notification preferences updated successfully",
    }
  );
});
