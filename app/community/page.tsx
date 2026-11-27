"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { AppShell } from "@/components/layout/app-shell";
import { useShell } from "@/components/layout/shell-context";
import {
  Users,
  AlertTriangle,
  MapPin,
  ThumbsUp,
  Search,
  Flame,
  Plus,
  RefreshCw,
  Clock,
  ShieldCheck,
  Calendar,
  Sparkles,
  Zap,
  Check,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageTitle, SectionTitle, Subtitle } from "@/components/ui/typography";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useToast } from "@/components/ui/toast";
import { AeroMascot } from "@/components/onboarding/aero-mascot";
import { cn } from "@/lib/utils";
import { CreateReportModal } from "@/components/community/create-report-modal";
import { ReportDetailsModal } from "@/components/community/report-details-modal";
import type {
  CommunityReportDto,
  CommunityChallengeItem,
  NeighborhoodActivityItem,
} from "@/types/api";
import type { CommunityReportType } from "@/lib/community-constants";
import { apiClient } from "@/lib/api-client";

// Dynamically import Leaflet Map with ssr: false
const CommunityMapView = dynamic(
  () => import("@/components/community/community-map-view").then((mod) => mod.CommunityMapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] sm:h-[600px] rounded-3xl bg-slate-100 border-2 border-brand-forest-700/10 flex flex-col items-center justify-center gap-3 text-brand-forest-700">
        <Loader2 className="h-8 w-8 animate-spin text-brand-forest-800" />
        <span className="text-xs font-bold">Loading interactive neighborhood air map...</span>
      </div>
    ),
  }
);

