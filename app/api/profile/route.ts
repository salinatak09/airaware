import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { connectToDatabase } from "@/server/db";
import {
  User,
  HouseholdProfile,
  GamificationProfile,
  DailyPlan,
  UserAction,
  ChatSession,
  Notification,
} from "@/models";
import { NotFoundError } from "@/server/utils/errors";

export const dynamic = "force-dynamic";

const profilePayloadSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(250).optional(),
  phone: z.string().max(20).optional(),
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
      isApproximate: z.boolean().optional(),
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
      distanceUnit: z.enum(["km", "miles"]).optional(),
      privacy: z
        .object({
          approximateLocationOnly: z.boolean().optional(),
          anonymizeCommunityReports: z.boolean().optional(),
          optOutAnalytics: z.boolean().optional(),
          optOutHealthContext: z.boolean().optional(),
        })
        .optional(),
      aiPersonalization: z
        .object({
          enabled: z.boolean().optional(),
          enableCommuteAdvice: z.boolean().optional(),
          enableIndoorAdvice: z.boolean().optional(),
          storeChatHistory: z.boolean().optional(),
        })
        .optional(),
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
  householdProfile: z
    .object({
      householdSize: z
        .object({
          adults: z.number().min(1).default(1),
          children: z.number().min(0).default(0),
          elderly: z.number().min(0).default(0),
          total: z.number().min(1).optional(),
        })
        .optional(),
      sensitiveGroupPreferences: z
        .object({
          hasRespiratorySensitivity: z.boolean().default(false),
          hasCardiovascularSensitivity: z.boolean().default(false),
          isPregnant: z.boolean().default(false),
          hasInfant: z.boolean().default(false),
          allergyTypes: z.array(z.string()).optional(),
          notes: z.string().max(200).optional(),
        })
        .optional(),
      lifestyle: z
        .object({
          workSchedule: z.enum(["fixed_office", "hybrid", "work_from_home", "outdoor_work", "student", "retired"]).optional(),
          exerciseHabits: z.enum(["outdoor_morning", "outdoor_evening", "indoor_gym", "none", "intermittent"]).optional(),
          outdoorActivityFrequency: z.enum(["daily", "weekends_only", "occasional", "rare"]).optional(),
          preferredExerciseTime: z.string().optional(),
        })
        .optional(),
      commute: z
        .object({
          commuteType: z.enum(["car", "metro", "bus", "two_wheeler", "walking", "bicycle", "mixed"]).optional(),
          durationMinutes: z.number().min(0).max(240).optional(),
          travelWindow: z.enum(["early_morning", "morning_rush", "midday", "evening_rush", "night"]).optional(),
          vehicleHasAcAirFilter: z.boolean().optional(),
        })
        .optional(),
      homeEnvironment: z
        .object({
          homeType: z.enum(["apartment", "independent_house", "villa", "other"]).optional(),
          floorLevel: z.number().optional(),
          ventilationType: z.enum(["natural", "central_ac", "split_ac", "mixed"]).optional(),
          cookingFuel: z.enum(["lpg", "induction_electric", "piped_gas", "biomass"]).optional(),
          hasBalconyOrGarden: z.boolean().optional(),
          hasKitchenChimney: z.boolean().optional(),
          cleanerAirRoomStatus: z.string().optional(),
        })
        .optional(),
      purifierAvailability: z
        .object({
          hasPurifier: z.boolean().optional(),
          purifierCount: z.number().min(0).optional(),
          roomsWithPurifiers: z.array(z.string()).optional(),
          purifierType: z.enum(["hepa", "carbon_hepa", "diy", "none"]).optional(),
          lastFilterChangeDate: z.string().or(z.date()).optional(),
        })
        .optional(),
      budgetPreferences: z
        .object({
          budgetRange: z.enum(["minimal", "moderate", "comprehensive"]).optional(),
          improvementPriorities: z.array(z.string()).optional(),
        })
        .optional(),
    })
    .optional(),
});

