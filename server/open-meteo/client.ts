import "server-only";
import { env } from "@/lib/env";
import { AqiCategory, AirQualityCurrent } from "@/types";

export interface OpenMeteoAirQualityParams {
  latitude: number;
  longitude: number;
  hourly?: string[];
  forecast_days?: number;
}

/**
 * Calculates standard AQI category based on US AQI numerical score.
 */
export function getAqiCategory(aqi: number): { category: AqiCategory; label: string } {
  if (aqi <= 50) return { category: "good", label: "Good" };
  if (aqi <= 100) return { category: "moderate", label: "Moderate" };
  if (aqi <= 150) return { category: "unhealthy-sensitive", label: "Unhealthy for Sensitive Groups" };
  if (aqi <= 200) return { category: "unhealthy", label: "Unhealthy" };
  if (aqi <= 300) return { category: "very-unhealthy", label: "Very Unhealthy" };
  return { category: "hazardous", label: "Hazardous" };
}

/**
 * Fetches real-time and forecast air quality data from Open-Meteo Air Quality API.
 */
export async function fetchOpenMeteoAirQuality(
  params: OpenMeteoAirQualityParams
): Promise<AirQualityCurrent> {
  const url = new URL(env.OPEN_METEO_AIR_QUALITY_URL);
  url.searchParams.set("latitude", params.latitude.toString());
  url.searchParams.set("longitude", params.longitude.toString());
  url.searchParams.set(
    "current",
    "us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone"
  );
  url.searchParams.set("forecast_days", (params.forecast_days ?? 3).toString());

  const response = await fetch(url.toString(), {
    next: { revalidate: 900 }, // Cache in Next.js for 15 minutes
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo API returned status ${response.status}: ${response.statusText}`);
  }

  const raw = await response.json();
  const current = raw.current || {};
  const aqi = Math.round(current.us_aqi ?? 50);
  const { category, label } = getAqiCategory(aqi);

  return {
    aqi,
    category,
    categoryLabel: label,
    dominantPollutant: "pm25",
    pollutants: {
      pm25: current.pm2_5 ?? 0,
      pm10: current.pm10 ?? 0,
      no2: current.nitrogen_dioxide,
      o3: current.ozone,
      so2: current.sulphur_dioxide,
      co: current.carbon_monoxide,
    },
    timestamp: current.time || new Date().toISOString(),
    location: {
      latitude: params.latitude,
      longitude: params.longitude,
      city: "Selected Location",
      country: "Auto-detected",
    },
    healthRecommendation:
      aqi > 150
        ? "Wear N95/FFP2 masks outdoors and run air purifiers indoors."
        : "Air quality is acceptable. Sensitive groups should monitor exertion.",
  };
}
