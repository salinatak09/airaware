import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateQuery } from "@/server/utils/validation";
import { exploreService } from "@/server/services/explore.service";

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
 * Retrieves interactive air quality map stations, modeled grid points,
 * community citizen reports, and nearby area comparisons with caching.
 * Differentiates official ground stations from modeled and community data.
 */
export const GET = withApiHandler(async (req: NextRequest) => {
  const query = validateQuery(req, nearbyQuerySchema);

  const result = await exploreService.getExploreMapData(
    query.latitude,
    query.longitude,
    query.city
  );

  return apiSuccess(result, {
    message: `Nearby regional air quality stations & map data for ${query.city} retrieved successfully`,
    meta: {
      totalStationsCount: result.stations.length,
      officialStationsCount: result.stats.officialStationsCount,
      modeledLocationsCount: result.stats.modeledLocationsCount,
      communityReportsCount: result.stats.communityReportsCount,
    },
  });
});
