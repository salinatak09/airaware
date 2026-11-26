"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useShell } from "@/components/layout/shell-context";
import {
  Sparkles,
  Send,
  User,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Loader2,
  Trash2,
  History,
  MessageSquare,
  Compass,
  Wind,
  PlusCircle,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageTitle, Subtitle } from "@/components/ui/typography";
import { AeroMascot, AeroMood } from "@/components/onboarding/aero-mascot";
import { getAqiTheme } from "@/lib/colors";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ChatMessage {
  id: string;
  sender: "user" | "buddy";
  text: string;
  timestamp: string;
  safetyWarnings?: string[];
  actionableTips?: string[];
  dataSource?: string;
  dataTimestamp?: string;
  disclaimer?: string;
}

interface SavedSession {
  _id: string;
  title: string;
  persona: string;
  sessionMetadata: {
    initialAqi?: number;
    city: string;
    messageCount: number;
  };
  updatedAt: string;
}

const DEFAULT_SUGGESTED_PROMPTS = [
  "Can my child play outside today?",
  "What should I do at home right now?",
  "Is it a good time to go for a walk?",
  "How can I protect myself during my commute?",
  "Why is today's AQI so high?",
  "What can I do without buying an air purifier?",
];

export default function AiBuddyPage() {
  const { currentLocation, activeFamilyMember } = useShell();
  const aqiTheme = getAqiTheme(currentLocation.aqi);

  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = React.useState<string | undefined>(undefined);
  const [savedSessions, setSavedSessions] = React.useState<SavedSession[]>([]);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = React.useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = React.useState<string[]>(DEFAULT_SUGGESTED_PROMPTS);

  // Initial welcome message from Aero
  const initialAeroMessage: ChatMessage = React.useMemo(
    () => ({
      id: "welcome-msg",
      sender: "buddy",
      text: `Hello! I'm Aero, your friendly clean air buddy. Today in ${currentLocation.area}, ambient AQI is ${currentLocation.aqi} (${aqiTheme.label}).\n\nI'm customized to protect ${activeFamilyMember.name}${
        activeFamilyMember.condition ? ` (${activeFamilyMember.condition})` : ""
      }. Ask me anything about safe playtime, home air purification, or commuter protection!`,
      timestamp: "Just now",
      dataSource: "CPCB Ground Stations + Open-Meteo High Resolution Model",
      dataTimestamp: "Live 15m update",
      actionableTips:
        currentLocation.aqi > 150
          ? [
              "Keep exterior windows tightly sealed during morning hours",
              "Wet mop hard surfaces with water to lock in microscopic dust",
            ]
          : [
              "Safe midday ventilation window between 1:00 PM and 3:30 PM",
              "Check air quality before evening outdoor exertion",
            ],
    }),
    [currentLocation, activeFamilyMember, aqiTheme]
  );

  const [messages, setMessages] = React.useState<ChatMessage[]>([initialAeroMessage]);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load existing persistent chat history on mount
  React.useEffect(() => {
    let isMounted = true;
    async function fetchChatHistory() {
      try {
        const res = await fetch("/api/ai/chat");
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && isMounted) {
          if (json.data.sessions) {
            setSavedSessions(json.data.sessions);
          }
          if (json.data.activeSession && json.data.activeSession.messages?.length > 0) {
            const active = json.data.activeSession;
            setActiveSessionId(active._id);
            const loadedMessages: ChatMessage[] = active.messages.map((m: any) => ({
              id: m.messageId || String(Date.now()),
              sender: m.role === "user" ? ("user" as const) : ("buddy" as const),
              text: m.content,
              timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              safetyWarnings: m.safetyAdvisories?.length ? m.safetyAdvisories : undefined,
              dataSource: m.aqiContext ? "CPCB Ground Stations + Open-Meteo" : undefined,
            }));
            setMessages(loadedMessages);
          }
        }
      } catch (err) {
        console.warn("Could not load past chat history:", err);
      }
    }
    fetchChatHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-4).map((m) => ({
        role: (m.sender === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.text,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          sessionId: activeSessionId,
          history: historyPayload,
          context: {
            currentAqi: currentLocation.aqi,
            category: aqiTheme.label,
            userLocation: {
              city: currentLocation.city,
              area: currentLocation.area,
            },
            householdProfile: {
              sensitivePreferences: {
                hasRespiratorySensitivity:
                  activeFamilyMember.vulnerability === "critical" ||
                  Boolean(activeFamilyMember.condition?.toLowerCase().includes("asthma")),
                hasCardiovascularSensitivity:
                  activeFamilyMember.vulnerability === "high" ||
                  Boolean(activeFamilyMember.condition?.toLowerCase().includes("cardiac")),
                isPregnant: activeFamilyMember.role.toLowerCase().includes("pregnant"),
                hasInfant: activeFamilyMember.ageGroup === "infant",
              },
            },
          },
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Aero could not generate a response. Please retry.");
      }

      const data = json.data;
      if (data.sessionId) {
        setActiveSessionId(data.sessionId);
      }

      const buddyMsg: ChatMessage = {
        id: `buddy-${Date.now()}`,
        sender: "buddy",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        safetyWarnings: data.safetyWarnings?.length ? data.safetyWarnings : undefined,
        actionableTips: data.actionableTips?.length ? data.actionableTips : undefined,
        dataSource: data.dataSource,
        dataTimestamp: data.dataTimestamp ? new Date(data.dataTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
        disclaimer: data.disclaimer,
      };

      setMessages((prev) => [...prev, buddyMsg]);

      if (data.quickSuggestions && data.quickSuggestions.length > 0) {
        setSuggestedPrompts(data.quickSuggestions);
      }
    } catch (err: any) {
      console.error("AI Buddy error:", err);
      setErrorMessage(err.message || "Failed to reach Aero. Please check your network and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await fetch(`/api/ai/chat${activeSessionId ? `?sessionId=${activeSessionId}` : ""}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("Clear chat error:", err);
    }
    setActiveSessionId(undefined);
    setMessages([initialAeroMessage]);
    setSuggestedPrompts(DEFAULT_SUGGESTED_PROMPTS);
    setClearConfirmOpen(false);
  };

  const handleStartNewChat = () => {
    setActiveSessionId(undefined);
    setMessages([initialAeroMessage]);
    setSuggestedPrompts(DEFAULT_SUGGESTED_PROMPTS);
    setHistoryOpen(false);
  };

  const handleLoadSession = async (session: SavedSession) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/ai/chat?sessionId=${session._id}`);
      const json = await res.json();
      if (json.success && json.data.activeSession) {
        const s = json.data.activeSession;
        setActiveSessionId(s._id);
        const loaded: ChatMessage[] = s.messages.map((m: any) => ({
          id: m.messageId || String(Date.now()),
          sender: m.role === "user" ? ("user" as const) : ("buddy" as const),
          text: m.content,
          timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          safetyWarnings: m.safetyAdvisories?.length ? m.safetyAdvisories : undefined,
          dataSource: "CPCB Ground Stations + Open-Meteo",
        }));
        setMessages(loaded);
      }
    } catch (err) {
      console.error("Could not load session:", err);
    } finally {
      setIsLoading(false);
      setHistoryOpen(false);
    }
  };

  const aeroMood: AeroMood =
    currentLocation.aqi > 200
      ? "household"
      : currentLocation.aqi > 100
      ? "lifestyle"
      : "welcome";

  return (
    <AppShell>
      <div className="space-y-4 max-w-4xl mx-auto">
        {/* Top AQI Context Card */}
        <div className="rounded-3xl border-2 border-brand-mint-200 bg-white p-4 sm:p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E0F5EB] border border-brand-mint-300">
              <Wind className="h-6 w-6 text-brand-forest-800" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-brand-forest-900">
                  {currentLocation.area}, {currentLocation.city}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-black border",
                    aqiTheme.badgeClass
                  )}
                >
                  AQI {currentLocation.aqi} • {aqiTheme.label}
                </span>
              </div>
              <p className="text-xs text-brand-forest-700/80 mt-0.5">
                Protecting: <strong className="text-brand-forest-900">{activeFamilyMember.name}</strong>{" "}
                ({activeFamilyMember.role}
                {activeFamilyMember.condition ? ` • ${activeFamilyMember.condition}` : ""})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 justify-between sm:justify-end">
            <div className="text-[11px] text-right text-brand-forest-700/70 hidden sm:block">
              <div>Source: CPCB Ground + Open-Meteo</div>
              <div className="text-[10px] text-brand-forest-700/50">Diurnal solar model synced</div>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHistoryOpen(true)}
                className="gap-1.5 rounded-xl text-xs font-bold border-brand-mint-200 text-brand-forest-800 hover:bg-[#F0FAF5]"
              >
                <History className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Past Chats</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setClearConfirmOpen(true)}
                className="gap-1.5 rounded-xl text-xs font-bold border-brand-mint-200 text-slate-600 hover:text-red-700 hover:bg-red-50"
                title="Clear conversation"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Window Container */}
        <Card className="p-4 sm:p-6 bg-white border-2 border-brand-mint-200/80 shadow-card flex flex-col h-[600px] sm:h-[650px]">
          {/* Aero Header Bar inside Chat */}
          <div className="flex items-center justify-between pb-3 border-b border-brand-mint-100 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 shrink-0">
                <AeroMascot mood={aeroMood} size="sm" className="w-10 h-10 -mt-1" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-brand-forest-900">Aero Health Buddy</h3>
                  <Badge variant="mint" className="text-[9px] py-0 px-1.5 font-bold">
                    Online
                  </Badge>
                </div>
                <p className="text-[11px] text-brand-forest-700/70">
                  Powered by Gemini 1.5 • Deterministic Air Safety Shield
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartNewChat}
              className="text-xs font-bold text-brand-forest-800 hover:bg-[#F0FAF5] gap-1"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Topic</span>
            </Button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 pt-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-3",
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-xs",
                    msg.sender === "user"
                      ? "bg-brand-forest text-white"
                      : "bg-[#E0F5EB] border border-brand-mint-300 text-brand-forest-900"
                  )}
                >
                  {msg.sender === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-brand-forest-800" />
                  )}
                </div>

                {/* Bubble Body */}
                <div
                  className={cn(
                    "max-w-xl rounded-3xl p-4 text-xs sm:text-sm leading-relaxed space-y-2.5",
                    msg.sender === "user"
                      ? "bg-brand-forest-800 text-white rounded-tr-xs"
                      : "bg-[#F7FAF7] border border-brand-mint-200 text-brand-forest-900 rounded-tl-xs shadow-xs"
                  )}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {/* Safety Notice Banner if present */}
                  {msg.safetyWarnings && msg.safetyWarnings.length > 0 && (
                    <div className="rounded-2xl bg-amber-50 p-2.5 border border-amber-200 text-amber-900 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px]">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <span>Safety Alert</span>
                      </div>
                      {msg.safetyWarnings.map((w, idx) => (
                        <p key={idx} className="text-amber-800 text-[11px] leading-tight">
                          • {w}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Actionable Tips if present */}
                  {msg.actionableTips && msg.actionableTips.length > 0 && (
                    <div className="rounded-2xl bg-emerald-50/80 p-2.5 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-[11px]">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Actionable Clean Air Steps</span>
                      </div>
                      {msg.actionableTips.map((tip, idx) => (
                        <p key={idx} className="text-emerald-800 text-[11px] leading-tight">
                          ✓ {tip}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Meta Bar: Timestamp, Source & Relevance-Filtered Disclaimer */}
                  {msg.sender === "buddy" && (
                    <div className="pt-1 border-t border-brand-mint-100/70 flex flex-col gap-1 text-[10px] text-brand-forest-700/60">
                      <div className="flex items-center justify-between">
                        <span>
                          {msg.dataSource ? `📡 ${msg.dataSource}` : "AI Clean Air Advisory"}
                          {msg.dataTimestamp ? ` • ${msg.dataTimestamp}` : ""}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>

                      {/* Health Disclaimer shown ONLY when relevant */}
                      {msg.disclaimer && (
                        <div className="text-[9.5px] italic text-slate-400 mt-0.5 leading-tight">
                          {msg.disclaimer}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator with pulsing Aero */}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-mint text-brand-forest-900 font-bold text-xs shadow-xs animate-pulse">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="rounded-3xl rounded-tl-xs p-3.5 bg-[#F7FAF7] border border-brand-mint-200 text-brand-forest-800 text-xs flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-brand-forest-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-brand-forest-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-brand-forest-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-[11px] font-medium text-brand-forest-700">
                    Aero is evaluating local particulate data...
                  </span>
                </div>
              </div>
            )}

            {/* Inline Error Message */}
            {errorMessage && (
              <div className="rounded-2xl bg-red-50 p-3 border border-red-200 text-red-700 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSend(messages[messages.length - 1]?.text)}
                  className="flex items-center gap-1 text-[11px] font-bold underline hover:text-red-900 ml-2"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Question Chips */}
          <div className="pt-2 pb-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-brand-forest-700/60 mb-1.5 flex items-center gap-1">
              <Compass className="h-3 w-3" />
              <span>Suggested Questions</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {suggestedPrompts.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSend(q)}
                  className="rounded-full bg-[#F0FAF5] px-3 py-1 text-[11px] font-semibold text-brand-forest-800 border border-brand-mint-200 hover:bg-brand-mint-100 hover:border-brand-mint-300 hover:text-brand-forest-900 transition-all disabled:opacity-50 text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box & Send Button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="pt-2 flex items-center gap-2 border-t border-brand-mint-100"
          >
            <input
              type="text"
              placeholder={`Ask Aero about air safety for ${activeFamilyMember.name} in ${currentLocation.area}...`}
              value={input}
              disabled={isLoading}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-2xl border border-brand-mint-200 bg-[#F7FAF7] px-4 py-3 text-xs font-medium text-brand-forest-900 placeholder:text-brand-forest-700/40 focus:outline-none focus:ring-2 focus:ring-brand-mint disabled:opacity-60"
            />
            <Button
              type="submit"
              variant="forest"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="shrink-0 rounded-2xl h-11 w-11 shadow-xs"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </Card>

        {/* Clear Conversation Confirmation Dialog */}
        <Dialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                <span>Clear Conversation?</span>
              </DialogTitle>
              <DialogDescription>
                This will reset your current conversation with Aero and clear stored turns from your active session.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button variant="outline" size="sm" onClick={() => setClearConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearChat}
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Yes, Clear Chat
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Conversation History Modal */}
        <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-brand-forest-800" />
                <span>Past Air Consultations</span>
              </DialogTitle>
              <DialogDescription>
                Browse previous conversation sessions with Aero.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mt-2">
              {savedSessions.length === 0 ? (
                <div className="text-center p-6 text-xs text-slate-500">
                  No past saved sessions found. Ongoing chats will be archived here automatically.
                </div>
              ) : (
                savedSessions.map((session) => (
                  <div
                    key={session._id}
                    onClick={() => handleLoadSession(session)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer",
                      activeSessionId === session._id
                        ? "bg-[#F0FAF5] border-brand-mint-400 shadow-xs"
                        : "bg-white border-brand-forest-700/10 hover:border-brand-mint-200 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-brand-mint-100 flex items-center justify-center font-bold text-xs text-brand-forest-900">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-brand-forest-900">{session.title}</p>
                        <p className="text-[10px] text-brand-forest-700/60">
                          {session.sessionMetadata?.city || "New Delhi"} • {session.sessionMetadata?.messageCount || 2} turns
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-brand-mint-100">
              <Button variant="outline" size="sm" onClick={() => setHistoryOpen(false)}>
                Close
              </Button>
              <Button variant="forest" size="sm" onClick={handleStartNewChat}>
                Start New Consultation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
