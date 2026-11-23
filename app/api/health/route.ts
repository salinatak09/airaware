import { NextRequest } from "next/server";
import { apiSuccess } from "@/server/api/response";
import { withErrorHandler } from "@/server/api/error-handler";
import { getDatabaseStatus } from "@/lib/db";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Health check endpoint for system monitoring, uptime tracking, and service validation.
 * GET /api/health
 */
export const GET = withErrorHandler(async (_request: NextRequest) => {
  const dbStatus = getDatabaseStatus();
  const uptimeSeconds = Math.floor(process.uptime());

  const healthData = {
    status: "ok",
    service: "AirAware API",
    version: "0.1.0",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds}s`,
    database: {
      status: dbStatus.stateLabel,
      connected: dbStatus.isConnected,
    },
    services: {
      geminiConfigured: Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY !== "dummy_gemini_key_for_dev"),
      openMeteoConfigured: Boolean(env.OPEN_METEO_AIR_QUALITY_URL),
    },
  };

  return apiSuccess(healthData, {
    message: "AirAware system health operational.",
  });
});
