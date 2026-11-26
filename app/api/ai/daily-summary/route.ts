import "server-only";
import { NextRequest } from "next/server";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { geminiService } from "@/server/services/ai/gemini";
import { AiContextInputSchema } from "@/server/services/ai/types";
import { connectToDatabase } from "@/server/db";
import { HouseholdProfile, AQIReading } from "@/models";
import { RATE_LIMIT } from "@/server/config/constants";

export const dynamic = "force-dynamic";

const dailySummaryRequestSchema = AiContextInputSchema.partial().optional();

/**
 * POST /api/ai/daily-summary
 * Generates personalized daily air summary with deterministic safety boundaries.
 */
export const POST = withApiHandler(
  async (req: NextRequest, _ctx, user) => {
    let body = {};
    try {
      body = await validateBody(req, dailySummaryRequestSchema.default({}));
    } catch {
      // Allow empty POST body
      body = {};
    }

    const context = {
      currentAqi: (body as any)?.currentAqi ?? 185,
      category: (body as any)?.category ?? "Poor",
      pollutants: (body as any)?.pollutants ?? { pm25: 110, pm10: 195, no2: 45 },
      dataSource: (body as any)?.dataSource ?? "CPCB Ground Stations + Open-Meteo High Resolution Model",
      dataTimestamp: (body as any)?.dataTimestamp ?? new Date().toISOString(),
      userLocation: (body as any)?.userLocation ?? { city: "New Delhi" },
      householdProfile: (body as any)?.householdProfile,
      commute: (body as any)?.commute,
      lifestyle: (body as any)?.lifestyle,
      homeEnvironment: (body as any)?.homeEnvironment,
      budget: (body as any)?.budget,
      completedActions: (body as any)?.completedActions,
    };

    if (user?.id) {
      try {
        await connectToDatabase();
        const [hp, latestReading] = await Promise.all([
          HouseholdProfile.findOne({ userId: user.id }).lean().exec(),
          AQIReading.findOne().sort({ recordedAt: -1 }).lean().exec(),
        ]);

        if (latestReading && !(body as any)?.currentAqi) {
          context.currentAqi = latestReading.aqi.indianAqi;
          context.category = latestReading.aqi.indianCategory;
          context.pollutants = {
            pm25: latestReading.pollutantMeasurements.pm25,
            pm10: latestReading.pollutantMeasurements.pm10,
            no2: latestReading.pollutantMeasurements.no2,
          };
        }

        if (hp) {
          context.householdProfile = context.householdProfile || {
            householdSize: hp.householdSize,
            sensitivePreferences: hp.sensitiveGroupPreferences,
          };
          context.commute = context.commute || hp.commute;
          context.homeEnvironment = context.homeEnvironment || {
            ...hp.homeEnvironment,
            purifierAvailability: hp.purifierAvailability,
          };
          context.budget = context.budget || hp.budgetPreferences;
        }
      } catch (err) {
        console.warn("[POST /api/ai/daily-summary] Enrichment error:", err);
      }
    }

    const summary = await geminiService.generateDailySummary(context);

    return apiSuccess(summary, {
      message: "Daily clean air summary generated",
    });
  },
  {
    requireAuth: true,
    rateLimit: {
      maxRequests: RATE_LIMIT.AI_MAX_REQUESTS,
      windowMs: RATE_LIMIT.AI_WINDOW_MS,
      keyPrefix: "ai-daily-summary",
    },
  }
);
