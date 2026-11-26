import "server-only";
import mongoose, { Types } from "mongoose";
import { connectToDatabase } from "../db/index.ts";
import {
  DailyPlan,
  HouseholdProfile,
  AQIReading,
  GamificationProfile,
  UserAction,
  User,
  type IDailyPlanDocument,
  type IPlanMission,
} from "../../models/index.ts";
import { geminiService } from "./ai/gemini.ts";
import { safetyEngine } from "./safety/index.ts";
import type { AiContextInput } from "./ai/types.ts";

export interface GeneratePlanOptions {
  userId?: string;
  date?: string; // YYYY-MM-DD
  forceRegenerate?: boolean;
  currentAqi?: number;
  city?: string;
}

export interface UpdateMissionPayload {
  action: "complete" | "skip" | "reschedule";
  rescheduledTime?: string;
}

// In-memory fallback repository when MongoDB is unreachable (e.g., in sandboxed test or offline mode)
const inMemoryPlans = new Map<string, any>();
const inMemoryGamification = new Map<string, { totalXp: number; level: number }>();
let dbUnavailableUntil = 0;

async function safeDbConnect(): Promise<boolean> {
  if (mongoose.connection.readyState === 1) return true;
  if (Date.now() < dbUnavailableUntil) return false;
  try {
    await connectToDatabase();
    return true;
  } catch (err) {
    dbUnavailableUntil = Date.now() + 30000; // back off for 30 seconds
    return false;
  }
}

