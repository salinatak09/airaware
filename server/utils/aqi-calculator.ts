import "server-only";
import {
  IndianNaqiCategory,
  SubIndexDetail,
  UsAqiCategory,
} from "@/types/aqi";

/**
 * CPCB Indian National Air Quality Index (NAQI) Breakpoints
 * Reference: Central Pollution Control Board, Ministry of Environment, Forest and Climate Change, Govt of India
 *
 * Each entry: [C_low, C_high, I_low, I_high]
 */
interface Breakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

const CPCB_BREAKPOINTS: Record<string, Breakpoint[]> = {
  // PM2.5 (24-hr avg, µg/m³)
  pm25: [
    { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
    { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 },
    { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 },
    { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 },
    { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 },
    { cLow: 251, cHigh: 380, iLow: 401, iHigh: 500 },
  ],
  // PM10 (24-hr avg, µg/m³)
  pm10: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 101, cHigh: 250, iLow: 101, iHigh: 200 },
    { cLow: 251, cHigh: 350, iLow: 201, iHigh: 300 },
    { cLow: 351, cHigh: 430, iLow: 301, iHigh: 400 },
    { cLow: 431, cHigh: 550, iLow: 401, iHigh: 500 },
  ],
  // NO2 (µg/m³)
  no2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
    { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
    { cLow: 81, cHigh: 180, iLow: 101, iHigh: 200 },
    { cLow: 181, cHigh: 280, iLow: 201, iHigh: 300 },
    { cLow: 281, cHigh: 400, iLow: 301, iHigh: 400 },
    { cLow: 401, cHigh: 600, iLow: 401, iHigh: 500 },
  ],
  // SO2 (µg/m³)
  so2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
    { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
    { cLow: 81, cHigh: 380, iLow: 101, iHigh: 200 },
    { cLow: 381, cHigh: 800, iLow: 201, iHigh: 300 },
    { cLow: 801, cHigh: 1600, iLow: 301, iHigh: 400 },
    { cLow: 1601, cHigh: 2400, iLow: 401, iHigh: 500 },
  ],
  // CO (in mg/m³ - CPCB standard)
  co: [
    { cLow: 0, cHigh: 1.0, iLow: 0, iHigh: 50 },
    { cLow: 1.1, cHigh: 2.0, iLow: 51, iHigh: 100 },
    { cLow: 2.1, cHigh: 10.0, iLow: 101, iHigh: 200 },
    { cLow: 10.1, cHigh: 17.0, iLow: 201, iHigh: 300 },
    { cLow: 17.1, cHigh: 34.0, iLow: 301, iHigh: 400 },
    { cLow: 34.1, cHigh: 50.0, iLow: 401, iHigh: 500 },
  ],
  // O3 (µg/m³)
  o3: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 101, cHigh: 168, iLow: 101, iHigh: 200 },
    { cLow: 169, cHigh: 208, iLow: 201, iHigh: 300 },
    { cLow: 209, cHigh: 748, iLow: 301, iHigh: 400 },
    { cLow: 749, cHigh: 1000, iLow: 401, iHigh: 500 },
  ],
};

const POLLUTANT_NAMES: Record<string, string> = {
  pm25: "Particulate Matter 2.5",
  pm10: "Particulate Matter 10",
  no2: "Nitrogen Dioxide",
  so2: "Sulphur Dioxide",
  co: "Carbon Monoxide",
  o3: "Ozone",
};

/**
 * Calculates a single pollutant sub-index using linear interpolation across CPCB breakpoints.
 */
