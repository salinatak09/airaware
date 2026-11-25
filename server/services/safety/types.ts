import "server-only";
import type { IndianNaqiCategory } from "../../../types/aqi.ts";

export type SafetySeverityLevel = "low" | "moderate" | "high" | "severe" | "critical";

export type WarningLevel = "info" | "advisory" | "warning" | "danger" | "emergency";

export type MaskType = "N95" | "FFP2" | "KF94" | "Cloth/Surgical" | "None";

export interface PollutantInputs {
  pm25?: number; // µg/m³
  pm10?: number; // µg/m³
  no2?: number;  // µg/m³
  so2?: number;  // µg/m³
  co?: number;   // mg/m³
  o3?: number;   // µg/m³
}

export interface HouseholdProfileInput {
  hasChildren?: boolean;
  hasElderly?: boolean;
  hasRespiratorySensitivity?: boolean;
  hasCardiovascularSensitivity?: boolean;
  isPregnant?: boolean;
  sensitiveMembersCount?: number;
}

export interface ActivityContextInput {
  plannedActivityType?: "outdoor_exercise" | "commute" | "school_run" | "indoor_rest" | "errands" | string;
  durationMinutes?: number;
  isOutdoor?: boolean;
  scheduledTimeOfDay?: string; // e.g. "07:30 AM"
}

export interface SafetyEvaluationInput {
  aqi?: number;
  pollutants?: PollutantInputs;
  recordedAt?: string | Date;
  householdProfile?: HouseholdProfileInput;
  activityContext?: ActivityContextInput;
}

export interface AffectedGroupsEvaluation {
  generalPopulation: boolean;
  children: boolean;
  elderly: boolean;
  respiratorySensitive: boolean;
  cardiovascularSensitive: boolean;
  pregnancy: boolean;
  summary: string;
}

export interface StructuredRecommendations {
  general: string[];
  outdoorActivity: string[];
  indoorEnvironment: string[];
  exercise: string[];
  schoolAndChildren: string[];
  commute: string[];
}

export interface StructuredRestrictions {
  maskRequired: boolean;
  maskTypeRecommended: MaskType;
  outdoorSportsRestricted: boolean;
  windowVentilationAllowed: boolean;
  curfewOrSchoolClosureAdvisory: boolean;
  prohibitedActivities: string[];
}

export interface StructuredWarning {
  code: string;
  level: WarningLevel;
  title: string;
  message: string;
  sourcePollutant?: string;
}

export interface DataFreshnessEvaluation {
  status: "fresh" | "acceptable" | "stale" | "missing";
  ageSeconds: number;
  recordedAt?: string;
  evaluatedAt: string;
  isStale: boolean;
  note: string;
}

export interface SafetyAdvisoryResult {
  category: IndianNaqiCategory;
  severity: SafetySeverityLevel;
  affectedGroups: AffectedGroupsEvaluation;
  recommendations: StructuredRecommendations;
  restrictions: StructuredRestrictions;
  warnings: StructuredWarning[];
  confidence: "high" | "medium" | "low";
  dataFreshness: DataFreshnessEvaluation;
  disclaimer: string;
}
