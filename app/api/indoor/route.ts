import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { indoorService } from "@/server/services/indoor.service";

export const dynamic = "force-dynamic";

const indoorActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("toggle_checklist"),
    itemId: z.string().min(1),
    completed: z.boolean(),
  }),
  z.object({
    action: z.literal("complete_mission"),
    missionId: z.string().min(1),
  }),
  z.object({
    action: z.literal("control_purifier"),
    roomId: z.string().min(1),
    active: z.boolean(),
    speed: z.enum(["low", "medium", "high", "turbo", "off"]).optional(),
  }),
]);

/**
 * GET /api/indoor
 * Retrieve comprehensive indoor sanctuary overview, ventilation status,
 * cleaner-air room guide, checklist, and missions.
 */
export const GET = withApiHandler(async (_req: NextRequest, _ctx, user) => {
  const overview = await indoorService.getIndoorOverview(user?.id);

  return apiSuccess(overview, {
    message: "Indoor air quality sanctuary overview retrieved",
  });
});

/**
 * POST /api/indoor
 * Handle interactive actions: checklist toggle, home health mission completion, or purifier speed adjustment
 */
export const POST = withApiHandler(async (req: NextRequest, _ctx, user) => {
  const body = await validateBody(req, indoorActionSchema);

  if (body.action === "toggle_checklist") {
    const updatedChecklist = await indoorService.toggleChecklistItem(
      body.itemId,
      body.completed
    );
    return apiSuccess(
      { checklist: updatedChecklist },
      {
        message: `Checklist item ${body.itemId} set to ${body.completed ? "completed" : "pending"}`,
      }
    );
  }

  if (body.action === "complete_mission") {
    const result = await indoorService.completeHomeMission(user?.id, body.missionId);
    return apiSuccess(result, {
      message: result.message,
    });
  }

  if (body.action === "control_purifier") {
    const updatedRoom = await indoorService.setPurifierState(
      body.roomId,
      body.active,
      body.speed
    );
    return apiSuccess(updatedRoom, {
      message: `Purifier in ${updatedRoom.name} updated to ${updatedRoom.purifierActive ? "ACTIVE" : "STANDBY"}`,
    });
  }

  throw new Error("Invalid indoor action");
});