/**
 * GET /api/profile
 * Retrieves full user account, household profile, and gamification status.
 */
export const GET = withApiHandler(
  async (_req: NextRequest, _ctx, user) => {
    await connectToDatabase();

    const [userDoc, householdDoc, gamificationDoc] = await Promise.all([
      User.findById(user!.id).lean().exec(),
      HouseholdProfile.findOne({ userId: user!.id }).lean().exec(),
      GamificationProfile.findOne({ userId: user!.id }).lean().exec(),
    ]);

    if (!userDoc) {
      throw new NotFoundError("User profile not found.");
    }

    return apiSuccess(
      {
        user: {
          id: userDoc._id.toString(),
          name: userDoc.name,
          email: userDoc.email,
          bio: userDoc.bio || "",
          phone: userDoc.phone || "",
          avatar: userDoc.avatar,
          location: userDoc.location || userDoc.homeLocation,
          preferences: userDoc.preferences,
          familyMembers: userDoc.familyMembers || [],
          onboardingComplete: userDoc.onboardingComplete || false,
          createdAt: userDoc.createdAt,
        },
        householdProfile: householdDoc || null,
        gamification: gamificationDoc
          ? {
              totalXp: gamificationDoc.totalXp,
              level: gamificationDoc.level,
              streak: gamificationDoc.streak,
              badges: gamificationDoc.badges,
              achievements: gamificationDoc.achievements,
            }
          : null,
      },
      {
        message: "Comprehensive profile retrieved successfully",
      }
    );
  },
  { requireAuth: true }
);

/**
 * PUT /api/profile
 * Full update for user profile and household environment.
 */