export class PlanService {
  /**
   * Generates or regenerates a personalized daily air quality plan.
   * Leverages Gemini AI contextualized with user schedule, commute, household vulnerabilities,
   * home environment, budget, and deterministic safety rules.
   */
  async generatePlan(options: GeneratePlanOptions = {}): Promise<IDailyPlanDocument> {
    const isDbConnected = await safeDbConnect();
    const todayStr = options.date || new Date().toISOString().split("T")[0];
    const targetUserId = options.userId || "guest_user";
    const cacheKey = `${targetUserId}_${todayStr}`;

    // Check if an unexpired plan already exists unless forceRegenerate is requested
    if (options.userId && !options.forceRegenerate) {
      if (isDbConnected) {
        try {
          const existing = await DailyPlan.findOne({
            userId: options.userId,
            date: todayStr,
          }).exec();

          if (existing) {
            return existing;
          }
        } catch {
          // Fall through to memory check
        }
      }

      if (inMemoryPlans.has(cacheKey)) {
        return inMemoryPlans.get(cacheKey);
      }
    }

    // 1. Fetch user context, household profile, and latest sensor readings
    let hp: any = null;
    let latestReading: any = null;
    let userDoc: any = null;

    if (isDbConnected && options.userId) {
      try {
        [hp, latestReading, userDoc] = await Promise.all([
          HouseholdProfile.findOne({ userId: options.userId }).lean().exec(),
          AQIReading.findOne().sort({ recordedAt: -1 }).lean().exec(),
          User.findById(options.userId).lean().exec(),
        ]);
      } catch {
        // Fallback to default context
      }
    } else if (isDbConnected) {
      try {
        latestReading = await AQIReading.findOne().sort({ recordedAt: -1 }).lean().exec();
      } catch {
        // Fallback
      }
    }

    const city = options.city || userDoc?.homeLocation?.city || latestReading?.location?.city || "New Delhi";
    const currentAqi = options.currentAqi || latestReading?.aqi?.indianAqi || 185;
    const category = latestReading?.aqi?.indianCategory || (currentAqi > 200 ? "Very Poor" : currentAqi > 100 ? "Poor" : "Moderate");

    // 2. Build full AI context
    const aiContext: AiContextInput = {
      currentAqi,
      category,
      pollutants: {
        pm25: latestReading?.pollutantMeasurements?.pm25 ?? Math.round(currentAqi * 0.6),
        pm10: latestReading?.pollutantMeasurements?.pm10 ?? Math.round(currentAqi * 1.1),
        no2: latestReading?.pollutantMeasurements?.no2 ?? 45,
      },
      dataSource: latestReading
        ? `${latestReading.source} (${latestReading.sourceType})`
        : "CPCB Ground Stations + Open-Meteo High Resolution Model",
      dataTimestamp: latestReading ? new Date(latestReading.recordedAt).toISOString() : new Date().toISOString(),
      userLocation: {
        city,
        area: userDoc?.homeLocation?.area || latestReading?.location?.area || "Central District",
      },
      householdProfile: hp
        ? {
            householdSize: hp.householdSize,
            sensitivePreferences: hp.sensitiveGroupPreferences,
          }
        : {
            householdSize: { adults: 2, children: 1, elderly: 0, total: 3 },
            sensitivePreferences: {
              hasRespiratorySensitivity: false,
              hasCardiovascularSensitivity: false,
              isPregnant: false,
              hasInfant: false,
            },
          },
      commute: hp?.commute || {
        commuteType: "metro",
        durationMinutes: 30,
        travelWindow: "morning_rush",
      },
      lifestyle: hp?.lifestyle || {
        workSchedule: "fixed_office",
        exerciseHabits: "none",
        outdoorActivityFrequency: "occasional",
      },
      homeEnvironment: hp?.homeEnvironment
        ? {
            ...hp.homeEnvironment,
            purifierAvailability: hp.purifierAvailability,
          }
        : {
            homeType: "apartment",
            floorLevel: 3,
            ventilationType: "natural",
            cookingFuel: "lpg",
            hasBalconyOrGarden: false,
            purifierAvailability: {
              hasPurifier: false,
              purifierCount: 0,
              roomsWithPurifiers: [],
              purifierType: "none",
            },
          },
      budget: hp?.budgetPreferences || {
        budgetRange: "minimal",
        improvementPriorities: ["sealing", "mopping"],
      },
    };

    // 3. Pre-evaluate deterministic safety rules
    const safety = safetyEngine.evaluateSafety({
      aqi: currentAqi,
      pollutants: aiContext.pollutants,
      householdProfile: {
        hasChildren: (aiContext.householdProfile?.householdSize?.children ?? 0) > 0,
        hasElderly: (aiContext.householdProfile?.householdSize?.elderly ?? 0) > 0,
        hasRespiratorySensitivity: aiContext.householdProfile?.sensitivePreferences?.hasRespiratorySensitivity,
        hasCardiovascularSensitivity: aiContext.householdProfile?.sensitivePreferences?.hasCardiovascularSensitivity,
      },
    });

    const startTime = Date.now();
    // 4. Generate AI daily plan with fallback
    const aiPlan = await geminiService.generateDailyPlan(aiContext);
    const latencyMs = Date.now() - startTime;

    // 5. Structure missions for timeline display
    const formattedMissions: IPlanMission[] = aiPlan.dailyMissions.map((m, idx) => ({
      missionId: m.id || `m_${idx + 1}`,
      time: m.time || (idx === 0 ? "07:00 AM" : idx === 1 ? "08:00 AM" : idx === 2 ? "12:00 PM" : idx === 3 ? "04:00 PM" : "08:00 PM"),
      title: m.title,
      description: m.description,
      whyItMatters: m.whyItMatters || "Reduces cumulative fine particulate exposure during diurnal peaks.",
      priority: m.priority || (idx < 2 ? "high" : "medium"),
      estimatedDuration: m.estimatedDuration || "15 mins",
      category: m.category || (idx === 1 ? "transit" : idx === 2 ? "indoor" : "protection"),
      xpReward: m.xp || 20,
      completed: false,
      skipped: false,
    }));

    const planPayload = {
      userId: targetUserId,
      date: todayStr,
      aqiContext: {
        expectedAqi: currentAqi,
        category: safety.category,
        safestWindow: aiPlan.safestWindow || {
          start: "01:00 PM",
          end: "03:30 PM",
          reason: "Diurnal thermal expansion disperses ground-level smog.",
        },
        peakSmogWindow: aiPlan.peakSmogWindow || {
          start: "07:00 AM",
          end: "09:30 AM",
          reason: "Morning cold ground temperature inversion traps vehicular emissions.",
        },
        dominantRisk: "pm25",
      },
      missions: formattedMissions,
      recommendations: {
        general: safety.recommendations.general.slice(0, 3),
        outdoorActivity: safety.recommendations.outdoorActivity.slice(0, 3),
        indoorEnvironment: safety.recommendations.indoorEnvironment.slice(0, 3),
        commute: safety.recommendations.commute.slice(0, 2),
        exercise: safety.recommendations.exercise.slice(0, 2),
      },
      planVersion: 1,
      aiModelMetadata: {
        modelName: "gemini-1.5-flash",
        generatedAt: new Date(),
        latencyMs,
        deterministicSafetyApplied: true,
      },
    };

    // 6. Persist to MongoDB or Fallback
    if (isDbConnected) {
      try {
        const planDoc = await DailyPlan.findOneAndUpdate(
          { userId: targetUserId, date: todayStr },
          {
            ...planPayload,
            $inc: { planVersion: 1 },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        ).exec();

        if (planDoc) {
          inMemoryPlans.set(cacheKey, planDoc);
          inMemoryPlans.set(planDoc._id.toString(), planDoc);
          return planDoc;
        }
      } catch (err) {
        console.warn("[PlanService.generatePlan] MongoDB persistence failed, falling back to memory:", err);
      }
    }

    // Fallback in-memory document with Mongoose-like interface
    const generatedId = new Types.ObjectId().toString();
    const mockPlanDoc: any = {
      _id: generatedId,
      id: generatedId,
      ...planPayload,
      save: async function () {
        inMemoryPlans.set(cacheKey, this);
        inMemoryPlans.set(this._id.toString(), this);
        return this;
      },
    };

    inMemoryPlans.set(cacheKey, mockPlanDoc);
    inMemoryPlans.set(generatedId, mockPlanDoc);
    return mockPlanDoc as IDailyPlanDocument;
  }

  /**
   * Retrieves today's plan for a user, automatically generating one if it doesn't exist yet.
   */
  async getTodayPlan(userId?: string): Promise<IDailyPlanDocument> {
    const isDbConnected = await safeDbConnect();
    const todayStr = new Date().toISOString().split("T")[0];
    const targetUserId = userId || "guest_user";
    const cacheKey = `${targetUserId}_${todayStr}`;

    if (inMemoryPlans.has(cacheKey)) {
      return inMemoryPlans.get(cacheKey);
    }

    if (isDbConnected && userId) {
      try {
        const plan = await DailyPlan.findOne({ userId, date: todayStr }).exec();
        if (plan) {
          inMemoryPlans.set(cacheKey, plan);
          inMemoryPlans.set(plan._id.toString(), plan);
          return plan;
        }
      } catch {
        // Fallback to generation
      }
    }

    return this.generatePlan({ userId, date: todayStr });
  }

  /**
   * Retrieves a plan by a specific calendar date (YYYY-MM-DD).
   */
  async getPlanByDate(userId: string | undefined, dateStr: string): Promise<IDailyPlanDocument | null> {
    const isDbConnected = await safeDbConnect();
    const targetUserId = userId || "guest_user";
    const cacheKey = `${targetUserId}_${dateStr}`;

    if (inMemoryPlans.has(cacheKey)) {
      return inMemoryPlans.get(cacheKey);
    }

    if (isDbConnected) {
      try {
        const query: Record<string, unknown> = { date: dateStr };
        if (userId) query.userId = userId;

        const plan = await DailyPlan.findOne(query).exec();
        if (plan) {
          inMemoryPlans.set(cacheKey, plan);
          inMemoryPlans.set(plan._id.toString(), plan);
          return plan;
        }
      } catch {
        // Continue
      }
    }

    const todayStr = new Date().toISOString().split("T")[0];
    if (dateStr === todayStr) {
      return this.generatePlan({ userId, date: dateStr });
    }

    return null;
  }

  /**
   * Updates a mission status (complete, skip, reschedule).
   * Ensures mission completion CANNOT award XP multiple times!
   */
  async updateMission(
    planId: string,
    missionId: string,
    userId: string | undefined,
    payload: UpdateMissionPayload
  ) {
    const isDbConnected = await safeDbConnect();
    let plan: any = null;

    if (inMemoryPlans.has(planId)) {
      plan = inMemoryPlans.get(planId);
    } else if (isDbConnected) {
      try {
        plan = await DailyPlan.findById(planId).exec();
      } catch {
        // fallback
      }
    }

    // Try finding by date if ID lookup didn't match in memory
    if (!plan) {
      for (const val of inMemoryPlans.values()) {
        if (val._id?.toString() === planId || val.id === planId) {
          plan = val;
          break;
        }
      }
    }

    if (!plan) {
      throw new Error("Daily plan not found");
    }

    const mission = plan.missions.find((m: any) => m.missionId === missionId);
    if (!mission) {
      throw new Error(`Mission with id "${missionId}" not found in this plan`);
    }

    // 1. ACTION: COMPLETE
    if (payload.action === "complete") {
      // Critical Guard: Ensure completion cannot award XP multiple times!
      if (mission.completed) {
        return {
          plan,
          mission,
          alreadyCompleted: true,
          xpEarned: 0,
          message: "Mission was already completed previously. No duplicate XP awarded.",
        };
      }

      mission.completed = true;
      mission.completedAt = new Date();
      mission.skipped = false;

      let totalXp = 0;
      let level = 1;

      // In-memory gamification tracking
      const targetUser = userId || "guest_user";
      const userGamification = inMemoryGamification.get(targetUser) || { totalXp: 0, level: 1 };
      userGamification.totalXp += mission.xpReward;
      userGamification.level = Math.floor(userGamification.totalXp / 100) + 1;
      inMemoryGamification.set(targetUser, userGamification);

      totalXp = userGamification.totalXp;
      level = userGamification.level;

      // Award XP to GamificationProfile in DB if connected
      if (isDbConnected && userId) {
        try {
          const profile = await GamificationProfile.findOneAndUpdate(
            { userId },
            {
              $inc: {
                totalXp: mission.xpReward,
                completedMissionsCount: 1,
                weeklyXp: mission.xpReward,
              },
            },
            { new: true, upsert: true }
          ).exec();

          if (profile) {
            totalXp = profile.totalXp;
            level = Math.floor(totalXp / 100) + 1;
            if (profile.level !== level) {
              profile.level = level;
              await profile.save();
            }
          }

          // Record immutable UserAction
          await UserAction.create({
            userId,
            actionType:
              mission.category === "transit"
                ? "route_adjusted"
                : mission.category === "indoor"
                ? "window_sealed"
                : "mask_worn",
            completedAt: new Date(),
            xpEarned: mission.xpReward,
            associatedMissionId: mission.missionId,
            metadata: {
              planId: plan._id.toString(),
              missionTitle: mission.title,
            },
          });
        } catch (err) {
          console.warn("[PlanService.updateMission] Gamification persistence warning:", err);
        }
      }

      if (typeof plan.save === "function") {
        await plan.save();
      }

      return {
        plan,
        mission,
        alreadyCompleted: false,
        xpEarned: mission.xpReward,
        totalXp,
        level,
        message: `Mission completed! +${mission.xpReward} XP awarded.`,
      };
    }

    // 2. ACTION: SKIP
    if (payload.action === "skip") {
      mission.skipped = true;
      if (typeof plan.save === "function") {
        await plan.save();
      }

      return {
        plan,
        mission,
        alreadyCompleted: false,
        xpEarned: 0,
        message: "Mission skipped for today.",
      };
    }

    // 3. ACTION: RESCHEDULE
    if (payload.action === "reschedule") {
      if (!payload.rescheduledTime) {
        throw new Error("rescheduledTime is required to reschedule a mission");
      }

      mission.rescheduledTime = payload.rescheduledTime;
      mission.time = payload.rescheduledTime;
      mission.skipped = false;
      if (typeof plan.save === "function") {
        await plan.save();
      }

      return {
        plan,
        mission,
        alreadyCompleted: false,
        xpEarned: 0,
        message: `Mission rescheduled to ${payload.rescheduledTime}.`,
      };
    }

    throw new Error(`Unsupported action "${payload.action}"`);
  }

  /**
   * Adds a custom user activity / mission to today's plan.
   */
  async addActivity(data: {
    title: string;
    scheduledTime: string;
    durationMinutes: number;
    activityType: string;
    airRiskLevel: string;
    recommendedMask: boolean;
    notes: string;
  }) {
    const todayPlan = await this.getTodayPlan();
    const newMission: IPlanMission = {
      missionId: `m_custom_${Date.now()}`,
      time: data.scheduledTime,
      title: data.title,
      description: data.notes || `Scheduled ${data.activityType.replace(/_/g, " ")} (${data.durationMinutes} mins)`,
      whyItMatters: `Air risk level: ${data.airRiskLevel}. ${data.recommendedMask ? "Mask recommended." : "Stay vigilant."}`,
      priority: data.airRiskLevel === "severe" || data.airRiskLevel === "high" ? "high" : "medium",
      estimatedDuration: `${data.durationMinutes} mins`,
      category: data.activityType === "commute" ? "transit" : "protection",
      xpReward: 15,
      completed: false,
      skipped: false,
    };

    todayPlan.missions.push(newMission);
    if (typeof todayPlan.save === "function") {
      await todayPlan.save();
    }

    return {
      ...newMission,
      scheduledTime: data.scheduledTime,
    };
  }
}

export const planService = new PlanService();
