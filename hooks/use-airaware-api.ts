"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  DailyPlanResponse,
  IndoorAirOverview,
  GamificationDashboardData,
  ExploreMapResponse,
  CommunityReportDto,
  CommunityChallengeItem,
  NotificationListResponse,
  NotificationPreferences,
  UserProfileResponse,
} from "@/types/api";
import type { AqiCurrentResponse, AqiForecastResponse } from "@/types/aqi";

// Query keys
export const queryKeys = {
  aqiCurrent: (lat?: number, lon?: number, city?: string, demo?: boolean) =>
    ["aqi", "current", { lat, lon, city, demo }] as const,
  aqiForecast: (lat?: number, lon?: number, city?: string, days?: number, demo?: boolean) =>
    ["aqi", "forecast", { lat, lon, city, days, demo }] as const,
  aqiNearby: (lat?: number, lon?: number, city?: string, radius?: number) =>
    ["aqi", "nearby", { lat, lon, city, radius }] as const,
  todayPlan: () => ["plans", "today"] as const,
  planByDate: (date: string) => ["plans", "byDate", date] as const,
  indoorOverview: () => ["indoor", "overview"] as const,
  gamification: () => ["impact", "overview"] as const,
  communityReports: (city?: string, category?: string, status?: string) =>
    ["community", "reports", { city, category, status }] as const,
  communityChallenges: () => ["community", "challenges"] as const,
  notifications: (category?: string, unreadOnly?: boolean) =>
    ["notifications", { category, unreadOnly }] as const,
  notificationPreferences: () => ["notifications", "preferences"] as const,
  profile: () => ["profile"] as const,
  chatSessions: (sessionId?: string) => ["ai", "chatSessions", sessionId] as const,
};

// ==========================================
// 1. AQI Hooks
// ==========================================

export function useCurrentAqiQuery(params: {
  latitude?: number;
  longitude?: number;
  city?: string;
  demo?: boolean;
  enabled?: boolean;
}) {
  return useQuery<AqiCurrentResponse, Error>({
    queryKey: queryKeys.aqiCurrent(params.latitude, params.longitude, params.city, params.demo),
    queryFn: () => apiClient.aqi.getCurrent(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: params.enabled !== false,
  });
}

export function useForecastAqiQuery(params: {
  latitude?: number;
  longitude?: number;
  city?: string;
  days?: number;
  demo?: boolean;
  enabled?: boolean;
}) {
  return useQuery<AqiForecastResponse, Error>({
    queryKey: queryKeys.aqiForecast(
      params.latitude,
      params.longitude,
      params.city,
      params.days,
      params.demo
    ),
    queryFn: () => apiClient.aqi.getForecast(params),
    staleTime: 1000 * 60 * 15, // 15 minutes
    enabled: params.enabled !== false,
  });
}

export function useExploreNearbyQuery(params: {
  latitude?: number;
  longitude?: number;
  city?: string;
  radius?: number;
  enabled?: boolean;
}) {
  return useQuery<ExploreMapResponse, Error>({
    queryKey: queryKeys.aqiNearby(params.latitude, params.longitude, params.city, params.radius),
    queryFn: () => apiClient.aqi.getNearby(params),
    staleTime: 1000 * 60 * 5,
    enabled: params.enabled !== false,
  });
}

// ==========================================
// 2. Daily Plan Hooks
// ==========================================

export function useTodayPlanQuery() {
  return useQuery<DailyPlanResponse, Error>({
    queryKey: queryKeys.todayPlan(),
    queryFn: () => apiClient.plans.getToday(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useGeneratePlanMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.plans.generate,
    onSuccess: (newPlan) => {
      queryClient.setQueryData(queryKeys.todayPlan(), newPlan);
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.gamification() });
    },
  });
}