export function calculateSubIndex(
  pollutant: "pm25" | "pm10" | "no2" | "so2" | "co" | "o3",
  concentration: number
): SubIndexDetail {
  const bps = CPCB_BREAKPOINTS[pollutant];
  const unit = pollutant === "co" ? "mg/m³" : "µg/m³";

  if (!bps || concentration < 0) {
    return {
      pollutant,
      name: POLLUTANT_NAMES[pollutant] || pollutant.toUpperCase(),
      concentration,
      unit,
      subIndex: 0,
      category: "good",
      categoryLabel: "Good",
      color: "#10b981",
      breakpointRange: [0, 50],
      indexRange: [0, 50],
    };
  }

  // Find corresponding breakpoint
  let matchedBp = bps[0];
  for (const bp of bps) {
    if (concentration >= bp.cLow && concentration <= bp.cHigh) {
      matchedBp = bp;
      break;
    }
  }

  // Handle concentrations beyond the highest breakpoint
  const highestBp = bps[bps.length - 1];
  if (concentration > highestBp.cHigh) {
    const extra = concentration - highestBp.cHigh;
    const rate = (highestBp.iHigh - highestBp.iLow) / (highestBp.cHigh - highestBp.cLow);
    const calculated = Math.min(600, Math.round(highestBp.iHigh + extra * rate));
    const cat = getIndianCategory(calculated);

    return {
      pollutant,
      name: POLLUTANT_NAMES[pollutant],
      concentration: Number(concentration.toFixed(1)),
      unit,
      subIndex: calculated,
      category: cat.category,
      categoryLabel: cat.label,
      color: cat.color,
      breakpointRange: [highestBp.cLow, highestBp.cHigh],
      indexRange: [highestBp.iLow, highestBp.iHigh],
    };
  }

  // Standard linear interpolation:
  // Ip = [ (I_hi - I_lo) / (C_hi - C_lo) ] * (Cp - C_lo) + I_lo
  const { cLow, cHigh, iLow, iHigh } = matchedBp;
  const subIndexVal = Math.round(
    ((iHigh - iLow) / (cHigh - cLow)) * (concentration - cLow) + iLow
  );

  const cat = getIndianCategory(subIndexVal);

  return {
    pollutant,
    name: POLLUTANT_NAMES[pollutant],
    concentration: Number(concentration.toFixed(1)),
    unit,
    subIndex: Math.max(0, subIndexVal),
    category: cat.category,
    categoryLabel: cat.label,
    color: cat.color,
    breakpointRange: [cLow, cHigh],
    indexRange: [iLow, iHigh],
  };
}

/**
 * Map Indian NAQI numerical value to CPCB Category and Color.
 */
export function getIndianCategory(aqi: number): {
  category: IndianNaqiCategory;
  label: string;
  color: string;
  badgeBg: string;
} {
  if (aqi <= 50) {
    return {
      category: "good",
      label: "Good",
      color: "#10b981", // Emerald 500
      badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    };
  }
  if (aqi <= 100) {
    return {
      category: "satisfactory",
      label: "Satisfactory",
      color: "#84cc16", // Lime 500
      badgeBg: "bg-lime-50 text-lime-800 border-lime-200",
    };
  }
  if (aqi <= 200) {
    return {
      category: "moderate",
      label: "Moderate",
      color: "#eab308", // Yellow 500
      badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    };
  }
  if (aqi <= 300) {
    return {
      category: "poor",
      label: "Poor",
      color: "#f97316", // Orange 500
      badgeBg: "bg-orange-50 text-orange-800 border-orange-200",
    };
  }
  if (aqi <= 400) {
    return {
      category: "very_poor",
      label: "Very Poor",
      color: "#ef4444", // Red 500
      badgeBg: "bg-rose-50 text-rose-800 border-rose-200",
    };
  }
  return {
    category: "severe",
    label: "Severe",
    color: "#881337", // Rose 900 / Maroon
    badgeBg: "bg-purple-950 text-white border-purple-800",
  };
}

export function calculateAqiCategory(aqi: number) {
  const cat = getIndianCategory(aqi);
  return {
    category: cat.category,
    label: cat.label,
    color: cat.color,
  };
}

/**
 * Health advisory tailored to Indian NAQI categories.
 */
