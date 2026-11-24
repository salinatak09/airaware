import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { indoorService } from "@/server/services/indoor.service";

export const dynamic = "force-dynamic";

const controlPurifierSchema = z.object({
  roomId: z.string().min(1),
  active: z.boolean(),
  speed: z.enum(["low", "medium", "high", "turbo", "off"]).optional(),
});

/**
 * GET /api/indoor
 * Retrieve indoor air status, room sensors, and connected purifier states
 */
export const GET = withApiHandler(async () => {
  const rooms = await indoorService.getRooms();
  const avgPm25 = Math.round(
    rooms.reduce((acc, r) => acc + r.pm25, 0) / (rooms.length || 1)
  );

  return apiSuccess(
    {
      averageIndoorPm25: avgPm25,
      airQualityAssessment:
        avgPm25 < 25 ? "Good indoor air" : "Moderate indoor particles detected",
      rooms,
    },
    {
      message: "Indoor environment sensors retrieved",
    }
  );
});

/**
 * POST /api/indoor
 * Control room air purifier state or fan speed
 */
export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await validateBody(req, controlPurifierSchema);
  const updatedRoom = await indoorService.setPurifierState(
    body.roomId,
    body.active,
    body.speed
  );

  return apiSuccess(updatedRoom, {
    message: `Purifier in ${updatedRoom.name} updated to ${updatedRoom.purifierActive ? "ACTIVE" : "STANDBY"} (${updatedRoom.purifierSpeed})`,
  });
});