export default function CommunityPage() {
  const { currentLocation } = useShell();
  const { toast } = useToast();

  const [reports, setReports] = React.useState<CommunityReportDto[]>([]);
  const [challenges, setChallenges] = React.useState<CommunityChallengeItem[]>([]);
  const [activities, setActivities] = React.useState<NeighborhoodActivityItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  // View Mode: map | feed | challenges
  const [activeTab, setActiveTab] = React.useState<"map" | "feed" | "challenges">("map");

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");

  // Modals
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [selectedReport, setSelectedReport] = React.useState<CommunityReportDto | null>(null);

  // Action pending states
  const [joiningChallengeId, setJoiningChallengeId] = React.useState<string | null>(null);
  const [togglingActivityId, setTogglingActivityId] = React.useState<string | null>(null);

  // Fetch Reports
  const fetchReports = React.useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await apiClient.community.getReports({
        city: currentLocation?.city,
        category: selectedCategory,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
      });
      setReports(data || []);
    } catch (err: any) {
      console.error("Error loading community reports:", err);
      toast({
        type: "error",
        title: "Unable to load reports",
        message: err.message || "Please check connection and retry.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentLocation?.city, selectedCategory, selectedStatus, toast]);

  // Fetch Challenges & Activities
  const fetchChallengesAndActivities = React.useCallback(async () => {
    try {
      const data: any = await apiClient.community.getChallenges();
      if (Array.isArray(data)) {
        setChallenges(data);
      } else if (data?.challenges) {
        setChallenges(data.challenges);
        setActivities(data.awarenessActivities || []);
      }
    } catch (err) {
      console.warn("Challenges fetch error:", err);
    }
  }, []);

  React.useEffect(() => {
    fetchReports();
    fetchChallengesAndActivities();
  }, [fetchReports, fetchChallengesAndActivities]);

  // Handle Joining a Community Challenge
  const handleJoinChallenge = async (challengeId: string) => {
    setJoiningChallengeId(challengeId);
    try {
      const res = await fetch("/api/community/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join_challenge", targetId: challengeId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to pledge challenge");

      toast({
        type: "success",
        title: `Pledge Recorded (+${json.data?.xpAwarded || 25} XP!)`,
        message: "You have joined this community air defense goal.",
      });

      // Update challenge state locally
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === challengeId
            ? {
                ...c,
                isJoined: true,
                participantsCount: c.participantsCount + 1,
                currentProgress: c.currentProgress + 1,
                progressPercent: Math.min(100, Math.round(((c.currentProgress + 1) / c.targetProgress) * 100)),
              }
            : c
        )
      );
    } catch (err: any) {
      toast({
        type: "error",
        title: "Action Failed",
        message: err.message || "Unable to join challenge.",
      });
    } finally {
      setJoiningChallengeId(null);
    }
  };

  // Handle RSVP to an activity
  const handleToggleActivityRsvp = async (activityId: string) => {
    setTogglingActivityId(activityId);
    try {
      const res = await fetch("/api/community/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_activity", targetId: activityId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update RSVP");

      toast({
        type: "success",
        title: json.data?.isAttending ? "RSVP Confirmed!" : "RSVP Cancelled",
        message: json.message || "Your attendance status has been updated.",
      });

      setActivities((prev) =>
        prev.map((a) =>
          a.id === activityId
            ? {
                ...a,
                isAttending: json.data?.isAttending,
                attendeesCount: json.data?.attendeesCount,
              }
            : a
        )
      );
    } catch (err: any) {
      toast({
        type: "error",
        title: "RSVP Error",
        message: err.message || "Unable to update RSVP.",
      });
    } finally {
      setTogglingActivityId(null);
    }
  };

  // Filtered reports by search query
  const filteredReports = reports.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.neighborhood.toLowerCase().includes(q) ||
      r.hazardLabel.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.approximateLocation.toLowerCase().includes(q)
    );
  });

  const centerCoords: [number, number] = [28.6139, 77.209]; // New Delhi center [lat, lon]

  return (
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="mint" icon={<Users className="h-3.5 w-3.5" />}>
                Neighborhood Clean Air Network
              </Badge>
              <Badge variant="yellow" icon={<ShieldCheck className="h-3.5 w-3.5 text-amber-800" />}>
                Approximate Privacy Fuzzed
              </Badge>
            </div>
            <PageTitle className="mt-2">Community Pollution Hub</PageTitle>
            <Subtitle className="mt-1">
              Report local smoke, construction dust, and traffic bottlenecks in {currentLocation.city}.
            </Subtitle>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchReports(true)}
              disabled={refreshing}
              className="gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
              <span>Refresh</span>
            </Button>

            <Button
              variant="forest"
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              className="gap-2 font-bold shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Report Local Pollution (+25 XP)</span>
            </Button>
          </div>
        </div>

        {/* Scientific Integrity & Privacy Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-[#FFFBEA] via-[#FFF8E8] to-[#F0FAF5] p-5 sm:p-6 border-2 border-brand-yellow-300 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="text-2xl mt-0.5">🛡️</span>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-brand-forest-900">
                Citizen Science & Privacy Guarantee
              </h3>
              <p className="text-xs text-brand-forest-800/80 leading-relaxed max-w-3xl">
                To protect family privacy, exact residential coordinates are never exposed—reports are automatically fuzzed to a ~500m neighborhood radius. Community reports represent citizen observations and are strictly labeled as distinct from official CPCB monitoring stations.
              </p>
            </div>
          </div>

          <Button
            variant="peach"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="shrink-0 text-xs font-bold gap-1.5"
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Submit Hazard Report</span>
          </Button>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-brand-forest-700/10 pb-2 overflow-x-auto">
          {[
            { id: "map", label: "Live Hazard Map", icon: MapPin },
            { id: "feed", label: `Nearby Reports (${filteredReports.length})`, icon: AlertTriangle },
            { id: "challenges", label: `Challenges & Walks (${challenges.length})`, icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap",
                  isActive
                    ? "bg-brand-forest-900 text-white shadow-xs"
                    : "text-brand-forest-700 hover:bg-brand-forest-50 hover:text-brand-forest-900"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-brand-forest-700/10 shadow-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by neighborhood, crossroad, or hazard (e.g. Lajpat Nagar, waste burning)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-mint"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "All Hazards" },
              { id: "garbage_burning", label: "🔥 Burning" },
              { id: "construction_dust", label: "🏗️ Dust" },
              { id: "heavy_traffic", label: "🚗 Traffic" },
              { id: "industrial_smoke", label: "🏭 Smoke" },
              { id: "clean_corridor", label: "🍃 Clean Paths" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                  selectedCategory === cat.id
                    ? "bg-brand-forest-900 text-white border-brand-forest-900 shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: LIVE MAP VIEW */}
        {activeTab === "map" && (
          <div className="space-y-6">
            <CommunityMapView
              center={centerCoords}
              zoom={12}
              reports={filteredReports}
              selectedReport={selectedReport}
              onSelectReport={(rep) => setSelectedReport(rep)}
              userLocation={centerCoords}
            />

            {/* Quick Summary Bar Under Map */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="p-4 bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Active Neighborhood Reports</span>
                  <p className="text-xl font-black text-brand-forest-900">{reports.length} Incidents</p>
                </div>
                <span className="text-2xl">📡</span>
              </Card>

              <Card className="p-4 bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Community Verified</span>
                  <p className="text-xl font-black text-emerald-700">
                    {reports.filter((r) => r.moderationStatus === "verified").length} Reports
                  </p>
                </div>
                <span className="text-2xl">✓</span>
              </Card>

              <Card className="p-4 bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Privacy Radius</span>
                  <p className="text-xl font-black text-amber-700">~500m Fuzzed</p>
                </div>
                <span className="text-2xl">🛡️</span>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: REPORTS FEED LIST */}
        {(activeTab === "feed" || activeTab === "map") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <SectionTitle>Nearby Citizen Reports</SectionTitle>
                <p className="text-xs text-brand-forest-700/80">
                  Real-time parent observations, school sensor reports, and verified pollution warnings.
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-500">
                Showing {filteredReports.length} reports
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-500 rounded-3xl bg-white border">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-forest-700" />
                Loading community reports...
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 rounded-3xl bg-white border space-y-2">
                <p className="text-sm font-bold text-slate-700">No reports found matching your filter.</p>
                <p className="text-slate-400">Be the first to alert neighbors about local smoke or construction dust!</p>
                <Button
                  variant="forest"
                  size="sm"
                  onClick={() => setCreateModalOpen(true)}
                  className="mt-2 text-xs font-bold"
                >
                  Create First Report (+25 XP)
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredReports.map((report) => {
                  const isVerified = report.moderationStatus === "verified";
                  const isSevere = report.severity === "severe" || report.severity === "high";

                  return (
                    <Card
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={cn(
                        "p-5 border-2 transition-all cursor-pointer hover:shadow-card-hover flex flex-col justify-between space-y-3 bg-white",
                        isSevere ? "border-amber-200/80 hover:border-amber-400" : "border-slate-200"
                      )}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-xl border border-amber-200 shadow-xs">
                              {report.hazardIcon}
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-brand-forest-900 line-clamp-1">
                                {report.hazardLabel}
                              </h4>
                              <p className="text-[11px] font-medium text-slate-500">{report.neighborhood}</p>
                            </div>
                          </div>

                          <span
                            className={cn(
                              "text-[9px] font-black uppercase px-2 py-0.5 rounded-md shrink-0",
                              isVerified ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
                            )}
                          >
                            {isVerified ? "Verified" : "Citizen"}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                          {report.description}
                        </p>

                        {report.imageReference && (
                          <div className="h-28 rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100">
                            <img
                              src={report.imageReference}
                              alt={report.hazardLabel}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                              Photo Attached
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-brand-forest-800">
                          <ThumbsUp className="h-3.5 w-3.5 text-brand-forest-700" />
                          <span>{report.upvotes} confirmed</span>
                        </span>

                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span>{report.timeFormatted}</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: COMMUNITY CHALLENGES & NEIGHBORHOOD AWARENESS DRIVES */}
        {activeTab === "challenges" && (
          <div className="space-y-8">
            {/* Neighborhood Challenges */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <SectionTitle>Collaborative Neighborhood Challenges</SectionTitle>
                  <p className="text-xs text-brand-forest-700/80">
                    Community goals to reduce localized smoke, dust, and vehicle idling.
                  </p>
                </div>
                <Badge variant="yellow" icon={<Sparkles className="h-3 w-3" />}>
                  Earn Badges & XP
                </Badge>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {challenges.map((challenge) => {
                  const isJoining = joiningChallengeId === challenge.id;

                  return (
                    <Card
                      key={challenge.id}
                      className="p-5 border-2 border-brand-mint-200/80 bg-white shadow-card flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-mint-900 bg-brand-mint-100 px-2 py-0.5 rounded-md">
                            {challenge.category.replace(/_/g, " ")}
                          </span>
                          <span className="text-xs font-black text-amber-800 flex items-center gap-1">
                            <Zap className="h-3 w-3 fill-amber-600" />+{challenge.xpReward} XP
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-brand-forest-900">{challenge.title}</h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{challenge.description}</p>
                        </div>

                        {/* Progress */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <span>Neighborhood Goal</span>
                            <span>
                              {challenge.currentProgress} / {challenge.targetProgress} ({challenge.progressPercent}%)
                            </span>
                          </div>
                          <ProgressBar value={challenge.progressPercent} variant="mint" showValue={false} />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500 font-medium">
                          👥 {challenge.participantsCount} Neighbors
                        </span>

                        <Button
                          size="sm"
                          variant={challenge.isJoined ? "outline" : "forest"}
                          disabled={challenge.isJoined || isJoining}
                          onClick={() => handleJoinChallenge(challenge.id)}
                          className="gap-1.5 text-xs font-bold"
                        >
                          {isJoining ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : challenge.isJoined ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" /> Joined
                            </>
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5" /> Pledge (+{challenge.xpReward} XP)
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Neighborhood Awareness Activities */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div>
                <SectionTitle>Upcoming Neighborhood Awareness Drives</SectionTitle>
                <p className="text-xs text-brand-forest-700/80">
                  Grassroots walking audits, mask fit workshops, and community green canopy drives.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {activities.map((act) => {
                  const isToggling = togglingActivityId === act.id;

                  return (
                    <Card key={act.id} className="p-5 border-2 border-slate-200 bg-white flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg w-fit">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{act.date}</span>
                        </div>

                        <h4 className="text-sm font-bold text-brand-forest-900">{act.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>

                        <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            <span>{act.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>{act.time}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-semibold">
                          {act.attendeesCount} Going
                        </span>

                        <Button
                          size="sm"
                          variant={act.isAttending ? "outline" : "forest"}
                          disabled={isToggling}
                          onClick={() => handleToggleActivityRsvp(act.id)}
                          className="text-xs font-bold"
                        >
                          {isToggling ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : act.isAttending ? (
                            "✓ Attending"
                          ) : (
                            "RSVP Attend"
                          )}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Aero Tip for Reporting */}
            <div className="rounded-3xl bg-gradient-to-r from-[#F0FAF5] to-[#E8F8F0] border-2 border-brand-mint-300 p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
              <AeroMascot mood="location" size="md" showSpeechBubble={false} />
              <div className="space-y-1.5 text-center sm:text-left">
                <Badge variant="mint">Aero&apos;s Civic Action Guide</Badge>
                <h4 className="text-lg font-bold text-brand-forest-900">
                  &ldquo;Citizen reports help municipal teams act before smog settles!&rdquo;
                </h4>
                <p className="text-xs sm:text-sm text-brand-forest-800 leading-relaxed max-w-2xl">
                  When you report open biomass or plastic burning on AirAware, nearby families get notified immediately to seal windows. You can also cite your AirAware report ID when contacting the Green Delhi helpline (155304) or MCD control room for swift sprinkler dispatch.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Create Report Modal */}
        <CreateReportModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onReportCreated={() => {
            fetchReports(true);
            fetchChallengesAndActivities();
          }}
          currentCity={currentLocation.city}
          currentNeighborhood="Lajpat Nagar IV"
        />

        {/* Report Details Modal */}
        <ReportDetailsModal
          report={selectedReport}
          open={!!selectedReport}
          onOpenChange={(open) => {
            if (!open) setSelectedReport(null);
          }}
          onReportUpdated={() => {
            fetchReports(true);
          }}
        />
      </div>
    </AppShell>
  );
}
