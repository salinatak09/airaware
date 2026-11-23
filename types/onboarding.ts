/**
 * AirAware - Onboarding Domain Types & Default State
 */

export interface OnboardingState {
  step: number;
  location: {
    city: string;
    area: string;
    coordinates?: { latitude: number; longitude: number };
    method: "gps" | "manual" | "default";
  };
  household: {
    adults: number;
    children: number;
    seniors: number;
    respiratorySensitivities: string[];
    pregnancySensitivity: boolean;
    activityPatterns: string[];
  };
  lifestyle: {
    workSchedule: "standard_9_5" | "morning_school" | "remote_flexible" | "shift_worker";
    commuteType: "metro_train" | "bus" | "car_ac" | "bike_two_wheeler" | "walking";
    outdoorActivities: string[];
    exerciseHabits: "outdoor_morning" | "outdoor_evening" | "indoor_gym" | "weekend_only" | "light_walks";
  };
  homeEnvironment: {
    homeType: "apartment_highrise" | "apartment_lowrise" | "independent_house" | "townhouse";
    ventilationType: "cross_breeze_windows" | "central_hvac" | "balcony_sliding" | "sealed_windows";
    cookingFuel: "induction_electric" | "piped_gas" | "lpg_cylinder";
    purifierAvailability: "all_rooms" | "single_unit" | "planning_to_buy" | "none";
    improvementBudget: "free_habits" | "low_masks_plants" | "moderate_purifiers" | "high_smart_filtration";
  };
  preferences: {
    notifications: {
      morningBriefing: boolean;
      afternoonVentilationWindow: boolean;
      severeSpikesAlert: boolean;
      filterWashReminders: boolean;
    };
    preferredLanguage: "en" | "hi" | "es" | "fr";
    aqiStandard: "us_aqi" | "european_aqi";
    temperatureUnit: "celsius" | "fahrenheit";
    privacyConsent: boolean;
  };
}

export const INITIAL_ONBOARDING_STATE: OnboardingState = {
  step: 1,
  location: {
    city: "New Delhi",
    area: "Connaught Place",
    coordinates: { latitude: 28.6139, longitude: 77.209 },
    method: "default",
  },
  household: {
    adults: 2,
    children: 1,
    seniors: 0,
    respiratorySensitivities: [],
    pregnancySensitivity: false,
    activityPatterns: ["early_risers"],
  },
  lifestyle: {
    workSchedule: "standard_9_5",
    commuteType: "metro_train",
    outdoorActivities: ["park_visits"],
    exerciseHabits: "outdoor_evening",
  },
  homeEnvironment: {
    homeType: "apartment_highrise",
    ventilationType: "cross_breeze_windows",
    cookingFuel: "piped_gas",
    purifierAvailability: "single_unit",
    improvementBudget: "moderate_purifiers",
  },
  preferences: {
    notifications: {
      morningBriefing: true,
      afternoonVentilationWindow: true,
      severeSpikesAlert: true,
      filterWashReminders: true,
    },
    preferredLanguage: "en",
    aqiStandard: "us_aqi",
    temperatureUnit: "celsius",
    privacyConsent: true,
  },
};
