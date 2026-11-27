"use client";

import * as React from "react";
import { useSession, signOut } from "next-auth/react";
import { AppShell } from "@/components/layout/app-shell";
import {
  User,
  MapPin,
  Home,
  Users,
  Compass,
  Bell,
  Shield,
  Sparkles,
  Globe,
  Sliders,
  Lock,
  Download,
  Trash2,
  Info,
  Save,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Layers,
  Car,
  Wind,
  Moon,
  Clock,
  Heart,
  FileText,
  Key,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageTitle, SectionTitle, Subtitle } from "@/components/ui/typography";
import { useToast } from "@/components/ui/toast";
import { AeroMascot } from "@/components/onboarding/aero-mascot";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

const SECTIONS = [
  { id: "profile", label: "Profile Information", icon: User, group: "Account & Identity" },
  { id: "location", label: "Location Settings", icon: MapPin, group: "Account & Identity" },
  { id: "security", label: "Account Security", icon: Lock, group: "Account & Identity" },
  { id: "household", label: "Household Profile", icon: Users, group: "Household & Space" },
  { id: "lifestyle", label: "Lifestyle & Commute", icon: Car, group: "Household & Space" },
  { id: "environment", label: "Home Environment", icon: Home, group: "Household & Space" },
  { id: "notifications", label: "Notification Preferences", icon: Bell, group: "Preferences & Alerts" },
  { id: "language", label: "Language", icon: Globe, group: "Preferences & Alerts" },
  { id: "units", label: "Units & Standards", icon: Sliders, group: "Preferences & Alerts" },
  { id: "privacy", label: "Privacy Settings", icon: Shield, group: "Privacy & Intelligence" },
  { id: "ai", label: "AI Personalization", icon: Sparkles, group: "Privacy & Intelligence" },
  { id: "export", label: "Data Export", icon: Download, group: "Data & System" },
  { id: "about", label: "About AirAware", icon: Info, group: "Data & System" },
  { id: "danger", label: "Delete Account", icon: Trash2, group: "Data & System" },
];

const AVATAR_OPTIONS = [
  { id: "aero-avatar-default", label: "Aero Breeze", emoji: "🍃" },
  { id: "aero-avatar-shield", label: "Sanctuary Shield", emoji: "🛡️" },
  { id: "aero-avatar-sun", label: "Solar Sentinel", emoji: "☀️" },
  { id: "aero-avatar-leaf", label: "Pure Leaf", emoji: "🌱" },
  { id: "aero-avatar-cloud", label: "Clean Cloud", emoji: "☁️" },
  { id: "aero-avatar-falcon", label: "Air Guardian", emoji: "🦅" },
];

