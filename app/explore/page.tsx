"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { AppShell } from "@/components/layout/app-shell";
import {
  Compass,
  Search,
  List,
  Map as MapIcon,
  ShieldCheck,
  Radio,
  AlertTriangle,
  Navigation,
  ChevronRight,
  Loader2,
  Clock,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageTitle, Subtitle } from "@/components/ui/typography";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { StationDetailsPanel } from "@/components/map/station-details-panel";
import { NearbyComparisonSection } from "@/components/map/nearby-comparison-card";
import type { ExploreMapItem, ExploreMapResponse } from "@/types/api";
import { apiClient } from "@/lib/api-client";

// Dynamically import Leaflet map component with ssr: false to prevent window errors during SSR
const ExploreMapView = dynamic(
  () => import("@/components/map/explore-map-view").then((mod) => mod.ExploreMapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[550px] sm:h-[650px] rounded-3xl bg-slate-100 border-2 border-brand-forest-700/10 flex flex-col items-center justify-center gap-3 text-brand-forest-700">
        <Loader2 className="h-8 w-8 animate-spin text-brand-forest-800" />
        <span className="text-xs font-bold">Loading interactive air quality map & CPCB stations...</span>
      </div>
    ),
  }
);

// Preset search locations for quick exploration
const PRESET_LOCATIONS = [
  { name: "Connaught Place", lat: 28.6364, lon: 77.1993, city: "New Delhi" },
  { name: "Anand Vihar", lat: 28.6469, lon: 77.3153, city: "New Delhi" },
  { name: "Lodhi Road", lat: 28.5893, lon: 77.2215, city: "New Delhi" },
  { name: "R.K. Puram", lat: 28.5632, lon: 77.1869, city: "New Delhi" },
  { name: "Dwarka", lat: 28.585, lon: 77.065, city: "New Delhi" },
  { name: "Noida Sec 62", lat: 28.628, lon: 77.3639, city: "Noida" },
  { name: "Gurugram", lat: 28.4595, lon: 77.0266, city: "Gurugram" },
];

