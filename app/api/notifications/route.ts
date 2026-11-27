import "server-only";
import { NextRequest } from "next/server";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { notificationService } from "@/server/services/notification.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications
 * Retrieve active smog alerts, daily advisories, and system notifications
 */
export const GET = withApiHandler(async (req: NextRequest, _ctx, user) => {
  const url = new URL(req.url);
  const categoryGroup = url.searchParams.get("category") || undefined;
  const unreadOnly = url.searchParams.get("unreadOnly") === "true";
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 30;

  const result = await notificationService.getNotifications({
    userId: user?.id,
    categoryGroup,
    unreadOnly,
    limit,
  });

  return apiSuccess(result, {
    message: "Notifications retrieved",
  });
});

/**
 * POST /api/notifications
 * Legacy backward compatibility fallback for mark-all-as-read
 */
export const POST = withApiHandler(async (req: NextRequest, _ctx, user) => {
  const body = await req.json().catch(() => ({}));

  if (body.markAll || !body.id) {
    const result = await notificationService.markAllAsRead(user?.id);
    return apiSuccess(result, { message: "All notifications marked as read" });
  }

  const updated = await notificationService.markAsRead(body.id);
  return apiSuccess(updated, { message: "Notification marked as read" });
});
