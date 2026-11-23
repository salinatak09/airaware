"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useShell } from "@/components/layout/shell-context";
import {
  Bot,
  Sparkles,
  Send,
  Baby,
  Activity,
  Home,
  User,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageTitle, Subtitle } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "user" | "buddy";
  text: string;
  timestamp: string;
  badges?: string[];
}

export default function AiBuddyPage() {
  const { currentLocation, activeFamilyMember } = useShell();

  const [persona, setPersona] = React.useState<"pediatric" | "planner" | "indoor">("pediatric");
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "buddy",
      text: `Hello! I am your AirAware AI Health Buddy. I see you are currently protecting ${activeFamilyMember.name} in ${currentLocation.area} where the ambient AQI is ${currentLocation.aqi}. How can I help safeguard your family today?`,
      timestamp: "Just now",
      badges: ["Pediatric Certified", "Local Air Station Synced"],
    },
    {
      id: "msg-2",
      sender: "user",
      text: `Is it safe for Aarav to go for his 4 PM football practice today?`,
      timestamp: "1m ago",
    },
    {
      id: "msg-3",
      sender: "buddy",
      text: `Good question! Based on today's diurnal forecast in ${currentLocation.area}, particulate levels drop to ~75 AQI between 1:30 PM and 4:30 PM as solar heating clears surface smog. Because Aarav has mild asthma, 4:00 PM is acceptable for light-to-moderate play, but ensure he has his bronchodilator handy and wrap up outdoor exertion before 5:15 PM when traffic exhaust begins to accumulate.`,
      timestamp: "Just now",
      badges: ["Window: 1:30 PM - 4:30 PM", "Safety: Caution / Moderate"],
    },
  ]);

  const quickPrompts = [
    "Can children play outdoors right now?",
    "Which mask is best for a 7-year-old?",
    "When is the best time to ventilate today?",
    "Does cooking with gas spike PM2.5 indoors?",
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate friendly AI response
    setTimeout(() => {
      const buddyMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "buddy",
        text: `Based on current AQI ${currentLocation.aqi} and pediatric guidelines: For ${activeFamilyMember.name}, always maintain indoor HEPA filtration at medium-high during morning peaks. If going outdoors, opt for an N95/FFP2 mask with good nose-bridge sealing. Safe outdoor playtime is recommended between 2:00 PM and 4:30 PM.`,
        timestamp: "Just now",
        badges: ["AI Verified", "WHO Standards"],
      };
      setMessages((prev) => [...prev, buddyMsg]);
    }, 600);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Badge variant="peach" icon={<Sparkles className="h-3.5 w-3.5" />}>
              Gemini 1.5 Air Quality Intelligence
            </Badge>
            <PageTitle className="mt-1">AI Buddy Health Advisor</PageTitle>
            <Subtitle className="mt-1">
              Ask questions tailored to your family&apos;s health, medical sensitivities, and daily commute.
            </Subtitle>
          </div>
        </div>

        {/* Persona Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-brand-forest-800 mr-1">Advisor Persona:</span>
          <button
            type="button"
            onClick={() => setPersona("pediatric")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all border",
              persona === "pediatric"
                ? "bg-brand-mint border-brand-mint-400 text-brand-forest-900 shadow-xs"
                : "bg-white border-brand-forest-700/10 text-brand-forest-700 hover:bg-slate-50"
            )}
          >
            <Baby className="h-3.5 w-3.5" />
            <span>Pediatric & Children</span>
          </button>
          <button
            type="button"
            onClick={() => setPersona("planner")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all border",
              persona === "planner"
                ? "bg-brand-sky border-brand-sky-300 text-brand-forest-900 shadow-xs"
                : "bg-white border-brand-forest-700/10 text-brand-forest-700 hover:bg-slate-50"
            )}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Daily Commute & Sports</span>
          </button>
          <button
            type="button"
            onClick={() => setPersona("indoor")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all border",
              persona === "indoor"
                ? "bg-brand-lavender border-brand-lavender-300 text-brand-forest-900 shadow-xs"
                : "bg-white border-brand-forest-700/10 text-brand-forest-700 hover:bg-slate-50"
            )}
          >
            <Home className="h-3.5 w-3.5" />
            <span>Indoor Sanctuary & HEPA</span>
          </button>
        </div>

        {/* Chat Window */}
        <Card className="p-4 sm:p-6 bg-white border-2 border-brand-mint-200/80 shadow-card flex flex-col h-[520px]">
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-3",
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-xs",
                    msg.sender === "user"
                      ? "bg-brand-forest text-white"
                      : "bg-brand-mint text-brand-forest-900"
                  )}
                >
                  {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div
                  className={cn(
                    "max-w-lg rounded-3xl p-4 text-xs sm:text-sm leading-relaxed",
                    msg.sender === "user"
                      ? "bg-brand-forest text-white rounded-tr-xs"
                      : "bg-[#F7FAF7] border border-brand-mint-200 text-brand-forest-900 rounded-tl-xs"
                  )}
                >
                  <p>{msg.text}</p>
                  {msg.badges && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      {msg.badges.map((b) => (
                        <span
                          key={b}
                          className="rounded-md bg-brand-mint-100 px-2 py-0.5 text-[10px] font-bold text-brand-forest-900"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="pt-3 pb-2 flex flex-wrap gap-1.5">
            {quickPrompts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                className="rounded-full bg-[#F0FAF5] px-3 py-1 text-[11px] font-semibold text-brand-forest-800 border border-brand-mint-200 hover:bg-brand-mint-100 hover:text-brand-forest-900 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="pt-2 flex items-center gap-2 border-t border-brand-mint-100"
          >
            <input
              type="text"
              placeholder={`Ask AI Buddy about air safety for ${activeFamilyMember.name}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-2xl border border-brand-mint-200 bg-[#F7FAF7] px-4 py-3 text-xs font-medium text-brand-forest-900 placeholder:text-brand-forest-700/40 focus:outline-none focus:ring-2 focus:ring-brand-mint"
            />
            <Button type="submit" variant="forest" size="icon" className="shrink-0 rounded-2xl">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
