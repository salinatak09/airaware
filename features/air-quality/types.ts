import { AirQualityCurrent, HourlyAirQualityForecast } from "@/types";

export interface AirQualityFeatureState {
  current: AirQualityCurrent | null;
  forecast: HourlyAirQualityForecast[];
  isLoading: boolean;
  error: string | null;
}
