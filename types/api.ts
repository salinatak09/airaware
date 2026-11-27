/**
 * AirAware - Client-Safe API Data Transfer Objects (DTOs) and Domain Types
 * Completely decoupled from server-only runtime modules.
 */

import type { IndianNaqiCategory, AqiCurrentResponse, AqiForecastResponse } from "./aqi";
import type {
  NotificationType,
  NotificationSeverity,
  NotificationPreferences,
} from "@/lib/notification-constants";
import type { CommunityReportType, ModerationStatus } from "@/lib/community-constants";

export type { NotificationPreferences, NotificationType, NotificationSeverity };
export type { CommunityReportType, ModerationStatus };

// ==========================================
// 1. Plan & Mission Types
// ==========================================

export interface PlanMission {
  missionId: string;
  time: string;
  title: string;
  description: string;
  whyItMatters: string;
  priority: "high" | "medium" | "low";
  estimatedDuration: string;
  category: "protection" | "indoor" | "habit" | "community" | "transit";
  xpReward: number;
  completed: boolean;
  completedAt?: string;
  skipped?: boolean;
  rescheduledTime?: string;
}

export interface DailyPlanResponse {
  _id: string;
  userId?: string;
  date: string;
  aqiContext: {
    expectedAqi: number;
    category: string;
    safestWindow?: {
      start: string;
      end: string;
      reason: string;
    };
    peakSmogWindow?: {
      start: string;
      end: string;
      reason: string;
    };
    dominantRisk?: string;
  };
  missions: PlanMission[];
  recommendations: {
    general?: string[];
    outdoorActivity?: string[];
    indoorEnvironment?: string[];
    commute?: string[];
    exercise?: string[];
  };
  planVersion: number;
  generatedBy?: "gemini" | "deterministic_fallback";
}

export interface UpdateMissionResponse {
  missionId: string;
  status: "complete" | "skip" | "reschedule";
  xpAwarded: number;
  newStreak?: number;
  totalXp?: number;
  level?: number;
  message: string;
}

// ==========================================
// 2. Indoor Air Types
// ==========================================

export interface IndoorRoomSensor {
  roomId: string;
  name: string;
  pm25: number;
  co2: number;
  humidity: number;
  temperature: number;
  purifierActive: boolean;
  purifierSpeed: "low" | "medium" | "high" | "turbo" | "off";
  filterLifeRemainingPercent: number;
  isSimulated: boolean;
}

export interface IndoorChecklistItem {
  id: string;
  title: string;
  description: string;
  category: "habits" | "cooking" | "cleaning" | "ventilation" | "sanctuary";
  impact: "high" | "medium";
  completed: boolean;
}

export interface HomeHealthMission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  duration: string;
  category: string;
  completed: boolean;
  completedAt?: string;
}

export interface IndoorAirOverview {
  hasHardwareSensor: boolean;
  statusType: "modeled_estimate" | "hardware_measured";
  measurementNotice: string;
  sanctuaryScore: number;
  sanctuaryRating: "Excellent" | "Good" | "Moderate" | "Vulnerable";
  outdoorAqi: number;
  outdoorCategory: string;
  estimatedIndoorPm25: {
    min: number;
    max: number;
    unit: string;
    explanation: string;
  };
  estimatedInfiltrationRatePercent: number;
  ventilationStatus: {
    state: "keep_closed" | "ventilate_recommended" | "caution";
    title: string;
    description: string;
    bestDiurnalWindow: string;
    reason: string;
  };
  cleanerRoomGuidance: {
    designatedRoom: string;
    steps: { title: string; instruction: string }[];
  };
  pollutionSources: {
    name: string;
    severity: "critical" | "high" | "medium";
    pm25Contribution: string;
    riskDetails: string;
    saferAlternative: string;
  }[];
  cookingSafety: {
    exhaustTiming: string;
    panLidTechnique: string;
    tadkaMitigation: string;
    fuelNotice: string;
  };
  cleaningAdvice: {
    wetMoppingVsSweeping: {
      recommendation: string;
      whySweepingIsHarmful: string;
      wetMoppingMethod: string;
    };
    dustingTips: string[];
    vacuumGuidance: string;
  };
  purifierGuidance: {
    cadrRecommendation: string;
    recommendedAirChangesPerHour: number;
    filterMaintenance: string[];
    ozoneWarning: string;
    diyOption: {
      name: string;
      description: string;
      materials: string[];
      estimatedCostInr: number;
    };
  };
  lowCostSolutions: {
    tier: "free" | "under_500" | "under_1500";
    title: string;
    costEstimate: string;
    impact: string;
    description: string;
  }[];
  plantMythBuster: {
    myth: string;
    scientificTruth: string;
    nasaStudyClarification: string;
    verdict: string;
  };
  checklist: IndoorChecklistItem[];
  homeMissions: HomeHealthMission[];
  simulatedSensors?: IndoorRoomSensor[];
}

