import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateQuery } from "@/server/utils/validation";
import { aqiProviderService } from "@/server/services/aqi-provider.service";

export const dynamic = "force-dynamic";

const currentAqiQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90).default(28.6139),
  longitude: z.coerce.number().min(-180).max(180).default(77.209),
  city: z.string().default("New Delhi"),
  demo: z
    .string()
    .optional()
    .transform((val) => val === "true" || val === "1"),
});

/**
 * GET /api/aqi/current
 *
 * Retrieves real-time air quality metrics for specified coordinates.
 * Computes Indian NAQI (CPCB) alongside US EPA AQI comparison.
 * Returns pollutant concentrations, CPCB sub-indices, data provenance (modeled vs observed),
 * data age, and integrated meteorological dispersion summary.
 */
export const GET = withApiHandler(async (req: NextRequest) => {
  const query = validateQuery(req, currentAqiQuerySchema);

  const result = await aqiProviderService.getCurrentAirQuality(
    query.latitude,
    query.longitude,
    query.city,
    query.demo
  );

  return apiSuccess(result, {
    message: `Current air quality for ${query.city} retrieved successfully`,
    meta: {
      standard: "CPCB National Air Quality Index (NAQI)",
      dataSourceType: result.meta.type,
      isStale: result.meta.isStale,
      dataAge: result.meta.dataAgeFormatted,
    },
  });
});
