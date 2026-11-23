import { z } from "zod";

/**
 * Coordinate and GeoLocation validation schemas
 */
export const coordinatesSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90, "Latitude must be between -90 and 90"),
  longitude: z.coerce.number().min(-180).max(180, "Longitude must be between -180 and 180"),
});

export const locationQuerySchema = coordinatesSchema.extend({
  city: z.string().optional(),
  country: z.string().optional(),
});

/**
 * Air Quality API query schemas
 */
export const airQualityQuerySchema = coordinatesSchema.extend({
  hourly: z.enum(["true", "false"]).optional().default("true"),
  forecast_days: z.coerce.number().int().min(1).max(7).optional().default(3),
});

/**
 * Family Member validation schema
 */
export const healthConditionEnum = z.enum([
  "asthma",
  "respiratory_allergy",
  "cardiovascular",
  "copd",
  "pregnancy",
  "none",
]);

export const ageGroupEnum = z.enum(["infant", "child", "teen", "adult", "senior"]);

export const familyMemberSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50),
  ageGroup: ageGroupEnum,
  healthConditions: z.array(healthConditionEnum).default(["none"]),
  vulnerabilityLevel: z.enum(["low", "medium", "high", "critical"]).default("low"),
  notes: z.string().max(250).optional(),
});

/**
 * AI Assistant prompt validation schema
 */
export const aiChatRequestSchema = z.object({
  prompt: z.string().trim().min(2, "Prompt must be at least 2 characters").max(1000),
  location: locationQuerySchema.optional(),
  persona: z
    .enum(["pediatric_advisor", "daily_planner", "indoor_specialist"])
    .default("daily_planner"),
  context: z
    .object({
      currentAqi: z.number().optional(),
      familyMemberIds: z.array(z.string()).optional(),
    })
    .optional(),
});

/**
 * Clean Air Habit completion schema
 */
export const habitToggleSchema = z.object({
  habitId: z.string().min(1, "Habit ID is required"),
  completed: z.boolean(),
  notes: z.string().max(200).optional(),
});
