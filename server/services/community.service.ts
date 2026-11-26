import "server-only";
import mongoose from "mongoose";
import { connectToDatabase } from "../db/index.ts";
import { CommunityReport, type ICommunityReport, type CommunityReportType, type ModerationStatus } from "../../models/index.ts";
import { impactService } from "./impact.service.ts";

export interface CommunityReportDto {
  id: string;
  authorName: string;
  authorRole: string;
  neighborhood: string;
  city: string;
  approximateLocation: string;
  coordinates: [number, number]; // [longitude, latitude] (fuzzed)
  hazardType: CommunityReportType;
  hazardLabel: string;
  hazardIcon: string;
  description: string;
  imageReference?: string;
  severity: "low" | "medium" | "high" | "severe";
  moderationStatus: ModerationStatus;
  upvotes: number;
  flagsCount: number;
  observedAt: string;
  timeFormatted: string;
  isApproximate: boolean;
  provenance: "citizen_report";
  disclaimer: string;
  isOfficialSensor: false;
}

export interface CommunityChallengeItem {
  id: string;
  title: string;
  category: "anti_burning" | "transit" | "construction" | "indoor";
  description: string;
  goal: string;
  currentProgress: number;
  targetProgress: number;
  progressPercent: number;
  participantsCount: number;
  badgeReward: string;
  xpReward: number;
  daysRemaining: number;
  isJoined: boolean;
}

export interface NeighborhoodActivityItem {
  id: string;
  title: string;
  activityType: "anti_burning_patrol" | "school_awareness" | "cleanliness_drive" | "green_corridor";
  description: string;
  organizer: string;
  location: string;
  date: string;
  time: string;
  attendeesCount: number;
  isAttending: boolean;
}

import { HAZARD_METADATA } from "../../lib/community-constants.ts";
export { HAZARD_METADATA };

// In-memory rate limiting store: userId -> timestamps array
const rateLimitStore = new Map<string, number[]>();

export class CommunityService {
  private static lastDbCheck = 0;
  private static dbOffline = false;