export function useUpdateMissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      planId,
      missionId,
      action,
      rescheduledTime,
    }: {
      planId: string;
      missionId: string;
      action: "complete" | "skip" | "reschedule";
      rescheduledTime?: string;
    }) =>
      apiClient.plans.updateMission(planId, missionId, { action, rescheduledTime }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todayPlan() });
      queryClient.invalidateQueries({ queryKey: queryKeys.gamification() });
    },
  });
}

// ==========================================
// 3. Indoor Air Hooks
// ==========================================

export function useIndoorOverviewQuery() {
  return useQuery<IndoorAirOverview, Error>({
    queryKey: queryKeys.indoorOverview(),
    queryFn: () => apiClient.indoor.getOverview(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useToggleChecklistMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, completed }: { itemId: string; completed: boolean }) =>
      apiClient.indoor.toggleChecklist(itemId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.indoorOverview() });
    },
  });
}

export function useCompleteIndoorMissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (missionId: string) => apiClient.indoor.completeMission(missionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.indoorOverview() });
      queryClient.invalidateQueries({ queryKey: queryKeys.gamification() });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayPlan() });
    },
  });
}

// ==========================================
// 4. Impact / Gamification Hooks
// ==========================================

export function useGamificationOverviewQuery() {
  return useQuery<GamificationDashboardData, Error>({
    queryKey: queryKeys.gamification(),
    queryFn: () => apiClient.impact.getOverview(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useLogImpactActionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { actionType: string; missionId?: string; customTitle?: string }) =>
      apiClient.impact.logAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gamification() });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayPlan() });
    },
  });
}

// ==========================================
// 5. Community Hooks
// ==========================================

export function useCommunityReportsQuery(params: {
  city?: string;
  category?: string;
  status?: string;
  limit?: number;
} = {}) {
  return useQuery<CommunityReportDto[], Error>({
    queryKey: queryKeys.communityReports(params.city, params.category, params.status),
    queryFn: () => apiClient.community.getReports(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCommunityChallengesQuery() {
  return useQuery<CommunityChallengeItem[], Error>({
    queryKey: queryKeys.communityChallenges(),
    queryFn: () => apiClient.community.getChallenges(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateCommunityReportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.community.createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", "reports"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.gamification() });
    },
  });
}

export function useUpvoteCommunityReportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportId: string) => apiClient.community.upvoteReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", "reports"] });
    },
  });
}

export function useJoinCommunityChallengeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (challengeId: string) => apiClient.community.joinChallenge(challengeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communityChallenges() });
      queryClient.invalidateQueries({ queryKey: queryKeys.gamification() });
    },
  });
}

// ==========================================
// 6. Notification Hooks
// ==========================================

export function useNotificationsQuery(params: {
  category?: string;
  unreadOnly?: boolean;
  limit?: number;
} = {}) {
  return useQuery<NotificationListResponse, Error>({
    queryKey: queryKeys.notifications(params.category, params.unreadOnly),
    queryFn: () => apiClient.notifications.getAll(params),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.notifications.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.notifications.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useNotificationPreferencesQuery() {
  return useQuery<NotificationPreferences, Error>({
    queryKey: queryKeys.notificationPreferences(),
    queryFn: () => apiClient.notifications.getPreferences(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useUpdateNotificationPreferencesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (prefs: Partial<NotificationPreferences>) =>
      apiClient.notifications.updatePreferences(prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationPreferences() });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// ==========================================
// 7. Profile Hooks
// ==========================================

export function useUserProfileQuery() {
  return useQuery<UserProfileResponse, Error>({
    queryKey: queryKeys.profile(),
    queryFn: () => apiClient.profile.get(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateUserProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<UserProfileResponse>) => apiClient.profile.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
}

// ==========================================
// 8. AI Chat Hooks
// ==========================================

export function useChatSessionsQuery(sessionId?: string) {
  return useQuery({
    queryKey: queryKeys.chatSessions(sessionId),
    queryFn: () => apiClient.ai.getChatSessions(sessionId),
    staleTime: 1000 * 60,
  });
}

export function useSendChatMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.ai.chat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai", "chatSessions"] });
    },
  });
}