// ==========================================
// 3. Impact & Gamification Types
// ==========================================

export interface LevelThreshold {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  icon: string;
  perk: string;
}

export interface HonestImpactMetrics {
  totalActionsCompleted: number;
  daysWithPrecautions: number;
  cleanTransitCommutesLogged: number;
  sanctuaryHabitsMaintained: number;
  n95PreparednessRatePercent: number;
  transparencyNotice: string;
}

export interface WeeklyActivityDay {
  day: string;
  date: string;
  xpEarned: number;
  actionsCount: number;
  adherenceLevel: "high" | "medium" | "low" | "none";
}

export interface HouseholdChallenge {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  xpReward: number;
  daysRemaining: number;
  category: "indoor" | "commute" | "family";
  joined: boolean;
  completed: boolean;
}

export interface MilestoneItem {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
  xpAwarded: number;
}

export interface GamificationDashboardData {
  user: {
    name: string;
    avatar: string;
  };
  totalXp: number;
  level: {
    current: number;
    title: string;
    icon: string;
    perk: string;
    minXp: number;
    maxXp: number;
    progressXp: number;
    neededXp: number;
    progressPercent: number;
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
    streakFreezesAvailable: number;
    lastActiveDate: string;
    isActiveToday: boolean;
  };
  honestImpact: HonestImpactMetrics;
  weeklyActivity: WeeklyActivityDay[];
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    tier: "bronze" | "silver" | "gold" | "platinum";
    earned: boolean;
    earnedDate?: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    progress: number;
    target: string;
    unlocked: boolean;
  }>;
  householdChallenges: HouseholdChallenge[];
  personalMilestones: MilestoneItem[];
  recentActionHistory: Array<{
    id: string;
    actionType: string;
    title: string;
    xpEarned: number;
    completedAt: string;
    timeFormatted: string;
  }>;
}

// ==========================================
// 4. Explore & Station Types
// ==========================================

export type StationType = "ground_station" | "modeled" | "community_report";

export interface ExploreMapItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: StationType;
  sourceName: string;
  isOfficial: boolean;
  aqi: number;
  category: "good" | "satisfactory" | "moderate" | "poor" | "very_poor" | "severe";
  categoryLabel: string;
  color: string;
  distanceKm: number;
  direction: string;
  pollutants: {
    pm25: number;
    pm10: number;
    no2?: number;
    so2?: number;
    co?: number;
    o3?: number;
  };
  weather?: {
    temperatureC: number;
    humidityPercent: number;
    windSpeedKmh: number;
    windDirectionCompass: string;
  };
  timestamp: string;
  dataAge: string;
  isStale: boolean;
  communityDetails?: {
    reportType: string;
    description: string;
    severity: "low" | "medium" | "high" | "severe";
    upvotes: number;
  };
  healthAdvisory: {
    summary: string;
    maskRequired: boolean;
    sensitiveAdvice: string;
  };
}

export interface NearbyAreaComparison {
  id: string;
  name: string;
  aqi: number;
  category: string;
  color: string;
  pm25: number;
  distanceKm: number;
  deltaVsUser: number;
  type: StationType;
  statusText: string;
}

export interface ExploreMapResponse {
  center: {
    latitude: number;
    longitude: number;
    city: string;
    area?: string;
  };
  stations: ExploreMapItem[];
  nearbyAreasComparison: NearbyAreaComparison[];
  stats: {
    totalLocations: number;
    officialStationsCount: number;
    modeledLocationsCount: number;
    communityReportsCount: number;
    cleanestLocation: { name: string; aqi: number };
    mostPollutedLocation: { name: string; aqi: number };
  };
  meta: {
    disclaimer: string;
    fetchedAt: string;
  };
}

// ==========================================
// 5. Community Types
// ==========================================

export interface CommunityReportDto {
  id: string;
  authorName: string;
  authorRole: string;
  neighborhood: string;
  city: string;
  approximateLocation: string;
  coordinates: [number, number]; // [longitude, latitude]
  hazardType: CommunityReportType;
  hazardLabel: string;
  hazardIcon: string;
  description: string;
  imageReference?: string;
  severity: "low" | "medium" | "high" | "severe";
  moderationStatus: ModerationStatus;
  upvotes: number;
  flagsCount: number;
  observedAt: string;
  timeFormatted: string;
  isApproximate: boolean;
  provenance: "citizen_report";
  disclaimer: string;
  isOfficialSensor: false;
}

