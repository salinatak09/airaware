/**
 * AirAware - Centralized Typed Client-Side API Client
 *
 * Exclusively communicates with Next.js Route Handlers (/api/...).
 * Never exposes MongoDB connections or Gemini keys to the browser.
 */

import type {
  DailyPlanResponse,
  UpdateMissionResponse,
  IndoorAirOverview,
  IndoorChecklistItem,
  HomeHealthMission,
  GamificationDashboardData,
  ExploreMapResponse,
  CommunityReportDto,
  CommunityChallengeItem,
  NotificationItemDto,
  NotificationPreferences,
  NotificationListResponse,
  ChatMessageDto,
  ChatSessionSummary,
  ChatResponseDto,
  UserProfileResponse,
} from "@/types/api";
import type { AqiCurrentResponse, AqiForecastResponse } from "@/types/aqi";

export class ApiClientError extends Error {
  public status: number;
  public code?: string;

  constructor(message: string, status: number = 500, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message?: string;
    code?: string;
  };
  message?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  let json: ApiResponse<T>;
  try {
    json = await response.json();
  } catch {
    throw new ApiClientError(
      `Failed to parse response from server (${response.status} ${response.statusText})`,
      response.status
    );
  }

  if (!response.ok || !json.success) {
    const errorMsg =
      json.error?.message ||
      json.message ||
      `Request failed with status ${response.status}`;
    throw new ApiClientError(errorMsg, response.status, json.error?.code);
  }

  return json.data as T;
}

