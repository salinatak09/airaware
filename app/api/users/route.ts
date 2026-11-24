import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, apiCreated } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody, validateQuery } from "@/server/utils/validation";
import { userService } from "@/server/services/user.service";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  city: z.string().default("New Delhi"),
  country: z.string().default("India"),
});

/**
 * GET /api/users
 * List users (supports query filtering)
 */
export const GET = withApiHandler(async (req: NextRequest) => {
  const query = validateQuery(req, querySchema);
  const users = await userService.listUsers();

  const filtered = query.search
    ? users.filter(
        (u) =>
          u.name?.toLowerCase().includes(query.search!.toLowerCase()) ||
          u.email?.toLowerCase().includes(query.search!.toLowerCase())
      )
    : users;

  return apiSuccess(filtered.slice(0, query.limit), {
    message: "Users retrieved successfully",
    meta: {
      count: filtered.length,
      limit: query.limit,
    },
  });
});

/**
 * POST /api/users
 * Create a new user account
 */
export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await validateBody(req, createUserSchema);
  const user = await userService.createUser({
    name: body.name,
    email: body.email,
    homeLocation: {
      city: body.city ?? "New Delhi",
      country: body.country ?? "India",
      latitude: 28.6139,
      longitude: 77.209,
    },
    familyMembers: [],
    gamification: {
      points: 50,
      level: 1,
      streakDays: 1,
    },
  });

  return apiCreated(user, {
    message: "User created successfully",
  });
});
