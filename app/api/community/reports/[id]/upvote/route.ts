import "server-only";
import { NextRequest } from "next/server";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { communityService } from "@/server/services/community.service";

export const dynamic = "force-dynamic";

/**
 * POST /api/community/reports/[id]/upvote
 * Upvote / confirm a community report
 */
export const POST = withApiHandler(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }, user) => {
  const { id } = await params;
  const result = await communityService.upvoteReport(id, user?.id);

  return apiSuccess(result, {
    message: "Report confirmed! Thank you for validating local neighborhood observations.",
  });
});
