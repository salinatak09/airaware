/**
 * AirAware - Air Quality Domain Types
 * Supporting Indian NAQI (CPCB) Standard and US EPA AQI comparison.
 */

export type IndianNaqiCategory =
  | "good"          // 0 - 50
  | "satisfactory"  // 51 - 100
  | "moderate"      // 101 - 200
  | "poor"          // 201 - 300
  | "very_poor"     // 301 - 400
  | "severe";       // 401 - 500+

export type UsAqiCategory =
  | "good"
  | "moderate"
  | "unhealthy-sensitive"
  | "unhealthy"
  | "very-unhealthy"
  | "hazardous";

export interface SubIndexDetail {
  pollutant: "pm25" | "pm10" | "no2" | "so2" | "co" | "o3";
  name: string;
  concentration: number;
  unit: string;
  subIndex: number;
  category: IndianNaqiCategory;
  categoryLabel: string;
  color: string;
  breakpointRange: [number, number];
  indexRange: [number, number];
}

export interface DataSourceMeta {
  provider: string; // e.g. "Open-Meteo Atmospheric Chemistry"
  type: "modeled" | "ground_station" | "hybrid";
  models: string[]; // e.g. ["CAMS European Centre (ECMWF)", "SILAM", "EMEP"]
  resolutionKm: number;
  isModelledData: true;
  isPhysicalGroundStation: false;
  recordedAt: string;
  fetchedAt: string;
  dataAgeSeconds: number;
  dataAgeFormatted: string;
  isStale: boolean; // true if older than 2 hours
  disclaimer: string;
  calculationMethodology: string;
}

export interface WeatherSummary {
  temperatureC: number;
  apparentTemperatureC: number;
  relativeHumidityPercent: number;
  windSpeedKmh: number;
  windDirectionDegrees: number;
  windDirectionCompass: string;
  weatherCode: number;
  weatherDescription: string;
  dispersionIndex: "poor" | "moderate" | "favorable";
  dispersionNote: string;
}

export interface AqiCurrentResponse {
  // Primary Indian NAQI
  indianAqi: number;
  indianCategory: IndianNaqiCategory;
  indianCategoryLabel: string;
  indianColor: string;
  dominantPollutant: "pm25" | "pm10" | "no2" | "so2" | "co" | "o3";
  dominantPollutantLabel: string;
  healthAdvisory: {
    summary: string;
    generalPopulation: string;
    sensitiveGroups: string;
    childrenAndElderly: string;
    recommendedMask: boolean;
    indoorPurifierAdvice: string;
  };
  
  // International Standard for Comparison
  usAqi?: number;
  usCategory?: UsAqiCategory;
  europeanAqi?: number;

  // Pollutant Concentrations & Sub-indices
  pollutants: {
    pm25: number;
    pm10: number;
    no2: number;
    so2: number;
    co: number; // in mg/m³ for NAQI, raw in µg/m³
    coRawUgM3?: number;
    o3: number;
  };
  subIndices: Record<string, SubIndexDetail>;

  // Location & Weather
  location: {
    latitude: number;
    longitude: number;
    city: string;
    area?: string;
    country: string;
    timezone: string;
    elevationMeters?: number;
  };
  weather?: WeatherSummary;

  // Metadata & Provenance
  meta: DataSourceMeta;
}

export interface HourlyForecastItem {
  time: string;
  indianAqi: number;
  indianCategory: IndianNaqiCategory;
  indianCategoryLabel: string;
  indianColor: string;
  usAqi?: number;
  pm25: number;
  pm10: number;
  dominantPollutant: string;
  riskLevel: "low" | "moderate" | "high" | "severe";
  suitability: "safe" | "caution" | "avoid";
}

export interface DailyForecastSummary {
  date: string;
  dayName: string;
  minAqi: number;
  maxAqi: number;
  avgAqi: number;
  dominantCategory: IndianNaqiCategory;
  dominantCategoryLabel: string;
  color: string;
  cleanestWindow: {
    startTime: string;
    endTime: string;
    estimatedAqi: number;
  };
  peakWindow: {
    startTime: string;
    endTime: string;
    estimatedAqi: number;
  };
}

export interface AqiForecastResponse {
  location: {
    latitude: number;
    longitude: number;
    city: string;
    timezone: string;
  };
  hourly: HourlyForecastItem[];
  daily: DailyForecastSummary[];
  safestWindows: Array<{
    day: string;
    timeRange: string;
    averageAqi: number;
    rationale: string;
  }>;
  meta: DataSourceMeta;
}

export interface AqiHistoryResponse {
  location: {
    latitude: number;
    longitude: number;
    city: string;
  };
  daysCount: number;
  history: Array<{
    time: string;
    indianAqi: number;
    category: IndianNaqiCategory;
    pm25: number;
    pm10: number;
    no2: number;
  }>;
  trend: {
    direction: "improving" | "worsening" | "stable";
    percentChange24h: number;
    summary: string;
    worstHour: { time: string; aqi: number };
    bestHour: { time: string; aqi: number };
  };
  meta: DataSourceMeta;
}

export interface NearbyStationItem {
  id: string;
  name: string;
  distanceKm: number;
  direction: string;
  latitude: number;
  longitude: number;
  indianAqi: number;
  category: IndianNaqiCategory;
  categoryLabel: string;
  color: string;
  pm25: number;
  pm10: number;
  dataSource: "Open-Meteo Model Grid Point";
}

export interface AqiNearbyResponse {
  center: {
    latitude: number;
    longitude: number;
    city: string;
  };
  stations: NearbyStationItem[];
  meta: DataSourceMeta;
}
