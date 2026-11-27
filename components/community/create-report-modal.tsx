"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  Flame,
  AlertTriangle,
  Camera,
  X,
  MapPin,
  Clock,
  ShieldCheck,
  Loader2,
  Sparkles,
  CheckCircle2,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HAZARD_METADATA, type CommunityReportType } from "@/lib/community-constants";

interface CreateReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportCreated: () => void;
  currentCity?: string;
  currentNeighborhood?: string;
}

export function CreateReportModal({
  open,
  onOpenChange,
  onReportCreated,
  currentCity = "New Delhi",
  currentNeighborhood = "Lajpat Nagar IV",
}: CreateReportModalProps) {
  const { toast } = useToast();

  const [step, setStep] = React.useState<"form" | "confirm">("form");
  const [submitting, setSubmitting] = React.useState(false);

  // Form State
  const [reportType, setReportType] = React.useState<CommunityReportType>("garbage_burning");
  const [severity, setSeverity] = React.useState<"low" | "medium" | "high" | "severe">("severe");
  const [city, setCity] = React.useState(currentCity);
  const [area, setArea] = React.useState(currentNeighborhood);
  const [landmark, setLandmark] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [observedTime, setObservedTime] = React.useState("Just now");
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);

  // Sync props when opening
  React.useEffect(() => {
    if (open) {
      setCity(currentCity);
      setArea(currentNeighborhood);
      setStep("form");
    }
  }, [open, currentCity, currentNeighborhood]);

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast({
        type: "error",
        title: "Photo Too Large",
        message: "Please choose an image under 4MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    if (!area.trim()) {
      toast({ type: "error", title: "Missing Neighborhood", message: "Please specify the neighborhood/area." });
      return false;
    }
    if (!description.trim() || description.trim().length < 10) {
      toast({
        type: "error",
        title: "Detailed Description Required",
        message: "Please describe the hazard observation with at least 10 characters.",
      });
      return false;
    }
    return true;
  };

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep("confirm");
    }
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          area,
          landmark: landmark || undefined,
          rawAddress: landmark || `Near ${area}`,
          reportType,
          description,
          severity,
          imageReference: photoPreview || undefined,
          observedTime: new Date().toISOString(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to submit report");
      }

      toast({
        type: "success",
        title: `Report Submitted (+${json.data?.xpAwarded || 25} XP!)`,
        message: "Your observation is live on the neighborhood map with fuzzed coordinates.",
      });

      // Reset and close
      setDescription("");
      setLandmark("");
      setPhotoPreview(null);
      setStep("form");
      onOpenChange(false);
      onReportCreated();
    } catch (err: any) {
      toast({
        type: "error",
        title: "Submission Error",
        message: err.message || "Unable to save report. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMeta = HAZARD_METADATA[reportType] || HAZARD_METADATA.other;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="yellow" icon={<Sparkles className="h-3 w-3 fill-amber-600 text-amber-600" />}>
              Earn +25 XP
            </Badge>
            <Badge variant="mint" icon={<ShieldCheck className="h-3 w-3 text-brand-mint-800" />}>
              Privacy Fuzzed (~500m)
            </Badge>
          </div>
          <DialogTitle className="text-xl font-black text-brand-forest-900 mt-2">
            {step === "form" ? "Report Neighborhood Air Hazard" : "Confirm Citizen Report"}
          </DialogTitle>
          <DialogDescription className="text-xs text-brand-forest-700/80">
            {step === "form"
              ? "Alert nearby families, schools, and civic monitors about temporary localized smoke or dust spikes."
              : "Review how your observation will appear to neighboring families."}
          </DialogDescription>
        </DialogHeader>

        {step === "form" ? (
          <form onSubmit={handleProceedToConfirm} className="space-y-5 pt-3">
            {/* Category Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-forest-900 block">
                Select Pollution Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(
                  [
                    "garbage_burning",
                    "construction_dust",
                    "industrial_smoke",
                    "heavy_traffic",
                    "crop_residue",
                    "unusual_pollution",
                    "clean_corridor",
                  ] as CommunityReportType[]
                ).map((cat) => {
                  const meta = HAZARD_METADATA[cat];
                  const isSelected = reportType === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setReportType(cat);
                        setSeverity(meta.defaultSeverity);
                      }}
                      className={cn(
                        "p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all text-xs font-semibold",
                        isSelected
                          ? "bg-amber-50 border-amber-400 text-brand-forest-950 shadow-xs ring-1 ring-amber-400"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <span className="text-lg">{meta.icon}</span>
                      <span className="truncate text-[11px]">{meta.label.split("&")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Severity Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-forest-900 block">
                Observed Severity
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["low", "medium", "high", "severe"] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={cn(
                      "py-1.5 px-2 rounded-xl text-xs font-bold capitalize transition-all border",
                      severity === sev
                        ? sev === "severe"
                          ? "bg-red-600 text-white border-red-700"
                          : sev === "high"
                          ? "bg-orange-500 text-white border-orange-600"
                          : sev === "medium"
                          ? "bg-amber-500 text-white border-amber-600"
                          : "bg-emerald-600 text-white border-emerald-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Approximate Location Inputs */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#F7FAF7] border border-brand-mint-200">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-forest-900">
                <MapPin className="h-4 w-4 text-brand-forest-700" />
                <span>Approximate Neighborhood Location</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="report-city" className="text-[11px] font-semibold text-brand-forest-800 block mb-1">
                    City
                  </label>
                  <input
                    id="report-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-forest-800 min-h-[40px]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="report-area" className="text-[11px] font-semibold text-brand-forest-800 block mb-1">
                    Neighborhood / Colony
                  </label>
                  <input
                    id="report-area"
                    type="text"
                    placeholder="e.g. Lajpat Nagar IV"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-forest-800 min-h-[40px]"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="report-landmark" className="text-[11px] font-semibold text-brand-forest-800 block mb-1">
                  Public Landmark / Crossroad
                </label>
                <input
                  id="report-landmark"
                  type="text"
                  placeholder="e.g. Near Metro Pillar 142 or Central Market Gate"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-forest-800 min-h-[40px]"
                />
                <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  <span>Privacy guarantee: Do not enter private flat/house numbers.</span>
                </p>
              </div>
            </div>

            {/* Time of Observation */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-forest-900 block flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span>Time Observed</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Just now", "Past 30 mins", "Past 1-2 hours"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setObservedTime(t)}
                    className={cn(
                      "py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center",
                      observedTime === t
                        ? "bg-brand-forest-900 text-white border-brand-forest-900"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="report-desc" className="text-xs font-bold text-brand-forest-900 block">
                Observation Description *
              </label>
              <textarea
                id="report-desc"
                rows={3}
                placeholder="Describe what you see or smell (e.g. dry leaves being burned in open plot, cement dust from uncovered tipper truck, continuous diesel exhaust)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-forest-800"
                required
              />
              <span className="text-[10px] text-slate-400 block text-right">
                {description.length} / 1000 characters
              </span>
            </div>

            {/* Optional Photo Upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-forest-900 block flex items-center justify-between">
                <span>Optional Photo Upload</span>
                <span className="text-[10px] text-slate-400 font-normal">Max 4MB (JPG, PNG)</span>
              </label>

              {photoPreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-32 bg-slate-50">
                  <img src={photoPreview} alt="Hazard preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full hover:bg-black"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <Camera className="h-6 w-6 text-slate-400" />
                  <span className="text-xs font-bold text-brand-forest-800 mt-1">Tap to attach photo</span>
                  <span className="text-[10px] text-slate-400">Helps municipal teams verify open burning</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Footer Submit */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="forest" className="font-bold">
                Review & Confirm
              </Button>
            </div>
          </form>
        ) : (
          /* Confirmation Step */
          <div className="space-y-5 pt-3">
            <div className="rounded-2xl bg-amber-50/70 border border-amber-300 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedMeta.icon}</span>
                  <div>
                    <h4 className="text-sm font-bold text-brand-forest-900">{selectedMeta.label}</h4>
                    <p className="text-[11px] text-slate-600">Severity: <span className="font-bold capitalize">{severity}</span></p>
                  </div>
                </div>
                <Badge variant="yellow">Citizen Report</Badge>
              </div>

              <div className="p-3 bg-white/90 rounded-xl border border-amber-200 text-xs space-y-1.5">
                <p className="font-medium text-slate-800">{description}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  <span>{landmark ? `Near ${landmark}, ${area}` : `Near ${area}`}, {city}</span>
                </div>
              </div>

              {photoPreview && (
                <div className="h-24 rounded-xl overflow-hidden border border-slate-200">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Transparency Notice */}
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Your report will be displayed with <strong>fuzzed coordinates (~500m radius)</strong>. It will be marked as an unverified citizen observation until confirmed by 3+ neighbors.
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setStep("form")} disabled={submitting}>
                Back to Edit
              </Button>

              <Button
                type="button"
                variant="forest"
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="gap-2 font-bold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Publish Report (+25 XP)
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
