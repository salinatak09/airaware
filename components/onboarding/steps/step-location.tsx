"use client";

import * as React from "react";
import { AeroMascot } from "../aero-mascot";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Navigation,
  Search,
  Check,
  Info,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { OnboardingState } from "@/types/onboarding";
import { cn } from "@/lib/utils";

const POPULAR_CITIES = [
  { city: "New Delhi", area: "Connaught Place", aqi: 142, status: "Sensitive", lat: 28.6139, lon: 77.209 },
  { city: "Mumbai", area: "Bandra West", aqi: 82, status: "Moderate", lat: 19.0596, lon: 72.8295 },
  { city: "Bengaluru", area: "Indiranagar", aqi: 44, status: "Good", lat: 12.9784, lon: 77.6408 },
  { city: "Kolkata", area: "Salt Lake", aqi: 156, status: "Unhealthy", lat: 22.5804, lon: 88.4172 },
  { city: "Lahore", area: "Gulberg III", aqi: 248, status: "Very Unhealthy", lat: 31.5204, lon: 74.3587 },
];

export function StepLocation({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: {
  data: OnboardingState["location"];
  onChange: (location: OnboardingState["location"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const [search, setSearch] = React.useState("");
  const [gpsLoading, setGpsLoading] = React.useState(false);
  const [gpsError, setGpsError] = React.useState<string | null>(null);

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLoading(false);
        onChange({
          city: "Detected Location",
          area: "Local Station (GPS)",
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          method: "gps",
        });
      },
      (error) => {
        setGpsLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError("Permission denied. You can select your city manually below.");
        } else {
          setGpsError("Unable to detect position. Please select manually.");
        }
      },
      { timeout: 8000 }
    );
  };

  const filteredCities = POPULAR_CITIES.filter(
    (c) =>
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.area.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <AeroMascot mood="location" size="md" />
        <h2 className="text-2xl sm:text-3xl font-black text-brand-forest-900">
          Where does your family live?
        </h2>
        <p className="text-xs sm:text-sm text-brand-forest-800/70 max-w-md">
          Air pollution shifts by the kilometer. We link your home to the closest air monitoring station.
        </p>
      </div>

      {/* GPS Detection Button */}
      <div className="space-y-2">
        <Button
          variant="forest"
          onClick={handleUseGps}
          disabled={gpsLoading}
          className="w-full gap-2 font-bold py-3 text-sm shadow-xs"
        >
          {gpsLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          <span>{gpsLoading ? "Detecting nearest station..." : "Use My Current GPS Location"}</span>
        </Button>
        {gpsError && (
          <p className="text-center text-xs font-medium text-amber-800 bg-[#FFFBEA] p-2 rounded-xl border border-brand-yellow-300">
            {gpsError}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-brand-mint-200" />
        <span className="text-[11px] font-bold uppercase text-brand-forest-700/50">Or choose manually</span>
        <div className="h-px flex-1 bg-brand-mint-200" />
      </div>

      {/* Manual City Search & Quick Selection */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-forest-700/50" />
          <input
            type="text"
            placeholder="Search your city or neighborhood..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-brand-mint-200 bg-[#F7FAF7] py-2.5 pl-10 pr-4 text-xs font-semibold text-brand-forest-900 placeholder:text-brand-forest-700/40 focus:outline-none focus:ring-2 focus:ring-brand-mint"
          />
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {filteredCities.map((item) => {
            const isSelected = data.city === item.city && data.area === item.area;

            return (
              <div
                key={`${item.city}-${item.area}`}
                onClick={() =>
                  onChange({
                    city: item.city,
                    area: item.area,
                    coordinates: { latitude: item.lat, longitude: item.lon },
                    method: "manual",
                  })
                }
                className={cn(
                  "flex items-center justify-between rounded-2xl p-3 border transition-all cursor-pointer",
                  isSelected
                    ? "bg-[#F0FAF5] border-brand-mint-400 shadow-xs"
                    : "bg-white border-brand-forest-700/10 hover:border-brand-mint-200 hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-mint-100 text-brand-forest-900">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-brand-forest-900">{item.area}</h5>
                    <p className="text-[10px] text-brand-forest-700/60">{item.city}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase"
                    style={{
                      backgroundColor: item.aqi <= 50 ? "#E0F5EB" : item.aqi <= 100 ? "#FFFBEA" : "#FFF7ED",
                      color: item.aqi <= 50 ? "#175C48" : item.aqi <= 100 ? "#854D0E" : "#9A3412",
                    }}
                  >
                    AQI {item.aqi} • {item.status}
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-brand-forest-800 ml-1 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanatory Privacy Callout */}
      <div className="rounded-2xl bg-[#FFF8E8] p-3.5 border border-brand-cream-300 flex items-start gap-2.5 text-left">
        <Info className="h-4 w-4 text-amber-800 shrink-0 mt-0.5" />
        <div className="text-xs text-brand-forest-900">
          <span className="font-bold block">Why is location needed?</span>
          <span className="text-[11px] text-brand-forest-800/80 leading-snug">
            AirAware exclusively uses your coordinates to connect to the nearest Open-Meteo monitoring station. Your exact live location is never tracked or shared.
          </span>
        </div>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 font-bold">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-bold text-brand-forest-700 hover:underline"
          >
            Skip for now
          </button>

          <Button variant="forest" size="sm" onClick={onNext} className="gap-1.5 font-bold">
            <span>Continue</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
