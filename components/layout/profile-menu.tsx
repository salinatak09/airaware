"use client";

import * as React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Check, Flame, Sparkles, ChevronDown, User, Settings, LogOut, LogIn } from "lucide-react";
import { useShell, MOCK_FAMILY, FamilyProfile } from "./shell-context";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function UserProfileMenu() {
  const { data: session, status } = useSession();
  const { activeFamilyMember, setActiveFamilyMember, userStats } = useShell();
  const [open, setOpen] = React.useState(false);

  const handleSelectMember = (member: FamilyProfile) => {
    setActiveFamilyMember(member);
    setOpen(false);
  };

  const displayName = session?.user?.name || activeFamilyMember.name;
  const displayEmail = session?.user?.email;
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (status === "unauthenticated") {
    return (
      <Link
        href="/auth/signin"
        className="flex items-center gap-1.5 rounded-2xl bg-brand-forest-800 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-forest-900 transition-all"
      >
        <LogIn className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Sign In</span>
      </Link>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`User account and family member switcher. Currently active: ${displayName}`}
          className="flex items-center gap-1.5 sm:gap-2 rounded-2xl bg-white p-1 sm:p-1.5 pr-2 sm:pr-3 border border-brand-forest-700/10 shadow-xs hover:border-brand-mint-300 hover:bg-[#F0FAF5] transition-all min-h-[40px]"
        >
          <div
            className={cn(
              "flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl font-black text-xs shadow-xs text-brand-forest-900 shrink-0",
              activeFamilyMember.avatarBg
            )}
          >
            {initials || "AA"}
          </div>
          <div className="hidden sm:flex flex-col text-left truncate max-w-[90px] md:max-w-[130px]">
            <span className="text-xs font-bold text-brand-forest-900 leading-tight truncate">
              {displayName}
            </span>
            <span className="text-[10px] text-brand-forest-700/60 leading-none truncate">
              {displayEmail ? "Account" : activeFamilyMember.role}
            </span>
          </div>
          <ChevronDown className="h-3 w-3 text-brand-forest-700/50 shrink-0" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle>Account & Family Profiles</DialogTitle>
            <Badge variant="yellow" className="text-[10px] gap-1 font-bold">
              <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
              {userStats.points} XP
            </Badge>
          </div>
          <DialogDescription>
            {displayEmail ? (
              <span className="font-medium text-brand-forest-800">
                Signed in as {displayEmail}
              </span>
            ) : (
              "Select who you are protecting to personalize daily warnings and air sensitivity rules."
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Account Quick Access */}
        <div className="mt-2 flex items-center justify-between p-3 rounded-2xl bg-[#F0FAF5] border border-brand-mint-200">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-brand-forest-800 text-white flex items-center justify-center font-bold text-xs">
              {initials}
            </div>
            <div>
              <p className="text-xs font-bold text-brand-forest-900">{displayName}</p>
              <p className="text-[10px] text-brand-forest-700/70">{displayEmail || "Local Guest Mode"}</p>
            </div>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-brand-forest-700/15 text-brand-forest-900 hover:bg-slate-50 transition-colors"
          >
            <Settings className="h-3 w-3 text-brand-forest-700" />
            <span>Profile</span>
          </Link>
        </div>

        {/* Family Member Options */}
        <div className="mt-3">
          <p className="text-xs font-bold text-brand-forest-900 mb-2">Switch Active Family Vulnerability:</p>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {MOCK_FAMILY.map((member) => {
              const isSelected = member.id === activeFamilyMember.id;

              return (
                <div
                  key={member.id}
                  onClick={() => handleSelectMember(member)}
                  className={cn(
                    "flex items-center justify-between rounded-2xl p-2.5 border transition-all cursor-pointer",
                    isSelected
                      ? "bg-[#F0FAF5] border-brand-mint-400 shadow-xs"
                      : "bg-white border-brand-forest-700/10 hover:border-brand-mint-200 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-xl font-bold text-xs shadow-xs text-brand-forest-900",
                        member.avatarBg
                      )}
                    >
                      {member.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-brand-forest-900">
                          {member.name}
                        </span>
                        {member.condition && (
                          <span className="rounded bg-brand-peach px-1.5 py-0.2 text-[9px] font-bold text-[#7c2d12]">
                            {member.condition}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-brand-forest-700/60">{member.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-bold capitalize",
                        member.vulnerability === "critical"
                          ? "bg-red-100 text-red-700"
                          : member.vulnerability === "high"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-emerald-100 text-emerald-800"
                      )}
                    >
                      {member.vulnerability}
                    </span>
                    {isSelected && <Check className="h-4 w-4 text-brand-forest-800 ml-1 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Links & Sign Out */}
        <div className="mt-4 pt-4 border-t border-brand-mint-100 flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between">
            <Link
              href="/impact"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 font-bold text-brand-forest-800 hover:underline"
            >
              <Sparkles className="h-3.5 w-3.5 text-brand-forest-700" />
              <span>View Clean Air Badges</span>
            </Link>
            <span className="text-brand-forest-700/60 font-semibold">{userStats.level}</span>
          </div>

          <div className="flex gap-2">
            <Link
              href="/onboarding"
              onClick={() => setOpen(false)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-mint-100 text-brand-forest-900 font-bold hover:bg-brand-mint-200 transition-colors text-center"
            >
              <span>Onboarding Wizard</span>
            </Link>

            {session ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  signOut({ callbackUrl: "/auth/signin" });
                }}
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-red-50 text-red-700 font-bold hover:bg-red-100 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                href="/auth/signin"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-brand-forest-800 text-white font-bold hover:bg-brand-forest-900 transition-colors"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