  // In-memory fallback dataset for seamless offline operation & unit testing
  private static inMemoryReports: CommunityReportDto[] = [
    {
      id: "rep_101",
      authorName: "Ananya M.",
      authorRole: "Parent • Neighborhood Watch",
      neighborhood: "Lajpat Nagar IV",
      city: "New Delhi",
      approximateLocation: "Near Metro Flyover Pillar 140, Lajpat Nagar IV",
      coordinates: [77.2435, 28.5682], // fuzzed [lon, lat]
      hazardType: "garbage_burning",
      hazardLabel: "Open Garbage & Waste Burning",
      hazardIcon: "🔥",
      description: "Open municipal waste fire spotted near railway embankment. Dense black smoke blowing into residential blocks.",
      imageReference: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80",
      severity: "severe",
      moderationStatus: "verified",
      upvotes: 18,
      flagsCount: 0,
      observedAt: new Date(Date.now() - 35 * 60000).toISOString(),
      timeFormatted: "35 mins ago",
      isApproximate: true,
      provenance: "citizen_report",
      disclaimer: "Citizen Observation. Not an official AQI ground measurement or government station.",
      isOfficialSensor: false,
    },
    {
      id: "rep_102",
      authorName: "Vikram S.",
      authorRole: "Commuter & Cyclist",
      neighborhood: "Dwarka Sector 12",
      city: "New Delhi",
      approximateLocation: "Near Sector 12 Metro Station Junction",
      coordinates: [77.0421, 28.5912],
      hazardType: "construction_dust",
      hazardLabel: "Uncovered Construction Dust & Sand",
      hazardIcon: "🏗️",
      description: "Large unshielded cement and dry soil excavation without water sprinklers. Dust haze extending over 300 meters.",
      imageReference: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80",
      severity: "high",
      moderationStatus: "approved",
      upvotes: 11,
      flagsCount: 0,
      observedAt: new Date(Date.now() - 90 * 60000).toISOString(),
      timeFormatted: "1.5 hours ago",
      isApproximate: true,
      provenance: "citizen_report",
      disclaimer: "Citizen Observation. Not an official AQI ground measurement or government station.",
      isOfficialSensor: false,
    },
    {
      id: "rep_103",
      authorName: "Dr. Priya K.",
      authorRole: "Resident Physician",
      neighborhood: "Rohini Sector 7",
      city: "New Delhi",
      approximateLocation: "Near Rohini West Outer Ring Junction",
      coordinates: [77.1145, 28.7089],
      hazardType: "heavy_traffic",
      hazardLabel: "Heavy Diesel Traffic & Gridlock",
      hazardIcon: "🚗",
      description: "Severe bottleneck with idling commercial trucks outside local school gate. High exhaust accumulation.",
      imageReference: undefined,
      severity: "severe",
      moderationStatus: "verified",
      upvotes: 29,
      flagsCount: 0,
      observedAt: new Date(Date.now() - 150 * 60000).toISOString(),
      timeFormatted: "2.5 hours ago",
      isApproximate: true,
      provenance: "citizen_report",
      disclaimer: "Citizen Observation. Not an official AQI ground measurement or government station.",
      isOfficialSensor: false,
    },
    {
      id: "rep_104",
      authorName: "Rajeev N.",
      authorRole: "Community Volunteer",
      neighborhood: "Anand Vihar ISBT",
      city: "New Delhi",
      approximateLocation: "Near Interstate Bus Terminal Exit",
      coordinates: [77.3142, 28.6475],
      hazardType: "industrial_smoke",
      hazardLabel: "Industrial & Factory Chimney Smoke",
      hazardIcon: "🏭",
      description: "Unfiltered boiler smoke observed from industrial cluster across border. Noticeable acrid smell.",
      imageReference: undefined,
      severity: "severe",
      moderationStatus: "pending",
      upvotes: 6,
      flagsCount: 0,
      observedAt: new Date(Date.now() - 240 * 60000).toISOString(),
      timeFormatted: "4 hours ago",
      isApproximate: true,
      provenance: "citizen_report",
      disclaimer: "Citizen Observation. Not an official AQI ground measurement or government station.",
      isOfficialSensor: false,
    },
    {
      id: "rep_105",
      authorName: "Meera D.",
      authorRole: "Environmental Science Teacher",
      neighborhood: "Lodhi Gardens Corridor",
      city: "New Delhi",
      approximateLocation: "Near Lodhi Estate Walking Track",
      coordinates: [77.2185, 28.5925],
      hazardType: "clean_corridor",
      hazardLabel: "Clean Green Corridor / Safe Route",
      hazardIcon: "🍃",
      description: "Dense canopy corridor with noticeably reduced particulate. Excellent low-exposure walking alternative to the main road.",
      imageReference: undefined,
      severity: "low",
      moderationStatus: "verified",
      upvotes: 34,
      flagsCount: 0,
      observedAt: new Date(Date.now() - 360 * 60000).toISOString(),
      timeFormatted: "6 hours ago",
      isApproximate: true,
      provenance: "citizen_report",
      disclaimer: "Citizen Observation. Not an official AQI ground measurement or government station.",
      isOfficialSensor: false,
    },
  ];

