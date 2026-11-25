"use client";

import { createContext, useState, useContext, useCallback, ReactNode } from "react";

export interface LocationItem {
  id: string;
  city: string;
  area: string;
  latitude?: number;
  longitude?: number;
  aqi: number;
  pm25: number;
  status: string;
  isHome?: boolean;
}

export interface NotificationAlert {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: "warning" | "info" | "success" | "critical";
}

export interface FamilyProfile {
  id: string;
  name: string;
  role: string;
  ageGroup: "infant" | "child" | "adult" | "senior";
  vulnerability: "low" | "medium" | "high" | "critical";
  condition?: string;
  avatarBg: string;
}

export const MOCK_LOCATIONS: LocationItem[] = [
  { id: "delhi-cp", city: "New Delhi", area: "Connaught Place", latitude: 28.6315, longitude: 77.2167, aqi: 105, pm25: 59, status: "Moderate", isHome: true },
  { id: "delhi-south", city: "New Delhi", area: "R.K. Puram", latitude: 28.5665, longitude: 77.1821, aqi: 188, pm25: 78.4, status: "Unhealthy" },
  { id: "mumbai-bandra", city: "Mumbai", area: "Bandra West", latitude: 19.0596, longitude: 72.8295, aqi: 82, pm25: 26.5, status: "Moderate" },
  { id: "bengaluru-ind", city: "Bengaluru", area: "Indiranagar", latitude: 12.9784, longitude: 77.6408, aqi: 44, pm25: 11.2, status: "Good" },
  { id: "kolkata-salt", city: "Kolkata", area: "Salt Lake", latitude: 22.5867, longitude: 88.4178, aqi: 156, pm25: 58.0, status: "Unhealthy" },
];

export const MOCK_FAMILY: FamilyProfile[] = [
  { id: "all", name: "All Family", role: "Overview", ageGroup: "adult", vulnerability: "medium", avatarBg: "bg-brand-mint text-brand-forest-900" },
  { id: "aarav", name: "Aarav", role: "Child (Age 7)", ageGroup: "child", vulnerability: "high", condition: "Mild Asthma", avatarBg: "bg-brand-sky text-sky-900" },
  { id: "meera", name: "Meera", role: "Mom", ageGroup: "adult", vulnerability: "low", avatarBg: "bg-brand-peach text-orange-950" },
  { id: "rohit", name: "Rohit", role: "Dad (Commuter)", ageGroup: "adult", vulnerability: "medium", avatarBg: "bg-brand-lavender text-purple-950" },
  { id: "dadi", name: "Kalyani Dadi", role: "Grandmother (Age 72)", ageGroup: "senior", vulnerability: "critical", condition: "Cardiac History", avatarBg: "bg-brand-cream text-amber-950" },
];

export const MOCK_NOTIFICATIONS: NotificationAlert[] = [
  {
    id: "notif-1",
    title: "Morning Smog Alert",
    message: "AQI spiked to 175 around Lodhi Road. Ensure Aarav wears his N95 for the school bus.",
    time: "15m ago",
    unread: true,
    type: "warning",
  },
  {
    id: "notif-2",
    title: "Optimal Ventilation Window",
    message: "Outdoor PM2.5 will dip around 2:15 PM today. Great time for a 15-minute cross-breeze.",
    time: "1h ago",
    unread: true,
    type: "info",
  },
  {
    id: "notif-3",
    title: "Daily Streak Extended! 🔥",
    message: "You checked morning air quality 7 days in a row! +60 Clean Air XP awarded.",
    time: "3h ago",
    unread: false,
    type: "success",
  },
];

interface ShellContextType {
  currentLocation: LocationItem;
  setCurrentLocation: (loc: LocationItem) => void;
  activeFamilyMember: FamilyProfile;
  setActiveFamilyMember: (member: FamilyProfile) => void;
  notifications: NotificationAlert[];
  unreadCount: number;
  markAllNotificationsRead: () => void;
  dismissNotification: (id: string) => void;
  userStats: {
    points: number;
    level: string;
    streakDays: number;
  };
}

const ShellContext = createContext<ShellContextType | undefined>(undefined);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<LocationItem>(MOCK_LOCATIONS[0]);
  const [activeFamilyMember, setActiveFamilyMember] = useState<FamilyProfile>(MOCK_FAMILY[0]);
  const [notifications, setNotifications] = useState<NotificationAlert[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const userStats = {
    points: 1420,
    level: "Clean Air Hero Lv. 3",
    streakDays: 7,
  };

  return (
    <ShellContext.Provider
      value={{
        currentLocation,
        setCurrentLocation,
        activeFamilyMember,
        setActiveFamilyMember,
        notifications,
        unreadCount,
        markAllNotificationsRead,
        dismissNotification,
        userStats,
      }}
    >
      {children}
    </ShellContext.Provider>
  );
}

export function useShell() {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error("useShell must be used within a ShellProvider");
  }
  return context;
}
