import "server-only";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { UnauthorizedError } from "@/server/utils/errors";
import { connectToDatabase } from "@/server/db";
import { User } from "@/models/User";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "user" | "admin" | "health_worker";
}

/**
 * Extracts session or authenticated user identity from Auth.js session,
 * Bearer headers, or fallback demo profiles.
 */
export async function getAuthSession(req?: NextRequest): Promise<AuthenticatedUser | null> {
  // 1. Check Auth.js session cookie
  try {
    const session = await getServerSession(authOptions);
    if (session?.user && session.user.id) {
      return {
        id: session.user.id,
        email: session.user.email || "",
        name: session.user.name || "Family Member",
        avatar: (session.user as { avatar?: string }).avatar,
        role: "user",
      };
    }
  } catch (err) {
    // Session read error
  }

  // 2. Check Bearer Authorization header
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      if (token && token.startsWith("airaware_jwt_")) {
        try {
          const parts = token.split("_");
          if (parts[2]) {
            const email = Buffer.from(parts[2], "base64").toString("utf-8");
            await connectToDatabase();
            const user = await User.findOne({ email }).lean().exec();
            if (user) {
              return {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                role: "user",
              };
            }
          }
        } catch {
          // Fall through
        }
      }
    }

    // 3. Development explicit user override
    const devUserId = req.headers.get("x-dev-user-id");
    if (devUserId) {
      try {
        await connectToDatabase();
        const user = await User.findById(devUserId).lean().exec();
        if (user) {
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            role: "user",
          };
        }
      } catch {
        // Fall through
      }
    }
  }

  // 4. In development mode, auto-bind to the primary demo user (Priya Sharma) so endpoints are immediately testable
  if (process.env.NODE_ENV !== "production") {
    try {
      await connectToDatabase();
      const demoUser = await User.findOne({ email: "priya.sharma@example.com" }).lean().exec();
      if (demoUser) {
        return {
          id: demoUser._id.toString(),
          email: demoUser.email,
          name: demoUser.name,
          avatar: demoUser.avatar,
          role: "user",
        };
      }
    } catch {
      // Fallback
    }

    return {
      id: "usr_delhi_demo_01",
      email: "priya.sharma@example.com",
      name: "Priya Sharma",
      avatar: "aero-avatar-priya",
      role: "user",
    };
  }

  return null;
}

/**
 * Enforces that a valid user session is present on the request.
 * Throws UnauthorizedError if unauthenticated.
 */
export async function requireAuth(req?: NextRequest): Promise<AuthenticatedUser> {
  const user = await getAuthSession(req);
  if (!user) {
    throw new UnauthorizedError("Authentication required. Please sign in to proceed.");
  }
  return user;
}
