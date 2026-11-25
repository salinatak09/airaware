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
  UserAction,
  IFamilyMember,
} from "@/models";

export const dynamic = "force-dynamic";

const completeOnboardingSchema = z.object({
  location: z.object({
    city: z.string().min(1),
    area: z.string().optional(),
    state: z.string().optional(),
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
    hasInfant: z.boolean().default(false),
    notes: z.string().max(200).optional(),
  }),
  lifestyle: z.object({
    workSchedule: z
      .enum(["fixed_office", "hybrid", "work_from_home", "outdoor_work", "student", "retired"])
      .default("hybrid"),
    commuteType: z
      .enum(["car", "metro", "bus", "two_wheeler", "walking", "bicycle", "mixed"])
      .default("metro"),
    commuteDurationMinutes: z.number().min(0).max(240).default(30),
    travelWindow: z
      .enum(["early_morning", "morning_rush", "midday", "evening_rush", "night"])
      .default("morning_rush"),
    outdoorActivities: z
      .enum(["daily", "weekends_only", "occasional", "rare"])
      .default("occasional"),
    exerciseHabits: z
      .enum(["outdoor_morning", "outdoor_evening", "indoor_gym", "none", "intermittent"])
      .default("intermittent"),
  }),
  homeEnvironment: z.object({
    homeType: z
      .enum(["apartment", "independent_house", "villa", "other"])
      .default("apartment"),
    floorLevel: z.number().default(2),
    ventilationType: z
      .enum(["natural", "central_ac", "split_ac", "mixed"])
      .default("mixed"),
    cookingFuel: z
      .enum(["lpg", "induction_electric", "piped_gas", "biomass"])
      .default("piped_gas"),
    hasAirPurifier: z.boolean().default(false),
    purifierCount: z.number().min(0).default(0),
    roomsWithPurifiers: z.array(z.string()).default([]),
    purifierType: z
      .enum(["hepa", "carbon_hepa", "diy", "none"])
      .default("none"),
    hasBalconyOrGarden: z.boolean().default(false),
    budgetRange: z
      .enum(["minimal", "moderate", "comprehensive"])
      .default("moderate"),
  }),
  preferences: z.object({
    notificationsEnabled: z.boolean().default(true),
    aqiThresholdAlert: z.number().default(150),
    temperatureUnit: z.enum(["celsius", "fahrenheit"]).default("celsius"),
    aqiStandard: z.enum(["CPCB_NAQI", "US_EPA"]).default("CPCB_NAQI"),
  }),
});

/**
 * POST /api/onboarding/complete
 * Persists comprehensive onboarding setup across User, HouseholdProfile, and GamificationProfile.
 */
