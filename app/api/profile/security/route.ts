import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, apiBadRequest } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { connectToDatabase } from "@/server/db";
import { User } from "@/models";
import { hashPassword, verifyPassword } from "@/server/utils/password";
import { NotFoundError } from "@/server/utils/errors";

export const dynamic = "force-dynamic";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

/**
 * POST /api/profile/security
 * Change account password securely with PBKDF2 verification.
 */
export const POST = withApiHandler(
  async (req: NextRequest, _ctx, user) => {
    const body = await validateBody(req, changePasswordSchema);
    await connectToDatabase();

    const userDoc = await User.findById(user!.id).select("+passwordHash").exec();
    if (!userDoc) {
      throw new NotFoundError("User not found.");
    }

    if (userDoc.authProvider !== "credentials") {
      return apiBadRequest(
        `This account signs in via ${userDoc.authProvider || "OAuth"}. Password change is not applicable.`
      );
    }

    const isValid = verifyPassword(body.currentPassword, userDoc.passwordHash);
    if (!isValid) {
      return apiBadRequest("Incorrect current password. Please try again.");
    }

    userDoc.passwordHash = hashPassword(body.newPassword);
    await userDoc.save();

    return apiSuccess(
      { updated: true },
      { message: "Your password has been securely updated." }
    );
  },
  { requireAuth: true }
);
