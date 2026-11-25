import "server-only";
import { NextRequest } from "next/server";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { seedDatabase } from "@/server/db/seed";

export const dynamic = "force-dynamic";

/**
 * POST /api/seed
 *
 * Seeds the MongoDB Atlas database with demo users, household profiles,
 * real-time/historical AQI readings, daily plans, gamification stats,
 * citizen reports, chat histories, and notifications.
 */
export const POST = withApiHandler(async () => {
  const result = await seedDatabase();

  return apiSuccess(result, {
    message: "AirAware database seeded with demo datasets successfully",
  });
});

/**
 * GET /api/seed
 * Convenience endpoint for invoking seed operations in development/demo environments.
 */
export const GET = withApiHandler(async (_req: NextRequest) => {
  const result = await seedDatabase();

  return apiSuccess(result, {
    message: "AirAware database seeded with demo datasets successfully",
  });
});
