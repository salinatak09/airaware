import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateQuery } from "@/server/utils/validation";
import { aqiService } from "@/server/services/aqi.service";

export const dynamic = "force-dynamic";

const aqiQuerySchema = z.object({
  latitude: z.coerce.number().default(28.6139),
  longitude: z.coerce.number().default(77.209),
  city: z.string().default("New Delhi"),
});

/**
 * GET /api/aqi
 * Retrieve current air quality metrics and hourly forecast
 */
export const GET = withApiHandler(async (req: NextRequest) => {
  const query = validateQuery(req, aqiQuerySchema);

  const [current, hourlyForecast] = await Promise.all([
    aqiService.getCurrentAirQuality(query.latitude, query.longitude, query.city),
    aqiService.getHourlyForecast(query.latitude, query.longitude),
  ]);

  return apiSuccess(
    {
      current,
      hourlyForecast,
      safestWindow: {
        timeRange: "12:30 PM - 03:30 PM",
        reason: "Peak solar thermal mixing temporarily thins ground-level particle smog.",
      },
    },
    {
      message: `Air quality metrics for ${query.city} retrieved successfully`,
    }
  );
});
