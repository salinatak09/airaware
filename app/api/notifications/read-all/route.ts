import "server-only";
import { NextRequest } from "next/server";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { notificationService } from "@/server/services/notification.service";

export const dynamic = "force-dynamic";

/**
 * POST /api/notifications/read-all
 * Mark all notifications as read for current user
 */
export const POST = withApiHandler(async (_req: NextRequest, _ctx, user) => {
  const result = await notificationService.markAllAsRead(user?.id);
  return apiSuccess(result, {
    message: "All notifications marked as read",
  });
});
