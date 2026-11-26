import "server-only";
import { NextRequest } from "next/server";
import { apiSuccess, apiNotFound } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { communityService } from "@/server/services/community.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/community/reports/[id]
 * Fetch single community report details
 */
export const GET = withApiHandler(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const report = await communityService.getReportById(id);

  if (!report) {
    return apiNotFound("Community report not found");
  }

  return apiSuccess(report, {
    message: "Community report details retrieved",
  });
});
