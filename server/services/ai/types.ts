import "server-only";
import { z } from "zod";

/**
 * Pollutants Context
 */
export const PollutantsContextSchema = z.object({
  pm25: z.number().optional(), // µg/m³
  pm10: z.number().optional(), // µg/m³
  no2: z.number().optional(),  // µg/m³
  so2: z.number().optional(),  // µg/m³
  co: z.number().optional(),   // mg/m³
  o3: z.number().optional(),   // µg/m³
});
export type PollutantsContext = z.infer<typeof PollutantsContextSchema>;

/**
 * Forecast context item
 */
export const ForecastContextItemSchema = z.object({
  time: z.string(),
  aqi: z.number(),
  pm25: z.number().optional(),
  category: z.string().optional(),
});
export type ForecastContextItem = z.infer<typeof ForecastContextItemSchema>;

/**
 * Household context
 */
export const HouseholdContextSchema = z.object({
  householdSize: z
    .object({
      adults: z.number().default(2),
      children: z.number().default(0),
      elderly: z.number().default(0),
      total: z.number().default(2),
    })
    .optional(),
  sensitivePreferences: z
    .object({
      hasRespiratorySensitivity: z.boolean().default(false),
      hasCardiovascularSensitivity: z.boolean().default(false),
      isPregnant: z.boolean().default(false),
      hasInfant: z.boolean().default(false),
      notes: z.string().optional(),
    })
    .optional(),
});
export type HouseholdContext = z.infer<typeof HouseholdContextSchema>;

/**
 * Commute context
 */
export const CommuteContextSchema = z.object({
  commuteType: z.string().default("metro"),
  durationMinutes: z.number().default(30),
  travelWindow: z.string().default("morning_rush"),
});
export type CommuteContext = z.infer<typeof CommuteContextSchema>;

/**
 * Lifestyle context
 */
export const LifestyleContextSchema = z.object({
  workSchedule: z.string().default("fixed_office"),
  exerciseHabits: z.string().default("none"),
  outdoorActivityFrequency: z.string().default("occasional"),
});
export type LifestyleContext = z.infer<typeof LifestyleContextSchema>;

/**
 * Home environment context
 */
export const HomeEnvironmentContextSchema = z.object({
  homeType: z.string().default("apartment"),
  floorLevel: z.number().default(3),
  ventilationType: z.string().default("natural"),
  cookingFuel: z.string().default("lpg"),
  hasBalconyOrGarden: z.boolean().default(false),
  purifierAvailability: z
    .object({
      hasPurifier: z.boolean().default(false),
      purifierCount: z.number().default(0),
      roomsWithPurifiers: z.array(z.string()).default([]),
      purifierType: z.string().default("none"),
    })
    .optional(),
});
export type HomeEnvironmentContext = z.infer<typeof HomeEnvironmentContextSchema>;

/**
 * Budget context
 */
export const BudgetContextSchema = z.object({
  budgetRange: z.enum(["minimal", "moderate", "comprehensive"]).default("minimal"),
  improvementPriorities: z.array(z.string()).default([]),
});
export type BudgetContext = z.infer<typeof BudgetContextSchema>;

/**
 * Full AI Context Input
 */
export const AiContextInputSchema = z.object({
  currentAqi: z.number().default(185),
  category: z.string().default("Poor"),
  pollutants: PollutantsContextSchema.default({}),
  forecast: z.array(ForecastContextItemSchema).optional(),
  dataSource: z.string().default("CPCB Ground Stations + Open-Meteo High Resolution Model"),
  dataTimestamp: z.string().default(() => new Date().toISOString()),
  userLocation: z
    .object({
      city: z.string().default("New Delhi"),
      area: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    })
    .default({ city: "New Delhi" }),
  householdProfile: HouseholdContextSchema.optional(),
  commute: CommuteContextSchema.optional(),
  lifestyle: LifestyleContextSchema.optional(),
  homeEnvironment: HomeEnvironmentContextSchema.optional(),
  budget: BudgetContextSchema.optional(),
  completedActions: z.array(z.string()).optional(),
});
export type AiContextInput = z.infer<typeof AiContextInputSchema>;