export const PUT = withApiHandler(
  async (req: NextRequest, _ctx, user) => {
    const body = await validateBody(req, profilePayloadSchema);

    await connectToDatabase();

    // 1. Update User Document
    const userUpdates: Record<string, unknown> = {};
    if (body.name !== undefined) userUpdates.name = body.name;
    if (body.bio !== undefined) userUpdates.bio = body.bio;
    if (body.phone !== undefined) userUpdates.phone = body.phone;
    if (body.avatar !== undefined) userUpdates.avatar = body.avatar;
    if (body.familyMembers !== undefined) userUpdates.familyMembers = body.familyMembers;

    if (body.location) {
      if (body.location.city !== undefined) userUpdates["location.city"] = body.location.city;
      if (body.location.area !== undefined) userUpdates["location.area"] = body.location.area;
      if (body.location.state !== undefined) userUpdates["location.state"] = body.location.state;
      if (body.location.country !== undefined) userUpdates["location.country"] = body.location.country;
      if (body.location.timezone !== undefined) userUpdates["location.timezone"] = body.location.timezone;
      if (body.location.isApproximate !== undefined) userUpdates["location.isApproximate"] = body.location.isApproximate;
      if (body.location.latitude !== undefined && body.location.longitude !== undefined) {
        userUpdates["location.latitude"] = body.location.latitude;
        userUpdates["location.longitude"] = body.location.longitude;
        userUpdates["location.coordinates"] = {
          type: "Point",
          coordinates: [body.location.longitude, body.location.latitude],
        };
      }
    }

    if (body.preferences) {
      if (body.preferences.theme !== undefined) userUpdates["preferences.theme"] = body.preferences.theme;
      if (body.preferences.language !== undefined) userUpdates["preferences.language"] = body.preferences.language;
      if (body.preferences.notificationsEnabled !== undefined) {
        userUpdates["preferences.notificationsEnabled"] = body.preferences.notificationsEnabled;
      }
      if (body.preferences.aqiThresholdAlert !== undefined) {
        userUpdates["preferences.aqiThresholdAlert"] = body.preferences.aqiThresholdAlert;
        userUpdates["preferences.aqiAlertThreshold"] = body.preferences.aqiThresholdAlert;
      }
      if (body.preferences.temperatureUnit !== undefined) {
        userUpdates["preferences.temperatureUnit"] = body.preferences.temperatureUnit;
      }
      if (body.preferences.aqiStandard !== undefined) {
        userUpdates["preferences.aqiStandard"] = body.preferences.aqiStandard;
      }
      if (body.preferences.distanceUnit !== undefined) {
        userUpdates["preferences.distanceUnit"] = body.preferences.distanceUnit;
      }
      if (body.preferences.privacy !== undefined) {
        userUpdates["preferences.privacy"] = body.preferences.privacy;
      }
      if (body.preferences.aiPersonalization !== undefined) {
        userUpdates["preferences.aiPersonalization"] = body.preferences.aiPersonalization;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      user!.id,
      { $set: userUpdates },
      { new: true }
    ).lean().exec();

    if (!updatedUser) {
      throw new NotFoundError("User not found.");
    }

    // 2. Update or Upsert HouseholdProfile Document
    let updatedHousehold = null;
    if (body.householdProfile) {
      const hp = body.householdProfile;
      const hpUpdates: Record<string, unknown> = {};

      if (hp.householdSize) {
        const adults = hp.householdSize.adults ?? 1;
        const children = hp.householdSize.children ?? 0;
        const elderly = hp.householdSize.elderly ?? 0;
        hpUpdates.householdSize = {
          adults,
          children,
          elderly,
          total: hp.householdSize.total ?? adults + children + elderly,
        };
      }

      if (hp.sensitiveGroupPreferences !== undefined) {
        hpUpdates.sensitiveGroupPreferences = hp.sensitiveGroupPreferences;
      }
      if (hp.lifestyle !== undefined) hpUpdates.lifestyle = hp.lifestyle;
      if (hp.commute !== undefined) hpUpdates.commute = hp.commute;
      if (hp.homeEnvironment !== undefined) hpUpdates.homeEnvironment = hp.homeEnvironment;
      if (hp.purifierAvailability !== undefined) hpUpdates.purifierAvailability = hp.purifierAvailability;
      if (hp.budgetPreferences !== undefined) hpUpdates.budgetPreferences = hp.budgetPreferences;

      updatedHousehold = await HouseholdProfile.findOneAndUpdate(
        { userId: user!.id },
        { $set: hpUpdates, $setOnInsert: { userId: user!.id } },
        { new: true, upsert: true }
      ).lean().exec();
    } else {
      updatedHousehold = await HouseholdProfile.findOne({ userId: user!.id }).lean().exec();
    }

    return apiSuccess(
      {
        user: {
          id: updatedUser._id.toString(),
          name: updatedUser.name,
          email: updatedUser.email,
          bio: updatedUser.bio,
          phone: updatedUser.phone,
          avatar: updatedUser.avatar,
          location: updatedUser.location,
          preferences: updatedUser.preferences,
          familyMembers: updatedUser.familyMembers,
          onboardingComplete: updatedUser.onboardingComplete,
        },
        householdProfile: updatedHousehold,
      },
      {
        message: "Profile and settings updated successfully",
      }
    );
  },
  { requireAuth: true }
);

/**
 * DELETE /api/profile
 * GDPR & Privacy-by-design compliant account deletion.
 * Wipes all user records, household details, daily plans, actions, and notifications.
 */
export const DELETE = withApiHandler(
  async (_req: NextRequest, _ctx, user) => {
    await connectToDatabase();
    const userId = user!.id;

    await Promise.all([
      User.findByIdAndDelete(userId),
      HouseholdProfile.deleteMany({ userId }),
      DailyPlan.deleteMany({ userId }),
      UserAction.deleteMany({ userId }),
      GamificationProfile.deleteMany({ userId }),
      ChatSession.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
    ]);

    return apiSuccess(
      { deleted: true },
      { message: "Account and associated health records have been permanently deleted." }
    );
  },
  { requireAuth: true }
);

/**
 * PATCH /api/profile
 * Alias for PUT /api/profile
 */
export const PATCH = PUT;
