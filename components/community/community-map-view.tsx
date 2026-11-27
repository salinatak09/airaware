"use client";

import * as React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { CommunityReportDto } from "@/types/api";

interface CommunityMapViewProps {
  center: [number, number]; // [lat, lon]
  zoom?: number;
  reports: CommunityReportDto[];
  selectedReport: CommunityReportDto | null;
  onSelectReport: (report: CommunityReportDto) => void;
  userLocation: [number, number];
}

// Controller to smoothly pan the map when center changes
function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.0 });
  }, [center, zoom, map]);
  return null;
}

// Severity color palette
function getSeverityColor(severity: string) {
  switch (severity) {
    case "severe":
      return { bg: "#DC2626", border: "#991B1B", halo: "rgba(220, 38, 38, 0.15)" }; // Crimson
    case "high":
      return { bg: "#EA580C", border: "#C2410C", halo: "rgba(234, 88, 12, 0.15)" }; // Deep Orange
    case "medium":
      return { bg: "#D97706", border: "#B45309", halo: "rgba(217, 119, 6, 0.15)" }; // Amber
    case "low":
    default:
      return { bg: "#10B981", border: "#047857", halo: "rgba(16, 185, 129, 0.15)" }; // Emerald
  }
}

// Create custom hazard marker icon using L.divIcon
function createReportMarkerIcon(report: CommunityReportDto, isSelected: boolean) {
  const { bg, border } = getSeverityColor(report.severity);
  const size = isSelected ? 46 : 38;

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
        background-color: ${bg};
        color: #FFFFFF;
        width: ${size}px;
        height: ${size}px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isSelected ? "20px" : "16px"};
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        border: ${isSelected ? "3px solid #0F172A" : `2px solid ${border}`};
        transition: transform 0.2s;
      ">
        ${report.hazardIcon}
      </div>

      <!-- Moderation / Citizen tag badge -->
      <div style="
        position: absolute;
        bottom: -7px;
        background-color: ${report.moderationStatus === "verified" ? "#065F46" : "#1E293B"};
        color: #FFFFFF;
        padding: 1px 5px;
        border-radius: 4px;
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        white-space: nowrap;
      ">
        ${report.moderationStatus === "verified" ? "VERIFIED" : "CITIZEN"}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "community-report-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// User location marker
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

export function CommunityMapView({
  center,
  zoom = 12,
  reports,
  selectedReport,
  onSelectReport,
  userLocation,
}: CommunityMapViewProps) {
  return (
    <div className="relative w-full h-[500px] sm:h-[600px] rounded-3xl overflow-hidden border-2 border-brand-forest-700/10 shadow-card">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
        style={{ background: "#F1F5F9" }}
      >
        <MapViewController center={center} zoom={zoom} />

        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />

        {/* User Location Marker */}
        <Marker position={userLocation} icon={createUserLocationIcon()}>
          <Popup>
            <div className="text-xs p-1 font-sans">
              <span className="font-bold text-blue-700 block">Your Current Area</span>
              <span className="text-slate-600">Showing neighborhood reports nearby</span>
            </div>
          </Popup>
        </Marker>

        {/* Render Reports with Privacy Zones */}
        {reports.map((report) => {
          // coordinates in GeoJSON are [lon, lat], Leaflet requires [lat, lon]
          const lat = report.coordinates[1];
          const lon = report.coordinates[0];
          const isSelected = selectedReport?.id === report.id;
          const { border, halo } = getSeverityColor(report.severity);

          return (
            <React.Fragment key={report.id}>
              {/* Privacy Halo Circle (~500m radius fuzzed zone) */}
              <Circle
                center={[lat, lon]}
                radius={450}
                pathOptions={{
                  color: isSelected ? "#0F172A" : border,
                  fillColor: halo,
                  fillOpacity: 0.35,
                  weight: isSelected ? 2 : 1,
                  dashArray: "4, 6",
                }}
              />

              {/* Hazard Marker Pin */}
              <Marker
                position={[lat, lon]}
                icon={createReportMarkerIcon(report, isSelected)}
                eventHandlers={{
                  click: () => onSelectReport(report),
                }}
              >
                <Popup>
                  <div className="text-xs p-1.5 font-sans space-y-1 max-w-[200px]">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span>{report.hazardIcon}</span>
                      <span>{report.hazardLabel}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{report.description}</p>
                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100">
                      <span>{report.neighborhood}</span>
                      <span>{report.timeFormatted}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-slate-200 shadow-lg text-xs space-y-2 pointer-events-auto max-w-[230px]">
        <span className="font-bold text-brand-forest-900 block text-[11px] uppercase tracking-wide">
          Community Reports Legend
        </span>
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-600 inline-block" />
            <span className="text-slate-700">Severe Hazard (Burning/Smoke)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-orange-500 inline-block" />
            <span className="text-slate-700">High (Dust/Idling)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-700">Clean Corridor / Safe Path</span>
          </div>
        </div>
        <div className="pt-1.5 border-t border-slate-100 text-[10px] text-slate-500 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-dashed border-slate-400" />
          <span>Fuzzed ~500m zone for privacy</span>
        </div>
      </div>
    </div>
  );
}
