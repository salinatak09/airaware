import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { userService } from "@/server/services/user.service";
import { connectToDatabase } from "@/server/db";
import { HouseholdProfile, GamificationProfile } from "@/models";

export const dynamic = "force-dynamic";

const onboardingPayloadSchema = z.object({
  location: z.object({
    city: z.string().min(1),
    country: z.string().default("India"),
    latitude: z.number().default(28.6139),
    longitude: z.number().default(77.209),
  }),
  household: z.object({
    adults: z.number().min(1).default(1),
    children: z.number().min(0).default(0),
    elderly: z.number().min(0).default(0),
    hasAsthma: z.boolean().default(false),
    hasAllergies: z.boolean().default(false),
    isPregnant: z.boolean().default(false),
  }),
  lifestyle: z.object({
    commuteType: z.string().default("metro"),
    outdoorHoursDaily: z.number().default(1),
    exerciseOutdoors: z.boolean().default(false),
  }),
  homeEnvironment: z.object({
    homeType: z.string().default("apartment"),
    hasAirPurifier: z.boolean().default(true),
    ventilationType: z.string().default("natural"),
    cookingFuel: z.string().default("lpg"),
  }),
  preferences: z.object({
    notificationsEnabled: z.boolean().default(true),
    aqiThresholdAlert: z.number().default(150),
    temperatureUnit: z.enum(["celsius", "fahrenheit"]).default("celsius"),
  }),
});

/**
 * GET /api/onboarding
 * Check onboarding completion status for authenticated user
 */
export const GET = withApiHandler(
  async (_req: NextRequest, _ctx, user) => {
    const profile = await userService.getUserById(user!.id);
    const isComplete = Boolean(profile.homeLocation && profile.familyMembers);

    return apiSuccess({
      completed: isComplete,
      user: profile,
    });
  },
  { requireAuth: true }
);

/**
 * POST /api/onboarding
 * Save questionnaire results and initialize user profile
 */
export const POST = withApiHandler(
  async (req: NextRequest, _ctx, user) => {
    const data = await validateBody(req, onboardingPayloadSchema);

    // Map household members
    const familyMembers = [];
    const childrenCount = data.household.children ?? 0;
    const elderlyCount = data.household.elderly ?? 0;

    if (childrenCount > 0) {
      for (let i = 0; i < childrenCount; i++) {
        familyMembers.push({
          name: `Child ${i + 1}`,
          ageGroup: "child" as const,
          healthConditions: data.household.hasAsthma ? ["asthma"] : ["none"],
          vulnerabilityLevel: "high" as const,
        });
      }
    }

    if (elderlyCount > 0) {
      for (let i = 0; i < elderlyCount; i++) {
        familyMembers.push({
          name: `Senior Member ${i + 1}`,
          ageGroup: "senior" as const,
          healthConditions: ["cardiovascular"],
          vulnerabilityLevel: "critical" as const,
        });
      }
    }

    const updated = await userService.updateProfile(user!.id, {
      homeLocation: {
        city: data.location.city,
        country: data.location.country ?? "India",
        latitude: data.location.latitude ?? 28.6139,
        longitude: data.location.longitude ?? 77.209,
      },
      familyMembers,
      preferences: {
        notificationsEnabled: data.preferences.notificationsEnabled ?? true,
        aqiThresholdAlert: data.preferences.aqiThresholdAlert ?? 150,
        temperatureUnit: data.preferences.temperatureUnit ?? "celsius",
      },
      gamification: {
        points: 100, // Reward 100 XP for completing onboarding!
        level: 1,
        streakDays: 1,
        lastActiveDate: new Date(),
      },
    });

    // Sync to Mongoose HouseholdProfile and GamificationProfile documents
    try {
      await connectToDatabase();
      await HouseholdProfile.findOneAndUpdate(
        { userId: user!.id },
        {
          userId: user!.id,
          householdSize: {
            adults: data.household.adults ?? 1,
            children: data.household.children ?? 0,
            elderly: data.household.elderly ?? 0,
            total: (data.household.adults ?? 1) + (data.household.children ?? 0) + (data.household.elderly ?? 0),
          },
          sensitiveGroupPreferences: {
            hasRespiratorySensitivity: Boolean(data.household.hasAsthma || data.household.hasAllergies),
            hasCardiovascularSensitivity: Boolean(elderlyCount > 0),
            isPregnant: Boolean(data.household.isPregnant),
            hasInfant: false,
          },
          lifestyle: {
            workSchedule: "hybrid",
            exerciseHabits: data.lifestyle.exerciseOutdoors ? "outdoor_morning" : "indoor_gym",
            outdoorActivityFrequency: data.lifestyle.outdoorHoursDaily > 2 ? "daily" : "occasional",
          },
          commute: {
            commuteType: (data.lifestyle.commuteType as "car" | "metro" | "bus" | "two_wheeler" | "walking" | "bicycle" | "mixed") || "metro",
            durationMinutes: 30,
            travelWindow: "morning_rush",
          },
          homeEnvironment: {
            homeType: (data.homeEnvironment.homeType as "apartment" | "independent_house" | "villa" | "other") || "apartment",
            floorLevel: 2,
            ventilationType: (data.homeEnvironment.ventilationType as "natural" | "central_ac" | "split_ac" | "mixed") || "natural",
            cookingFuel: (data.homeEnvironment.cookingFuel as "lpg" | "induction_electric" | "piped_gas" | "biomass") || "lpg",
            hasBalconyOrGarden: false,
          },
          purifierAvailability: {
            hasPurifier: Boolean(data.homeEnvironment.hasAirPurifier),
            purifierCount: data.homeEnvironment.hasAirPurifier ? 1 : 0,
            roomsWithPurifiers: data.homeEnvironment.hasAirPurifier ? ["living_room"] : [],
            purifierType: data.homeEnvironment.hasAirPurifier ? "hepa" : "none",
          },
          budgetPreferences: {
            budgetRange: "moderate",
            improvementPriorities: ["air_purifier", "plants"],
          },
        },
        { upsert: true, new: true }
      );

      await GamificationProfile.findOneAndUpdate(
        { userId: user!.id },
        {
          $setOnInsert: {
            userId: user!.id,
            totalXp: 100,
            level: 1,
            streak: {
              currentStreak: 1,
              longestStreak: 1,
              lastActiveDate: new Date(),
              streakFreezesAvailable: 1,
            },
            badges: [
              {
                badgeId: "clean-air-pioneer",
                name: "Clean Air Pioneer",
                category: "milestone",
                icon: "award",
                tier: "bronze",
                earnedAt: new Date(),
                description: "Completed full household onboarding.",
              },
            ],
            completedMissionsCount: 1,
            weeklyXp: 100,
          },
        },
        { upsert: true }
      );
    } catch (err) {
      console.warn("MongoDB onboarding models update skipped:", err);
    }

    return apiSuccess(
      {
        profile: updated,
        onboardingComplete: true,
        xpAwarded: 100,
      },
      {
        message: "Onboarding profile saved successfully! +100 XP awarded.",
      }
    );
  },
  { requireAuth: true }
);