export interface CommunityChallengeItem {
  id: string;
  title: string;
  category: "anti_burning" | "transit" | "construction" | "indoor";
  description: string;
  goal: string;
  currentProgress: number;
  targetProgress: number;
  progressPercent: number;
  participantsCount: number;
  badgeReward: string;
  xpReward: number;
  daysRemaining: number;
  isJoined: boolean;
}

export interface NeighborhoodActivityItem {
  id: string;
  title: string;
  activityType: "anti_burning_patrol" | "school_awareness" | "cleanliness_drive" | "green_corridor";
  description: string;
  organizer: string;
  location: string;
  date: string;
  time: string;
  attendeesCount: number;
  isAttending: boolean;
}

export interface CommunityFeedResponse {
  reports: CommunityReportDto[];
  challenges: CommunityChallengeItem[];
  activities: NeighborhoodActivityItem[];
}

// ==========================================
// 6. Notification Types
// ==========================================

export interface NotificationItemDto {
  id: string;
  type: NotificationType;
  typeLabel: string;
  typeIcon: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  isRead: boolean;
  timeFormatted: string;
  createdAt: string;
  dataSource?: string;
  dataTimestamp?: string;
  currentAqi?: number;
  previousAqi?: number;
  actionLabel?: string;
  actionUrl?: string;
}

export interface NotificationListResponse {
  notifications: NotificationItemDto[];
  unreadCount: number;
  totalCount: number;
  preferences: NotificationPreferences;
}

// ==========================================
// 7. AI Chat Types
// ==========================================

export interface ChatMessageDto {
  id: string;
  sender: "user" | "buddy";
  text: string;
  timestamp: string;
  safetyWarnings?: string[];
  actionableTips?: string[];
  dataSource?: string;
  dataTimestamp?: string;
  disclaimer?: string;
}

export interface ChatSessionSummary {
  _id: string;
  title: string;
  persona: string;
  sessionMetadata: {
    initialAqi?: number;
    city: string;
    messageCount: number;
  };
  updatedAt: string;
}

export interface ChatResponseDto {
  reply: string;
  sessionId: string;
  actionableTips?: string[];
  safetyWarnings?: string[];
  dataSource?: string;
  dataTimestamp?: string;
  disclaimer?: string;
}

// ==========================================
// 8. User Profile Types
// ==========================================

export interface UserProfileResponse {
  user: {
    id: string;
    name: string;
    email: string;
    bio?: string;
    phone?: string;
    avatar?: string;
    role?: string;
    createdAt?: string;
  };
  household: {
    familyMembers: Array<{
      name: string;
      ageGroup: "infant" | "child" | "teen" | "adult" | "senior";
      healthConditions: string[];
      vulnerabilityLevel?: "low" | "medium" | "high" | "critical";
      notes?: string;
    }>;
    homeEnvironment?: {
      homeType?: string;
      floorLevel?: number;
      airPurifiers?: Array<{
        roomName: string;
        brandModel?: string;
        cadrRating?: number;
        hasTrueHepa?: boolean;
        filterInstalledDate?: string;
        filterLifeMonths?: number;
      }>;
      windowType?: string;
      cookingFuel?: string;
      hasExhaustFan?: boolean;
      indoorPlantsCount?: number;
      smokersInHousehold?: boolean;
    };
    lifestyle?: {
      commuteMode?: string;
      commuteDurationMinutes?: number;
      commuteDepartureTime?: string;
      commuteReturnTime?: string;
      outdoorExerciseTime?: string;
      budgetPreference?: "strict_budget" | "balanced" | "premium";
    };
  };
  preferences: {
    theme?: "light" | "dark" | "system";
    language?: string;
    notificationsEnabled?: boolean;
    aqiThresholdAlert?: number;
    temperatureUnit?: "celsius" | "fahrenheit";
    aqiStandard?: "CPCB_NAQI" | "US_EPA";
    distanceUnit?: "km" | "miles";
    privacy?: {
      approximateLocationOnly?: boolean;
      anonymizeCommunityReports?: boolean;
      optOutAnalytics?: boolean;
      optOutHealthContext?: boolean;
    };
    aiPersonalization?: {
      enabled?: boolean;
      enableCommuteAdvice?: boolean;
      enableIndoorAdvice?: boolean;
      storeChatHistory?: boolean;
    };
  };
  location: {
    city?: string;
    area?: string;
    state?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    isApproximate?: boolean;
  };
}