export default function ProfilePage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [activeSection, setActiveSection] = React.useState("profile");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  // 1. Profile Information
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [avatar, setAvatar] = React.useState("aero-avatar-default");
  const [accountCreatedAt, setAccountCreatedAt] = React.useState<string | null>(null);

  // 2. Location Settings
  const [city, setCity] = React.useState("New Delhi");
  const [area, setArea] = React.useState("Greater Kailash I");
  const [stateName, setStateName] = React.useState("Delhi");
  const [country, setCountry] = React.useState("India");
  const [latitude, setLatitude] = React.useState(28.6139);
  const [longitude, setLongitude] = React.useState(77.209);
  const [isApproximateLocation, setIsApproximateLocation] = React.useState(true);

  // 3. Household Profile
  const [adults, setAdults] = React.useState(2);
  const [children, setChildren] = React.useState(1);
  const [elderly, setElderly] = React.useState(0);
  const [hasRespiratorySensitivity, setHasRespiratorySensitivity] = React.useState(false);
  const [hasCardiovascularSensitivity, setHasCardiovascularSensitivity] = React.useState(false);
  const [isPregnant, setIsPregnant] = React.useState(false);
  const [hasInfant, setHasInfant] = React.useState(false);
  const [allergyNotes, setAllergyNotes] = React.useState("");

  // 4. Lifestyle and Commute
  const [workSchedule, setWorkSchedule] = React.useState<"fixed_office" | "hybrid" | "work_from_home" | "outdoor_work" | "student" | "retired">("hybrid");
  const [exerciseHabits, setExerciseHabits] = React.useState<"outdoor_morning" | "outdoor_evening" | "indoor_gym" | "none" | "intermittent">("intermittent");
  const [commuteType, setCommuteType] = React.useState<"car" | "metro" | "bus" | "two_wheeler" | "walking" | "bicycle" | "mixed">("metro");
  const [commuteDuration, setCommuteDuration] = React.useState(35);
  const [travelWindow, setTravelWindow] = React.useState<"early_morning" | "morning_rush" | "midday" | "evening_rush" | "night">("morning_rush");
  const [vehicleHasAcAirFilter, setVehicleHasAcAirFilter] = React.useState(true);

  // 5. Home Environment
  const [homeType, setHomeType] = React.useState<"apartment" | "independent_house" | "villa" | "other">("apartment");
  const [floorLevel, setFloorLevel] = React.useState(3);
  const [hasAirPurifier, setHasAirPurifier] = React.useState(true);
  const [purifierCount, setPurifierCount] = React.useState(1);
  const [purifierType, setPurifierType] = React.useState<"hepa" | "carbon_hepa" | "diy" | "none">("hepa");
  const [hasKitchenChimney, setHasKitchenChimney] = React.useState(true);
  const [cookingFuel, setCookingFuel] = React.useState<"lpg" | "induction_electric" | "piped_gas" | "biomass">("piped_gas");
  const [cleanerAirRoomStatus, setCleanerAirRoomStatus] = React.useState("Master Bedroom (Sealed)");
  const [budgetRange, setBudgetRange] = React.useState<"minimal" | "moderate" | "comprehensive">("moderate");

  // 6. Notification Preferences
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [aqiThresholdAlert, setAqiThresholdAlert] = React.useState(150);
  const [notifDeterioration, setNotifDeterioration] = React.useState(true);
  const [notifSevere, setNotifSevere] = React.useState(true);
  const [notifDailyReminder, setNotifDailyReminder] = React.useState(true);
  const [notifMissionReminder, setNotifMissionReminder] = React.useState(true);
  const [notifStreakReminder, setNotifStreakReminder] = React.useState(true);
  const [notifForecastAlert, setNotifForecastAlert] = React.useState(true);
  const [notifCommunityUpdate, setNotifCommunityUpdate] = React.useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = React.useState(true);

  // 7. Privacy Settings
  const [anonymizeCommunityReports, setAnonymizeCommunityReports] = React.useState(false);
  const [optOutAnalytics, setOptOutAnalytics] = React.useState(false);
  const [optOutHealthContext, setOptOutHealthContext] = React.useState(false);

  // 8. AI Personalization Settings
  const [aiEnabled, setAiEnabled] = React.useState(true);
  const [aiCommuteAdvice, setAiCommuteAdvice] = React.useState(true);
  const [aiIndoorAdvice, setAiIndoorAdvice] = React.useState(true);
  const [aiStoreHistory, setAiStoreHistory] = React.useState(true);
  const [isResettingAi, setIsResettingAi] = React.useState(false);

  // 9. Language
  const [language, setLanguage] = React.useState("en");

  // 10. Units
  const [temperatureUnit, setTemperatureUnit] = React.useState<"celsius" | "fahrenheit">("celsius");
  const [aqiStandard, setAqiStandard] = React.useState<"CPCB_NAQI" | "US_EPA">("CPCB_NAQI");
  const [distanceUnit, setDistanceUnit] = React.useState<"km" | "miles">("km");

  // 11. Security State & Modal
  const [securityModalOpen, setSecurityModalOpen] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);

  // 12. Delete Account Dialog State
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = React.useState("");
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false);

  // 13. Gamification Overview Info
  const [gamification, setGamification] = React.useState<any>(null);

  // Fetch full profile from /api/profile
  const fetchProfile = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/profile");
      const json = await res.json();

      if (json.success && json.data) {
        const u = json.data.user;
        const hp = json.data.householdProfile;
        const g = json.data.gamification;

        setName(u?.name || "AirAware User");
        setEmail(u?.email || "");
        setBio(u?.bio || "");
        setPhone(u?.phone || "");
        setAvatar(u?.avatar || "aero-avatar-default");
        setAccountCreatedAt(u?.createdAt || null);

        if (u?.location) {
          setCity(u.location.city || "New Delhi");
          setArea(u.location.area || "Greater Kailash I");
          setStateName(u.location.state || "Delhi");
          setCountry(u.location.country || "India");
          setLatitude(u.location.latitude ?? 28.6139);
          setLongitude(u.location.longitude ?? 77.209);
          setIsApproximateLocation(u.location.isApproximate ?? true);
        }

        if (u?.preferences) {
          setLanguage(u.preferences.language || "en");
          setNotificationsEnabled(u.preferences.notificationsEnabled ?? true);
          setAqiThresholdAlert(u.preferences.aqiThresholdAlert ?? 150);
          setTemperatureUnit(u.preferences.temperatureUnit || "celsius");
          setAqiStandard(u.preferences.aqiStandard || "CPCB_NAQI");
          setDistanceUnit(u.preferences.distanceUnit || "km");

          if (u.preferences.privacy) {
            setIsApproximateLocation(u.preferences.privacy.approximateLocationOnly ?? true);
            setAnonymizeCommunityReports(u.preferences.privacy.anonymizeCommunityReports ?? false);
            setOptOutAnalytics(u.preferences.privacy.optOutAnalytics ?? false);
            setOptOutHealthContext(u.preferences.privacy.optOutHealthContext ?? false);
          }

          if (u.preferences.aiPersonalization) {
            setAiEnabled(u.preferences.aiPersonalization.enabled ?? true);
            setAiCommuteAdvice(u.preferences.aiPersonalization.enableCommuteAdvice ?? true);
            setAiIndoorAdvice(u.preferences.aiPersonalization.enableIndoorAdvice ?? true);
            setAiStoreHistory(u.preferences.aiPersonalization.storeChatHistory ?? true);
          }
        }

        if (hp) {
          setAdults(hp.householdSize?.adults ?? 2);
          setChildren(hp.householdSize?.children ?? 1);
          setElderly(hp.householdSize?.elderly ?? 0);

          setHasRespiratorySensitivity(Boolean(hp.sensitiveGroupPreferences?.hasRespiratorySensitivity));
          setHasCardiovascularSensitivity(Boolean(hp.sensitiveGroupPreferences?.hasCardiovascularSensitivity));
          setIsPregnant(Boolean(hp.sensitiveGroupPreferences?.isPregnant));
          setHasInfant(Boolean(hp.sensitiveGroupPreferences?.hasInfant));
          setAllergyNotes(hp.sensitiveGroupPreferences?.notes || "");

          if (hp.lifestyle) {
            setWorkSchedule(hp.lifestyle.workSchedule || "hybrid");
            setExerciseHabits(hp.lifestyle.exerciseHabits || "intermittent");
          }

          if (hp.commute) {
            setCommuteType(hp.commute.commuteType || "metro");
            setCommuteDuration(hp.commute.durationMinutes ?? 35);
            setTravelWindow(hp.commute.travelWindow || "morning_rush");
            setVehicleHasAcAirFilter(Boolean(hp.commute.vehicleHasAcAirFilter ?? true));
          }

          if (hp.homeEnvironment) {
            setHomeType(hp.homeEnvironment.homeType || "apartment");
            setFloorLevel(hp.homeEnvironment.floorLevel ?? 3);
            setHasKitchenChimney(Boolean(hp.homeEnvironment.hasKitchenChimney ?? true));
            setCookingFuel(hp.homeEnvironment.cookingFuel || "piped_gas");
            setCleanerAirRoomStatus(hp.homeEnvironment.cleanerAirRoomStatus || "Master Bedroom (Sealed)");
          }

          if (hp.purifierAvailability) {
            setHasAirPurifier(Boolean(hp.purifierAvailability.hasPurifier));
            setPurifierCount(hp.purifierAvailability.purifierCount ?? 1);
            setPurifierType(hp.purifierAvailability.purifierType || "hepa");
          }

          if (hp.budgetPreferences) {
            setBudgetRange(hp.budgetPreferences.budgetRange || "moderate");
          }
        }

        if (g) {
          setGamification(g);
        }
      }
    } catch (err: any) {
      console.warn("Error fetching profile:", err);
      toast({
        type: "error",
        title: "Could not load settings",
        message: err.message || "Please refresh the page to retry.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Save all updated profile and settings
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name,
        bio,
        phone,
        avatar,
        location: {
          city,
          area,
          state: stateName,
          country,
          latitude,
          longitude,
          isApproximate: isApproximateLocation,
        },
        preferences: {
          language,
          notificationsEnabled,
          aqiThresholdAlert,
          temperatureUnit,
          aqiStandard,
          distanceUnit,
          privacy: {
            approximateLocationOnly: isApproximateLocation,
            anonymizeCommunityReports,
            optOutAnalytics,
            optOutHealthContext,
          },
          aiPersonalization: {
            enabled: aiEnabled,
            enableCommuteAdvice: aiCommuteAdvice,
            enableIndoorAdvice: aiIndoorAdvice,
            storeChatHistory: aiStoreHistory,
          },
        },
        householdProfile: {
          householdSize: {
            adults,
            children,
            elderly,
            total: adults + children + elderly,
          },
          sensitiveGroupPreferences: {
            hasRespiratorySensitivity,
            hasCardiovascularSensitivity,
            isPregnant,
            hasInfant,
            notes: allergyNotes,
          },
          lifestyle: {
            workSchedule,
            exerciseHabits,
          },
          commute: {
            commuteType,
            durationMinutes: commuteDuration,
            travelWindow,
            vehicleHasAcAirFilter,
          },
          homeEnvironment: {
            homeType,
            floorLevel,
            hasKitchenChimney,
            cookingFuel,
            cleanerAirRoomStatus,
          },
          purifierAvailability: {
            hasPurifier: hasAirPurifier,
            purifierCount: hasAirPurifier ? purifierCount : 0,
            purifierType: hasAirPurifier ? purifierType : "none",
          },
          budgetPreferences: {
            budgetRange,
          },
        },
      };

      await apiClient.profile.update(payload as any);

      toast({
        type: "success",
        title: "Settings Saved",
        message: "Your profile, household shielding preferences, and privacy rules were updated.",
      });
    } catch (err: any) {
      toast({
        type: "error",
        title: "Save Failed",
        message: err.message || "An error occurred while saving. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Location Autodetect using HTML5 geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast({ type: "error", title: "Unsupported", message: "Geolocation is not supported by your browser." });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        let lat = pos.coords.latitude;
        let lon = pos.coords.longitude;

        if (isApproximateLocation) {
          // Fuzz coordinates to ~500m
          lat = Math.round(lat * 200) / 200;
          lon = Math.round(lon * 200) / 200;
        }

        setLatitude(lat);
        setLongitude(lon);
        toast({
          type: "success",
          title: "Location Updated",
          message: `Coordinates fuzzed for privacy: [${lat.toFixed(3)}, ${lon.toFixed(3)}]`,
        });
      },
      (err) => {
        toast({ type: "warning", title: "Location Access Denied", message: err.message });
      }
    );
  };

  // Data Export Handler
  const handleExportData = () => {
    window.location.href = "/api/profile/export";
    toast({
      type: "success",
      title: "Exporting Data",
      message: "Your complete AirAware profile, actions, and defense history are downloading.",
    });
  };

  // Reset AI Memory Handler
  const handleResetAiMemory = async () => {
    setIsResettingAi(true);
    try {
      await apiClient.profile.resetAiHistory();

      toast({
        type: "success",
        title: "AI Context Reset",
        message: "All previous chat sessions and conversation memories have been cleared.",
      });
    } catch (err: any) {
      toast({ type: "error", title: "Reset Failed", message: err.message });
    } finally {
      setIsResettingAi(false);
    }
  };

  // Password Update Handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ type: "error", title: "Mismatch", message: "New passwords do not match." });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await apiClient.profile.updateSecurity({ currentPassword, newPassword });

      toast({
        type: "success",
        title: "Password Updated",
        message: "Your account password was securely changed.",
      });
      setSecurityModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({ type: "error", title: "Security Error", message: err.message });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Delete Account Handler
  const handleDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== "DELETE") {
      toast({ type: "error", title: "Confirmation Required", message: "Please type DELETE to confirm." });
      return;
    }

    setIsDeletingAccount(true);
    try {
      const res = await fetch("/api/profile", { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete account");

      toast({
        type: "warning",
        title: "Account Deleted",
        message: "Your account and all associated records have been permanently erased.",
      });
      signOut({ callbackUrl: "/" });
    } catch (err: any) {
      toast({ type: "error", title: "Deletion Failed", message: err.message });
      setIsDeletingAccount(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-forest-700" />
          <p className="text-sm font-semibold text-brand-forest-800">Loading your profile & household settings...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="mint" icon={<Sliders className="h-3.5 w-3.5" />}>
                Profile & Air Shielding Settings
              </Badge>
              <Badge variant="yellow" icon={<Shield className="h-3.5 w-3.5 text-amber-800" />}>
                Privacy-by-Design
              </Badge>
            </div>
            <PageTitle className="mt-2">Account & Settings</PageTitle>
            <Subtitle className="mt-1">
              Customize your household shielding parameters, diurnal commute timings, notifications, and privacy options.
            </Subtitle>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="forest"
              size="sm"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="gap-2 font-bold shadow-xs"
            >
              {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{isSaving ? "Saving..." : "Save All Settings"}</span>
            </Button>
          </div>
        </div>

        {/* Gamification / Level Snapshot Card */}
        {gamification && (
          <div className="rounded-3xl bg-gradient-to-br from-[#FFFBEA] via-[#FFF8E8] to-[#F0FAF5] p-5 sm:p-6 border-2 border-brand-yellow-300 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-amber-300 text-3xl shadow-xs">
                {AVATAR_OPTIONS.find((a) => a.id === avatar)?.emoji || "🍃"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-brand-forest-900">{name}</h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white">
                    Lv. {gamification.level || 1}
                  </span>
                </div>
                <p className="text-xs text-brand-forest-700/80 mt-0.5">
                  {city}, {country} • {gamification.totalXp || 0} Total XP • 🔥 {gamification.streak?.currentStreak || 0} Day Streak
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportData} className="gap-1.5 text-xs font-semibold">
                <Download className="h-3.5 w-3.5" />
                <span>Export Data</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="gap-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        )}

        {/* Main 2-Column Responsive Layout */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Navigation Sidebar (4 cols on lg) */}
          <div className="lg:col-span-4 sticky top-20 rounded-3xl bg-white border-2 border-brand-forest-700/10 p-4 shadow-card space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 block">
              Settings Directory
            </span>

            <div className="space-y-1">
              {SECTIONS.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSection(sec.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-all text-left",
                      isActive
                        ? "bg-brand-forest-900 text-white shadow-xs"
                        : "text-brand-forest-700 hover:bg-brand-forest-50 hover:text-brand-forest-900"
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-amber-400" : "text-slate-400")} />
                      <span className="truncate">{sec.label}</span>
                    </div>
                    <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 opacity-40", isActive && "opacity-100 text-white")} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Section Content (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. PROFILE INFORMATION */}
            {activeSection === "profile" && (
              <Card className="p-6 bg-white border-2 border-brand-forest-700/10 shadow-card space-y-6">
                <div>
                  <SectionTitle>1. Profile Information</SectionTitle>
                  <p className="text-xs text-brand-forest-700/80">
                    Your personal profile details and AirAware community persona.
                  </p>
                </div>

                {/* Avatar Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-forest-900 block">Choose Your Mascot Avatar</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {AVATAR_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAvatar(opt.id)}
                        className={cn(
                          "p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all",
                          avatar === opt.id
                            ? "bg-amber-50 border-amber-400 shadow-xs ring-2 ring-amber-400"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className="text-[10px] font-bold text-slate-700 truncate w-full text-center">
                          {opt.label.split(" ")[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-forest-900 block">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-mint"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-forest-900 block">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs font-medium text-slate-500 cursor-not-allowed"
                    />
                    <span className="text-[10px] text-slate-400">Primary login identity (read-only)</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-forest-900 block">Phone (Optional)</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-mint"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-brand-forest-900 block">Short Bio / Household Role</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Parent of 2 asthmatic children, Delhi daily metro commuter..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-mint"
                    />
                  </div>
                </div>

                {accountCreatedAt && (
                  <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    Member since: {new Date(accountCreatedAt).toLocaleDateString("en-IN", { month: "long", year: "numeric", day: "numeric" })}
                  </p>
                )}
              </Card>
            )}

            {/* 2. LOCATION SETTINGS */}
            {activeSection === "location" && (
              <Card className="p-6 bg-white border-2 border-brand-forest-700/10 shadow-card space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <SectionTitle>2. Location Settings</SectionTitle>
                    <p className="text-xs text-brand-forest-700/80">
                      Configure your primary neighborhood for hyper-local AQI alerts and station monitoring.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDetectLocation} className="gap-1.5 text-xs font-bold">
                    <Compass className="h-3.5 w-3.5" />
                    <span>Auto-Detect</span>
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-forest-900 block">Primary City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-mint"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-forest-900 block">Neighborhood / Colony Area</label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-mint"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-forest-900 block">State / Region</label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-mint"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-forest-900 block">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-mint"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-forest-900 block">Latitude</label>
                    <input
                      type="number"
                      step="0.001"
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-mint"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-forest-900 block">Longitude</label>
                    <input
                      type="number"
                      step="0.001"
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-mint"
                    />
                  </div>
                </div>

                {/* Privacy Fuzzing Toggle */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-brand-forest-950 block">
                      Approximate Location Privacy Fuzzing (~500m)
                    </span>
                    <p className="text-[11px] text-brand-forest-800/80 leading-relaxed">
                      Automatically offsets GPS coordinates slightly to ensure precise residential addresses are never broadcasted or stored.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsApproximateLocation(!isApproximateLocation)}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      isApproximateLocation ? "bg-emerald-600" : "bg-slate-300"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                        isApproximateLocation ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </Card>
            )}

            {/* 3. HOUSEHOLD PROFILE */}
            {activeSection === "household" && (
              <Card className="p-6 bg-white border-2 border-brand-forest-700/10 shadow-card space-y-6">
                <div>
                  <SectionTitle>3. Household Profile & Sensitivities</SectionTitle>
                  <p className="text-xs text-brand-forest-700/80">
                    Non-diagnostic sensitivity indicators used strictly to calculate customized defense thresholds.
                  </p>
                </div>

                {/* Household Size Counters */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Adults (18 - 60)</span>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="h-8 w-8 rounded-full bg-white border border-slate-300 font-black text-slate-700"
                      >
                        -
                      </button>
                      <span className="text-xl font-black text-brand-forest-900">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults(adults + 1)}
                        className="h-8 w-8 rounded-full bg-white border border-slate-300 font-black text-slate-700"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Children (&lt; 18)</span>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        className="h-8 w-8 rounded-full bg-white border border-slate-300 font-black text-slate-700"
                      >
                        -
                      </button>
                      <span className="text-xl font-black text-brand-forest-900">{children}</span>
                      <button
                        type="button"
                        onClick={() => setChildren(children + 1)}
                        className="h-8 w-8 rounded-full bg-white border border-slate-300 font-black text-slate-700"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Seniors (60+)</span>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setElderly(Math.max(0, elderly - 1))}
                        className="h-8 w-8 rounded-full bg-white border border-slate-300 font-black text-slate-700"
                      >
                        -
                      </button>
                      <span className="text-xl font-black text-brand-forest-900">{elderly}</span>
                      <button
                        type="button"
                        onClick={() => setElderly(elderly + 1)}
                        className="h-8 w-8 rounded-full bg-white border border-slate-300 font-black text-slate-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Health Sensitivity Checkboxes */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-brand-forest-900 block">
                    Vulnerable Group Considerations (Optional)
                  </span>

                  {[
                    {
                      label: "Asthma or Respiratory Sensitivity",
                      desc: "Triggers stricter N95 mask reminders and lower indoor PM2.5 thresholds.",
                      checked: hasRespiratorySensitivity,
                      onChange: () => setHasRespiratorySensitivity(!hasRespiratorySensitivity),
                    },
                    {
                      label: "Cardiovascular History",
                      desc: "Elevates emergency alerts during severe ground-level smog events.",
                      checked: hasCardiovascularSensitivity,
                      onChange: () => setHasCardiovascularSensitivity(!hasCardiovascularSensitivity),
                    },
                    {
                      label: "Pregnant Household Member",
                      desc: "Activates maternal air alerts and extra cleaner-air room safeguards.",
                      checked: isPregnant,
                      onChange: () => setIsPregnant(!isPregnant),
                    },
                    {
                      label: "Infant in Household (< 1 Year)",
                      desc: "Mandates unventilated sealed bedrooms during diurnal pollution peaks.",
                      checked: hasInfant,
                      onChange: () => setHasInfant(!hasInfant),
                    },
                  ].map((item, idx) => (
                    <label
                      key={idx}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={item.onChange}
                        className="mt-0.5 h-4 w-4 rounded text-brand-forest-900 focus:ring-brand-mint"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">{item.label}</span>
                        <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-forest-900 block">Allergy Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Dust mite allergy, seasonal pollen sensitivity..."
                    value={allergyNotes}
                    onChange={(e) => setAllergyNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-mint"
                  />
                </div>
              </Card>
            )}

            {/* 4. LIFESTYLE AND COMMUTE */}
            {activeSection === "lifestyle" && (
              <Card className="p-6 bg-white border-2 border-brand-forest-700/10 shadow-card space-y-6">
                <div>
                  <SectionTitle>4. Lifestyle & Commute Parameters</SectionTitle>
                  <p className="text-xs text-brand-forest-700/80">
                    Used by the My Day timeline and route optimizer to plan low-exposure travel.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-forest-900 block">Work Schedule</label>
                    <select
                      value={workSchedule}
                      onChange={(e) => setWorkSchedule(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-mint"
                    >
                      <option value="fixed_office">Fixed Office (Daily In-Person)</option>
                      <option value="hybrid">Hybrid (2-3 Days Office)</option>
                      <option value="work_from_home">100% Work from Home</option>
                      <option value="outdoor_work">Outdoor / Field Work</option>
                      <option value="student">Student / School</option>
                      <option value="retired">Retired / Home-Based</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-forest-900 block">Primary Commute Mode</label>
                    <select
                      value={commuteType}
                      onChange={(e) => setCommuteType(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-mint"
                    >
                      <option value="metro">Metro (Air-Conditioned / Underground)</option>
                      <option value="car">Car / Cab with AC Recirculation</option>
                      <option value="two_wheeler">Two-Wheeler / Motorcycle (High Exposure)</option>
                      <option value="bus">Public Bus</option>
                      <option value="walking">Walking</option>
                      <option value="bicycle">Bicycle</option>
                      <option value="mixed">Mixed Modes</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-forest-900 block">Average Commute Duration</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="5"
                        max="240"
                        value={commuteDuration}
                        onChange={(e) => setCommuteDuration(parseInt(e.target.value, 10) || 30)}
                        className="w-32 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-mint"
                      />
                      <span className="text-xs font-bold text-slate-600">Minutes</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-forest-900 block">Typical Travel Rush Window</label>
                    <select
                      value={travelWindow}
                      onChange={(e) => setTravelWindow(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-mint"
                    >
                      <option value="morning_rush">Morning Rush (7:30 AM - 10:00 AM)</option>
                      <option value="early_morning">Early Morning (&lt; 7:30 AM)</option>
                      <option value="midday">Midday (11:00 AM - 3:30 PM)</option>
                      <option value="evening_rush">Evening Rush (5:00 PM - 8:30 PM)</option>
                      <option value="night">Night (&gt; 9:00 PM)</option>
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-brand-forest-900 block">Outdoor Exercise Habit</label>
                    <select
                      value={exerciseHabits}
                      onChange={(e) => setExerciseHabits(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-mint"
                    >
                      <option value="outdoor_morning">Morning Outdoor Walks/Jogging</option>
                      <option value="outdoor_evening">Evening Outdoor Walks/Sports</option>
                      <option value="indoor_gym">Indoor Gym / Studio Workout</option>
                      <option value="intermittent">Intermittent / Safe-Window Exerciser</option>
                      <option value="none">Sedentary / Little Outdoor Exercise</option>
                    </select>
                  </div>
                </div>
              </Card>
            )}

            {/* 5. HOME ENVIRONMENT */}
            {activeSection === "environment" && (
              <Card className="p-6 bg-white border-2 border-brand-forest-700/10 shadow-card space-y-6">
                <div>
                  <SectionTitle>5. Home Environment & Purifier Setup</SectionTitle>
                  <p className="text-xs text-brand-forest-700/80">
                    Defines your indoor air parameters, kitchen exhaust capabilities, and cleaner-air room.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-forest-900 block">Home Residence Type</label>
                    <select
                      value={homeType}
                      onChange={(e) => setHomeType(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-mint"
                    >
                      <option value="apartment">Apartment / Flat</option>
                      <option value="independent_house">Independent Builder Floor / House</option>
                      <option value="villa">Gated Villa</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-forest-900 block">Floor Level</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={floorLevel}
                      onChange={(e) => setFloorLevel(parseInt(e.target.value, 10) || 0)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-mint"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-forest-900 block">Kitchen Cooking Fuel</label>
                    <select
                      value={cookingFuel}
                      onChange={(e) => setCookingFuel(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-mint"
                    >
                      <option value="piped_gas">Piped Natural Gas (PNG)</option>
                      <option value="lpg">LPG Cylinder</option>
                      <option value="induction_electric">Electric / Induction</option>
                      <option value="biomass">Biomass / Chulha (High VOCs)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-forest-900 block">Designated Cleaner-Air Room</label>
                    <input
                      type="text"
                      value={cleanerAirRoomStatus}
                      onChange={(e) => setCleanerAirRoomStatus(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-mint"
                    />
                  </div>
                </div>

                {/* Purifier Availability Toggle */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-brand-forest-900 block">HEPA Air Purifier Installed</span>
                      <p className="text-[11px] text-slate-500">Do you own one or more mechanical HEPA purifiers?</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHasAirPurifier(!hasAirPurifier)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        hasAirPurifier ? "bg-emerald-600" : "bg-slate-300"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                          hasAirPurifier ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                  {hasAirPurifier && (
                    <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-slate-200">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Total Purifier Units</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={purifierCount}
                          onChange={(e) => setPurifierCount(parseInt(e.target.value, 10) || 1)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Filter Filtration Tier</label>
                        <select
                          value={purifierType}
                          onChange={(e) => setPurifierType(e.target.value as any)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
                        >
                          <option value="hepa">True HEPA (H13 / H14)</option>
                          <option value="carbon_hepa">HEPA + Activated Carbon</option>
                          <option value="diy">Corsi-Rosenthal DIY Box Fan</option>
                          <option value="none">Basic Mesh Pre-filter</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Budget Preference */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-forest-900 block">
                    Budget Preference for Air Recommendations
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "minimal", label: "Zero-Cost Hacks", desc: "Wet mopping, exhaust timing, window seals" },
                      { id: "moderate", label: "Moderate (₹500 - ₹2,000)", desc: "Weatherstripping, DIY filters, N95s" },
                      { id: "comprehensive", label: "Comprehensive", desc: "Multi-room HEPA purifiers, laser sensors" },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBudgetRange(b.id as any)}
                        className={cn(
                          "p-3 rounded-2xl border text-left transition-all",
                          budgetRange === b.id
                            ? "bg-amber-50 border-amber-400 shadow-xs ring-1 ring-amber-400 text-brand-forest-900"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <span className="text-xs font-bold block">{b.label}</span>
                        <span className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{b.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* 6. NOTIFICATION PREFERENCES */}
            {activeSection === "notifications" && (
              <Card className="p-6 bg-white border-2 border-brand-forest-700/10 shadow-card space-y-6">
                <div>
                  <SectionTitle>6. Notification Preferences</SectionTitle>
                  <p className="text-xs text-brand-forest-700/80">
                    Control which alerts reach your device and avoid notification overload.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      label: "AQI Deterioration Alerts",
                      desc: "Instant notice when local AQI jumps by 30+ points into a worse category.",
                      checked: notifDeterioration,
                      toggle: () => setNotifDeterioration(!notifDeterioration),
                    },
                    {
                      label: "Severe Smog Emergency Alerts",
                      desc: "Critical alerts when AQI exceeds 300 (Very Poor) or 400 (Severe).",
                      checked: notifSevere,
                      toggle: () => setNotifSevere(!notifSevere),
                    },
                    {
                      label: "Daily Morning Air Check",
                      desc: "Morning brief with diurnal pollution peaks and commute advice.",
                      checked: notifDailyReminder,
                      toggle: () => setNotifDailyReminder(!notifDailyReminder),
                    },
                    {
                      label: "Mission & Ventilation Reminders",
                      desc: "Prompts when optimal afternoon thermal ventilation windows open.",
                      checked: notifMissionReminder,
                      toggle: () => setNotifMissionReminder(!notifMissionReminder),
                    },
                    {
                      label: "Streak Savers",
                      desc: "Evening reminder to log daily defense habits and maintain your streak.",
                      checked: notifStreakReminder,
                      toggle: () => setNotifStreakReminder(!notifStreakReminder),
                    },
                    {
                      label: "Thermal Inversion Forecast Alerts",
                      desc: "Advance notice when overnight fog and low winds trap ground particulate.",
                      checked: notifForecastAlert,
                      toggle: () => setNotifForecastAlert(!notifForecastAlert),
                    },
                    {
                      label: "Community Smoke & Hazard Reports",
                      desc: "Alerts when neighbors report nearby open waste burning or construction dust.",
                      checked: notifCommunityUpdate,
                      toggle: () => setNotifCommunityUpdate(!notifCommunityUpdate),
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-brand-forest-900 block">{item.label}</span>
                        <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={item.toggle}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                          item.checked ? "bg-emerald-600" : "bg-slate-300"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                            item.checked ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 7. PRIVACY SETTINGS */}
            {activeSection === "privacy" && (
              <Card className="p-6 bg-white border-2 border-brand-forest-700/10 shadow-card space-y-6">
                <div>
                  <SectionTitle>7. Privacy Settings & Data Rights</SectionTitle>
                  <p className="text-xs text-brand-forest-700/80">
                    AirAware operates under privacy-by-design. You have complete control over data sharing.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-brand-forest-900 block">
                        Approximate Location Only (~500m Fuzzing)
                      </span>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Prevents exact home address triangulation. Your GPS coordinates are fuzzed to neighborhood-level precision.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsApproximateLocation(!isApproximateLocation)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                        isApproximateLocation ? "bg-emerald-600" : "bg-slate-300"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                          isApproximateLocation ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-brand-forest-900 block">
                        Anonymize Community Reports
                      </span>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        When you submit local burning or dust reports, display your author persona as &ldquo;Local Resident&rdquo; instead of your name.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAnonymizeCommunityReports(!anonymizeCommunityReports)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                        anonymizeCommunityReports ? "bg-emerald-600" : "bg-slate-300"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                          anonymizeCommunityReports ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-brand-forest-900 block">
                        Opt Out of Usage Analytics
                      </span>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Disable all anonymous telemetry, screen transition metrics, and feature engagement logs.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOptOutAnalytics(!optOutAnalytics)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                        optOutAnalytics ? "bg-emerald-600" : "bg-slate-300"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                          optOutAnalytics ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-brand-forest-900 block">
                        Opt Out of Health Context in AI Prompts
                      </span>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Strips all asthma, infant, or pregnancy flags from AI prompts so Gemini receives only outdoor weather and station AQI.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOptOutHealthContext(!optOutHealthContext)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                        optOutHealthContext ? "bg-emerald-600" : "bg-slate-300"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                          optOutHealthContext ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {/* 8. AI PERSONALIZATION SETTINGS */}
            {activeSection === "ai" && (
              <Card className="p-6 bg-white border-2 border-brand-forest-700/10 shadow-card space-y-6">
                <div>
                  <SectionTitle>8. AI Personalization Settings</SectionTitle>
                  <p className="text-xs text-brand-forest-700/80">
                    Controls how Google Gemini generates your daily plans, commute guides, and indoor advisories.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-[#F0FAF5] border border-brand-mint-300 flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-brand-forest-950 block">Enable Gemini AI Personalization</span>
                      <p className="text-[11px] text-brand-forest-800/80">
                        Synthesizes diurnal weather models, CPCB ground readings, and household schedules into conversational daily plans.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAiEnabled(!aiEnabled)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                        aiEnabled ? "bg-emerald-600" : "bg-slate-300"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                          aiEnabled ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-brand-forest-900 block">Personalized Commute Timing</span>
                      <p className="text-[11px] text-slate-500">Adapts departure recommendations based on morning thermal smog peaks.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAiCommuteAdvice(!aiCommuteAdvice)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                        aiCommuteAdvice ? "bg-emerald-600" : "bg-slate-300"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                          aiCommuteAdvice ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-brand-forest-900 block">Indoor Action Guidance</span>
                      <p className="text-[11px] text-slate-500">Guides window opening times based on hourly particulate forecast.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAiIndoorAdvice(!aiIndoorAdvice)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                        aiIndoorAdvice ? "bg-emerald-600" : "bg-slate-300"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                          aiIndoorAdvice ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                  {/* Reset AI Memory Button */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 pt-4">
                    <div>
                      <span className="text-xs font-bold text-brand-forest-900 block">Clear AI Chat Memory</span>
                      <p className="text-[11px] text-slate-500">Erase all saved Aero buddy conversations and cached personalization context.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetAiMemory}
                      disabled={isResettingAi}
                      className="text-xs font-bold shrink-0"
                    >
                      {isResettingAi ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 text-rose-600" />}
                      <span>{isResettingAi ? "Clearing..." : "Reset AI Memory"}</span>
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* 9. LANGUAGE */}
            {activeSection === "language" && (
              <Card className="p-6 bg-white border-2 border-brand-forest-700/10 shadow-card space-y-6">
                <div>
                  <SectionTitle>9. Language & Localization</SectionTitle>
                  <p className="text-xs text-brand-forest-700/80">
                    Select your preferred interface and advisory language.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { id: "en", label: "English", sub: "Standard English Interface" },
                    { id: "hi", label: "हिन्दी (Hindi)", sub: "दैनिक वायु गुणवत्ता सलाह" },
                    { id: "hinglish", label: "Hinglish", sub: "Conversational Urban Indian" },
                    { id: "bn", label: "বাংলা (Bengali)", sub: "বাতাসের মানের নির্দেশিকা" },
                    { id: "mr", label: "मराठी (Marathi)", sub: "हवेची गुणवत्ता सल्ला" },
                    { id: "ta", label: "தமிழ் (Tamil)", sub: "காற்றுத் தர வழிகாட்டி" },
                    { id: "te", label: "తెలుగు (Telugu)", sub: "గాలి నాణ్యత సూచనలు" },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setLanguage(lang.id)}
                      className={cn(
                        "p-4 rounded-2xl border text-left flex items-center justify-between transition-all",
                        language === lang.id
                          ? "bg-amber-50 border-amber-400 shadow-xs ring-1 ring-amber-400"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      <div>
                        <span className="text-xs font-bold text-brand-forest-900 block">{lang.label}</span>
                        <span className="text-[10px] text-slate-500">{lang.sub}</span>
                      </div>
                      {language === lang.id && <Check className="h-4 w-4 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* 10. UNITS */}
            {activeSection === "units" && (
              <Card className="p-6 bg-white border-2 border-brand-forest-700/10 shadow-card space-y-6">
                <div>
                  <SectionTitle>10. Measurement Units & Standards</SectionTitle>
                  <p className="text-xs text-brand-forest-700/80">
                    Define the calculation standards used across charts, maps, and advisories.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* AQI Standard */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-forest-900 block">Air Quality Index (AQI) Standard</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAqiStandard("CPCB_NAQI")}
                        className={cn(
                          "p-3.5 rounded-2xl border text-left transition-all",
                          aqiStandard === "CPCB_NAQI"
                            ? "bg-amber-50 border-amber-400 ring-1 ring-amber-400 shadow-xs"
                            : "bg-slate-50 border-slate-200"
                        )}
                      >
                        <span className="text-xs font-bold text-brand-forest-900 block">India CPCB NAQI (Default)</span>
                        <span className="text-[10px] text-slate-500">6 Categories: Good, Satisfactory, Moderate, Poor, Very Poor, Severe.</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAqiStandard("US_EPA")}
                        className={cn(
                          "p-3.5 rounded-2xl border text-left transition-all",
                          aqiStandard === "US_EPA"
                            ? "bg-amber-50 border-amber-400 ring-1 ring-amber-400 shadow-xs"
                            : "bg-slate-50 border-slate-200"
                        )}
                      >
                        <span className="text-xs font-bold text-brand-forest-900 block">US EPA Standard</span>
                        <span className="text-[10px] text-slate-500">International 0-500 scale with Unhealthy for Sensitive Groups.</span>
                      </button>
                    </div>
                  </div>

                  {/* Temperature Unit */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-forest-900 block">Temperature Unit</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setTemperatureUnit("celsius")}
                        className={cn(
                          "p-3.5 rounded-2xl border text-left font-bold text-xs transition-all",
                          temperatureUnit === "celsius"
                            ? "bg-amber-50 border-amber-400 ring-1 ring-amber-400 text-brand-forest-900"
                            : "bg-slate-50 border-slate-200 text-slate-600"
                        )}
                      >
                        Celsius (°C)
                      </button>

                      <button
                        type="button"
                        onClick={() => setTemperatureUnit("fahrenheit")}
                        className={cn(
                          "p-3.5 rounded-2xl border text-left font-bold text-xs transition-all",
                          temperatureUnit === "fahrenheit"
                            ? "bg-amber-50 border-amber-400 ring-1 ring-amber-400 text-brand-forest-900"
                            : "bg-slate-50 border-slate-200 text-slate-600"
                        )}
                      >
                        Fahrenheit (°F)
                      </button>
                    </div>
                  </div>

                  {/* Distance Unit */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-forest-900 block">Distance & Station Radius</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDistanceUnit("km")}
                        className={cn(
                          "p-3.5 rounded-2xl border text-left font-bold text-xs transition-all",
                          distanceUnit === "km"
                            ? "bg-amber-50 border-amber-400 ring-1 ring-amber-400 text-brand-forest-900"
                            : "bg-slate-50 border-slate-200 text-slate-600"
                        )}
                      >
                        Kilometers (km)
                      </button>

                      <button
                        type="button"
                        onClick={() => setDistanceUnit("miles")}
                        className={cn(
                          "p-3.5 rounded-2xl border text-left font-bold text-xs transition-all",
                          distanceUnit === "miles"
                            ? "bg-amber-50 border-amber-400 ring-1 ring-amber-400 text-brand-forest-900"
                            : "bg-slate-50 border-slate-200 text-slate-600"
                        )}
                      >
                        Miles (mi)
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* 11. ACCOUNT SECURITY */}
            {activeSection === "security" && (
              <Card className="p-6 bg-white border-2 border-brand-forest-700/10 shadow-card space-y-6">
                <div>
                  <SectionTitle>11. Account Security</SectionTitle>
                  <p className="text-xs text-brand-forest-700/80">
                    Manage authentication credentials, password security, and active sessions.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-brand-forest-900 block">Account Password</span>
                    <p className="text-[11px] text-slate-500">Secured via PBKDF2 with SHA-512 cryptographic salt.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSecurityModalOpen(true)} className="gap-1.5 text-xs font-bold">
                    <Key className="h-3.5 w-3.5" />
                    <span>Change Password</span>
                  </Button>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-forest-900">Current Login Session</span>
                    <Badge variant="mint">Active</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Signed in via Auth.js session cookie. Device: Web Browser ({navigator.userAgent.includes("Windows") ? "Windows" : "Desktop/Mobile"}).
                  </p>
                </div>
              </Card>
            )}

            {/* 12. DATA EXPORT */}
            {activeSection === "export" && (
              <Card className="p-6 bg-white border-2 border-brand-forest-700/10 shadow-card space-y-6">
                <div>
                  <SectionTitle>12. Data Portability & Export</SectionTitle>
                  <p className="text-xs text-brand-forest-700/80">
                    Download a copy of your personal data under GDPR and Indian Digital Personal Data Protection standards.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-brand-forest-950">Complete AirAware User Data Package</h4>
                    <p className="text-[11px] text-emerald-900/80 leading-relaxed max-w-xl">
                      Includes your profile info, household shielding parameters, logged defense habits, streak history, notifications, and community incident reports formatted in structured JSON.
                    </p>
                  </div>

                  <Button variant="forest" size="sm" onClick={handleExportData} className="gap-2 font-bold shrink-0">
                    <Download className="h-4 w-4" />
                    <span>Download JSON Export</span>
                  </Button>
                </div>
              </Card>
            )}

            {/* 13. DELETE ACCOUNT (DANGER ZONE) */}
            {activeSection === "danger" && (
              <Card className="p-6 bg-white border-2 border-red-200 shadow-card space-y-6">
                <div className="flex items-center gap-2 text-rose-800">
                  <AlertTriangle className="h-5 w-5" />
                  <SectionTitle className="text-rose-900">13. Danger Zone — Permanent Account Deletion</SectionTitle>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-2">
                  <p className="font-bold">This action is permanent and cannot be undone.</p>
                  <p className="leading-relaxed">
                    Deleting your account will erase your user identity, household vulnerability preferences, daily plan history, XP progression, badges, and notification records from our database.
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setDeleteModalOpen(true)}
                  className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 font-bold text-xs gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete My Account Permanently</span>
                </Button>
              </Card>
            )}

            {/* 14. ABOUT AIRAWARE */}
            {activeSection === "about" && (
              <Card className="p-6 bg-white border-2 border-brand-forest-700/10 shadow-card space-y-6">
                <div>
                  <SectionTitle>14. About AirAware</SectionTitle>
                  <p className="text-xs text-brand-forest-700/80">
                    Scientific methodology, authoritative partner institutions, and app metadata.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F0FAF5] border border-brand-mint-300 p-5 flex flex-col sm:flex-row items-center gap-5">
                  <AeroMascot mood="welcome" size="sm" showSpeechBubble={false} />
                  <div className="space-y-1 text-center sm:text-left">
                    <h4 className="text-sm font-bold text-brand-forest-900">AirAware Version 1.0.0 (Production)</h4>
                    <p className="text-xs text-brand-forest-800/80 leading-relaxed">
                      A personalized, scientifically grounded clean-air defense system built for families navigating North Indian winter smog and urban air crises.
                    </p>
                  </div>
                </div>

                {/* Authoritative Sources Grid */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-brand-forest-900 block">Authoritative Data Integration</span>
                  <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                      <span className="font-bold text-slate-800 block">CPCB & State Pollution Boards</span>
                      <span className="text-[11px] text-slate-500">Official Continuous Ambient Air Quality Monitoring Stations (CAAQMS).</span>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                      <span className="font-bold text-slate-800 block">Open-Meteo & Copernicus</span>
                      <span className="text-[11px] text-slate-500">High-resolution atmospheric chemistry models (PM2.5, PM10, NO2, O3).</span>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                      <span className="font-bold text-slate-800 block">IMD Thermal Inversion Dynamics</span>
                      <span className="text-[11px] text-slate-500">Diurnal temperature tracking to calculate optimal room ventilation windows.</span>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                      <span className="font-bold text-slate-800 block">Google Gemini 2.5 Flash</span>
                      <span className="text-[11px] text-slate-500">Conversational AI Buddy and personalized timeline generator.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>© 2026 AirAware Health Systems. All rights reserved.</span>
                  <span>Privacy-First Architecture</span>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Change Password Modal */}
        <Dialog open={securityModalOpen} onOpenChange={setSecurityModalOpen}>
          <DialogContent className="max-w-md p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-brand-forest-900">Change Account Password</DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Enter your existing password and choose a secure replacement.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setSecurityModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="forest" size="sm" disabled={isUpdatingPassword} className="font-bold">
                  {isUpdatingPassword ? "Updating..." : "Update Password"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Account Confirmation Modal */}
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent className="max-w-md p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-rose-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
                <span>Confirm Permanent Deletion</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600 leading-relaxed">
                This will immediately delete your account, household data, daily plans, and gamification points.
                To proceed, type <strong className="text-rose-900">DELETE</strong> in the box below.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <input
                type="text"
                placeholder="Type DELETE to confirm"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                className="w-full rounded-xl border border-rose-300 bg-rose-50/50 px-3.5 py-2.5 text-xs font-bold text-rose-950 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setDeleteConfirmationText("");
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmationText.trim().toUpperCase() !== "DELETE" || isDeletingAccount}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  {isDeletingAccount ? "Deleting..." : "Permanently Delete"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