export default function ExplorePage() {
  const { toast } = useToast();

  const [mapData, setMapData] = React.useState<ExploreMapResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  // Active view: map or list
  const [viewMode, setViewMode] = React.useState<"map" | "list">("map");

  // Station type filter: all | ground_station | modeled | community_report
  const [activeFilter, setActiveFilter] = React.useState<"all" | "ground_station" | "modeled" | "community_report">("all");

  // Selected station for details panel
  const [selectedStation, setSelectedStation] = React.useState<ExploreMapItem | null>(null);

  // Current map center & user location
  const [centerCoordinates, setCenterCoordinates] = React.useState<[number, number]>([28.6139, 77.209]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeCityName, setActiveCityName] = React.useState("New Delhi");

  // Fetch explore map data
  const loadMapData = React.useCallback(
    async (lat: number, lon: number, city: string, isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const data = await apiClient.aqi.getNearby({
          latitude: lat,
          longitude: lon,
          city,
        });
        setMapData(data);
        if (!selectedStation && data.stations?.length > 0) {
          setSelectedStation(data.stations[0]);
        }
      } catch (err) {
        console.error("Failed to fetch map data:", err);
        toast({
          type: "error",
          title: "Connection Error",
          message: "Could not load nearby AQI stations.",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedStation, toast]
  );

  React.useEffect(() => {
    loadMapData(centerCoordinates[0], centerCoordinates[1], activeCityName);
  }, [centerCoordinates, activeCityName, loadMapData]);

  // Handle preset location selection
  const handleSelectPreset = (loc: typeof PRESET_LOCATIONS[0]) => {
    setCenterCoordinates([loc.lat, loc.lon]);
    setActiveCityName(loc.city);
    setSearchQuery(loc.name);
    loadMapData(loc.lat, loc.lon, loc.city);
    toast({
      type: "info",
      title: `Map Centered on ${loc.name}`,
      message: `Fetching nearby ground stations and modeled points for ${loc.city}.`,
    });
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const matched = PRESET_LOCATIONS.find((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matched) {
      handleSelectPreset(matched);
    } else {
      // Fallback search: New Delhi center with city update
      setActiveCityName(searchQuery);
      loadMapData(centerCoordinates[0], centerCoordinates[1], searchQuery);
      toast({
        type: "info",
        title: `Searching "${searchQuery}"`,
        message: "Fetching regional air quality network data...",
      });
    }
  };

  // Filter stations based on active filter
  const filteredStations = React.useMemo(() => {
    if (!mapData?.stations) return [];
    if (activeFilter === "all") return mapData.stations;
    return mapData.stations.filter((s) => s.type === activeFilter);
  }, [mapData?.stations, activeFilter]);

  // Select area from nearby comparison
  const handleSelectNearbyArea = (areaId: string) => {
    const station = mapData?.stations.find((s) => s.id === areaId);
    if (station) {
      setSelectedStation(station);
      setCenterCoordinates([station.latitude, station.longitude]);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* ========================================================= */}
        {/* HEADER & CONTROLS */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Badge variant="sky" icon={<Compass className="h-3.5 w-3.5" />}>
              Spatial Air Quality Network
            </Badge>
            <PageTitle className="mt-1">Explore Air Quality Map</PageTitle>
            <Subtitle className="mt-1">
              Live interactive map differentiating official monitoring stations, modeled dispersion points, and community citizen reports.
            </Subtitle>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Map / List View Toggle */}
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                  viewMode === "map"
                    ? "bg-white text-brand-forest-950 shadow-xs"
                    : "text-brand-forest-700 hover:text-brand-forest-950"
                )}
              >
                <MapIcon className="h-3.5 w-3.5" />
                <span>Map View</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                  viewMode === "list"
                    ? "bg-white text-brand-forest-950 shadow-xs"
                    : "text-brand-forest-700 hover:text-brand-forest-950"
                )}
              >
                <List className="h-3.5 w-3.5" />
                <span>List View</span>
              </button>
            </div>

            {/* Locate Me / Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCenterCoordinates([28.6139, 77.209]);
                loadMapData(28.6139, 77.209, "New Delhi", true);
                toast({
                  type: "info",
                  title: "Centered on User Location",
                  message: "Map centered on Central New Delhi.",
                });
              }}
              disabled={refreshing}
              className="gap-1.5 text-xs font-bold"
            >
              <Navigation className="h-3.5 w-3.5 text-brand-forest-800" />
              <span>Locate Me</span>
            </Button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SEARCH BAR & PRESET CHIPS */}
        {/* ========================================================= */}
        <div className="space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <label htmlFor="explore-search-input" className="sr-only">
              Search area, city or station landmark
            </label>
            <Search className="absolute left-4 h-4 w-4 text-slate-400" />
            <input
              id="explore-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search area, city or landmark (e.g. Anand Vihar, Connaught Place, Noida, Gurugram)..."
              className="w-full pl-11 pr-24 py-3 bg-white border-2 border-brand-forest-700/10 rounded-2xl text-xs sm:text-sm font-medium text-brand-forest-950 placeholder:text-slate-400 focus:outline-hidden focus:border-brand-forest-700 transition-colors shadow-xs min-h-[44px]"
            />
            <button
              type="submit"
              aria-label="Submit search"
              className="absolute right-2 px-4 py-2 bg-brand-forest-800 hover:bg-brand-forest-900 text-white rounded-xl text-xs font-bold transition-colors shadow-xs min-h-[38px]"
            >
              Search
            </button>
          </form>

          {/* Quick preset location chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">Popular Areas:</span>
            {PRESET_LOCATIONS.map((loc) => (
              <button
                key={loc.name}
                type="button"
                onClick={() => handleSelectPreset(loc)}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-mint-50/80 text-brand-forest-800 text-[11px] font-semibold border border-slate-200 transition-colors min-h-[36px]"
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* PROVENANCE TRANSPARENCY NOTICE */}
        {/* ========================================================= */}
        <div className="rounded-2xl border-2 border-brand-mint-300 bg-brand-mint-50/50 p-4 flex items-start gap-3 text-xs text-brand-forest-900 leading-relaxed">
          <Info className="h-4 w-4 text-brand-forest-800 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-brand-forest-950">Data Provenance Standard: </span>
            AirAware strictly differentiates <strong>Official Monitoring Stations</strong> (CPCB/DPCC physical ground sensors) from <strong>Modeled Dispersion Locations</strong> (Open-Meteo mathematical grid points) and <strong>Community Reports</strong>. Modeled locations provide spatial coverage but are never represented as official ground sensors.
          </div>
        </div>

        {/* ========================================================= */}
        {/* FILTER BUTTONS & STATION STATS */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={cn(
                "px-3 py-1.5 rounded-xl border transition-all shrink-0",
                activeFilter === "all"
                  ? "bg-brand-forest-800 text-white border-brand-forest-800 shadow-xs"
                  : "bg-white text-brand-forest-800 border-slate-200 hover:border-brand-forest-700/30"
              )}
            >
              All Locations ({mapData?.stats.totalLocations || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("ground_station")}
              className={cn(
                "px-3 py-1.5 rounded-xl border transition-all shrink-0 flex items-center gap-1.5",
                activeFilter === "ground_station"
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                  : "bg-white text-emerald-900 border-slate-200 hover:border-emerald-300"
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Official CPCB ({mapData?.stats.officialStationsCount || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("modeled")}
              className={cn(
                "px-3 py-1.5 rounded-xl border transition-all shrink-0 flex items-center gap-1.5",
                activeFilter === "modeled"
                  ? "bg-purple-700 text-white border-purple-700 shadow-xs"
                  : "bg-white text-purple-900 border-slate-200 hover:border-purple-300"
              )}
            >
              <Radio className="h-3.5 w-3.5" />
              <span>Modeled Grid ({mapData?.stats.modeledLocationsCount || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("community_report")}
              className={cn(
                "px-3 py-1.5 rounded-xl border transition-all shrink-0 flex items-center gap-1.5",
                activeFilter === "community_report"
                  ? "bg-amber-700 text-white border-amber-700 shadow-xs"
                  : "bg-white text-amber-900 border-slate-200 hover:border-amber-300"
              )}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Citizen Reports ({mapData?.stats.communityReportsCount || 0})</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-semibold self-start sm:self-auto">
            Showing {filteredStations.length} verified data points
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN DISPLAY: MAP VIEW OR LIST VIEW */}
        {/* ========================================================= */}
        <div className="relative">
          {viewMode === "map" ? (
            <div className="relative flex flex-col lg:flex-row gap-6 items-start">
              {/* Map Canvas */}
              <div className="flex-1 w-full">
                <ExploreMapView
                  center={centerCoordinates}
                  zoom={12}
                  stations={filteredStations}
                  selectedStation={selectedStation}
                  onSelectStation={(st) => setSelectedStation(st)}
                  userLocation={[28.6139, 77.209]}
                />
              </div>

              {/* Station Details Panel (Desktop side pane / Mobile bottom drawer) */}
              {selectedStation && (
                <div className="w-full lg:w-96 shrink-0">
                  <StationDetailsPanel
                    station={selectedStation}
                    onClose={() => setSelectedStation(null)}
                    onUpvoteCommunityReport={(id) => {
                      toast({
                        type: "success",
                        title: "Citizen Report Confirmed",
                        message: "Thank you for confirming this localized smoke sighting.",
                      });
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            /* List View */
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStations.map((st) => {
                const isSelected = selectedStation?.id === st.id;
                const isOfficial = st.type === "ground_station";
                const isModeled = st.type === "modeled";

                return (
                  <Card
                    key={st.id}
                    onClick={() => {
                      setSelectedStation(st);
                      setViewMode("map");
                      setCenterCoordinates([st.latitude, st.longitude]);
                    }}
                    className={cn(
                      "cursor-pointer p-5 border-2 transition-all duration-200 flex flex-col justify-between shadow-card hover:border-brand-forest-700/40 select-none",
                      isSelected
                        ? "border-brand-forest-800 bg-brand-mint-50/40"
                        : "border-brand-forest-700/10 bg-white"
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isOfficial ? (
                              <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[9px] font-black uppercase flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" /> CPCB Official
                              </span>
                            ) : isModeled ? (
                              <span className="rounded-full bg-purple-100 text-purple-800 px-2 py-0.5 text-[9px] font-black uppercase flex items-center gap-1">
                                <Radio className="h-3 w-3" /> Modeled Grid
                              </span>
                            ) : (
                              <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[9px] font-black uppercase flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> Citizen Report
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {st.distanceKm} km away
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-brand-forest-950 leading-snug">
                            {st.name}
                          </h4>
                        </div>

                        {/* AQI Pill */}
                        <div
                          className="h-11 w-11 rounded-full flex flex-col items-center justify-center text-white font-black text-sm shadow-xs shrink-0"
                          style={{ backgroundColor: st.color }}
                        >
                          {st.aqi}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-500 font-semibold block">PM2.5:</span>
                          <span className="font-black text-brand-forest-950 text-xs">
                            {st.pollutants.pm25} µg/m³
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-500 font-semibold block">PM10:</span>
                          <span className="font-black text-brand-forest-950 text-xs">
                            {st.pollutants.pm10} µg/m³
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {st.healthAdvisory.summary}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-brand-forest-700/5 flex items-center justify-between text-xs font-bold text-brand-forest-800">
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {st.dataAge}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-brand-forest-900 group-hover:text-brand-forest-700">
                        View on Map <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* NEARBY AREAS COMPARISON SECTION */}
        {/* ========================================================= */}
        <section className="pt-4 border-t border-brand-forest-700/10">
          <NearbyComparisonSection
            areas={mapData?.nearbyAreasComparison || []}
            onSelectArea={handleSelectNearbyArea}
            selectedAreaId={selectedStation?.id}
          />
        </section>
      </div>
    </AppShell>
  );
}
