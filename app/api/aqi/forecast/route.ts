import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateQuery } from "@/server/utils/validation";
import { aqiProviderService } from "@/server/services/aqi-provider.service";

export const dynamic = "force-dynamic";

const forecastQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90).default(28.6139),
  longitude: z.coerce.number().min(-180).max(180).default(77.209),
  days: z.coerce.number().min(1).max(5).default(3),
  city: z.string().default("New Delhi"),
  demo: z
    .string()
    .optional()
    .transform((val) => val === "true" || val === "1"),
});

/**
 * GET /api/aqi/forecast
 *
 * Retrieves hourly and 3-day air quality forecast using Open-Meteo CAMS ensemble.
 * Computes Indian NAQI for each predicted hour and aggregates daily min/max/average.
 * Identifies safest outdoor windows and peak smog periods based on diurnal thermal inversion.
 */
export const GET = withApiHandler(async (req: NextRequest) => {
  const query = validateQuery(req, forecastQuerySchema);

  const result = await aqiProviderService.getAirQualityForecast(
    query.latitude,
    query.longitude,
    query.days,
    query.city,
    query.demo
  );

  return apiSuccess(result, {
    message: `${query.days}-day air quality forecast for ${query.city} retrieved successfully`,
    meta: {
      forecastHours: result.hourly.length,
      daysCount: result.daily.length,
      dataSourceType: result.meta.type,
      standard: "CPCB National Air Quality Index (NAQI)",
    },
  });
});
