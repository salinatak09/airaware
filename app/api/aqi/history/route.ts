import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateQuery } from "@/server/utils/validation";
import { aqiProviderService } from "@/server/services/aqi-provider.service";

export const dynamic = "force-dynamic";

const historyQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90).default(28.6139),
  longitude: z.coerce.number().min(-180).max(180).default(77.209),
  days: z.coerce.number().min(1).max(7).default(2),
  city: z.string().default("New Delhi"),
  demo: z
    .string()
    .optional()
    .transform((val) => val === "true" || val === "1"),
});

/**
 * GET /api/aqi/history
 *
 * Retrieves historical air quality data over the past 1 to 7 days.
 * Calculates 24-hour delta and trends (improving vs worsening) to give families context
 * on whether current smog levels represent an acute spike or steady baseline.
 */
export const GET = withApiHandler(async (req: NextRequest) => {
  const query = validateQuery(req, historyQuerySchema);

  const result = await aqiProviderService.getAirQualityHistory(
    query.latitude,
    query.longitude,
    query.days,
    query.city,
    query.demo
  );

  return apiSuccess(result, {
    message: `Historical air quality trend (${query.days} days) for ${query.city} retrieved successfully`,
    meta: {
      dataPoints: result.history.length,
      trend: result.trend.direction,
      percentChange24h: result.trend.percentChange24h,
    },
  });
});
