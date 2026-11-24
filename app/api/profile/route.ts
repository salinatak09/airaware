import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { userService } from "@/server/services/user.service";
import { IUserData } from "@/models/User";

export const dynamic = "force-dynamic";

const familyMemberSchema = z.object({
  name: z.string().min(1),
  ageGroup: z.enum(["infant", "child", "teen", "adult", "senior"]),
  healthConditions: z.array(z.string()).default([]),
  vulnerabilityLevel: z.enum(["low", "medium", "high", "critical"]).default("low"),
  notes: z.string().max(250).optional(),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  homeLocation: z
    .object({
      city: z.string(),
      country: z.string(),
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  familyMembers: z.array(familyMemberSchema).optional(),
  preferences: z
    .object({
      notificationsEnabled: z.boolean().optional(),
      aqiThresholdAlert: z.number().optional(),
      temperatureUnit: z.enum(["celsius", "fahrenheit"]).optional(),
    })
    .optional(),
});

/**
 * GET /api/profile
 * Get authenticated user's profile and family details
 */
export const GET = withApiHandler(
  async (_req: NextRequest, _ctx, user) => {
    const profile = await userService.getUserById(user!.id);
    return apiSuccess(profile, {
      message: "Profile retrieved successfully",
    });
  },
  { requireAuth: true }
);

/**
 * PATCH /api/profile
 * Update user preferences, location, or family members
 */
export const PATCH = withApiHandler(
  async (req: NextRequest, _ctx, user) => {
    const body = await validateBody(req, updateProfileSchema);
    const updated = await userService.updateProfile(user!.id, {
      name: body.name,
      homeLocation: body.homeLocation,
      familyMembers: body.familyMembers?.map((m) => ({
        name: m.name,
        ageGroup: m.ageGroup,
        healthConditions: m.healthConditions ?? [],
        vulnerabilityLevel: m.vulnerabilityLevel ?? "low",
        notes: m.notes,
      })),
      preferences: body.preferences as IUserData["preferences"] | undefined,
    });

    return apiSuccess(updated, {
      message: "Profile updated successfully",
    });
  },
  { requireAuth: true }
);
