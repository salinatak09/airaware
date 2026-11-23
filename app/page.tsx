import Link from "next/link";
import {
  Wind,
  ShieldCheck,
  Sparkles,
  Layers,
  HeartPulse,
  Flame,
  Activity,
  ArrowRight,
  Database,
  Bot,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-md shadow-cyan-600/20">
              <Wind className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                AirAware
              </span>
              <span className="ml-2 rounded bg-cyan-100 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                AI Urban Shield
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/api/health" target="_blank">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Activity className="h-3.5 w-3.5 text-emerald-500" />
                API Health Endpoint
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container flex-1 py-10">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-4 gap-1.5 py-1 px-3 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
            Air Quality Intelligence for Urban Families
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-slate-900 dark:text-white">
            Breathe safer in polluted cities with{" "}
            <span className="bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
              AI-driven protection
            </span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            AirAware helps families plan outdoor activities, protect vulnerable members, optimize
            indoor air purification, and build healthy clean-air habits.
          </p>
        </div>

        {/* Architecture Grid */}
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-slate-200/80 shadow-sm transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
                <Wind className="h-5 w-5" />
              </div>
              <CardTitle className="mt-2 text-lg">Hyperlocal Air Quality</CardTitle>
              <CardDescription>
                Real-time PM2.5, PM10, AQI monitoring and 72-hour hourly forecasts powered by
                Open-Meteo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Layers className="h-4 w-4" />
                <span>Open-Meteo Air Quality API</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Bot className="h-5 w-5" />
              </div>
              <CardTitle className="mt-2 text-lg">Gemini AI Health Advisor</CardTitle>
              <CardDescription>
                Personalized guidance for infants, asthmatic children, and elderly family members.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>Google Gemini API (Official SDK)</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <Flame className="h-5 w-5" />
              </div>
              <CardTitle className="mt-2 text-lg">Gamified Clean-Air Habits</CardTitle>
              <CardDescription>
                Daily streaks, habit tracking, purifier filter alerts, and family health rewards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Database className="h-4 w-4" />
                <span>MongoDB Atlas & Mongoose</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Foundation & Architecture Specs */}
        <div className="mt-12 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-4">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold">Production Architecture Foundation</h2>
          </div>
          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-slate-100/70 p-3.5 dark:bg-slate-900">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Framework</span>
              <p className="mt-1 text-xs text-muted-foreground">Next.js 15 App Router & React 19</p>
            </div>
            <div className="rounded-lg bg-slate-100/70 p-3.5 dark:bg-slate-900">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Backend API</span>
              <p className="mt-1 text-xs text-muted-foreground">Next.js Route Handlers (`app/api`)</p>
            </div>
            <div className="rounded-lg bg-slate-100/70 p-3.5 dark:bg-slate-900">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Validation</span>
              <p className="mt-1 text-xs text-muted-foreground">Zod & Server-Side Env Guards</p>
            </div>
            <div className="rounded-lg bg-slate-100/70 p-3.5 dark:bg-slate-900">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Data & Cache</span>
              <p className="mt-1 text-xs text-muted-foreground">TanStack Query + Mongoose Pool</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        <p>AirAware © 2026 - Urban Air Quality Assistant for Healthy Families</p>
      </footer>
    </div>
  );
}
