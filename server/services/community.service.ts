import "server-only";

export interface CommunityReport {
  id: string;
  authorName: string;
  neighborhood: string;
  hazardType: "garbage_burning" | "construction_dust" | "heavy_diesel_traffic" | "industrial_smoke";
  description: string;
  severity: "low" | "moderate" | "severe";
  timestamp: string;
  upvotes: number;
}

export class CommunityService {
  private static reports: CommunityReport[] = [
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

  async getReports(): Promise<CommunityReport[]> {
    return [...CommunityService.reports];
  }

  async createReport(report: Omit<CommunityReport, "id" | "timestamp" | "upvotes">): Promise<CommunityReport> {
    const newReport: CommunityReport = {
      ...report,
      id: `rep_${Date.now()}`,
      timestamp: "Just now",
      upvotes: 1,
    };
    CommunityService.reports.unshift(newReport);
    return newReport;
  }
}

export const communityService = new CommunityService();
