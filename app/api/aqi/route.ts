import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateQuery } from "@/server/utils/validation";
import { aqiProviderService } from "@/server/services/aqi-provider.service";

export const dynamic = "force-dynamic";

const aqiQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90).default(28.6139),
  longitude: z.coerce.number().min(-180).max(180).default(77.209),
  city: z.string().default("New Delhi"),
  demo: z
    .string()
    .optional()
    .transform((val) => val === "true" || val === "1"),
});

/**
 * GET /api/aqi
 * Aggregate endpoint returning current metrics + forecast + safest window.
 */
export const GET = withApiHandler(async (req: NextRequest) => {
  const query = validateQuery(req, aqiQuerySchema);

  const [current, forecast] = await Promise.all([
    aqiProviderService.getCurrentAirQuality(query.latitude, query.longitude, query.city, query.demo),
    aqiProviderService.getAirQualityForecast(query.latitude, query.longitude, 2, query.city, query.demo),
  ]);

  return apiSuccess(
    {
      current,
      hourlyForecast: forecast.hourly.slice(0, 24),
      dailyForecast: forecast.daily,
      safestWindow: forecast.safestWindows[0] || {
        day: "Today",
        timeRange: "12:30 PM - 03:30 PM",
        averageAqi: 140,
        rationale: "Solar thermal boundary mixing elevates particle dispersal.",
      },
    },
    {
      message: `Air quality metrics for ${query.city} retrieved successfully`,
      meta: {
        standard: "CPCB National Air Quality Index (NAQI)",
        dataSource: current.meta.provider,
        dataType: current.meta.type,
      },
    }
  );
});
