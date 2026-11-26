import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { communityService } from "@/server/services/community.service";

export const dynamic = "force-dynamic";

const flagSchema = z.object({
  reason: z.string().optional(),
});

/**
 * POST /api/community/reports/[id]/flag
 * Flag a community report as inaccurate, expired, or spam
 */
export const POST = withApiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }, user) => {
  const { id } = await params;
  const body = await validateBody(req, flagSchema).catch(() => ({ reason: undefined }));
  const result = await communityService.flagReport(id, body.reason, user?.id);

  return apiSuccess(result, {
    message: "Report flagged for community review. Our team prioritizes verified neighborhood accuracy.",
  });
});
