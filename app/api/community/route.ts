import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, apiCreated } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { communityService } from "@/server/services/community.service";

export const dynamic = "force-dynamic";

const reportHazardSchema = z.object({
  authorName: z.string().min(2),
  neighborhood: z.string().min(2),
  hazardType: z.enum([
    "garbage_burning",
    "construction_dust",
    "heavy_diesel_traffic",
    "industrial_smoke",
  ]),
  description: z.string().min(5),
  severity: z.enum(["low", "moderate", "severe"]).default("moderate"),
});

/**
 * GET /api/community
 * Retrieve community clean air reports and neighborhood alerts
 */
export const GET = withApiHandler(async () => {
  const reports = await communityService.getReports();
  return apiSuccess(reports, {
    message: "Community air reports retrieved",
  });
});

/**
 * POST /api/community
 * Submit a local pollution hazard report
 */
export const POST = withApiHandler(async (req: NextRequest, _ctx, user) => {
  const body = await validateBody(req, reportHazardSchema);
  const created = await communityService.createReport({
    authorName: body.authorName,
    neighborhood: body.neighborhood,
    hazardType: body.hazardType,
    description: body.description,
    severity: body.severity ?? "moderate",
    userId: user?.id,
  });

  return apiCreated(created, {
    message: "Community report submitted successfully. Thank you for keeping your neighborhood informed!",
  });
});