export const POST = withApiHandler(
  async (req: NextRequest, _ctx, authUser) => {
    const data = await validateBody(req, completeOnboardingSchema);

    await connectToDatabase();

    // 1. Resolve User Document
    let userId = authUser?.id;
    let userDoc = null;

    if (userId) {
      userDoc = await User.findById(userId).exec();
    }

    if (!userDoc) {
      // Find or create default demo user
      userDoc = await User.findOne({ email: "priya.sharma@example.com" }).exec();
      if (!userDoc) {
        userDoc = await User.create({
          name: "AirAware Member",
          email: `family_${Date.now()}@airaware.local`,
          avatar: "aero-avatar-default",
          authProvider: "credentials",
        });
      }
      userId = userDoc._id.toString();
    }

    // 2. Build Family Member Profiles based on household count
    const familyMembers: IFamilyMember[] = [];
    const childrenCount = data.household.children;
    const elderlyCount = data.household.elderly;

    if (childrenCount > 0) {
      for (let i = 0; i < childrenCount; i++) {
        familyMembers.push({
          name: i === 0 ? "Child" : `Child ${i + 1}`,
          ageGroup: "child",
          healthConditions: data.household.hasAsthma ? ["asthma"] : ["none"],
          vulnerabilityLevel: data.household.hasAsthma ? "high" : "medium",
        });
      }
    }

    if (elderlyCount > 0) {
      for (let i = 0; i < elderlyCount; i++) {
        familyMembers.push({
          name: i === 0 ? "Senior" : `Senior Member ${i + 1}`,
          ageGroup: "senior",
          healthConditions: ["cardiovascular"],
          vulnerabilityLevel: "critical",
        });
      }
    }

    // 3. Update User Document
    userDoc.location = {
      city: data.location.city,
      area: data.location.area || "City Center",
      state: data.location.state || "Delhi",
      country: data.location.country,
      coordinates: {
        type: "Point",
        coordinates: [data.location.longitude, data.location.latitude],
      },
      latitude: data.location.latitude,
      longitude: data.location.longitude,
      timezone: "Asia/Kolkata",
    };
    userDoc.homeLocation = {
      city: data.location.city,
      country: data.location.country,
      latitude: data.location.latitude,
      longitude: data.location.longitude,
    };
    userDoc.preferences = {
      notificationsEnabled: data.preferences.notificationsEnabled,
      aqiThresholdAlert: data.preferences.aqiThresholdAlert,
      aqiAlertThreshold: data.preferences.aqiThresholdAlert,
      temperatureUnit: data.preferences.temperatureUnit,
      aqiStandard: data.preferences.aqiStandard,
    };
    if (familyMembers.length > 0) {
      userDoc.familyMembers = familyMembers;
    }
    userDoc.onboardingComplete = true;
    await userDoc.save();

    // 4. Upsert HouseholdProfile Document
    const totalMembers = data.household.adults + data.household.children + data.household.elderly;
    const householdDoc = await HouseholdProfile.findOneAndUpdate(
      { userId: userDoc._id },
      {
        userId: userDoc._id,
        householdSize: {
          adults: data.household.adults,
          children: data.household.children,
          elderly: data.household.elderly,
          total: totalMembers,
        },
        sensitiveGroupPreferences: {
          hasRespiratorySensitivity: Boolean(data.household.hasAsthma || data.household.hasAllergies),
          hasCardiovascularSensitivity: Boolean(elderlyCount > 0),
          isPregnant: Boolean(data.household.isPregnant),
          hasInfant: Boolean(data.household.hasInfant),
          notes: data.household.notes || "",
        },
        lifestyle: {
          workSchedule: data.lifestyle.workSchedule,
          exerciseHabits: data.lifestyle.exerciseHabits,
          outdoorActivityFrequency: data.lifestyle.outdoorActivities,
        },
        commute: {
          commuteType: data.lifestyle.commuteType,
          durationMinutes: data.lifestyle.commuteDurationMinutes,
          travelWindow: data.lifestyle.travelWindow,
        },
        homeEnvironment: {
          homeType: data.homeEnvironment.homeType,
          floorLevel: data.homeEnvironment.floorLevel,
          ventilationType: data.homeEnvironment.ventilationType,
          cookingFuel: data.homeEnvironment.cookingFuel,
          hasBalconyOrGarden: data.homeEnvironment.hasBalconyOrGarden,
        },
        purifierAvailability: {
          hasPurifier: data.homeEnvironment.hasAirPurifier,
          purifierCount: data.homeEnvironment.purifierCount,
          roomsWithPurifiers: data.homeEnvironment.roomsWithPurifiers,
          purifierType: data.homeEnvironment.purifierType,
        },
        budgetPreferences: {
          budgetRange: data.homeEnvironment.budgetRange,
          improvementPriorities: ["air_purifier", "plants", "weather_stripping"],
        },
      },
      { upsert: true, new: true }
    ).lean().exec();

    // 5. Award Onboarding XP (+100 XP) and Badge in GamificationProfile
    const gamificationDoc = await GamificationProfile.findOneAndUpdate(
      { userId: userDoc._id },
      {
        $inc: { totalXp: 100, completedMissionsCount: 1, weeklyXp: 100 },
        $set: {
          "streak.currentStreak": 1,
          "streak.lastActiveDate": new Date(),
        },
        $addToSet: {
          badges: {
            badgeId: "clean-air-pioneer",
            name: "Clean Air Pioneer",
            category: "milestone",
            icon: "award",
            tier: "bronze",
            earnedAt: new Date(),
            description: "Completed full household onboarding and activated family air shield.",
          },
        },
      },
      { upsert: true, new: true }
    ).lean().exec();

    // 6. Record User Action for Audit & Timeline
    await UserAction.create({
      userId: userDoc._id,
      actionType: "air_check",
      completedAt: new Date(),
      xpEarned: 100,
      metadata: {
        eventType: "onboarding_completed",
        city: data.location.city,
      },
    });

    return apiSuccess(
      {
        onboardingComplete: true,
        xpAwarded: 100,
        user: {
          id: userDoc._id.toString(),
          name: userDoc.name,
          email: userDoc.email,
          location: userDoc.location,
          preferences: userDoc.preferences,
          familyMembers: userDoc.familyMembers,
          onboardingComplete: true,
        },
        householdProfile: householdDoc,
        gamification: gamificationDoc
          ? {
              totalXp: gamificationDoc.totalXp,
              level: gamificationDoc.level,
              streak: gamificationDoc.streak,
            }
          : null,
      },
      {
        message: "AirAware onboarding complete! Your personalized protection shield is active (+100 XP).",
      }
    );
  }
);
