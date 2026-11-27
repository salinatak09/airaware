import "server-only";
import { NextRequest } from "next/server";
import { apiSuccess, apiNotFound } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { notificationService } from "@/server/services/notification.service";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/notifications/[id]
 * Mark a single notification as read
 */
export const PATCH = withApiHandler(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const updated = await notificationService.markAsRead(id);

  if (!updated) {
    return apiNotFound("Notification not found");
  }

  return apiSuccess(updated, {
    message: "Notification marked as read",
  });
});
