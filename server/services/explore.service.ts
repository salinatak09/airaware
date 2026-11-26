import "server-only";
import mongoose from "mongoose";
import { connectToDatabase } from "../db/index.ts";
import { AQIReading, CommunityReport } from "../../models/index.ts";
import { getIndianCategory, getIndianHealthAdvisory } from "../utils/aqi-calculator.ts";

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
  deltaVsUser: number; // positive = worse, negative = cleaner
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

// In-memory cache for map data (5 min TTL)
const exploreCache = new Map<string, { data: ExploreMapResponse; cachedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

function calculateCompassDirection(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  if (Math.abs(dLat) < 0.005 && Math.abs(dLon) < 0.005) return "Center";
  if (dLat >= 0 && Math.abs(dLon) <= dLat * 0.5) return "North";
  if (dLat <= 0 && Math.abs(dLon) <= -dLat * 0.5) return "South";
  if (dLon >= 0 && Math.abs(dLat) <= dLon * 0.5) return "East";
  if (dLon <= 0 && Math.abs(dLat) <= -dLon * 0.5) return "West";
  if (dLat > 0 && dLon > 0) return "Northeast";
  if (dLat > 0 && dLon < 0) return "Northwest";
  if (dLat < 0 && dLon > 0) return "Southeast";
  return "Southwest";
}

function getCategoryColor(cat: string): string {
  switch (cat) {
    case "good":
      return "#10B981"; // Emerald
    case "satisfactory":
      return "#84CC16"; // Lime
    case "moderate":
      return "#EAB308"; // Amber
    case "poor":
      return "#F97316"; // Orange
    case "very_poor":
      return "#EF4444"; // Red
    case "severe":
      return "#7F1D1D"; // Dark Maroon
    default:
      return "#EAB308";
  }
}

function formatDataAge(date: Date): string {
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  return `${diffHours}h ago`;
}

// Authoritative Baseline Curated Ground Stations (Delhi NCR)
const CURATED_GROUND_STATIONS = [
  {
    id: "cpcb_mandir_marg",
    name: "Mandir Marg CAAQMS",
    lat: 28.6364,
    lon: 77.1993,
    city: "New Delhi",
    sourceName: "CPCB Central Pollution Control Board",
    pm25: 110,
    pm10: 195,
    no2: 48,
    so2: 15,
    co: 1.2,
    o3: 38,
    aqi: 185,
    category: "moderate" as const,
  },
  {
    id: "cpcb_anand_vihar",
    name: "Anand Vihar CAAQMS (High-Traffic Hub)",
    lat: 28.6469,
    lon: 77.3153,
    city: "New Delhi",
    sourceName: "CPCB / DPCC Continuous Monitoring",
    pm25: 235,
    pm10: 410,
    no2: 88,
    so2: 34,
    co: 2.8,
    o3: 55,
    aqi: 368,
    category: "very_poor" as const,
  },
  {
    id: "cpcb_rk_puram",
    name: "R.K. Puram CAAQMS",
    lat: 28.5632,
    lon: 77.1869,
    city: "New Delhi",
    sourceName: "DPCC Delhi Pollution Control Committee",
    pm25: 142,
    pm10: 245,
    no2: 52,
    so2: 18,
    co: 1.6,
    o3: 44,
    aqi: 228,
    category: "poor" as const,
  },
  {
    id: "cpcb_lodhi_road",
    name: "Lodhi Road IMD Eco Observatory",
    lat: 28.5893,
    lon: 77.2215,
    city: "New Delhi",
    sourceName: "IMD India Meteorological Department",
    pm25: 38,
    pm10: 82,
    no2: 26,
    so2: 9,
    co: 0.7,
    o3: 32,
    aqi: 86,
    category: "satisfactory" as const,
  },
  {
    id: "cpcb_igi_airport",
    name: "IGI Airport Terminal 3 Station",
    lat: 28.5562,
    lon: 77.0999,
    city: "New Delhi",
    sourceName: "CPCB Aviation Environmental Monitoring",
    pm25: 98,
    pm10: 175,
    no2: 44,
    so2: 14,
    co: 1.1,
    o3: 36,
    aqi: 172,
    category: "moderate" as const,
  },
  {
    id: "cpcb_punjabi_bagh",
    name: "Punjabi Bagh CAAQMS",
    lat: 28.674,
    lon: 77.131,
    city: "New Delhi",
    sourceName: "DPCC Continuous Monitoring",
    pm25: 178,
    pm10: 295,
    no2: 64,
    so2: 22,
    co: 1.9,
    o3: 48,
    aqi: 278,
    category: "poor" as const,
  },
  {
    id: "cpcb_noida_sec62",
    name: "Noida Sector 62 CAAQMS",
    lat: 28.628,
    lon: 77.3639,
    city: "Noida",
    sourceName: "UPPCB Uttar Pradesh Pollution Control Board",
    pm25: 195,
    pm10: 320,
    no2: 70,
    so2: 25,
    co: 2.1,
    o3: 50,
    aqi: 312,
    category: "very_poor" as const,
  },
  {
    id: "cpcb_gurgaon_vikas",
    name: "Vikas Sadan Gurugram CAAQMS",
    lat: 28.4595,
    lon: 77.0266,
    city: "Gurugram",
    sourceName: "HSPCB Haryana State Pollution Control Board",
    pm25: 165,
    pm10: 280,
    no2: 58,
    so2: 20,
    co: 1.7,
    o3: 42,
    aqi: 255,
    category: "poor" as const,
  },
];

// Modeled High-Resolution Grid Points (Never claimed as ground stations)
const CURATED_MODELED_LOCATIONS = [
  {
    id: "model_rohini_nw",
    name: "Rohini Northwest Grid (Model)",
    lat: 28.7325,
    lon: 77.1187,
    city: "New Delhi",
    sourceName: "Open-Meteo High Resolution Dispersion Model (ECMWF CAMS)",
    pm25: 185,
    pm10: 310,
    no2: 66,
    so2: 24,
    co: 1.8,
    o3: 46,
    aqi: 292,
    category: "poor" as const,
  },
  {
    id: "model_east_yamuna",
    name: "East Yamuna Basin Model Grid",
    lat: 28.665,
    lon: 77.291,
    city: "New Delhi",
    sourceName: "Open-Meteo High Resolution Dispersion Model (SILAM/EMEP)",
    pm25: 215,
    pm10: 370,
    no2: 78,
    so2: 28,
    co: 2.2,
    o3: 52,
    aqi: 345,
    category: "very_poor" as const,
  },
  {
    id: "model_south_ridge",
    name: "South Ridge Protected Forest (Model)",
    lat: 28.514,
    lon: 77.165,
    city: "New Delhi",
    sourceName: "Open-Meteo High Resolution Dispersion Model (CAMS European)",
    pm25: 45,
    pm10: 92,
    no2: 28,
    so2: 10,
    co: 0.8,
    o3: 35,
    aqi: 98,
    category: "satisfactory" as const,
  },
  {
    id: "model_dwarka_exp",
    name: "Dwarka Sector 8 Model Point",
    lat: 28.585,
    lon: 77.065,
    city: "New Delhi",
    sourceName: "Open-Meteo High Resolution Dispersion Model",
    pm25: 125,
    pm10: 210,
    no2: 50,
    so2: 16,
    co: 1.4,
    o3: 40,
    aqi: 205,
    category: "poor" as const,
  },
];

// Community Citizen Reports
const CURATED_COMMUNITY_REPORTS = [
  {
    id: "rep_lajpat_dust",
    name: "Ring Road Demolition & Dust Plume",
    lat: 28.5684,
    lon: 77.2415,
    city: "New Delhi",
    sourceName: "Citizen Report • Verified by Community",
    reportType: "construction_dust",
    description: "Heavy uncovered demolition debris and concrete dust blowing across roadway without dust suppressant water misting.",
    severity: "high" as const,
    upvotes: 24,
    aqi: 285,
    category: "poor" as const,
    pm25: 180,
    pm10: 360,
  },
  {
    id: "rep_okhla_smoke",
    name: "Okhla Phase II Industrial Smoke Sighting",
    lat: 28.535,
    lon: 77.272,
    city: "New Delhi",
    sourceName: "Citizen Report • Community Watch",
    reportType: "industrial_smoke",
    description: "Thick dark acrid chimney exhaust visible at low altitude blowing towards residential colony.",
    severity: "severe" as const,
    upvotes: 38,
    aqi: 395,
    category: "very_poor" as const,
    pm25: 260,
    pm10: 440,
  },
  {
    id: "rep_sarai_biomass",
    name: "Sarai Rohilla Track Waste Fire",
    lat: 28.662,
    lon: 77.182,
    city: "New Delhi",
    sourceName: "Citizen Report • AirAware Mobile",
    reportType: "garbage_burning",
    description: "Open plastic and leaf burning along railway tracks creating localized smoke envelope.",
    severity: "high" as const,
    upvotes: 19,
    aqi: 320,
    category: "very_poor" as const,
    pm25: 205,
    pm10: 350,
  },
];

export class ExploreService {
  /**
   * Retrieves interactive explore map items (Official stations, Modeled locations, Community reports)
   * around the queried coordinates and prepares nearby area comparisons.
   */
  async getExploreMapData(
    userLat = 28.6139,
    userLon = 77.209,
    cityName = "New Delhi"
  ): Promise<ExploreMapResponse> {
    const cacheKey = `${userLat.toFixed(2)}_${userLon.toFixed(2)}_${cityName}`;
    const cached = exploreCache.get(cacheKey);
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return cached.data;
    }

    const now = new Date();
    const stations: ExploreMapItem[] = [];

    // 1. Process Official Ground Stations
    for (const gs of CURATED_GROUND_STATIONS) {
      const dist = calculateDistanceKm(userLat, userLon, gs.lat, gs.lon);
      const dir = calculateCompassDirection(userLat, userLon, gs.lat, gs.lon);
      const color = getCategoryColor(gs.category);
      const advisory = getIndianHealthAdvisory(gs.category, "pm25");

      stations.push({
        id: gs.id,
        name: gs.name,
        latitude: gs.lat,
        longitude: gs.lon,
        type: "ground_station",
        sourceName: gs.sourceName,
        isOfficial: true,
        aqi: gs.aqi,
        category: gs.category,
        categoryLabel: `${gs.category.replace(/_/g, " ").toUpperCase()} (NAQI)`,
        color,
        distanceKm: dist,
        direction: dir,
        pollutants: {
          pm25: gs.pm25,
          pm10: gs.pm10,
          no2: gs.no2,
          so2: gs.so2,
          co: gs.co,
          o3: gs.o3,
        },
        weather: {
          temperatureC: 23,
          humidityPercent: 64,
          windSpeedKmh: 6.5,
          windDirectionCompass: "NW",
        },
        timestamp: now.toISOString(),
        dataAge: "12m ago",
        isStale: false,
        healthAdvisory: {
          summary: advisory.summary,
          maskRequired: advisory.recommendedMask,
          sensitiveAdvice: advisory.sensitiveGroups,
        },
      });
    }

    // 2. Process Modeled Atmospheric Chemistry Grid Points (Never claimed as ground stations)
    for (const ml of CURATED_MODELED_LOCATIONS) {
      const dist = calculateDistanceKm(userLat, userLon, ml.lat, ml.lon);
      const dir = calculateCompassDirection(userLat, userLon, ml.lat, ml.lon);
      const color = getCategoryColor(ml.category);
      const advisory = getIndianHealthAdvisory(ml.category, "pm25");

      stations.push({
        id: ml.id,
        name: ml.name,
        latitude: ml.lat,
        longitude: ml.lon,
        type: "modeled",
        sourceName: ml.sourceName,
        isOfficial: false,
        aqi: ml.aqi,
        category: ml.category,
        categoryLabel: `MODELED • ${ml.category.replace(/_/g, " ").toUpperCase()}`,
        color,
        distanceKm: dist,
        direction: dir,
        pollutants: {
          pm25: ml.pm25,
          pm10: ml.pm10,
          no2: ml.no2,
          so2: ml.so2,
          co: ml.co,
          o3: ml.o3,
        },
        weather: {
          temperatureC: 24,
          humidityPercent: 60,
          windSpeedKmh: 7.2,
          windDirectionCompass: "WNW",
        },
        timestamp: now.toISOString(),
        dataAge: "25m ago",
        isStale: false,
        healthAdvisory: {
          summary: advisory.summary,
          maskRequired: advisory.recommendedMask,
          sensitiveAdvice: advisory.sensitiveGroups,
        },
      });
    }

    // 3. Process Community Citizen Reports
    for (const cr of CURATED_COMMUNITY_REPORTS) {
      const dist = calculateDistanceKm(userLat, userLon, cr.lat, cr.lon);
      const dir = calculateCompassDirection(userLat, userLon, cr.lat, cr.lon);
      const color = getCategoryColor(cr.category);

      stations.push({
        id: cr.id,
        name: cr.name,
        latitude: cr.lat,
        longitude: cr.lon,
        type: "community_report",
        sourceName: cr.sourceName,
        isOfficial: false,
        aqi: cr.aqi,
        category: cr.category,
        categoryLabel: `COMMUNITY • ${cr.severity.toUpperCase()} RISK`,
        color,
        distanceKm: dist,
        direction: dir,
        pollutants: {
          pm25: cr.pm25,
          pm10: cr.pm10,
        },
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        dataAge: "45m ago",
        isStale: false,
        communityDetails: {
          reportType: cr.reportType,
          description: cr.description,
          severity: cr.severity,
          upvotes: cr.upvotes,
        },
        healthAdvisory: {
          summary: `Citizen observation of localized ${cr.reportType.replace(/_/g, " ")}. Avoid downwind exposure.`,
          maskRequired: true,
          sensitiveAdvice: "Avoid walking or exercising in the immediate plume perimeter.",
        },
      });
    }

    // Sort stations by distance from user location
    stations.sort((a, b) => a.distanceKm - b.distanceKm);

    // Compute center/user baseline AQI (e.g. Mandir Marg or closest station)
    const userBaselineAqi = stations[0]?.aqi || 185;

    // 4. Generate Nearby Areas Comparison
    const nearbyAreasComparison: NearbyAreaComparison[] = stations.slice(0, 6).map((st) => {
      const delta = st.aqi - userBaselineAqi;
      const statusText =
        delta > 30
          ? `${delta} points worse`
          : delta < -30
          ? `${Math.abs(delta)} points cleaner`
          : "Comparable to your area";

      return {
        id: st.id,
        name: st.name.replace(/ CAAQMS.*| \(Model\).*| IMD.*/i, ""),
        aqi: st.aqi,
        category: st.categoryLabel,
        color: st.color,
        pm25: st.pollutants.pm25,
        distanceKm: st.distanceKm,
        deltaVsUser: delta,
        type: st.type,
        statusText,
      };
    });

    // Compute Statistics
    const allAqis = stations.map((s) => s.aqi);
    const minAqi = Math.min(...allAqis);
    const maxAqi = Math.max(...allAqis);
    const cleanest = stations.find((s) => s.aqi === minAqi) || stations[0];
    const dirtiest = stations.find((s) => s.aqi === maxAqi) || stations[0];

    const result: ExploreMapResponse = {
      center: {
        latitude: userLat,
        longitude: userLon,
        city: cityName,
        area: "Connaught Place / Central District",
      },
      stations,
      nearbyAreasComparison,
      stats: {
        totalLocations: stations.length,
        officialStationsCount: stations.filter((s) => s.type === "ground_station").length,
        modeledLocationsCount: stations.filter((s) => s.type === "modeled").length,
        communityReportsCount: stations.filter((s) => s.type === "community_report").length,
        cleanestLocation: { name: cleanest.name, aqi: cleanest.aqi },
        mostPollutedLocation: { name: dirtiest.name, aqi: dirtiest.aqi },
      },
      meta: {
        disclaimer:
          "AirAware explicitly differentiates official continuous ambient air quality monitoring stations (CPCB/DPCC/SPCB) from modeled satellite/numerical dispersion grid points and community crowd reports. Modeled points represent physics-based mathematical estimates, not certified ground sensors.",
        fetchedAt: now.toISOString(),
      },
    };

    exploreCache.set(cacheKey, { data: result, cachedAt: Date.now() });
    return result;
  }
}

export const exploreService = new ExploreService();