export const apiClient = {
  // ==========================================
  // 1. AQI Endpoints
  // ==========================================
  aqi: {
    getCurrent: (params: {
      latitude?: number;
      longitude?: number;
      city?: string;
      demo?: boolean;
    }) => {
      const search = new URLSearchParams();
      if (params.latitude !== undefined) search.set("latitude", String(params.latitude));
      if (params.longitude !== undefined) search.set("longitude", String(params.longitude));
      if (params.city) search.set("city", params.city);
      if (params.demo) search.set("demo", "true");
      return request<AqiCurrentResponse>(`/api/aqi/current?${search.toString()}`);
    },

    getForecast: (params: {
      latitude?: number;
      longitude?: number;
      city?: string;
      days?: number;
      demo?: boolean;
    }) => {
      const search = new URLSearchParams();
      if (params.latitude !== undefined) search.set("latitude", String(params.latitude));
      if (params.longitude !== undefined) search.set("longitude", String(params.longitude));
      if (params.city) search.set("city", params.city);
      if (params.days) search.set("days", String(params.days));
      if (params.demo) search.set("demo", "true");
      return request<AqiForecastResponse>(`/api/aqi/forecast?${search.toString()}`);
    },

    getNearby: (params: {
      latitude?: number;
      longitude?: number;
      city?: string;
      radius?: number;
    }) => {
      const search = new URLSearchParams();
      if (params.latitude !== undefined) search.set("latitude", String(params.latitude));
      if (params.longitude !== undefined) search.set("longitude", String(params.longitude));
      if (params.city) search.set("city", params.city);
      if (params.radius) search.set("radius", String(params.radius));
      return request<ExploreMapResponse>(`/api/aqi/nearby?${search.toString()}`);
    },
  },

  // ==========================================
  // 2. Daily Plans & Missions
  // ==========================================
  plans: {
    getToday: () => {
      return request<DailyPlanResponse>("/api/plans/today");
    },

    getByDate: (date: string) => {
      return request<DailyPlanResponse>(`/api/plans/by-date/${date}`);
    },

    generate: (payload: {
      date?: string;
      forceRegenerate?: boolean;
      currentAqi?: number;
      city?: string;
    } = {}) => {
      return request<DailyPlanResponse>("/api/plans/generate", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    updateMission: (
      planId: string,
      missionId: string,
      payload: {
        action: "complete" | "skip" | "reschedule";
        rescheduledTime?: string;
      }
    ) => {
      return request<UpdateMissionResponse>(
        `/api/plans/${planId}/missions/${missionId}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        }
      );
    },
  },

  // ==========================================
  // 3. Indoor Air Sanctuary
  // ==========================================
  indoor: {
    getOverview: () => {
      return request<IndoorAirOverview>("/api/indoor");
    },

    toggleChecklist: (itemId: string, completed: boolean) => {
      return request<{ checklist: IndoorChecklistItem[] }>("/api/indoor", {
        method: "POST",
        body: JSON.stringify({
          action: "toggle_checklist",
          itemId,
          completed,
        }),
      });
    },

    completeMission: (missionId: string) => {
      return request<{
        mission: HomeHealthMission;
        xpAwarded: number;
        totalXp: number;
        level: number;
        message: string;
      }>("/api/indoor", {
        method: "POST",
        body: JSON.stringify({
          action: "complete_mission",
          missionId,
        }),
      });
    },

    controlPurifier: (
      roomId: string,
      active: boolean,
      speed?: "low" | "medium" | "high" | "turbo" | "off"
    ) => {
      return request<{ room: any }>("/api/indoor", {
        method: "POST",
        body: JSON.stringify({
          action: "control_purifier",
          roomId,
          active,
          speed,
        }),
      });
    },

    getAdvice: (context: Record<string, any> = {}) => {
      return request<any>("/api/ai/indoor-advice", {
        method: "POST",
        body: JSON.stringify(context),
      });
    },
  },

  // ==========================================
  // 4. Impact & Gamification
  // ==========================================
  impact: {
    getOverview: () => {
      return request<GamificationDashboardData>("/api/impact");
    },

    logAction: (payload: {
      actionType: string;
      missionId?: string;
      customTitle?: string;
    }) => {
      return request<{
        action: any;
        xpEarned: number;
        totalXp: number;
        level: number;
        streak: number;
        message: string;
      }>("/api/impact", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  },

  // ==========================================
  // 5. Community Features
  // ==========================================
  community: {
    getReports: (params: {
      city?: string;
      category?: string;
      status?: string;
      limit?: number;
    } = {}) => {
      const search = new URLSearchParams();
      if (params.city) search.set("city", params.city);
      if (params.category && params.category !== "all") search.set("category", params.category);
      if (params.status) search.set("status", params.status);
      if (params.limit) search.set("limit", String(params.limit));
      return request<CommunityReportDto[]>(`/api/community?${search.toString()}`);
    },

    createReport: (payload: {
      city: string;
      area: string;
      landmark?: string;
      latitude?: number;
      longitude?: number;
      reportType: string;
      description: string;
      severity?: string;
      imageReference?: string;
      observedTime?: string;
      authorName?: string;
      authorRole?: string;
    }) => {
      return request<CommunityReportDto>("/api/community", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    upvoteReport: (reportId: string) => {
      return request<{ reportId: string; upvotes: number; userHasUpvoted: boolean }>(
        `/api/community/reports/${reportId}/upvote`,
        {
          method: "POST",
        }
      );
    },

    flagReport: (reportId: string, reason: string) => {
      return request<{ message: string; reportId: string }>(
        `/api/community/reports/${reportId}/flag`,
        {
          method: "POST",
          body: JSON.stringify({ reason }),
        }
      );
    },

    getChallenges: () => {
      return request<CommunityChallengeItem[]>("/api/community/challenges");
    },

    joinChallenge: (challengeId: string) => {
      return request<{ challengeId: string; joined: boolean; participantsCount: number }>(
        "/api/community/challenges",
        {
          method: "POST",
          body: JSON.stringify({ action: "join", challengeId }),
        }
      );
    },
  },

  // ==========================================
  // 6. Notification System
  // ==========================================
  notifications: {
    getAll: (params: {
      category?: string;
      unreadOnly?: boolean;
      limit?: number;
    } = {}) => {
      const search = new URLSearchParams();
      if (params.category && params.category !== "all") search.set("category", params.category);
      if (params.unreadOnly) search.set("unreadOnly", "true");
      if (params.limit) search.set("limit", String(params.limit));
      return request<NotificationListResponse>(`/api/notifications?${search.toString()}`);
    },

    markRead: (id: string) => {
      return request<NotificationItemDto>(`/api/notifications/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isRead: true }),
      });
    },

    markAllRead: () => {
      return request<{ markedCount: number; message: string }>("/api/notifications/read-all", {
        method: "POST",
      });
    },

    getPreferences: () => {
      return request<NotificationPreferences>("/api/notifications/preferences");
    },

    updatePreferences: (preferences: Partial<NotificationPreferences>) => {
      return request<NotificationPreferences>("/api/notifications/preferences", {
        method: "PATCH",
        body: JSON.stringify(preferences),
      });
    },
  },

  // ==========================================
  // 7. AI Buddy & Gemini Intelligence
  // ==========================================
  ai: {
    chat: (payload: {
      prompt: string;
      sessionId?: string;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
      context?: Record<string, any>;
    }) => {
      return request<ChatResponseDto>("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    getChatSessions: (sessionId?: string) => {
      const search = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : "";
      return request<{
        sessions?: ChatSessionSummary[];
        activeSession?: any;
      }>(`/api/ai/chat${search}`);
    },

    getDailySummary: (context: Record<string, any> = {}) => {
      return request<any>("/api/ai/daily-summary", {
        method: "POST",
        body: JSON.stringify(context),
      });
    },

    getCommuteAdvice: (payload: Record<string, any> = {}) => {
      return request<any>("/api/ai/commute-advice", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  },

  // ==========================================
  // 8. User Profile & Settings
  // ==========================================
  profile: {
    get: () => {
      return request<UserProfileResponse>("/api/profile");
    },

    update: (payload: Partial<UserProfileResponse>) => {
      return request<UserProfileResponse>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },

    exportData: () => {
      return request<any>("/api/profile/export");
    },

    updateSecurity: (payload: { currentPassword?: string; newPassword?: string }) => {
      return request<{ message: string }>("/api/profile/security", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    resetAiHistory: () => {
      return request<{ message: string }>("/api/profile/reset-ai", {
        method: "POST",
      });
    },
  },

  // ==========================================
  // 9. Current User Context
  // ==========================================
  user: {
    getMe: () => {
      return request<{ user: any }>("/api/users/me");
    },
  },
};