export function getIndianHealthAdvisory(category: IndianNaqiCategory, dominantPollutant: string) {
  switch (category) {
    case "good":
      return {
        summary: "Air quality is ideal. Minimal health impact.",
        generalPopulation: "Safe for all outdoor recreation, athletics, and cross-ventilation.",
        sensitiveGroups: "No restrictions. Enjoy outdoor fresh air.",
        childrenAndElderly: "Completely safe for children playing outdoors and morning elder walks.",
        recommendedMask: false,
        indoorPurifierAdvice: "Natural ventilation is recommended. Keep windows open during fresh breeze.",
      };
    case "satisfactory":
      return {
        summary: "Air quality is acceptable. Minor breathing discomfort to sensitive people.",
        generalPopulation: "Normal outdoor activities are permitted without restrictions.",
        sensitiveGroups: "Individuals with severe asthma should keep inhalers on hand during exertion.",
        childrenAndElderly: "Safe for regular school routines and park visits.",
        recommendedMask: false,
        indoorPurifierAdvice: "Natural ventilation is suitable during daytime hours.",
      };
    case "moderate":
      return {
        summary: "Breathing discomfort to sensitive people, children, and elderly with lung or heart issues.",
        generalPopulation: "Healthy individuals can proceed with normal activities but limit prolonged exertion.",
        sensitiveGroups: "People with asthma, COPD, or cardiac conditions should reduce strenuous outdoor workouts.",
        childrenAndElderly: "Avoid intense outdoor sports in early morning hours when pollution concentrates.",
        recommendedMask: false,
        indoorPurifierAdvice: "Run indoor air purifiers on low speed in bedrooms; close windows near high-traffic roads.",
      };
    case "poor":
      return {
        summary: "Breathing discomfort to most people on prolonged exposure; triggers asthma attacks.",
        generalPopulation: "Reduce prolonged outdoor exertion. Avoid outdoor jogging between 6 AM and 10 AM.",
        sensitiveGroups: "Wear an N95 mask outdoors. Avoid all vigorous outdoor activities.",
        childrenAndElderly: "Shift recess and outdoor playtime indoors. Children developing lungs are sensitive to high PM.",
        recommendedMask: true,
        indoorPurifierAdvice: "Keep windows shut. Run HEPA air purifiers on medium speed continuously.",
      };
    case "very_poor":
      return {
        summary: "Respiratory illness on prolonged exposure. Severe effect on people with lung or heart disease.",
        generalPopulation: "Avoid outdoor running, cycling, or heavy exertion. Wear an N95/FFP2 mask if commuting.",
        sensitiveGroups: "Stay indoors. Keep emergency medication accessible. Avoid all outdoor exposure.",
        childrenAndElderly: "Strictly avoid outdoor activities. School sports should be canceled or held indoors.",
        recommendedMask: true,
        indoorPurifierAdvice: "Run HEPA purifiers continuously. Seal doors and window gaps against smog infiltration.",
      };
    case "severe":
    default:
      return {
        summary: "Emergency air quality. Affects healthy people and seriously impacts those with existing conditions.",
        generalPopulation: "Avoid all outdoor exposure. Keep physical activity minimal even indoors.",
        sensitiveGroups: "Strictly remain in clean-air sealed rooms with active HEPA air filtration.",
        childrenAndElderly: "Keep children, seniors, and pregnant individuals completely indoors.",
        recommendedMask: true,
        indoorPurifierAdvice: "Operate purifiers on maximum/turbo setting. Use wet-mopping indoors instead of dry sweeping.",
      };
  }
}

/**
 * Calculates US EPA AQI category for reference.
 */
export function getUsAqiCategory(usAqi: number): {
  category: UsAqiCategory;
  label: string;
} {
  if (usAqi <= 50) return { category: "good", label: "Good" };
  if (usAqi <= 100) return { category: "moderate", label: "Moderate" };
  if (usAqi <= 150) return { category: "unhealthy-sensitive", label: "Unhealthy for Sensitive Groups" };
  if (usAqi <= 200) return { category: "unhealthy", label: "Unhealthy" };
  if (usAqi <= 300) return { category: "very-unhealthy", label: "Very Unhealthy" };
  return { category: "hazardous", label: "Hazardous" };
}

