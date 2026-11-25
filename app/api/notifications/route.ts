import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { notificationService } from "@/server/services/notification.service";

export const dynamic = "force-dynamic";

const readNotificationSchema = z.object({
  id: z.string().optional(),
  markAll: z.boolean().default(false),
});

/**
 * GET /api/notifications
 * Retrieve active smog alerts, safe window advisories, and system notifications
 */
export const GET = withApiHandler(async (_req: NextRequest, _ctx, user) => {
  const notifications = await notificationService.getNotifications(user?.id);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return apiSuccess(
    {
      unreadCount,
      notifications,
    },
    {
      message: "Notifications retrieved",
    }
  );
});

/**
 * POST /api/notifications
 * Mark notifications as read
 */
export const POST = withApiHandler(async (req: NextRequest, _ctx, user) => {
  const body = await validateBody(req, readNotificationSchema);

  if (body.markAll) {
    await notificationService.markAllAsRead(user?.id);
    return apiSuccess({ success: true }, { message: "All notifications marked as read" });
  }

  if (body.id) {
    const updated = await notificationService.markAsRead(body.id);
    return apiSuccess(updated, { message: "Notification marked as read" });
  }

  return apiSuccess({ success: true }, { message: "No action required" });
});