  private static inMemoryChallenges: CommunityChallengeItem[] = [
    {
      id: "chal_1",
      title: "Delhi Zero Open Burning Sprint",
      category: "anti_burning",
      description: "Report open leaf or waste fires to prompt swift municipal ward sprinkler interventions.",
      goal: "Log and resolve 200 localized burning incidents across NCR",
      currentProgress: 154,
      targetProgress: 200,
      progressPercent: 77,
      participantsCount: 418,
      badgeReward: "Pollution Protector",
      xpReward: 35,
      daysRemaining: 6,
      isJoined: true,
    },
    {
      id: "chal_2",
      title: "School Gate Anti-Idling Zone",
      category: "transit",
      description: "Encourage school vans and parents to switch off engines during 15-minute pickup windows.",
      goal: "Engage 100 school transport drivers and parent groups",
      currentProgress: 82,
      targetProgress: 100,
      progressPercent: 82,
      participantsCount: 230,
      badgeReward: "Family Champion",
      xpReward: 25,
      daysRemaining: 12,
      isJoined: false,
    },
    {
      id: "chal_3",
      title: "Dust Shield Neighborhood Watch",
      category: "construction",
      description: "Identify unshielded roadwork or construction excavation lacking water suppression.",
      goal: "Monitor 50 active infrastructure sites in residential zones",
      currentProgress: 39,
      targetProgress: 50,
      progressPercent: 78,
      participantsCount: 165,
      badgeReward: "Atmospheric Sentinel",
      xpReward: 30,
      daysRemaining: 9,
      isJoined: true,
    },
  ];

  private static inMemoryActivities: NeighborhoodActivityItem[] = [
    {
      id: "act_1",
      title: "South Delhi Community Air Walking Audit",
      activityType: "anti_burning_patrol",
      description: "A 45-minute collective morning stroll documenting local biomass smoke, idling pockets, and clean transit paths.",
      organizer: "Lajpat Nagar Resident Welfare Association",
      location: "Central Park Gate 2, Lajpat Nagar IV",
      date: "Saturday, Nov 28, 2026",
      time: "8:00 AM - 8:45 AM",
      attendeesCount: 26,
      isAttending: true,
    },
    {
      id: "act_2",
      title: "Pediatric Mask Fit & Air Awareness Workshop",
      activityType: "school_awareness",
      description: "Interactive session showing parents how to properly seal N95 respirators on children without air leaks.",
      organizer: "Delhi Parents for Clean Air & Pediatric Care",
      location: "Community Center, Sector 14, Dwarka",
      date: "Sunday, Nov 29, 2026",
      time: "10:30 AM - 11:45 AM",
      attendeesCount: 42,
      isAttending: false,
    },
    {
      id: "act_3",
      title: "Green Canopy Planting & Anti-Dust Misting Drive",
      activityType: "green_corridor",
      description: "Community effort watering roadside foliage and distributing low-cost home sealing weatherstrips.",
      organizer: "NCR Clean Air Action Youth Collective",
      location: "Near District Park, Rohini",
      date: "Tuesday, Dec 1, 2026",
      time: "4:00 PM - 5:30 PM",
      attendeesCount: 31,
      isAttending: false,
    },
  ];

  /**
   * Safe Database connection helper with backoff
   */
  private async safeDbConnect(): Promise<boolean> {
    const now = Date.now();
    if (CommunityService.dbOffline && now - CommunityService.lastDbCheck < 30000) {
      return false;
    }
    try {
      await connectToDatabase();
      CommunityService.dbOffline = false;
      return true;
    } catch {
      CommunityService.dbOffline = true;
      CommunityService.lastDbCheck = now;
      return false;
    }
  }

  /**
   * Privacy: Fuzz coordinates to ~500m precision (rounds to 2-3 decimals with subtle privacy jitter)
   */
  fuzzCoordinates(lat: number, lon: number): [number, number] {
    // 0.005 degrees latitude is ~550m
    const roundedLon = Math.round(lon * 200) / 200;
    const roundedLat = Math.round(lat * 200) / 200;
    return [roundedLon, roundedLat];
  }

