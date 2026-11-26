import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, apiBadRequest } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { communityService } from "@/server/services/community.service";

export const dynamic = "force-dynamic";

const participateSchema = z.object({
  action: z.enum(["join_challenge", "toggle_activity"]),
  targetId: z.string().min(1),
});

/**
 * GET /api/community/challenges
 * Retrieve active community challenges and neighborhood awareness activities
 */
export const GET = withApiHandler(async () => {
  const data = await communityService.getCommunityChallenges();
  return apiSuccess(data, {
    message: "Community challenges and activities retrieved",
  });
});

/**
 * POST /api/community/challenges
 * Participate in a challenge or toggle RSVP for an awareness activity
 */
export const POST = withApiHandler(async (req: NextRequest, _ctx, user) => {
  const body = await validateBody(req, participateSchema);

  if (body.action === "join_challenge") {
    const result = await communityService.participateInChallenge(body.targetId, user?.id);
    return apiSuccess(result, {
      message: `You joined the challenge! +${result.xpAwarded} XP awarded.`,
    });
  }

  if (body.action === "toggle_activity") {
    const result = await communityService.toggleActivityRsvp(body.targetId);
    return apiSuccess(result, {
      message: result.isAttending ? "RSVP confirmed! See you at the community walk." : "RSVP cancelled.",
    });
  }

  return apiBadRequest("Invalid action type");
});
