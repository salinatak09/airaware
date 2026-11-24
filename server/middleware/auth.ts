import "server-only";
import { NextRequest } from "next/server";
import { UnauthorizedError, ForbiddenError } from "@/server/utils/errors";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin" | "health_worker";
}

/**
 * Extracts session or authenticated user identity from request headers or auth cookie.
 * In development, provides a fallback demo user if no authorization header is supplied.
 */
export async function getAuthSession(req: NextRequest): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.get("authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    // In production, token would be decoded via JWT/Auth.js verifyToken(token)
    if (token) {
      return {
        id: "usr_mock_auth_token",
        email: "family@airaware.local",
        name: "Aero Family",
        role: "user",
      };
    }
  }

  // Development convenience session
  if (process.env.NODE_ENV !== "production") {
    const devUserId = req.headers.get("x-dev-user-id");
    if (devUserId) {
      return {
        id: devUserId,
        email: `${devUserId}@airaware.local`,
        name: "Dev User",
        role: "user",
      };
    }
    // Return default local user in development so dev endpoints are easy to test
    return {
      id: "usr_delhi_demo_01",
      email: "delhi.family@airaware.local",
      name: "Delhi Family",
      role: "user",
    };
  }

  return null;
}

/**
 * Enforces that a valid user session is present on the request.
 * Throws UnauthorizedError if unauthenticated.
 */
export async function requireAuth(req: NextRequest): Promise<AuthenticatedUser> {
  const user = await getAuthSession(req);
  if (!user) {
    throw new UnauthorizedError("You must be signed in to perform this operation.");
  }
  return user;
}

/**
 * Enforces that the authenticated user possesses one of the allowed roles.
 */
export async function requireRole(
  req: NextRequest,
  allowedRoles: Array<"user" | "admin" | "health_worker">
): Promise<AuthenticatedUser> {
  const user = await requireAuth(req);
  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError("You do not have permission to access this resource.");
  }
  return user;
}
