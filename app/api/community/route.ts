import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, apiCreated, apiBadRequest } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { communityService } from "@/server/services/community.service";
import type { CommunityReportType } from "@/models/CommunityReport";

export const dynamic = "force-dynamic";

const createReportSchema = z.object({
  authorName: z.string().optional(),
  authorRole: z.string().optional(),
  city: z.string().min(2, "City is required"),
  area: z.string().min(2, "Neighborhood/area is required"),
  landmark: z.string().optional(),
  rawAddress: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  reportType: z.enum([
    "garbage_burning",
    "smoke",
    "industrial_smoke",
    "construction_dust",
    "crop_residue",
    "heavy_traffic",
    "traffic_congestion",
    "unusual_pollution",
    "clean_corridor",
    "other",
  ]),
  description: z.string().min(10, "Description must be at least 10 characters long").max(1000),
  severity: z.enum(["low", "medium", "high", "severe"]).optional(),
  imageReference: z.string().optional(),
  observedTime: z.string().optional(),
});

/**
 * GET /api/community
 * Retrieve community clean air reports with optional filtering
 */
export const GET = withApiHandler(async (req: NextRequest) => {
  const url = new URL(req.url);
  const city = url.searchParams.get("city") || undefined;
  const category = url.searchParams.get("category") || undefined;
  const moderationStatus = url.searchParams.get("status") || undefined;
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 25;

  const reports = await communityService.getReports({
    city,
    category,
    moderationStatus,
    limit,
  });

  return apiSuccess(reports, {
    message: "Community air reports retrieved",
  });
});

/**
 * POST /api/community
 * Submit a local community pollution hazard report
 */
export const POST = withApiHandler(async (req: NextRequest, _ctx, user) => {
  const body = await validateBody(req, createReportSchema);

  try {
    const result = await communityService.createReport({
      userId: user?.id,
      authorName: body.authorName || (user as any)?.name,
      authorRole: body.authorRole || "Neighborhood Resident",
      city: body.city,
      area: body.area,
      landmark: body.landmark,
      rawAddress: body.rawAddress,
      latitude: body.latitude,
      longitude: body.longitude,
      reportType: body.reportType as CommunityReportType,
      description: body.description,
      severity: body.severity,
      imageReference: body.imageReference,
      observedTime: body.observedTime,
    });

    return apiCreated(result, {
      message: result.message,
    });
  } catch (err: any) {
    return apiBadRequest(err.message || "Failed to submit community report");
  }
}, { requireAuth: true });