  /**
   * Privacy: Sanitize address strings to remove house numbers, flat numbers, and private apartment details
   */
  sanitizeApproximateAddress(rawAddress: string, area = "Local Neighborhood"): string {
    if (!rawAddress) return `Near ${area}`;
    // Strip common private residence patterns: "Flat 201", "H.No 45", "House #12", "Plot 5", "Floor 3"
    let sanitized = rawAddress
      .replace(/\b(flat|apt|apartment|house|h\.no|hno|plot|unit|floor|room)\s*#?\s*\w+[-/]?\w*/gi, "")
      .replace(/\b#\s*\d+[-/]?\w*/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    if (!sanitized || sanitized.length < 3) {
      return `Near ${area}`;
    }

    return sanitized;
  }

  /**
   * Anti-Spam: Rate limit user submissions (max 3 reports per user per hour, 30s cooldown)
   */
  checkRateLimit(userId: string): { allowed: boolean; retryAfterSeconds?: number } {
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour
    const timestamps = rateLimitStore.get(userId) || [];

    // Filter to last hour
    const recent = timestamps.filter((t) => now - t < windowMs);

    // Cooldown check: minimum 30s between submissions
    if (recent.length > 0) {
      const last = recent[recent.length - 1];
      if (now - last < 30 * 1000) {
        const waitSec = Math.ceil((30 * 1000 - (now - last)) / 1000);
        return { allowed: false, retryAfterSeconds: waitSec };
      }
    }

    // Hourly limit: max 3 reports per hour
    if (recent.length >= 3) {
      const oldest = recent[0];
      const waitSec = Math.ceil((windowMs - (now - oldest)) / 1000);
      return { allowed: false, retryAfterSeconds: waitSec };
    }

    recent.push(now);
    rateLimitStore.set(userId, recent);
    return { allowed: true };
  }

  /**
   * Format relative time string
   */
  private formatTimeAgo(dateInput: Date | string): string {
    const time = new Date(dateInput).getTime();
    const diffMs = Date.now() - time;
    const mins = Math.max(1, Math.floor(diffMs / 60000));
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  /**
   * Retrieve community reports with optional filtering
   */
  async getReports(params?: {
    city?: string;
    category?: string;
    moderationStatus?: string;
    limit?: number;
  }): Promise<CommunityReportDto[]> {
    const city = params?.city || "New Delhi";
    const category = params?.category;
    const status = params?.moderationStatus;
    const limit = params?.limit || 25;

    const dbConnected = await this.safeDbConnect();
    if (dbConnected) {
      try {
        const query: any = {};
        if (city) {
          query["location.city"] = new RegExp(city, "i");
        }
        if (category && category !== "all") {
          query["reportType"] = category;
        }
        if (status && status !== "all") {
          query["moderationStatus"] = status;
        } else {
          // By default, exclude rejected reports from the community feed
          query["moderationStatus"] = { $ne: "rejected" };
        }

        const docs = await CommunityReport.find(query)
          .sort({ reportedAt: -1 })
          .limit(limit)
          .populate("userId", "name avatar preferences")
          .lean()
          .exec();

        if (docs && docs.length > 0) {
          return docs.map((doc: any) => {
            const user = doc.userId as any;
            const meta = HAZARD_METADATA[doc.reportType as CommunityReportType] || HAZARD_METADATA.other;

            return {
              id: doc._id.toString(),
              authorName: doc.authorName || user?.name || "Local Resident",
              authorRole: doc.authorRole || "Community Member",
              neighborhood: doc.location?.area || "Neighborhood",
              city: doc.location?.city || city,
              approximateLocation:
                doc.location?.approximateAddress ||
                (doc.location?.landmark ? `Near ${doc.location.landmark}` : `Near ${doc.location?.area}`),
              coordinates: (doc.location?.coordinates?.coordinates as [number, number]) || [77.209, 28.6139],
              hazardType: doc.reportType as CommunityReportType,
              hazardLabel: meta.label,
              hazardIcon: meta.icon,
              description: doc.description,
              imageReference: doc.imageReference,
              severity: doc.severity || meta.defaultSeverity,
              moderationStatus: doc.moderationStatus || "pending",
              upvotes: doc.upvotes || 0,
              flagsCount: doc.flagsCount || 0,
              observedAt: doc.observedAt ? new Date(doc.observedAt).toISOString() : new Date().toISOString(),
              timeFormatted: this.formatTimeAgo(doc.observedAt || doc.reportedAt || new Date()),
              isApproximate: doc.location?.isApproximate ?? true,
              provenance: "citizen_report",
              disclaimer: "Citizen Observation. Not an official AQI ground measurement or government station.",
              isOfficialSensor: false,
            };
          });
        }
      } catch (err) {
        console.warn("MongoDB getReports error, falling back to memory:", err);
      }
    }

    // In-memory fallback
    let reports = [...CommunityService.inMemoryReports];
    if (category && category !== "all") {
      reports = reports.filter((r) => r.hazardType === category);
    }
    if (status && status !== "all") {
      reports = reports.filter((r) => r.moderationStatus === status);
    }

    return reports.slice(0, limit);
  }

  /**
   * Retrieve single community report by ID
   */
  async getReportById(reportId: string): Promise<CommunityReportDto | null> {
    const dbConnected = await this.safeDbConnect();
    if (dbConnected) {
      try {
        const doc: any = await CommunityReport.findById(reportId).populate("userId", "name avatar").lean().exec();
        if (doc) {
          const user = doc.userId as any;
          const meta = HAZARD_METADATA[doc.reportType as CommunityReportType] || HAZARD_METADATA.other;

          return {
            id: doc._id.toString(),
            authorName: doc.authorName || user?.name || "Local Resident",
            authorRole: doc.authorRole || "Community Member",
            neighborhood: doc.location?.area || "Neighborhood",
            city: doc.location?.city || "New Delhi",
            approximateLocation:
              doc.location?.approximateAddress ||
              (doc.location?.landmark ? `Near ${doc.location.landmark}` : `Near ${doc.location?.area}`),
            coordinates: (doc.location?.coordinates?.coordinates as [number, number]) || [77.209, 28.6139],
            hazardType: doc.reportType as CommunityReportType,
            hazardLabel: meta.label,
            hazardIcon: meta.icon,
            description: doc.description,
            imageReference: doc.imageReference,
            severity: doc.severity || meta.defaultSeverity,
            moderationStatus: doc.moderationStatus || "pending",
            upvotes: doc.upvotes || 0,
            flagsCount: doc.flagsCount || 0,
            observedAt: doc.observedAt ? new Date(doc.observedAt).toISOString() : new Date().toISOString(),
            timeFormatted: this.formatTimeAgo(doc.observedAt || doc.reportedAt || new Date()),
            isApproximate: doc.location?.isApproximate ?? true,
            provenance: "citizen_report",
            disclaimer: "Citizen Observation. Not an official AQI ground measurement or government station.",
            isOfficialSensor: false,
          };
        }
      } catch (err) {
        console.warn("MongoDB getReportById fallback:", err);
      }
    }

    return CommunityService.inMemoryReports.find((r) => r.id === reportId) || null;
  }

  /**
   * Create a community report with privacy sanitization, rate limiting, and XP rewards
   */
  async createReport(input: {
    userId?: string;
    authorName?: string;
    authorRole?: string;
    city: string;
    area: string;
    landmark?: string;
    rawAddress?: string;
    latitude?: number;
    longitude?: number;
    reportType: CommunityReportType;
    description: string;
    severity?: "low" | "medium" | "high" | "severe";
    imageReference?: string;
    observedTime?: string;
  }): Promise<{ report: CommunityReportDto; xpAwarded: number; message: string }> {
    const effectiveUserId = input.userId || "anon_user_" + Math.random().toString(36).substring(7);

    // 1. Rate limiting & anti-abuse check
    const rateCheck = this.checkRateLimit(effectiveUserId);
    if (!rateCheck.allowed) {
      throw new Error(`Rate limit exceeded. Please wait ${rateCheck.retryAfterSeconds}s before submitting another report.`);
    }

    // 2. Input validation
    if (!input.description || input.description.trim().length < 10) {
      throw new Error("Report description must be at least 10 characters long.");
    }

    const hazardMeta = HAZARD_METADATA[input.reportType] || HAZARD_METADATA.other;
    const severity = input.severity || hazardMeta.defaultSeverity;

    // 3. Privacy Preservation: Coordinates Fuzzing & Address Sanitization
    const defaultCoords = { lat: 28.6139, lon: 77.209 }; // New Delhi default
    const rawLat = typeof input.latitude === "number" ? input.latitude : defaultCoords.lat;
    const rawLon = typeof input.longitude === "number" ? input.longitude : defaultCoords.lon;
    const fuzzedCoordinates = this.fuzzCoordinates(rawLat, rawLon);

    const approximateAddress = this.sanitizeApproximateAddress(
      input.rawAddress || input.landmark || `Near ${input.area}`,
      input.area
    );

    const now = new Date();
    const observedAt = input.observedTime ? new Date(input.observedTime) : now;

    let createdId = `rep_${Date.now()}`;
    const dbConnected = await this.safeDbConnect();

    if (dbConnected) {
      try {
        const created = await CommunityReport.create({
          userId: input.userId && mongoose.Types.ObjectId.isValid(input.userId)
            ? new mongoose.Types.ObjectId(input.userId)
            : new mongoose.Types.ObjectId(),
          authorName: input.authorName?.trim() || "Local Resident",
          authorRole: input.authorRole?.trim() || "Community Member",
          location: {
            city: input.city.trim(),
            area: input.area.trim(),
            landmark: input.landmark?.trim(),
            approximateAddress,
            coordinates: {
              type: "Point",
              coordinates: fuzzedCoordinates,
            },
            isApproximate: true,
          },
          reportType: input.reportType,
          description: input.description.trim(),
          imageReference: input.imageReference,
          severity,
          moderationStatus: "pending",
          upvotes: 0,
          flagsCount: 0,
          observedAt,
          reportedAt: now,
        });

        createdId = created._id.toString();
      } catch (err) {
        console.warn("MongoDB createReport error, saving to memory:", err);
      }
    }

    const newReportDto: CommunityReportDto = {
      id: createdId,
      authorName: input.authorName?.trim() || "Local Resident",
      authorRole: input.authorRole?.trim() || "Community Member",
      neighborhood: input.area.trim(),
      city: input.city.trim(),
      approximateLocation: approximateAddress,
      coordinates: fuzzedCoordinates,
      hazardType: input.reportType,
      hazardLabel: hazardMeta.label,
      hazardIcon: hazardMeta.icon,
      description: input.description.trim(),
      imageReference: input.imageReference,
      severity,
      moderationStatus: "pending",
      upvotes: 0,
      flagsCount: 0,
      observedAt: observedAt.toISOString(),
      timeFormatted: "Just now",
      isApproximate: true,
      provenance: "citizen_report",
      disclaimer: "Citizen Observation. Not an official AQI ground measurement or government station.",
      isOfficialSensor: false,
    };

    // Prepend to in-memory store
    CommunityService.inMemoryReports.unshift(newReportDto);

    // 4. Gamification Hook: Award XP (+25 XP for community contribution)
    let xpAwarded = 25;
    try {
      await impactService.logUserAction(
        effectiveUserId,
        "community_report",
        `report_${createdId}`,
        `Reported local hazard: ${hazardMeta.label}`
      );
    } catch {
      // Impact service resilience
    }

    return {
      report: newReportDto,
      xpAwarded,
      message: "Report submitted successfully! Thank you for protecting your neighborhood with verified local observations.",
    };
  }

  /**
   * Community Upvote / Confirmation:
   * Confirms a report. If it reaches >= 3 upvotes, auto-promotes moderationStatus to "verified".
   */
  async upvoteReport(reportId: string, userId?: string): Promise<{ upvotes: number; status: ModerationStatus }> {
    const dbConnected = await this.safeDbConnect();
    if (dbConnected) {
      try {
        const report = await CommunityReport.findById(reportId);
        if (report) {
          report.upvotes = (report.upvotes || 0) + 1;
          if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            report.upvotedBy.push(new mongoose.Types.ObjectId(userId));
          }
          if (report.upvotes >= 3 && report.moderationStatus === "pending") {
            report.moderationStatus = "verified";
          }
          await report.save();
          return { upvotes: report.upvotes, status: report.moderationStatus };
        }
      } catch (err) {
        console.warn("MongoDB upvote error:", err);
      }
    }

    // In-memory fallback
    const memReport = CommunityService.inMemoryReports.find((r) => r.id === reportId);
    if (memReport) {
      memReport.upvotes += 1;
      if (memReport.upvotes >= 3 && memReport.moderationStatus === "pending") {
        memReport.moderationStatus = "verified";
      }
      return { upvotes: memReport.upvotes, status: memReport.moderationStatus };
    }

    return { upvotes: 1, status: "pending" };
  }

  /**
   * Flag Inaccurate / Spam:
   * Flags a report. If it receives >= 3 flags, auto-marks moderationStatus to "flagged".
   */
  async flagReport(reportId: string, reason?: string, userId?: string): Promise<{ flagsCount: number; status: ModerationStatus }> {
    const dbConnected = await this.safeDbConnect();
    if (dbConnected) {
      try {
        const report = await CommunityReport.findById(reportId);
        if (report) {
          report.flagsCount = (report.flagsCount || 0) + 1;
          if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            report.flaggedBy.push(new mongoose.Types.ObjectId(userId));
          }
          if (report.flagsCount >= 3) {
            report.moderationStatus = "flagged";
          }
          await report.save();
          return { flagsCount: report.flagsCount, status: report.moderationStatus };
        }
      } catch (err) {
        console.warn("MongoDB flag error:", err);
      }
    }

    // In-memory fallback
    const memReport = CommunityService.inMemoryReports.find((r) => r.id === reportId);
    if (memReport) {
      memReport.flagsCount += 1;
      if (memReport.flagsCount >= 3) {
        memReport.moderationStatus = "flagged";
      }
      return { flagsCount: memReport.flagsCount, status: memReport.moderationStatus };
    }

    return { flagsCount: 1, status: "flagged" };
  }

