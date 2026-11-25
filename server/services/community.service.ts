import "server-only";
import { connectToDatabase } from "@/server/db";
import { CommunityReport, ICommunityReport } from "@/models/CommunityReport";

export interface CommunityReportItem {
  id: string;
  authorName: string;
  neighborhood: string;
  hazardType: "garbage_burning" | "construction_dust" | "heavy_diesel_traffic" | "industrial_smoke" | "crop_residue" | "clean_corridor" | "other";
  description: string;
  severity: "low" | "moderate" | "severe";
  timestamp: string;
  upvotes: number;
}

export class CommunityService {
  private static fallbackReports: CommunityReportItem[] = [
    {
      id: "rep_1",
      authorName: "Ananya M.",
      neighborhood: "Lajpat Nagar IV",
      hazardType: "garbage_burning",
      description: "Open waste fire spotted near railway underpass causing dense black smoke.",
      severity: "severe",
      timestamp: "20 minutes ago",
      upvotes: 14,
    },
    {
      id: "rep_2",
      authorName: "Vikram S.",
      neighborhood: "Dwarka Sector 12",
      hazardType: "construction_dust",
      description: "Active road excavation without water spraying; PM10 sensor spikes detected.",
      severity: "moderate",
      timestamp: "1 hour ago",
      upvotes: 9,
    },
    {
      id: "rep_3",
      authorName: "Priya K.",
      neighborhood: "Rohini Sector 7",
      hazardType: "heavy_diesel_traffic",
      description: "Truck diversion causing stationary diesel bottleneck outside local primary school.",
      severity: "severe",
      timestamp: "2 hours ago",
      upvotes: 27,
    },
  ];

  async getReports(city = "New Delhi"): Promise<CommunityReportItem[]> {
    try {
      await connectToDatabase();
      const docs = await CommunityReport.find({
        $or: [{ "location.city": city }, { moderationStatus: "approved" }],
      })
        .sort({ reportedAt: -1 })
        .limit(20)
        .populate("userId", "name avatar")
        .lean()
        .exec();

      if (docs && docs.length > 0) {
        return docs.map((doc) => {
          const author = doc.userId as unknown as { name?: string };
          const reportedTime = doc.reportedAt ? new Date(doc.reportedAt).getTime() : Date.now();
          const minutesAgo = Math.max(1, Math.floor((Date.now() - reportedTime) / 60000));
          const timeLabel = minutesAgo < 60 ? `${minutesAgo}m ago` : `${Math.floor(minutesAgo / 60)}h ago`;

          return {
            id: doc._id.toString(),
            authorName: author?.name || "Local Citizen",
            neighborhood: doc.location.area,
            hazardType: doc.reportType === "heavy_traffic" ? "heavy_diesel_traffic" : (doc.reportType as CommunityReportItem["hazardType"]),
            description: doc.description,
            severity: doc.severity === "high" || doc.severity === "severe" ? "severe" : doc.severity === "low" ? "low" : "moderate",
            timestamp: timeLabel,
            upvotes: doc.upvotes || 0,
          };
        });
      }
    } catch {
      // Graceful fallback to memory
    }

    return [...CommunityService.fallbackReports];
  }

  async createReport(report: {
    authorName: string;
    neighborhood: string;
    hazardType: string;
    description: string;
    severity: "low" | "moderate" | "severe";
    userId?: string;
  }): Promise<CommunityReportItem> {
    const hazardMapping: Record<string, ICommunityReport["reportType"]> = {
      garbage_burning: "garbage_burning",
      construction_dust: "construction_dust",
      heavy_diesel_traffic: "heavy_traffic",
      industrial_smoke: "industrial_smoke",
      crop_residue: "crop_residue",
      clean_corridor: "clean_corridor",
      other: "other",
    };

    try {
      await connectToDatabase();
      if (report.userId) {
        const doc = await CommunityReport.create({
          userId: report.userId,
          location: {
            city: "New Delhi",
            area: report.neighborhood,
            coordinates: {
              type: "Point",
              coordinates: [77.209, 28.6139],
            },
          },
          reportType: hazardMapping[report.hazardType] || "other",
          description: report.description,
          severity: report.severity === "severe" ? "severe" : report.severity === "low" ? "low" : "medium",
          moderationStatus: "approved",
          upvotes: 1,
          reportedAt: new Date(),
        });

        return {
          id: doc._id.toString(),
          authorName: report.authorName,
          neighborhood: report.neighborhood,
          hazardType: report.hazardType as CommunityReportItem["hazardType"],
          description: report.description,
          severity: report.severity,
          timestamp: "Just now",
          upvotes: 1,
        };
      }
    } catch {
      // Fallback
    }

    const newReport: CommunityReportItem = {
      id: `rep_${Date.now()}`,
      authorName: report.authorName,
      neighborhood: report.neighborhood,
      hazardType: report.hazardType as CommunityReportItem["hazardType"],
      description: report.description,
      severity: report.severity,
      timestamp: "Just now",
      upvotes: 1,
    };
    CommunityService.fallbackReports.unshift(newReport);
    return newReport;
  }
}

export const communityService = new CommunityService();
