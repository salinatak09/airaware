import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { connectToDatabase } from "@/server/db";
import { User } from "@/models/User";
import { NotFoundError } from "@/server/utils/errors";

export const dynamic = "force-dynamic";

const patchUserSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().optional(),
  location: z
    .object({
      city: z.string().optional(),
      area: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      timezone: z.string().optional(),
    })
    .optional(),
  preferences: z
    .object({
      theme: z.enum(["light", "dark", "system"]).optional(),
      language: z.string().optional(),
      notificationsEnabled: z.boolean().optional(),
      aqiThresholdAlert: z.number().optional(),
      temperatureUnit: z.enum(["celsius", "fahrenheit"]).optional(),
      aqiStandard: z.enum(["CPCB_NAQI", "US_EPA"]).optional(),
    })
    .optional(),
  familyMembers: z
    .array(
      z.object({
        name: z.string().min(1),
        ageGroup: z.enum(["infant", "child", "teen", "adult", "senior"]),
        healthConditions: z.array(z.string()).default([]),
        vulnerabilityLevel: z.enum(["low", "medium", "high", "critical"]).default("low"),
        notes: z.string().max(250).optional(),
      })
    )
    .optional(),
});

/**
 * GET /api/users/me
 * Retrieves the currently authenticated user's account details.
 * Prevents unauthorized access by scoping query strictly to session identity.
 */
export const GET = withApiHandler(
  async (_req: NextRequest, _ctx, user) => {
    await connectToDatabase();
    const doc = await User.findById(user!.id).lean().exec();

    if (!doc) {
      throw new NotFoundError("User account not found.");
    }

    return apiSuccess(
      {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        avatar: doc.avatar,
        location: doc.location || doc.homeLocation,
        preferences: doc.preferences,
        familyMembers: doc.familyMembers || [],
        onboardingComplete: doc.onboardingComplete || false,
        createdAt: doc.createdAt,
      },
      {
        message: "Current user account retrieved successfully",
      }
    );
  },
  { requireAuth: true }
);

/**
 * PATCH /api/users/me
 * Updates authenticated user's account settings, location, or preferences.
 */
export const PATCH = withApiHandler(
  async (req: NextRequest, _ctx, user) => {
    const body = await validateBody(req, patchUserSchema);

    await connectToDatabase();

    const updateOps: Record<string, unknown> = {};
    if (body.name) updateOps.name = body.name;
    if (body.avatar) updateOps.avatar = body.avatar;

    if (body.location) {
      if (body.location.city) updateOps["location.city"] = body.location.city;
      if (body.location.area) updateOps["location.area"] = body.location.area;
      if (body.location.state) updateOps["location.state"] = body.location.state;
      if (body.location.country) updateOps["location.country"] = body.location.country;
      if (body.location.timezone) updateOps["location.timezone"] = body.location.timezone;
      if (body.location.latitude !== undefined && body.location.longitude !== undefined) {
        updateOps["location.latitude"] = body.location.latitude;
        updateOps["location.longitude"] = body.location.longitude;
        updateOps["location.coordinates"] = {
          type: "Point",
          coordinates: [body.location.longitude, body.location.latitude],
        };
      }
    }

    if (body.preferences) {
      if (body.preferences.theme) updateOps["preferences.theme"] = body.preferences.theme;
      if (body.preferences.language) updateOps["preferences.language"] = body.preferences.language;
      if (body.preferences.notificationsEnabled !== undefined) {
        updateOps["preferences.notificationsEnabled"] = body.preferences.notificationsEnabled;
      }
      if (body.preferences.aqiThresholdAlert !== undefined) {
        updateOps["preferences.aqiThresholdAlert"] = body.preferences.aqiThresholdAlert;
        updateOps["preferences.aqiAlertThreshold"] = body.preferences.aqiThresholdAlert;
      }
      if (body.preferences.temperatureUnit) {
        updateOps["preferences.temperatureUnit"] = body.preferences.temperatureUnit;
      }
      if (body.preferences.aqiStandard) {
        updateOps["preferences.aqiStandard"] = body.preferences.aqiStandard;
      }
    }

    if (body.familyMembers) {
      updateOps.familyMembers = body.familyMembers;
    }

    const updated = await User.findByIdAndUpdate(user!.id, { $set: updateOps }, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundError("User account not found.");
    }

    return apiSuccess(
      {
        id: updated._id.toString(),
        name: updated.name,
        email: updated.email,
        avatar: updated.avatar,
        location: updated.location,
        preferences: updated.preferences,
        familyMembers: updated.familyMembers,
        onboardingComplete: updated.onboardingComplete,
      },
      {
        message: "User account updated successfully",
      }
    );
  },
  { requireAuth: true }
);
