"use client";

import * as React from "react";
import { MapPin, Check, ChevronDown, Search } from "lucide-react";
import { useShell, MOCK_LOCATIONS, LocationItem } from "./shell-context";
import { getAqiTheme } from "@/lib/colors";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function LocationSelector({ className }: { className?: string }) {
  const { currentLocation, setCurrentLocation } = useShell();
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredLocations = MOCK_LOCATIONS.filter(
    (loc) =>
      loc.city.toLowerCase().includes(search.toLowerCase()) ||
      loc.area.toLowerCase().includes(search.toLowerCase())
  );

  const currentTheme = getAqiTheme(currentLocation.aqi);

  const handleSelect = (loc: LocationItem) => {
    setCurrentLocation(loc);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "group flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2 text-xs font-bold text-brand-forest-900 border border-brand-forest-700/10 shadow-xs hover:border-brand-mint-300 hover:bg-[#F0FAF5] transition-all",
            className
          )}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-mint-100 text-brand-forest-800">
            <MapPin className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="leading-tight">{currentLocation.area}</span>
            <span className="text-[10px] font-medium text-brand-forest-700/60 leading-none">
              {currentLocation.city}
            </span>
          </div>

          <div
            className="ml-1.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-extrabold"
            style={{
              backgroundColor: currentTheme.pillColor + "25",
              color: currentTheme.category === "good" ? "#175C48" : currentTheme.colorHex,
            }}
          >
            <span>AQI {currentLocation.aqi}</span>
          </div>

          <ChevronDown className="h-3.5 w-3.5 text-brand-forest-700/50 group-hover:text-brand-forest-900 transition-transform group-hover:translate-y-0.5" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle>Select Air Quality Station</DialogTitle>
          <DialogDescription>
            Switch between monitoring stations or your saved family locations.
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative mt-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-forest-700/50" />
          <input
            type="text"
            placeholder="Search city, neighborhood, or station..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-brand-mint-200 bg-[#F7FAF7] py-2.5 pl-10 pr-4 text-xs font-semibold text-brand-forest-900 placeholder:text-brand-forest-700/40 focus:outline-none focus:ring-2 focus:ring-brand-mint"
          />
        </div>

        {/* Locations List */}
        <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredLocations.map((loc) => {
            const isSelected = loc.id === currentLocation.id;
            const theme = getAqiTheme(loc.aqi);

            return (
              <div
                key={loc.id}
                onClick={() => handleSelect(loc)}
                className={cn(
                  "flex items-center justify-between rounded-2xl p-3 border transition-all cursor-pointer",
                  isSelected
                    ? "bg-[#F0FAF5] border-brand-mint-400 shadow-xs"
                    : "bg-white border-brand-forest-700/10 hover:border-brand-mint-200 hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-brand-forest-800">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-brand-forest-900">{loc.area}</span>
                      {loc.isHome && (
                        <span className="rounded bg-brand-cream px-1.5 py-0.2 text-[9px] font-bold text-brand-forest-900 border border-brand-cream-300">
                          HOME
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-brand-forest-700/60">{loc.city}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span
                      className="text-sm font-black"
                      style={{ color: theme.colorHex }}
                    >
                      AQI {loc.aqi}
                    </span>
                    <p className="text-[10px] text-brand-forest-700/60 capitalize">{loc.status}</p>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-brand-forest-800 ml-1 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