// ==========================================
// Structured JSON Output Schemas for Gemini
// ==========================================

/**
 * 1. Personalized Daily Plan Output
 */
export const DailyPlanOutputSchema = z.object({
  summary: z.string(),
  riskLevel: z.enum(["low", "moderate", "high", "severe", "critical"]),
  keyAdvisories: z.array(z.string()),
  timeWindows: z.array(
    z.object({
      time: z.string(),
      activity: z.string(),
      safetyLevel: z.enum(["recommended", "caution", "avoid"]),
      rationale: z.string(),
    })
  ),
  dailyMissions: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      xp: z.number(),
      category: z.enum(["indoor", "outdoor", "habit", "protection"]),
    })
  ),
  disclaimer: z.string(),
});
export type DailyPlanOutput = z.infer<typeof DailyPlanOutputSchema>;

/**
 * 2. Indoor Air Quality Advice Output
 */
export const IndoorAdviceOutputSchema = z.object({
  airQualityAssessment: z.string(),
  purifierAction: z.object({
    recommended: z.boolean(),
    mode: z.string().optional(),
    targetRooms: z.array(z.string()).optional(),
    notes: z.string(),
  }),
  ventilationWindow: z.object({
    recommended: z.boolean(),
    bestTimeWindow: z.string().optional(),
    notes: z.string(),
  }),
  budgetFriendlyInterventions: z.array(
    z.object({
      title: z.string(),
      impact: z.enum(["high", "medium", "low"]),
      cost: z.enum(["free", "low", "medium"]),
      description: z.string(),
    })
  ),
  cookingAndCombustionSafety: z.array(z.string()),
  cleaningAdvice: z.array(z.string()),
  disclaimer: z.string(),
});
export type IndoorAdviceOutput = z.infer<typeof IndoorAdviceOutputSchema>;

/**
 * 3. Personalized Commute Advice Output
 */
export const CommuteAdviceOutputSchema = z.object({
  riskAssessment: z.string(),
  recommendedMode: z.string(),
  maskGuidance: z.object({
    required: z.boolean(),
    maskType: z.string(),
    instructions: z.string(),
  }),
  optimalDepartureTime: z.string(),
  exposureMitigationTips: z.array(z.string()),
  alternativeRouteNotes: z.string().optional(),
  disclaimer: z.string(),
});
export type CommuteAdviceOutput = z.infer<typeof CommuteAdviceOutputSchema>;

/**
 * 4. Conversational AI Assistant (Chat) Output
 */
export const ChatReplyOutputSchema = z.object({
  reply: z.string(),
  quickSuggestions: z.array(z.string()).default([]),
  safetyWarnings: z.array(z.string()).default([]),
  actionableTips: z.array(z.string()).default([]),
  disclaimer: z.string().optional(),
  dataSource: z.string().optional(),
  dataTimestamp: z.string().optional(),
});
export type ChatReplyOutput = z.infer<typeof ChatReplyOutputSchema>;

/**
 * 5. AQI Explanation Output
 */
export const AqiExplanationOutputSchema = z.object({
  headline: z.string(),
  healthImpact: z.string(),
  dominantPollutantExplanation: z.string(),
  whatThisMeansForChildren: z.string(),
  whatThisMeansForElderly: z.string(),
  simpleAnalogy: z.string(),
  actionSummary: z.array(z.string()),
  disclaimer: z.string(),
});
export type AqiExplanationOutput = z.infer<typeof AqiExplanationOutputSchema>;

/**
 * 6. Daily Summary Output
 */
export const DailySummaryOutputSchema = z.object({
  greeting: z.string(),
  headline: z.string(),
  aqiTrend: z.enum(["improving", "stable", "deteriorating"]),
  topAction: z.string(),
  morningGuidance: z.string(),
  afternoonGuidance: z.string(),
  eveningGuidance: z.string(),
  missionsXP: z.number().default(60),
  disclaimer: z.string(),
});
export type DailySummaryOutput = z.infer<typeof DailySummaryOutputSchema>;
