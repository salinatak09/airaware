"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type AeroMood =
  | "welcome"
  | "location"
  | "household"
  | "lifestyle"
  | "home"
  | "preferences";

export interface AeroMascotProps {
  mood?: AeroMood;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showSpeechBubble?: boolean;
  speechText?: string;
}

export function AeroMascot({
  mood = "welcome",
  size = "md",
  className,
  showSpeechBubble = false,
  speechText,
}: AeroMascotProps) {
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-44 h-44",
    xl: "w-56 h-56",
  };

  const getMoodAccessories = () => {
    switch (mood) {
      case "location":
        return (
          // Mini compass / map pin
          <g transform="translate(70, 75)">
            <circle cx="10" cy="10" r="12" fill="#175C48" />
            <polygon points="10,2 14,14 10,12 6,14" fill="#78D6B0" />
            <polygon points="10,18 14,6 10,8 6,6" fill="#FFF8E8" />
          </g>
        );
      case "household":
        return (
          // Protective heart shield
          <g transform="translate(68, 70)">
            <circle cx="12" cy="12" r="14" fill="#FFD6BD" stroke="#175C48" strokeWidth="2" />
            <path
              d="M12,18 C7,14 5,11 5,8 C5,6 6.5,4.5 8.5,4.5 C10,4.5 11,5.5 12,6.5 C13,5.5 14,4.5 15.5,4.5 C17.5,4.5 19,6 19,8 C19,11 17,14 12,18 Z"
              fill="#EF4444"
            />
          </g>
        );
      case "lifestyle":
        return (
          // Sporty headband
          <g transform="translate(20, 24)">
            <path
              d="M 5 22 Q 40 5 75 22"
              fill="none"
              stroke="#175C48"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx="68" cy="18" r="4" fill="#FFE58A" />
          </g>
        );
      case "home":
        return (
          // Cozy house badge
          <g transform="translate(70, 72)">
            <rect x="0" y="4" width="22" height="18" rx="4" fill="#FFF8E8" stroke="#175C48" strokeWidth="2" />
            <polygon points="11,-4 25,6 -3,6" fill="#78D6B0" stroke="#175C48" strokeWidth="2" />
            <rect x="7" y="10" width="8" height="12" rx="2" fill="#175C48" />
          </g>
        );
      case "preferences":
        return (
          // Sparkling stars
          <g transform="translate(68, 12)">
            <path
              d="M10,0 L12,7 L19,9 L12,11 L10,18 L8,11 L1,9 L8,7 Z"
              fill="#FFE58A"
              stroke="#854D0E"
              strokeWidth="1.5"
            />
          </g>
        );
      default:
        return (
          // Waving leaf sprout
          <g transform="translate(74, 55)">
            <path
              d="M0,15 C5,5 15,0 20,0 C20,10 12,18 0,15 Z"
              fill="#36A87C"
              stroke="#175C48"
              strokeWidth="2"
            />
          </g>
        );
    }
  };

  return (
    <div className={cn("relative flex flex-col items-center justify-center", className)}>
      {/* Optional Speech Bubble */}
      {showSpeechBubble && speechText && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative mb-3 max-w-[240px] sm:max-w-[280px] rounded-2xl bg-white px-4 py-2.5 text-center text-xs font-bold text-brand-forest-900 border-2 border-brand-mint-300 shadow-soft"
        >
          <span>{speechText}</span>
          {/* Downward triangle pointer */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-0 w-0 border-x-8 border-x-transparent border-t-8 border-t-brand-mint-300" />
        </motion.div>
      )}

      {/* Floating Aero Mascot Body */}
      <motion.div
        animate={{
          y: [0, -8, 0],
          scale: [1, 1.025, 1],
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn("relative flex items-center justify-center select-none", sizeClasses[size])}
        role="img"
        aria-label="Aero - The AirAware Clean Air Mascot"
      >
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="aeroBodyGradient" x1="10" y1="10" x2="110" y2="110" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9FE1C3" />
              <stop offset="0.55" stopColor="#78D6B0" />
              <stop offset="1" stopColor="#BFE8FF" />
            </linearGradient>
            <linearGradient id="aeroBellyGradient" x1="30" y1="50" x2="90" y2="105" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFDF6" stopOpacity="0.9" />
              <stop offset="1" stopColor="#FFF8E8" stopOpacity="0.75" />
            </linearGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Soft Glow */}
          <circle cx="60" cy="60" r="48" fill="#78D6B0" opacity="0.25" filter="url(#softGlow)" />

          {/* Aero Organic Cloud/Droplet Body */}
          <path
            d="M 60 18 C 84 18 104 36 104 60 C 104 84 86 102 60 102 C 34 102 16 84 16 60 C 16 36 36 18 60 18 Z"
            fill="url(#aeroBodyGradient)"
            stroke="#175C48"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Little Top Puff / Breeze Tufts */}
          <path
            d="M 52 18 C 50 10 58 4 64 8 C 70 12 66 18 64 18"
            fill="#78D6B0"
            stroke="#175C48"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Soft Cream Belly Patch */}
          <ellipse cx="60" cy="74" rx="28" ry="20" fill="url(#aeroBellyGradient)" />

          {/* Cheerful Eyes */}
          <g>
            {/* Left Eye */}
            <circle cx="46" cy="54" r="5.5" fill="#175C48" />
            <circle cx="48" cy="52" r="2" fill="#FFFFFF" />
            {/* Right Eye */}
            <circle cx="74" cy="54" r="5.5" fill="#175C48" />
            <circle cx="76" cy="52" r="2" fill="#FFFFFF" />
          </g>

          {/* Rosy Peach Cheeks */}
          <ellipse cx="37" cy="63" rx="6" ry="4" fill="#FFD6BD" opacity="0.95" />
          <ellipse cx="83" cy="63" rx="6" ry="4" fill="#FFD6BD" opacity="0.95" />

          {/* Friendly Smile */}
          <path
            d="M 50 64 Q 60 74 70 64"
            fill="none"
            stroke="#175C48"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Mood Accessories */}
          {getMoodAccessories()}

          {/* Clean air sparkles */}
          <path
            d="M 18 36 L 20 42 L 26 44 L 20 46 L 18 52 L 16 46 L 10 44 L 16 42 Z"
            fill="#FFE58A"
            opacity="0.85"
          />
          <path
            d="M 100 32 L 101.5 36.5 L 106 38 L 101.5 39.5 L 100 44 L 98.5 39.5 L 94 38 L 98.5 36.5 Z"
            fill="#FFE58A"
            opacity="0.85"
          />
        </svg>
      </motion.div>
    </div>
  );
}