export interface ComprehensiveAqiCalculation {
  indianAqi: number;
  category: IndianNaqiCategory;
  categoryLabel: string;
  color: string;
  badgeBg: string;
  dominantPollutant: "pm25" | "pm10" | "no2" | "so2" | "co" | "o3";
  dominantPollutantLabel: string;
  subIndices: Record<string, SubIndexDetail>;
  healthAdvisory: ReturnType<typeof getIndianHealthAdvisory>;
  methodology: string;
}

/**
 * Evaluates full Indian CPCB NAQI from given pollutant concentrations.
 * Overall AQI = max(subIndex) among all measured pollutants (with PM2.5 or PM10 as required anchor).
 */
export function calculateComprehensiveIndianAqi(params: {
  pm25?: number;
  pm10?: number;
  no2?: number;
  so2?: number;
  coUgM3?: number; // In µg/m³ from Open-Meteo
  coMgM3?: number; // In mg/m³
  o3?: number;
}): ComprehensiveAqiCalculation {
  const subIndices: Record<string, SubIndexDetail> = {};

  // 1. PM2.5
  if (params.pm25 !== undefined && params.pm25 !== null) {
    subIndices.pm25 = calculateSubIndex("pm25", params.pm25);
  }

  // 2. PM10
  if (params.pm10 !== undefined && params.pm10 !== null) {
    subIndices.pm10 = calculateSubIndex("pm10", params.pm10);
  }

  // 3. NO2
  if (params.no2 !== undefined && params.no2 !== null) {
    subIndices.no2 = calculateSubIndex("no2", params.no2);
  }

  // 4. SO2
  if (params.so2 !== undefined && params.so2 !== null) {
    subIndices.so2 = calculateSubIndex("so2", params.so2);
  }

  // 5. CO (Convert µg/m³ to mg/m³ if needed: 1 mg/m³ = 1000 µg/m³)
  const coConcentration =
    params.coMgM3 !== undefined
      ? params.coMgM3
      : params.coUgM3 !== undefined
      ? params.coUgM3 / 1000
      : undefined;

  if (coConcentration !== undefined && coConcentration !== null) {
    subIndices.co = calculateSubIndex("co", coConcentration);
  }

  // 6. O3
  if (params.o3 !== undefined && params.o3 !== null) {
    subIndices.o3 = calculateSubIndex("o3", params.o3);
  }

  // Determine Overall AQI = Maximum of Sub-Indices
  let maxSubIndex = 0;
  let dominantKey: "pm25" | "pm10" | "no2" | "so2" | "co" | "o3" = "pm25";

  for (const [key, detail] of Object.entries(subIndices)) {
    if (detail.subIndex > maxSubIndex) {
      maxSubIndex = detail.subIndex;
      dominantKey = key as typeof dominantKey;
    }
  }

  const categoryInfo = getIndianCategory(maxSubIndex);
  const healthAdvisory = getIndianHealthAdvisory(categoryInfo.category, dominantKey);

  const methodology =
    "Calculated according to the Central Pollution Control Board (CPCB) National Air Quality Index (NAQI) guidelines. Sub-indices are computed using piecewise linear interpolation against official Indian concentration breakpoints. Overall NAQI is the maximum sub-index across measured pollutants.";

  return {
    indianAqi: maxSubIndex,
    category: categoryInfo.category,
    categoryLabel: categoryInfo.label,
    color: categoryInfo.color,
    badgeBg: categoryInfo.badgeBg,
    dominantPollutant: dominantKey,
    dominantPollutantLabel: POLLUTANT_NAMES[dominantKey] || dominantKey.toUpperCase(),
    subIndices,
    healthAdvisory,
    methodology,
  };
}
