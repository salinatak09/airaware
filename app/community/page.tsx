"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useShell } from "@/components/layout/shell-context";
import {
  Users,
  School,
  AlertTriangle,
  ThumbsUp,
  MapPin,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageTitle, SectionTitle, Subtitle } from "@/components/ui/typography";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface CommunityPost {
  id: string;
  author: string;
  role: string;
  location: string;
  time: string;
  title: string;
  content: string;
  likes: number;
  tags: string[];
}

export default function CommunityPage() {
  const { currentLocation } = useShell();
  const { toast } = useToast();

  const [posts, setPosts] = React.useState<CommunityPost[]>([
    {
      id: "p-1",
      author: "Pooja Verma",
      role: "Parent • 2 Kids",
      location: "Vasant Vihar",
      time: "25m ago",
      title: "School Sports Shifted Indoors at DPS",
      content:
        "Just received notice from the school administration that morning PT and outdoor football are suspended this week. Indoor gym air filters are running.",
      likes: 18,
      tags: ["School Safety", "Sports Advisory"],
    },
    {
      id: "p-2",
      author: "Dr. Anirudh Sen",
      role: "Pediatric Pulmonologist",
      location: "Green Park Clinic",
      time: "2h ago",
      title: "Tip for Children's Night Coughs During Smog Peaks",
      content:
        "Seeing a 30% rise in midnight coughing fits. Ensure bedroom purifiers are placed 3 feet off the floor (where micro-particles settle) and maintain 45% humidity.",
      likes: 42,
      tags: ["Doctor Advice", "Pediatric Health"],
    },
    {
      id: "p-3",
      author: "Siddharth Malhotra",
      role: "Neighborhood Watch",
      location: "Ring Road Junction",
      time: "4h ago",
      title: "Waste Burning Reported Near Flyover",
      content:
        "Reported unauthorized biomass leaf burning to Municipal App. Particulate spiked to 320 in immediate 500m radius. Avoid taking evening walks near the bridge.",
      likes: 29,
      tags: ["Hotspot Alert", "Active Hazard"],
    },
  ]);

  const [reportOpen, setReportOpen] = React.useState(false);
  const [reportLocation, setReportLocation] = React.useState("");
  const [reportDesc, setReportDesc] = React.useState("");

  const handleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
    toast({
      type: "success",
      title: "Helpful Mark Recorded",
      message: "Thank you for supporting community clean air contributors!",
    });
  };

  const submitReport = () => {
    if (!reportDesc.trim()) return;
    setReportOpen(false);
    toast({
      type: "warning",
      title: "Community Alert Broadcasted",
      message: "Your smoke hazard report was dispatched to nearby families and municipal authorities.",
    });
    setReportLocation("");
    setReportDesc("");
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Badge variant="mint" icon={<Users className="h-3.5 w-3.5" />}>
              Neighborhood Clean Air Network
            </Badge>
            <PageTitle className="mt-1">Community Hub</PageTitle>
            <Subtitle className="mt-1">
              Real-time parent observations, school sensor reports, and verified pollution warnings in {currentLocation.city}.
            </Subtitle>
          </div>

          <Dialog open={reportOpen} onOpenChange={setReportOpen}>
            <DialogTrigger asChild>
              <Button variant="peach" size="sm" className="gap-2 font-bold shadow-xs">
                <AlertTriangle className="h-4 w-4" />
                <span>Report Smog Hazard</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report Smoke or Burning Hazard</DialogTitle>
                <DialogDescription>
                  Alert nearby families and school commuters about temporary localized smoke spikes.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                <div>
                  <label className="text-xs font-bold text-brand-forest-900 block mb-1">
                    Specific Landmark / Crossroad
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Metro Pillar 142, Outer Ring Road"
                    value={reportLocation}
                    onChange={(e) => setReportLocation(e.target.value)}
                    className="w-full rounded-2xl border border-brand-mint-200 bg-[#F7FAF7] px-3.5 py-2.5 text-xs font-medium text-brand-forest-900 focus:outline-none focus:ring-2 focus:ring-brand-mint"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-brand-forest-900 block mb-1">
                    Hazard Observation
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe the smoke source (e.g. leaf burning, heavy diesel truck breakdown, construction dust)..."
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    className="w-full rounded-2xl border border-brand-mint-200 bg-[#F7FAF7] px-3.5 py-2.5 text-xs font-medium text-brand-forest-900 focus:outline-none focus:ring-2 focus:ring-brand-mint"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="forest" onClick={submitReport} className="w-full sm:w-auto">
                  Submit Hazard Alert
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Local School Monitors Bar */}
        <div className="rounded-3xl border-2 border-brand-sky-300 bg-[#F0F9FF] p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-3">
            <School className="h-5 w-5 text-sky-700" />
            <h3 className="text-base font-bold text-brand-forest-900">
              Verified School Air Monitors (Morning Commute Status)
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-3.5 border border-sky-200 shadow-xs">
              <span className="text-xs font-bold text-brand-forest-900 block">Delhi Public School</span>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm font-black text-orange-700">AQI 142 • Sensitive</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 rounded px-1.5 py-0.5 font-bold">
                  Indoors
                </span>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-3.5 border border-sky-200 shadow-xs">
              <span className="text-xs font-bold text-brand-forest-900 block">Sanskriti School Campus</span>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm font-black text-amber-700">AQI 98 • Moderate</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 rounded px-1.5 py-0.5 font-bold">
                  Purified
                </span>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-3.5 border border-sky-200 shadow-xs">
              <span className="text-xs font-bold text-brand-forest-900 block">The Mother&apos;s International</span>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm font-black text-red-700">AQI 168 • High</span>
                <span className="text-[10px] text-amber-800 bg-amber-100 rounded px-1.5 py-0.5 font-bold">
                  N95 Bus Rule
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Community Discussion Feed */}
        <section className="space-y-4">
          <SectionTitle>Neighborhood Parent & Medical Feed</SectionTitle>

          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="p-5 sm:p-6 bg-white border-2 border-brand-forest-700/10 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F0FAF5] font-black text-xs text-brand-forest-900 border border-brand-mint-200">
                      {post.author.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-brand-forest-900">{post.author}</span>
                        <span className="text-[11px] text-brand-forest-700/60 font-medium">{post.role}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-brand-forest-700/50">
                        <MapPin className="h-3 w-3" />
                        <span>{post.location}</span>
                        <span>•</span>
                        <span>{post.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((t) => (
                      <Badge key={t} variant="cream" className="text-[10px] py-0 px-2 font-bold">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-base font-bold text-brand-forest-900">{post.title}</h4>
                  <p className="mt-1.5 text-xs sm:text-sm text-brand-forest-800/80 leading-relaxed">
                    {post.content}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-brand-mint-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-brand-forest-800 hover:text-brand-forest-900 hover:bg-[#F0FAF5] rounded-xl px-2.5 py-1.5 transition-colors"
                  >
                    <ThumbsUp className="h-3.5 w-3.5 text-brand-forest-700" />
                    <span>Helpful ({post.likes})</span>
                  </button>

                  <span className="text-[11px] text-brand-forest-700/60 font-medium">
                    Verified Community Member
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
