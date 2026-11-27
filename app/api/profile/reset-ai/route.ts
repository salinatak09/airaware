import "server-only";
import { NextRequest } from "next/server";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { connectToDatabase } from "@/server/db";
import { ChatSession, User } from "@/models";

export const dynamic = "force-dynamic";

/**
 * POST /api/profile/reset-ai
 * Clears user chat sessions and resets AI context memory.
 */
export const POST = withApiHandler(
  async (_req: NextRequest, _ctx, user) => {
    await connectToDatabase();
    const userId = user!.id;

    // Delete chat sessions
    const deleted = await ChatSession.deleteMany({ userId }).exec();

    // Optionally reset AI personalization flag if requested
    await User.findByIdAndUpdate(userId, {
      $set: { "preferences.aiPersonalization.storeChatHistory": true },
    }).exec();

    return apiSuccess(
      { deletedSessionsCount: deleted.deletedCount || 0 },
      { message: "AI chat history and memory context have been cleared successfully." }
    );
  },
  { requireAuth: true }
);
