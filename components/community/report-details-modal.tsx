"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  MapPin,
  Clock,
  ThumbsUp,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Check,
  CheckCircle2,
  Flag,
  Share2,
  Info,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommunityReportDto } from "@/types/api";

interface ReportDetailsModalProps {
  report: CommunityReportDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportUpdated?: () => void;
}

export function ReportDetailsModal({
  report,
  open,
  onOpenChange,
  onReportUpdated,
}: ReportDetailsModalProps) {
  const { toast } = useToast();

  const [upvotes, setUpvotes] = React.useState(report?.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = React.useState(false);
  const [upvoting, setUpvoting] = React.useState(false);

  const [flagsCount, setFlagsCount] = React.useState(report?.flagsCount || 0);
  const [hasFlagged, setHasFlagged] = React.useState(false);
  const [flagging, setFlagging] = React.useState(false);

  React.useEffect(() => {
    if (report) {
      setUpvotes(report.upvotes);
      setFlagsCount(report.flagsCount);
      setHasUpvoted(false);
      setHasFlagged(false);
    }
  }, [report]);

  if (!report) return null;

  const handleUpvote = async () => {
    if (hasUpvoted) return;
    setUpvoting(true);
    try {
      const res = await fetch(`/api/community/reports/${report.id}/upvote`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to confirm report");

      setUpvotes(json.data?.upvotes || upvotes + 1);
      setHasUpvoted(true);
      toast({
        type: "success",
        title: "Report Confirmed",
        message: "Thank you for validating this local observation with your neighbors!",
      });
      onReportUpdated?.();
    } catch (err: any) {
      toast({
        type: "error",
        title: "Action Failed",
        message: err.message || "Unable to confirm report.",
      });
    } finally {
      setUpvoting(false);
    }
  };

  const handleFlag = async () => {
    if (hasFlagged) return;
    setFlagging(true);
    try {
      const res = await fetch(`/api/community/reports/${report.id}/flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "inaccurate_or_expired" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to flag report");

      setFlagsCount(json.data?.flagsCount || flagsCount + 1);
      setHasFlagged(true);
      toast({
        type: "info",
        title: "Report Flagged for Review",
        message: "Our neighborhood moderation system prioritizes verified local accuracy.",
      });
      onReportUpdated?.();
    } catch (err: any) {
      toast({
        type: "error",
        title: "Action Failed",
        message: err.message || "Unable to flag report.",
      });
    } finally {
      setFlagging(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(
      `⚠️ AirAware Citizen Report: ${report.hazardLabel} observed near ${report.approximateLocation}. Avoid open air exercise in this vicinity.`
    );
    toast({
      type: "success",
      title: "Hazard Notice Copied",
      message: "Ready to share with your family or neighborhood WhatsApp group.",
    });
  };

  const isVerified = report.moderationStatus === "verified";
  const isSevere = report.severity === "severe" || report.severity === "high";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 sm:p-7 max-h-[90vh] overflow-y-auto space-y-4">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-[10px] font-black uppercase px-2 py-0.5 rounded-md",
                  isVerified ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
                )}
              >
                {isVerified ? "✓ Verified Citizen Report" : "Pending Community Review"}
              </span>

              <span
                className={cn(
                  "text-[10px] font-black uppercase px-2 py-0.5 rounded-md",
                  report.severity === "severe"
                    ? "bg-red-100 text-red-900"
                    : report.severity === "high"
                    ? "bg-orange-100 text-orange-900"
                    : "bg-amber-100 text-amber-900"
                )}
              >
                {report.severity} severity
              </span>
            </div>

            <Button variant="ghost" size="sm" onClick={handleShare} className="h-8 gap-1.5 text-xs font-semibold">
              <Share2 className="h-3.5 w-3.5" /> Share
            </Button>
          </div>

          <DialogTitle className="text-xl font-black text-brand-forest-900 flex items-center gap-2.5 mt-2">
            <span className="text-2xl">{report.hazardIcon}</span>
            <span>{report.hazardLabel}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Data Provenance & Safety Disclaimer Banner */}
        <div className="rounded-2xl bg-amber-50/80 border border-amber-300 p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Citizen Environmental Observation: </span>
            {report.disclaimer}
          </div>
        </div>

        {/* Approximate Location & Privacy */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <MapPin className="h-4 w-4 text-brand-forest-700" />
              <span>{report.approximateLocation}</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-500">{report.city}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" /> Fuzzed coordinates (~500m area)
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="h-3 w-3" /> {report.timeFormatted}
            </span>
          </div>
        </div>

        {/* Full Description */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-brand-forest-900 uppercase tracking-wider">
            Reporter Observation
          </h4>
          <p className="text-sm text-slate-800 leading-relaxed bg-white p-3.5 rounded-2xl border border-slate-200">
            {report.description}
          </p>
        </div>

        {/* Attached Photo (if any) */}
        {report.imageReference && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-brand-forest-900 uppercase tracking-wider">
              Citizen Photo Evidence
            </h4>
            <div className="rounded-2xl overflow-hidden border border-slate-200 h-52 bg-slate-100">
              <img
                src={report.imageReference}
                alt={report.hazardLabel}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Reporter Info */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div>
            <span className="font-bold text-slate-800">{report.authorName}</span>
            <span className="text-[11px] text-slate-500 block">{report.authorRole}</span>
          </div>
          <span className="text-[11px] text-slate-400">Observed {report.timeFormatted}</span>
        </div>

        {/* Community Confirmation & Flagging Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant={hasUpvoted ? "outline" : "forest"}
            onClick={handleUpvote}
            disabled={hasUpvoted || upvoting}
            className="flex-1 font-bold gap-2 text-xs"
          >
            {upvoting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : hasUpvoted ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" /> Confirmed ({upvotes})
              </>
            ) : (
              <>
                <ThumbsUp className="h-4 w-4" /> Confirm This Hazard ({upvotes})
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={handleFlag}
            disabled={hasFlagged || flagging}
            className="text-xs text-slate-500 hover:text-red-700 hover:bg-red-50 gap-1.5"
          >
            <Flag className="h-3.5 w-3.5" />
            <span>{hasFlagged ? "Flagged" : "Report Inaccurate"}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
