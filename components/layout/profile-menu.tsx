"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Flame, Sparkles, ChevronDown } from "lucide-react";
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
  const { activeFamilyMember, setActiveFamilyMember, userStats } = useShell();
  const [open, setOpen] = React.useState(false);

  const handleSelectMember = (member: FamilyProfile) => {
    setActiveFamilyMember(member);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-2xl bg-white p-1.5 pr-3 border border-brand-forest-700/10 shadow-xs hover:border-brand-mint-300 hover:bg-[#F0FAF5] transition-all"
        >
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-xl font-black text-xs shadow-xs",
              activeFamilyMember.avatarBg
            )}
          >
            {activeFamilyMember.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-brand-forest-900 leading-tight">
              {activeFamilyMember.name}
            </span>
            <span className="text-[10px] text-brand-forest-700/60 leading-none">
              {activeFamilyMember.role}
            </span>
          </div>
          <ChevronDown className="h-3 w-3 text-brand-forest-700/50" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle>Family Air Health Profiles</DialogTitle>
            <Badge variant="yellow" className="text-[10px] gap-1 font-bold">
              <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
              {userStats.points} XP
            </Badge>
          </div>
          <DialogDescription>
            Select who you are protecting to personalize daily warnings and air sensitivity rules.
          </DialogDescription>
        </DialogHeader>

        {/* Family Member Options */}
        <div className="mt-4 space-y-2 max-h-80 overflow-y-auto pr-1">
          {MOCK_FAMILY.map((member) => {
            const isSelected = member.id === activeFamilyMember.id;

            return (
              <div
                key={member.id}
                onClick={() => handleSelectMember(member)}
                className={cn(
                  "flex items-center justify-between rounded-2xl p-3 border transition-all cursor-pointer",
                  isSelected
                    ? "bg-[#F0FAF5] border-brand-mint-400 shadow-xs"
                    : "bg-white border-brand-forest-700/10 hover:border-brand-mint-200 hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl font-bold text-xs shadow-xs",
                      member.avatarBg
                    )}
                  >
                    {member.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-brand-forest-900">
                        {member.name}
                      </span>
                      {member.condition && (
                        <span className="rounded bg-brand-peach px-1.5 py-0.5 text-[9px] font-bold text-[#7c2d12]">
                          {member.condition}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-brand-forest-700/60">{member.role}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold capitalize",
                      member.vulnerability === "critical"
                        ? "bg-red-100 text-red-700"
                        : member.vulnerability === "high"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-emerald-100 text-emerald-800"
                    )}
                  >
                    {member.vulnerability} risk
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-brand-forest-800 ml-1 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Links */}
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

          <Link
            href="/onboarding"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-mint-100 text-brand-forest-900 font-bold hover:bg-brand-mint-200 transition-colors"
          >
            <span>Restart Onboarding Setup Wizard</span>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
