/**
 * AirAware - Core TypeScript Domain Models and Types
 */

// ==========================================
// 1. Air Quality Types
// ==========================================

export type AqiCategory =
  | "good"
  | "moderate"
  | "unhealthy-sensitive"
  | "unhealthy"
  | "very-unhealthy"
  | "hazardous";

export interface PollutantValues {
  pm25: number;      // µg/m³
  pm10: number;      // µg/m³
  no2?: number;      // µg/m³
  o3?: number;       // µg/m³
  so2?: number;      // µg/m³
  co?: number;       // µg/m³
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeoLocation extends Coordinates {
  city: string;
  country: string;
  region?: string;
  postalCode?: string;
}

export interface AirQualityCurrent {
  aqi: number;
  category: AqiCategory;
  categoryLabel: string;
  dominantPollutant: keyof PollutantValues;
  pollutants: PollutantValues;
  timestamp: string;
  location: GeoLocation;
  healthRecommendation: string;
}

export interface HourlyAirQualityForecast {
  time: string;
  aqi: number;
  category: AqiCategory;
  pm25: number;
  pm10: number;
}

export interface DailyAirQualityForecast {
  date: string;
  minAqi: number;
  maxAqi: number;
  avgAqi: number;
  dominantCategory: AqiCategory;
}

// ==========================================
// 2. User & Family Profile Types
// ==========================================

export type VulnerabilityLevel = "low" | "medium" | "high" | "critical";

export type HealthCondition =
  | "asthma"
  | "respiratory_allergy"
  | "cardiovascular"
  | "copd"
  | "pregnancy"
  | "none";

export type AgeGroup = "infant" | "child" | "teen" | "adult" | "senior";

export interface FamilyMember {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  healthConditions: HealthCondition[];
  vulnerabilityLevel: VulnerabilityLevel;
  notes?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  homeLocation: GeoLocation;
  familyMembers: FamilyMember[];
  preferences: {
    notificationsEnabled: boolean;
    aqiThresholdAlert: number;
    preferredLanguage: string;
    temperatureUnit: "celsius" | "fahrenheit";
  };
  gamification: {
    points: number;
    level: number;
    streakDays: number;
    badges: Badge[];
  };
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 3. Habits & Gamification Types
// ==========================================

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt?: string;
}

export type HabitCategory =
  | "morning_check"
  | "mask_usage"
  | "purifier_filter"
  | "indoor_ventilation"
  | "greenery"
  | "commute_planning";

export interface CleanAirHabit {
  id: string;
  title: string;
  category: HabitCategory;
  pointsReward: number;
  completedToday: boolean;
  frequency: "daily" | "weekly" | "monthly";
}

// ==========================================
// 4. AI Urban Assistant Types
// ==========================================

export type AssistantPersona = "pediatric_advisor" | "daily_planner" | "indoor_specialist";

export interface AiChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  metadata?: {
    recommendedOutdoorWindows?: Array<{
      startTime: string;
      endTime: string;
      aqiEstimate: number;
      safetyLevel: "safe" | "caution" | "avoid";
    }>;
    suggestedActions?: string[];
  };
}

// ==========================================
// 5. API Utilities & Response Standard
// ==========================================

export interface ApiResponseSuccess<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    durationMs?: number;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiResponseError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
  meta: {
    timestamp: string;
  };
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

// Re-export extended AQI types
export * from "./aqi";

