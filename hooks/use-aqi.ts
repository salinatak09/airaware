"use client";

import { useState, useCallback, useEffect } from "react";
import { AqiCurrentResponse, AqiForecastResponse } from "@/types/aqi";

export interface UseAqiOptions {
  latitude?: number;
  longitude?: number;
  city?: string;
  initialDemo?: boolean;
}

export interface UseAqiReturn {
  currentAqi: AqiCurrentResponse | null;
  forecastAqi: AqiForecastResponse | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  toggleDemoMode: () => void;
  refetch: () => Promise<void>;
  lastFetchedAt: Date | null;
}

export function useAqi({
  latitude = 28.6139,
  longitude = 77.209,
  city = "New Delhi",
  initialDemo = false,
}: UseAqiOptions = {}): UseAqiReturn {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(initialDemo);
  const [currentAqi, setCurrentAqi] = useState<AqiCurrentResponse | null>(null);
  const [forecastAqi, setForecastAqi] = useState<AqiForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const demoParam = isDemoMode ? "&demo=true" : "";
      const currentUrl = `/api/aqi/current?latitude=${latitude}&longitude=${longitude}&city=${encodeURIComponent(city)}${demoParam}`;
      const forecastUrl = `/api/aqi/forecast?latitude=${latitude}&longitude=${longitude}&city=${encodeURIComponent(city)}&days=3${demoParam}`;

      const [curRes, fcRes] = await Promise.all([
        fetch(currentUrl),
        fetch(forecastUrl),
      ]);

      if (!curRes.ok) {
        throw new Error(`Current AQI API returned status ${curRes.status}`);
      }

      const curJson = await curRes.json();
      const fcJson = fcRes.ok ? await fcRes.json() : null;

      if (curJson.success && curJson.data) {
        setCurrentAqi(curJson.data);
      } else {
        throw new Error(curJson.error?.message || "Failed to load current AQI");
      }

      if (fcJson && fcJson.success && fcJson.data) {
        setForecastAqi(fcJson.data);
      }

      setLastFetchedAt(new Date());
    } catch (err: unknown) {
      console.error("useAqi fetch failed:", err);
      setIsError(true);
      setErrorMessage((err as Error)?.message || "Failed to fetch air quality data");
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude, city, isDemoMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleDemoMode = useCallback(() => {
    setIsDemoMode((prev) => !prev);
  }, []);

  return {
    currentAqi,
    forecastAqi,
    isLoading,
    isError,
    errorMessage,
    isDemoMode,
    setDemoMode: setIsDemoMode,
    toggleDemoMode,
    refetch: fetchData,
    lastFetchedAt,
  };
}
