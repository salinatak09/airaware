import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { authService } from "@/server/services/auth.service";
import { getAuthSession } from "@/server/middleware/auth";
import { RATE_LIMIT } from "@/server/config/constants";

export const dynamic = "force-dynamic";

const authActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("register"),
    email: z.string().email(),
    name: z.string().min(2),
    password: z.string().min(6).optional(),
    city: z.string().optional(),
    country: z.string().optional(),
  }),
  z.object({
    action: z.literal("login"),
    email: z.string().email(),
    password: z.string().optional(),
  }),
]);

/**
 * GET /api/auth
 * Return current session status
 */
export const GET = withApiHandler(async (req: NextRequest) => {
  const sessionUser = await getAuthSession(req);
  return apiSuccess(
    {
      authenticated: Boolean(sessionUser),
      user: sessionUser,
    },
    { message: sessionUser ? "Active session identified" : "No active session" }
  );
});

/**
 * POST /api/auth
 * Register new user or log in existing user
 */
export const POST = withApiHandler(
  async (req: NextRequest) => {
    const payload = await validateBody(req, authActionSchema);

    if (payload.action === "register") {
      const result = await authService.register(payload);
      return apiSuccess(result, {
        status: 201,
        message: "Account registered successfully",
      });
    }

    const result = await authService.login(payload);
    return apiSuccess(result, {
      message: "Authentication successful",
    });
  },
  {
    rateLimit: {
      maxRequests: RATE_LIMIT.AUTH_MAX_REQUESTS,
      windowMs: RATE_LIMIT.AUTH_WINDOW_MS,
      keyPrefix: "auth",
    },
  }
);
