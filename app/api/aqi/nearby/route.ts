import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateQuery } from "@/server/utils/validation";
import { aqiProviderService } from "@/server/services/aqi-provider.service";

export const dynamic = "force-dynamic";

const nearbyQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90).default(28.6139),
  longitude: z.coerce.number().min(-180).max(180).default(77.209),
  city: z.string().default("New Delhi"),
  demo: z
    .string()
    .optional()
    .transform((val) => val === "true" || val === "1"),
});

/**
 * GET /api/aqi/nearby
 *
 * Retrieves comparative air quality readings from surrounding regional grid points
 * (e.g. North, East, South, West sectors around the specified coordinates).
 * Enables neighborhood-level comparison for commuters and school planners.
 */
export const GET = withApiHandler(async (req: NextRequest) => {
  const query = validateQuery(req, nearbyQuerySchema);

  const result = await aqiProviderService.getNearbyAirQuality(
    query.latitude,
    query.longitude,
    query.city,
    query.demo
  );

  return apiSuccess(result, {
    message: `Nearby regional air quality stations for ${query.city} retrieved successfully`,
    meta: {
      stationsCount: result.stations.length,
      dataSourceType: result.meta.type,
    },
  });
});
