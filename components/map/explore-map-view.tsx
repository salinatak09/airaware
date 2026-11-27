"use client";

import * as React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ExploreMapItem } from "@/types/api";

interface ExploreMapViewProps {
  center: [number, number];
  zoom?: number;
  stations: ExploreMapItem[];
  selectedStation: ExploreMapItem | null;
  onSelectStation: (station: ExploreMapItem) => void;
  userLocation: [number, number];
}

// Controller to smoothly pan the map when center changes
function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// Create custom colored AQI marker using L.divIcon
function createAqiMarkerIcon(station: ExploreMapItem, isSelected: boolean) {
  const isOfficial = station.type === "ground_station";
  const isModeled = station.type === "modeled";
  const isCommunity = station.type === "community_report";

  const size = isSelected ? 48 : 40;
  const borderColor = isSelected ? "#0F172A" : "#FFFFFF";
  const borderWidth = isSelected ? "3px" : "2px";

  const typeIconSvg = isOfficial
    ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="inline"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
    : isModeled
    ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="inline"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>`
    : `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="inline"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

  const html = `
    <div style="
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transform: translate(-50%, -50%);
    ">
      <div style="
        background-color: ${station.color};
        color: #FFFFFF;
        width: ${size}px;
        height: ${size}px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: ${isSelected ? "14px" : "12px"};
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2);
        border: ${borderWidth} solid ${borderColor};
        transition: transform 0.2s;
      ">
        ${station.aqi}
      </div>

      <!-- Small type indicator badge -->
      <div style="
        position: absolute;
        bottom: -6px;
        background-color: ${isOfficial ? "#175C48" : isModeled ? "#6B21A8" : "#9A3412"};
        color: #FFFFFF;
        padding: 1px 4px;
        border-radius: 4px;
        font-size: 8px;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 2px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        white-space: nowrap;
      ">
        ${typeIconSvg}
        <span>${isOfficial ? "CPCB" : isModeled ? "MODEL" : "REPORT"}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "aqi-custom-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// User location pulsating marker icon
function createUserLocationIcon() {
  const html = `
    <div style="
      position: relative;
      width: 24px;
      height: 24px;
      transform: translate(-50%, -50%);
    ">
      <div style="
        position: absolute;
        inset: -6px;
        border-radius: 9999px;
        background-color: rgba(37, 99, 235, 0.35);
        animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 9999px;
        background-color: #2563EB;
        border: 3px solid #FFFFFF;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "user-loc-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export function ExploreMapView({
  center,
  zoom = 12,
  stations,
  selectedStation,
  onSelectStation,
  userLocation,
}: ExploreMapViewProps) {
  const [currentZoom, setCurrentZoom] = React.useState(zoom);

  return (
    <div className="relative w-full h-[380px] sm:h-[500px] lg:h-[650px] rounded-3xl overflow-hidden border-2 border-brand-forest-700/10 shadow-card z-0 min-w-0">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
        style={{ minHeight: "100%", width: "100%" }}
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />

        {/* Map Controller */}
        <MapViewController center={center} zoom={currentZoom} />

        {/* User Location Radar Marker */}
        <Marker position={userLocation} icon={createUserLocationIcon()}>
          <Popup>
            <div className="p-1 text-center font-bold text-xs text-brand-forest-900">
              📍 Your Current Location
            </div>
          </Popup>
        </Marker>

        {/* Stations & Reports Markers */}
        {stations.map((st) => {
          const isSelected = selectedStation?.id === st.id;
          const markerIcon = createAqiMarkerIcon(st, isSelected);

          return (
            <Marker
              key={st.id}
              position={[st.latitude, st.longitude]}
              icon={markerIcon}
              eventHandlers={{
                click: () => onSelectStation(st),
              }}
            >
              <Popup>
                <div className="p-2 space-y-1.5 text-xs text-brand-forest-900 min-w-[160px]">
                  <div className="font-black text-sm">{st.name}</div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-black text-white"
                      style={{ backgroundColor: st.color }}
                    >
                      AQI {st.aqi}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {st.categoryLabel}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    PM2.5: <strong>{st.pollutants.pm25} µg/m³</strong>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Source: {st.sourceName}
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectStation(st)}
                    className="w-full mt-1.5 bg-brand-forest-800 text-white rounded-lg py-1 font-bold text-[10px] hover:bg-brand-forest-900 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-slate-200/80 shadow-card text-[11px] text-brand-forest-900 space-y-2 pointer-events-auto max-w-[220px]">
        <span className="font-black text-[10px] uppercase tracking-wider block text-slate-500">
          Map Legend & Verification
        </span>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-600 border border-white shrink-0" />
            <span className="font-semibold text-emerald-950">Official CPCB Ground</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-purple-600 border border-white shrink-0" />
            <span className="font-semibold text-purple-950">Modeled Grid Point</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-600 border border-white shrink-0" />
            <span className="font-semibold text-amber-950">Citizen Community Report</span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ExploreMapView;
