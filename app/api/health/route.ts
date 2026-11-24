import "server-only";
import { NextRequest } from "next/server";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { getDatabaseStatus } from "@/server/api/db/connection";
import { serverConfig } from "@/server/config/env";

export const dynamic = "force-dynamic";

/**
 * Health check endpoint for system monitoring, uptime tracking, and service validation.
 * GET /api/health
 */
export const GET = withApiHandler(async (_req: NextRequest) => {
  const dbStatus = getDatabaseStatus();
  const uptimeSeconds = Math.floor(process.uptime());

  const healthData = {
    status: "ok",
    service: "AirAware API",
    version: "0.1.0",
    environment: serverConfig.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds}s`,
    database: {
      status: dbStatus.stateLabel,
      connected: dbStatus.isConnected,
      host: dbStatus.host ?? "localhost",
    },
    integrations: {
      geminiConfigured: Boolean(
        serverConfig.GEMINI_API_KEY &&
        serverConfig.GEMINI_API_KEY !== "dummy_gemini_key_for_dev"
      ),
      openMeteoConfigured: Boolean(serverConfig.OPEN_METEO_AIR_QUALITY_URL),
    },
  };

  return apiSuccess(healthData, {
    message: "AirAware API services operational",
  });
});
