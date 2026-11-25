import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateQuery } from "@/server/utils/validation";
import { aqiProviderService } from "@/server/services/aqi-provider.service";
import { safetyEngine } from "@/server/services/safety";

export const dynamic = "force-dynamic";

const currentAqiQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90).default(28.6139),
  longitude: z.coerce.number().min(-180).max(180).default(77.209),
  city: z.string().default("New Delhi"),
  hasChildren: z
    .string()
    .optional()
    .transform((val) => val === "true" || val === "1"),
  hasRespiratorySensitivity: z
    .string()
    .optional()
    .transform((val) => val === "true" || val === "1"),
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
 * Deterministically evaluates health advisories, restrictions, and warnings.
 * Returns pollutant concentrations, CPCB sub-indices, data provenance (modeled vs observed),
 * data age, integrated meteorological dispersion summary, and deterministic safety advisory.
 */
export const GET = withApiHandler(async (req: NextRequest) => {
  const query = validateQuery(req, currentAqiQuerySchema);

  const result = await aqiProviderService.getCurrentAirQuality(
    query.latitude,
    query.longitude,
    query.city,
    query.demo
  );

  // Evaluate safety deterministically via safety engine (pure TS, zero LLM reliance)
  const safety = safetyEngine.evaluateSafety({
    aqi: result.indianAqi,
    pollutants: {
      pm25: result.pollutants.pm25,
      pm10: result.pollutants.pm10,
      no2: result.pollutants.no2,
      so2: result.pollutants.so2,
      co: result.pollutants.co,
      o3: result.pollutants.o3,
    },
    recordedAt: result.meta.recordedAt,
    householdProfile: {
      hasChildren: query.hasChildren,
      hasRespiratorySensitivity: query.hasRespiratorySensitivity,
    },
  });

  return apiSuccess(
    {
      ...result,
      safety,
    },
    {
      message: `Current air quality and safety advisory for ${query.city} retrieved successfully`,
      meta: {
        standard: "CPCB National Air Quality Index (NAQI)",
        dataSourceType: result.meta.type,
        isStale: result.meta.isStale,
        dataAge: result.meta.dataAgeFormatted,
        severity: safety.severity,
        maskRequired: safety.restrictions.maskRequired,
        confidence: safety.confidence,
      },
    }
  );
});