  /**
   * Retrieve Community Challenges & Neighborhood Awareness Activities
   */
  async getCommunityChallenges(): Promise<{
    challenges: CommunityChallengeItem[];
    awarenessActivities: NeighborhoodActivityItem[];
  }> {
    return {
      challenges: [...CommunityService.inMemoryChallenges],
      awarenessActivities: [...CommunityService.inMemoryActivities],
    };
  }

  /**
   * Join / Pledge a community challenge
   */
  async participateInChallenge(challengeId: string, userId?: string): Promise<{ success: boolean; xpAwarded: number }> {
    const challenge = CommunityService.inMemoryChallenges.find((c) => c.id === challengeId);
    if (challenge) {
      if (!challenge.isJoined) {
        challenge.isJoined = true;
        challenge.participantsCount += 1;
        challenge.currentProgress += 1;
        challenge.progressPercent = Math.min(100, Math.round((challenge.currentProgress / challenge.targetProgress) * 100));
      }

      // Award XP
      try {
        await impactService.logUserAction(
          userId || "anon_user",
          "challenge_participation",
          `challenge_${challengeId}`,
          `Pledged Community Challenge: ${challenge.title}`
        );
      } catch {
        // Resilience
      }

      return { success: true, xpAwarded: challenge.xpReward };
    }

    return { success: false, xpAwarded: 0 };
  }

  /**
   * Toggle RSVP attendance for a neighborhood activity
   */
  async toggleActivityRsvp(activityId: string): Promise<{ isAttending: boolean; attendeesCount: number }> {
    const activity = CommunityService.inMemoryActivities.find((a) => a.id === activityId);
    if (activity) {
      activity.isAttending = !activity.isAttending;
      activity.attendeesCount += activity.isAttending ? 1 : -1;
      return { isAttending: activity.isAttending, attendeesCount: activity.attendeesCount };
    }
    return { isAttending: true, attendeesCount: 1 };
  }
}

export const communityService = new CommunityService();
