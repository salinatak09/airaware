"use client";

import * as React from "react";
import { useSession, signOut } from "next-auth/react";
import { AppShell } from "@/components/layout/app-shell";
import {
  User,
  Home,
  Shield,
  Bell,
  Award,
  Flame,
  Save,
  LogOut,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Profile Form States
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [city, setCity] = React.useState("New Delhi");
  const [area, setArea] = React.useState("Greater Kailash I");

  // Household Profile States
  const [adults, setAdults] = React.useState(2);
  const [children, setChildren] = React.useState(1);
  const [elderly, setElderly] = React.useState(0);
  const [hasRespiratorySensitivity, setHasRespiratorySensitivity] = React.useState(false);
  const [hasCardiovascularSensitivity, setHasCardiovascularSensitivity] = React.useState(false);
  const [isPregnant, setIsPregnant] = React.useState(false);

  // Environment & Commute States
  const [homeType, setHomeType] = React.useState<"apartment" | "independent_house" | "villa" | "other">("apartment");
  const [hasAirPurifier, setHasAirPurifier] = React.useState(true);
  const [purifierCount, setPurifierCount] = React.useState(1);
  const [commuteType, setCommuteType] = React.useState<"car" | "metro" | "bus" | "two_wheeler" | "walking" | "bicycle" | "mixed">("metro");

  // Preferences
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [aqiThresholdAlert, setAqiThresholdAlert] = React.useState(150);
  const [temperatureUnit, setTemperatureUnit] = React.useState<"celsius" | "fahrenheit">("celsius");

  // Gamification Data
  const [gamification, setGamification] = React.useState<{
    totalXp: number;
    level: number;
    streak: { currentStreak: number; longestStreak: number };
    badges: Array<{ badgeId: string; name: string; icon: string; description: string }>;
  } | null>(null);

  // Fetch full profile from /api/profile
  const fetchProfile = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/profile");
      const json = await res.json();

      if (json.success && json.data) {
        const u = json.data.user;
        const hp = json.data.householdProfile;
        const g = json.data.gamification;

        setName(u?.name || "AirAware User");
        setEmail(u?.email || "");
        if (u?.location) {
          setCity(u.location.city || "New Delhi");
          setArea(u.location.area || "Connaught Place");
        }
        if (u?.preferences) {
          setNotificationsEnabled(u.preferences.notificationsEnabled ?? true);
          setAqiThresholdAlert(u.preferences.aqiThresholdAlert ?? 150);
          setTemperatureUnit(u.preferences.temperatureUnit || "celsius");
        }

        if (hp) {
          setAdults(hp.householdSize?.adults ?? 2);
          setChildren(hp.householdSize?.children ?? 0);
          setElderly(hp.householdSize?.elderly ?? 0);
          setHasRespiratorySensitivity(Boolean(hp.sensitiveGroupPreferences?.hasRespiratorySensitivity));
          setHasCardiovascularSensitivity(Boolean(hp.sensitiveGroupPreferences?.hasCardiovascularSensitivity));
          setIsPregnant(Boolean(hp.sensitiveGroupPreferences?.isPregnant));
          setHomeType(hp.homeEnvironment?.homeType || "apartment");
          setHasAirPurifier(Boolean(hp.purifierAvailability?.hasPurifier));
          setPurifierCount(hp.purifierAvailability?.purifierCount ?? 0);
          setCommuteType(hp.commute?.commuteType || "metro");
        }

        if (g) {
          setGamification(g);
        }
      }
    } catch {
      setErrorMessage("Could not connect to profile service. Showing cached values.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const payload = {
        name,
        location: {
          city,
          area,
        },
        preferences: {
          notificationsEnabled,
          aqiThresholdAlert,
          temperatureUnit,
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
          },
          homeEnvironment: {
            homeType,
            hasAirPurifier,
            purifierCount: hasAirPurifier ? purifierCount : 0,
          },
          commute: {
            commuteType,
          },
        },
      };

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        toast({
          type: "success",
          title: "Profile Updated! 🎉",
          message: "Your family air quality settings have been successfully saved.",
        });
      } else {
        throw new Error(json.error?.message || "Failed to update profile");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed. Please retry.";
      setErrorMessage(msg);
      toast({
        type: "error",
        title: "Update Failed",
        message: msg,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-mint-100 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-forest-900 tracking-tight">
              Family Air Shield Profile
            </h1>
            <p className="text-sm text-brand-forest-700/80 font-medium mt-1">
              Manage your household sensitivities, notification thresholds, and clean air habits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProfile}
              className="rounded-2xl gap-1.5 text-xs font-bold"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSignOut}
              className="rounded-2xl gap-1.5 text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-200 text-amber-800 text-xs font-semibold">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Gamification Badge Overview Banner */}
        {gamification && (
          <div className="rounded-3xl bg-linear-to-r from-brand-mint/40 via-brand-sky/30 to-brand-cream/50 p-5 sm:p-6 border border-brand-mint-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xs border border-brand-mint-300 text-brand-forest-900 font-black text-lg">
                Lvl {gamification.level}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-brand-forest-900">
                    Clean Air Guardian
                  </span>
                  <Badge variant="mint" className="text-[10px] font-bold">
                    {gamification.totalXp} XP
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-brand-forest-700/80 mt-1 font-semibold">
                  <span className="flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    {gamification.streak?.currentStreak || 0}-Day Streak
                  </span>
                  <span>•</span>
                  <span>{gamification.badges?.length || 0} Badges Earned</span>
                </div>
              </div>
            </div>

            {gamification.badges && gamification.badges.length > 0 && (
              <div className="flex items-center gap-2">
                {gamification.badges.slice(0, 3).map((b) => (
                  <div
                    key={b.badgeId}
                    title={b.description}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border border-brand-forest-700/10 text-xs font-bold text-brand-forest-900 shadow-xs"
                  >
                    <Award className="h-3.5 w-3.5 text-amber-600" />
                    <span>{b.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Card 1: User Identity & Location */}
          <div className="rounded-3xl bg-white p-5 sm:p-7 border border-brand-forest-700/10 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <User className="h-5 w-5 text-brand-forest-700" />
              <h2 className="text-base font-bold text-brand-forest-900">
                Primary Account & Location
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-forest-900 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-brand-forest-900 focus:border-brand-mint-400 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-forest-900 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-100/70 px-3.5 py-2 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-forest-900 mb-1.5">
                  Home City
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-brand-forest-900 focus:border-brand-mint-400 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-forest-900 mb-1.5">
                  Neighborhood / Locality
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-brand-forest-900 focus:border-brand-mint-400 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Household Demographics & Vulnerabilities */}
          <div className="rounded-3xl bg-white p-5 sm:p-7 border border-brand-forest-700/10 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <Shield className="h-5 w-5 text-brand-forest-700" />
              <h2 className="text-base font-bold text-brand-forest-900">
                Household Profile & Air Sensitivity
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-forest-900 mb-1.5">
                  Adults
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-brand-forest-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-forest-900 mb-1.5">
                  Children (&lt;14 yrs)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-brand-forest-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-forest-900 mb-1.5">
                  Elderly (&gt;65 yrs)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={elderly}
                  onChange={(e) => setElderly(Number(e.target.value))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-brand-forest-900"
                />
              </div>
            </div>

            <div className="pt-2">
              <span className="block text-xs font-bold text-brand-forest-900 mb-2">
                Sensitive Group Protection Preferences
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={hasRespiratorySensitivity}
                    onChange={(e) => setHasRespiratorySensitivity(e.target.checked)}
                    className="rounded text-brand-forest-800 focus:ring-brand-mint-300 h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-brand-forest-900">
                    Asthma / Bronchitis
                  </span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={hasCardiovascularSensitivity}
                    onChange={(e) => setHasCardiovascularSensitivity(e.target.checked)}
                    className="rounded text-brand-forest-800 focus:ring-brand-mint-300 h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-brand-forest-900">
                    Cardiovascular Care
                  </span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={isPregnant}
                    onChange={(e) => setIsPregnant(e.target.checked)}
                    className="rounded text-brand-forest-800 focus:ring-brand-mint-300 h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-brand-forest-900">
                    Expectant Mother
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Card 3: Home & Commute Environment */}
          <div className="rounded-3xl bg-white p-5 sm:p-7 border border-brand-forest-700/10 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <Home className="h-5 w-5 text-brand-forest-700" />
              <h2 className="text-base font-bold text-brand-forest-900">
                Home Environment & Daily Commute
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-forest-900 mb-1.5">
                  Home Type
                </label>
                <select
                  value={homeType}
                  onChange={(e) => setHomeType(e.target.value as "apartment" | "independent_house" | "villa" | "other")}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-brand-forest-900 focus:border-brand-mint-400 focus:bg-white focus:outline-none"
                >
                  <option value="apartment">Apartment / High-rise</option>
                  <option value="independent_house">Independent House</option>
                  <option value="villa">Villa / Townhouse</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-forest-900 mb-1.5">
                  Primary Commute Mode
                </label>
                <select
                  value={commuteType}
                  onChange={(e) => setCommuteType(e.target.value as "car" | "metro" | "bus" | "two_wheeler" | "walking" | "bicycle" | "mixed")}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-brand-forest-900 focus:border-brand-mint-400 focus:bg-white focus:outline-none"
                >
                  <option value="metro">Metro / Air-Conditioned Rail</option>
                  <option value="car">Car (with AC filter)</option>
                  <option value="bus">Public Bus</option>
                  <option value="two_wheeler">Two-Wheeler / Motorcycle</option>
                  <option value="walking">Walking</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-forest-900 mb-1.5">
                  Air Purifiers Available
                </label>
                <select
                  value={hasAirPurifier ? "yes" : "no"}
                  onChange={(e) => setHasAirPurifier(e.target.value === "yes")}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-brand-forest-900 focus:border-brand-mint-400 focus:bg-white focus:outline-none"
                >
                  <option value="yes">Yes, operational HEPA units</option>
                  <option value="no">No purifiers currently</option>
                </select>
              </div>

              {hasAirPurifier && (
                <div>
                  <label className="block text-xs font-bold text-brand-forest-900 mb-1.5">
                    Number of Air Purifiers
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={purifierCount}
                    onChange={(e) => setPurifierCount(Number(e.target.value))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-brand-forest-900 focus:border-brand-mint-400 focus:bg-white focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Notification Preferences */}
          <div className="rounded-3xl bg-white p-5 sm:p-7 border border-brand-forest-700/10 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <Bell className="h-5 w-5 text-brand-forest-700" />
              <h2 className="text-base font-bold text-brand-forest-900">
                Advisory & Notification Preferences
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-slate-50/50">
                <div>
                  <span className="block text-xs font-bold text-brand-forest-900">
                    Smog Surge Notifications
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Receive alert when AQI exceeds chosen threshold
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="rounded text-brand-forest-800 focus:ring-brand-mint-300 h-4 w-4"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-forest-900 mb-1.5">
                  AQI Alert Threshold
                </label>
                <select
                  value={aqiThresholdAlert}
                  onChange={(e) => setAqiThresholdAlert(Number(e.target.value))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-brand-forest-900 focus:border-brand-mint-400 focus:bg-white focus:outline-none"
                >
                  <option value={100}>AQI &gt; 100 (Moderate / Sensitive)</option>
                  <option value={150}>AQI &gt; 150 (General Advisory)</option>
                  <option value={200}>AQI &gt; 200 (Poor / N95 Mandatory)</option>
                  <option value={300}>AQI &gt; 300 (Severe Smog Alert)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-brand-forest-900 text-white font-bold px-8 py-3 hover:bg-brand-forest-800 transition-all flex items-center gap-2"
            >
              {isSaving ? (
                <span>Saving Profile...</span>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Family Settings</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
