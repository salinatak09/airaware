"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

export type AeroMood =
  // Gamification & Expressive States
  | "happy"
  | "concerned"
  | "celebrating"
  | "sleeping"
  | "wearing_mask"
  | "masked"
  | "exercising"
  | "advising"
  | "giving_advice"
  | "level_up"
  | "mission_completed"
  // Legacy onboarding states (fully supported)
  | "welcome"
  | "location"
  | "household"
  | "lifestyle"
  | "home"
  | "preferences";

export interface AeroMascotProps {
  mood?: AeroMood;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showSpeechBubble?: boolean;
  speechText?: string;
  animated?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

export function AeroMascot({
  mood = "happy",
  size = "md",
  className,
  showSpeechBubble = false,
  speechText,
  animated = true,
  interactive = false,
  onClick,
}: AeroMascotProps) {
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-44 h-44",
    xl: "w-56 h-56",
    "2xl": "w-64 h-64",
  };

  // Canonicalize aliases
  const normalizedMood: AeroMood =
    mood === "wearing_mask"
      ? "masked"
      : mood === "giving_advice"
      ? "advising"
      : mood === "welcome"
      ? "happy"
      : mood;

  // Animation variants based on normalized mood
  const getMotionVariants = (): Variants => {
    if (!animated) {
      return {
        animate: { y: 0, scale: 1, rotate: 0 },
      };
    }

    switch (normalizedMood) {
      case "sleeping":
        return {
          animate: {
            y: [0, -3, 0],
            scale: [1, 1.015, 1],
            transition: {
              duration: 4.0,
              repeat: Infinity,
              ease: "easeInOut",
            },
          },
        };

      case "celebrating":
      case "level_up":
        return {
          animate: {
            y: [0, -14, -2, -10, 0],
            scale: [1, 1.06, 0.98, 1.04, 1],
            rotate: [0, -4, 4, -2, 0],
            transition: {
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
            },
          },
        };

      case "mission_completed":
        return {
          animate: {
            y: [0, -10, 0],
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0],
            transition: {
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          },
        };

      case "exercising":
        return {
          animate: {
            y: [0, -9, 0, -5, 0],
            scale: [1, 1.04, 0.98, 1.02, 1],
            transition: {
              duration: 1.1,
              repeat: Infinity,
              ease: "easeInOut",
            },
          },
        };

      case "concerned":
        return {
          animate: {
            y: [0, -4, 0],
            rotate: [-1.5, 1.5, -1.5],
            transition: {
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          },
        };

      case "advising":
        return {
          animate: {
            y: [0, -6, 0],
            rotate: [0, 1.5, 0],
            transition: {
              duration: 2.8,
              repeat: Infinity,
              ease: "easeInOut",
            },
          },
        };

      case "masked":
      case "happy":
      default:
        return {
          animate: {
            y: [0, -7, 0],
            scale: [1, 1.02, 1],
            transition: {
              duration: 3.0,
              repeat: Infinity,
              ease: "easeInOut",
            },
          },
        };
    }
  };

  // Facial elements: Eyes, Eyebrows, Mouth, and Cheeks
  const renderFace = () => {
    switch (normalizedMood) {
      // 1. Sleeping Expression (gentle crescent closed eyes, soft smile, floating Zzz)
      case "sleeping":
        return (
          <g id="face-sleeping">
            {/* Left Closed Eye (curved arc) */}
            <path
              d="M 40 56 Q 46 62 52 56"
              fill="none"
              stroke="#175C48"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Right Closed Eye */}
            <path
              d="M 68 56 Q 74 62 80 56"
              fill="none"
              stroke="#175C48"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Gentle Resting Mouth */}
            <path
              d="M 57 66 Q 60 69 63 66"
              fill="none"
              stroke="#175C48"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Rosy Sleeping Cheeks */}
            <ellipse cx="37" cy="61" rx="6" ry="3.5" fill="#FFD6BD" opacity="0.9" />
            <ellipse cx="83" cy="61" rx="6" ry="3.5" fill="#FFD6BD" opacity="0.9" />

            {/* Floating Zzz */}
            <g transform="translate(82, 24)">
              <motion.text
                animate={{ opacity: [0.3, 1, 0.3], y: [0, -6, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                x="0"
                y="0"
                fill="#175C48"
                fontSize="11"
                fontWeight="900"
                fontFamily="sans-serif"
              >
                z
              </motion.text>
              <motion.text
                animate={{ opacity: [0.2, 0.9, 0.2], y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.4, ease: "easeInOut" }}
                x="9"
                y="-6"
                fill="#36A87C"
                fontSize="14"
                fontWeight="900"
                fontFamily="sans-serif"
              >
                Z
              </motion.text>
            </g>
          </g>
        );

      // 2. Concerned / Smog Alert Expression (worried angled brows, cautious mouth, sweat droplet)
      case "concerned":
        return (
          <g id="face-concerned">
            {/* Worried Eyebrows */}
            <path
              d="M 40 46 Q 47 49 53 45"
              fill="none"
              stroke="#175C48"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M 67 45 Q 73 49 80 46"
              fill="none"
              stroke="#175C48"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Wide Worried Eyes */}
            <circle cx="46" cy="54" r="5" fill="#175C48" />
            <circle cx="48" cy="52" r="1.8" fill="#FFFFFF" />
            <circle cx="74" cy="54" r="5" fill="#175C48" />
            <circle cx="76" cy="52" r="1.8" fill="#FFFFFF" />
            {/* Concerned Wavy Mouth */}
            <path
              d="M 52 68 Q 60 63 68 68"
              fill="none"
              stroke="#175C48"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Subtle Cheeks */}
            <ellipse cx="37" cy="62" rx="5" ry="3.5" fill="#FFD6BD" opacity="0.75" />
            <ellipse cx="83" cy="62" rx="5" ry="3.5" fill="#FFD6BD" opacity="0.75" />
            {/* Nervous condensation/sweat droplet */}
            <path
              d="M 88 44 C 88 41 85 36 85 36 C 85 36 82 41 82 44 C 82 46 84 48 85 48 C 86 48 88 46 88 44 Z"
              fill="#38BDF8"
              stroke="#0284C7"
              strokeWidth="1"
            />
          </g>
        );

      // 3. Masked / Wearing N95 Respirator Expression
      case "masked":
        return (
          <g id="face-masked">
            {/* Reassuring Calm Eyes */}
            <circle cx="46" cy="50" r="5" fill="#175C48" />
            <circle cx="48" cy="48" r="1.8" fill="#FFFFFF" />
            <circle cx="74" cy="50" r="5" fill="#175C48" />
            <circle cx="76" cy="48" r="1.8" fill="#FFFFFF" />
            {/* Content Eyebrows */}
            <path
              d="M 41 42 Q 47 39 52 42"
              fill="none"
              stroke="#175C48"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 68 42 Q 73 39 79 42"
              fill="none"
              stroke="#175C48"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Rosy Cheeks peering over mask */}
            <ellipse cx="37" cy="54" rx="5" ry="3.5" fill="#FFD6BD" opacity="0.9" />
            <ellipse cx="83" cy="54" rx="5" ry="3.5" fill="#FFD6BD" opacity="0.9" />

            {/* N95 Respirator Mask Body */}
            <g id="n95-mask" transform="translate(0, 4)">
              {/* Mask Elastic Straps */}
              <path
                d="M 28 66 Q 38 60 48 60"
                fill="none"
                stroke="#175C48"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M 92 66 Q 82 60 72 60"
                fill="none"
                stroke="#175C48"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M 32 76 Q 42 70 48 70"
                fill="none"
                stroke="#175C48"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M 88 76 Q 78 70 72 70"
                fill="none"
                stroke="#175C48"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              {/* Mask Cup */}
              <polygon
                points="60,54 78,63 76,82 60,86 44,82 42,63"
                fill="#FFFDF6"
                stroke="#175C48"
                strokeWidth="2.8"
                strokeLinejoin="round"
              />
              {/* Metallic Nose Clip */}
              <line
                x1="52"
                y1="57"
                x2="68"
                y2="57"
                stroke="#94A3B8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Center Fold Crease */}
              <line
                x1="60"
                y1="56"
                x2="60"
                y2="85"
                stroke="#E2E8F0"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* N95 Stamp Badge */}
              <rect x="52" y="68" width="16" height="7" rx="2" fill="#E6F4EA" />
              <text
                x="60"
                y="73.5"
                textAnchor="middle"
                fontSize="5"
                fontWeight="900"
                fill="#175C48"
                fontFamily="sans-serif"
              >
                N95
              </text>
            </g>
          </g>
        );

      // 4. Celebrating / Confetti Party Expression
      case "celebrating":
        return (
          <g id="face-celebrating">
            {/* Happy Upward-Curved Squinched Eyes (^_^) */}
            <path
              d="M 40 55 Q 46 47 52 55"
              fill="none"
              stroke="#175C48"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M 68 55 Q 74 47 80 55"
              fill="none"
              stroke="#175C48"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Big Open Happy Mouth */}
            <path
              d="M 48 62 Q 60 78 72 62 Z"
              fill="#EF4444"
              stroke="#175C48"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d="M 52 64 Q 60 70 68 64" fill="#FFB4A2" />
            {/* Blushing Cheeks */}
            <ellipse cx="36" cy="62" rx="6.5" ry="4" fill="#FFD6BD" opacity="0.95" />
            <ellipse cx="84" cy="62" rx="6.5" ry="4" fill="#FFD6BD" opacity="0.95" />
          </g>
        );

      // 5. Level-Up Celebration Expression (Radiant eyes, Golden Crown, Majestic Aura)
      case "level_up":
        return (
          <g id="face-levelup">
            {/* Star-Sparkle Victorious Eyes */}
            <g transform="translate(46, 52)">
              <polygon
                points="0,-6 2,-2 6,0 2,2 0,6 -2,2 -6,0 -2,-2"
                fill="#175C48"
              />
              <circle cx="0" cy="0" r="1.5" fill="#FFE58A" />
            </g>
            <g transform="translate(74, 52)">
              <polygon
                points="0,-6 2,-2 6,0 2,2 0,6 -2,2 -6,0 -2,-2"
                fill="#175C48"
              />
              <circle cx="0" cy="0" r="1.5" fill="#FFE58A" />
            </g>
            {/* Confident Beaming Smile */}
            <path
              d="M 48 63 Q 60 76 72 63"
              fill="none"
              stroke="#175C48"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Rosy Cheeks */}
            <ellipse cx="36" cy="63" rx="6.5" ry="4" fill="#FFD6BD" opacity="0.95" />
            <ellipse cx="84" cy="63" rx="6.5" ry="4" fill="#FFD6BD" opacity="0.95" />
          </g>
        );

      // 6. Mission Completed Expression (Wink + Proud Smile + Thumbs up feel)
      case "mission_completed":
        return (
          <g id="face-mission-completed">
            {/* Left Happy Winking Eye */}
            <path
              d="M 40 54 Q 46 48 52 54"
              fill="none"
              stroke="#175C48"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Right Sparkling Open Eye */}
            <circle cx="74" cy="53" r="5.5" fill="#175C48" />
            <circle cx="76" cy="51" r="2" fill="#FFFFFF" />
            {/* Proud Smile */}
            <path
              d="M 49 63 Q 60 74 71 63"
              fill="none"
              stroke="#175C48"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            {/* Cheeks */}
            <ellipse cx="36" cy="62" rx="6" ry="4" fill="#FFD6BD" opacity="0.95" />
            <ellipse cx="84" cy="62" rx="6" ry="4" fill="#FFD6BD" opacity="0.95" />
          </g>
        );

      // 7. Exercising Expression (Determined, Focused, Athletic)
      case "exercising":
        return (
          <g id="face-exercising">
            {/* Determined Eyebrows */}
            <path
              d="M 41 47 L 52 50"
              fill="none"
              stroke="#175C48"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M 79 47 L 68 50"
              fill="none"
              stroke="#175C48"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Energetic Focused Eyes */}
            <circle cx="46" cy="54" r="5" fill="#175C48" />
            <circle cx="48" cy="52" r="1.8" fill="#FFFFFF" />
            <circle cx="74" cy="54" r="5" fill="#175C48" />
            <circle cx="76" cy="52" r="1.8" fill="#FFFFFF" />
            {/* Energetic Open Breath / Smile */}
            <path
              d="M 52 64 Q 60 72 68 64 Z"
              fill="#175C48"
            />
            <path d="M 55 66 Q 60 70 65 66" fill="#FFFDF6" />
            {/* Active Cheeks */}
            <ellipse cx="36" cy="63" rx="6" ry="4" fill="#FFAAA6" opacity="0.9" />
            <ellipse cx="84" cy="63" rx="6" ry="4" fill="#FFAAA6" opacity="0.9" />
          </g>
        );

      // 8. Advising / Giving Advice Expression (Wise, Thoughtful, Friendly teacher)
      case "advising":
        return (
          <g id="face-advising">
            {/* Inquisitive / Friendly Eyebrow */}
            <path
              d="M 41 45 Q 46 41 52 46"
              fill="none"
              stroke="#175C48"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M 68 47 Q 73 45 79 48"
              fill="none"
              stroke="#175C48"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Expressive Eyes */}
            <circle cx="46" cy="53" r="5.2" fill="#175C48" />
            <circle cx="48" cy="51" r="2" fill="#FFFFFF" />
            <circle cx="74" cy="54" r="5.2" fill="#175C48" />
            <circle cx="76" cy="52" r="2" fill="#FFFFFF" />
            {/* Speaking / Advising Mouth */}
            <ellipse cx="60" cy="66" rx="4.5" ry="3.5" fill="#175C48" />
            <ellipse cx="60" cy="67" rx="3" ry="1.5" fill="#FFB4A2" />
            {/* Cheeks */}
            <ellipse cx="36" cy="63" rx="6" ry="4" fill="#FFD6BD" opacity="0.95" />
            <ellipse cx="84" cy="63" rx="6" ry="4" fill="#FFD6BD" opacity="0.95" />
          </g>
        );

      // 9. Happy & Default Cheerful Expression
      case "happy":
      default:
        return (
          <g id="face-happy">
            {/* Cheerful Round Eyes with Sparkle */}
            <circle cx="46" cy="54" r="5.5" fill="#175C48" />
            <circle cx="48" cy="52" r="2" fill="#FFFFFF" />
            <circle cx="74" cy="54" r="5.5" fill="#175C48" />
            <circle cx="76" cy="52" r="2" fill="#FFFFFF" />
            {/* Cheerful Mouth */}
            <path
              d="M 50 64 Q 60 74 70 64"
              fill="none"
              stroke="#175C48"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Rosy Peach Cheeks */}
            <ellipse cx="37" cy="63" rx="6" ry="4" fill="#FFD6BD" opacity="0.95" />
            <ellipse cx="83" cy="63" rx="6" ry="4" fill="#FFD6BD" opacity="0.95" />
          </g>
        );
    }
  };

  // Distinct Accessories tailored to each expression
  const renderAccessories = () => {
    switch (normalizedMood) {
      // Level-up Golden Crown with Jewels
      case "level_up":
        return (
          <g id="accessory-level-up">
            {/* Radiant Golden Crown */}
            <g transform="translate(38, -2)">
              <polygon
                points="0,18 7,5 22,12 37,5 44,18"
                fill="#FBBF24"
                stroke="#B45309"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <circle cx="7" cy="5" r="2.5" fill="#EF4444" />
              <circle cx="22" cy="12" r="3" fill="#3B82F6" />
              <circle cx="37" cy="5" r="2.5" fill="#10B981" />
            </g>
            {/* Sparkling Star Flares */}
            <path
              d="M 12 28 L 14 34 L 20 36 L 14 38 L 12 44 L 10 38 L 4 36 L 10 34 Z"
              fill="#FBBF24"
              stroke="#B45309"
              strokeWidth="1"
            />
            <path
              d="M 106 24 L 107.5 28.5 L 112 30 L 107.5 31.5 L 106 36 L 104.5 31.5 L 100 30 L 104.5 28.5 Z"
              fill="#FBBF24"
              stroke="#B45309"
              strokeWidth="1"
            />
          </g>
        );

      // Celebrating Party Hat & Confetti Stars
      case "celebrating":
        return (
          <g id="accessory-celebrating">
            {/* Party Hat */}
            <g transform="translate(48, -4)">
              <polygon
                points="12,0 0,26 24,26"
                fill="#818CF8"
                stroke="#3730A3"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Party stripes */}
              <path d="M 4,20 L 20,20" stroke="#FFE58A" strokeWidth="2.5" />
              <path d="M 7,12 L 17,12" stroke="#F43F5E" strokeWidth="2.5" />
              {/* Pom-pom */}
              <circle cx="12" cy="0" r="3.5" fill="#FFE58A" stroke="#B45309" strokeWidth="1.5" />
            </g>
            {/* Party sparkles */}
            <circle cx="20" cy="30" r="2.5" fill="#F43F5E" />
            <circle cx="26" cy="22" r="2" fill="#38BDF8" />
            <circle cx="98" cy="24" r="2.5" fill="#FBBF24" />
            <circle cx="104" cy="32" r="2" fill="#10B981" />
          </g>
        );

      // Mission Completed Shield Badge with Emerald Check
      case "mission_completed":
        return (
          <g id="accessory-mission-completed" transform="translate(72, 70)">
            {/* Badge Shield Base */}
            <circle cx="13" cy="13" r="14" fill="#175C48" stroke="#78D6B0" strokeWidth="2.5" />
            {/* Sparkling Gold Star Ring */}
            <circle cx="13" cy="13" r="11" fill="#78D6B0" />
            {/* Bold White Checkmark */}
            <path
              d="M 8 13 L 12 17 L 19 9"
              fill="none"
              stroke="#175C48"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );

      // Exercising Athletic Sweatband
      case "exercising":
        return (
          <g id="accessory-exercising" transform="translate(18, 22)">
            {/* Athletic Headband across top puff */}
            <path
              d="M 5 22 Q 42 7 79 22"
              fill="none"
              stroke="#175C48"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M 7 22 Q 42 8 77 22"
              fill="none"
              stroke="#FFE58A"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
        );

      // Giving Advice: Lightbulb of Clarity
      case "advising":
        return (
          <g id="accessory-advising" transform="translate(74, 10)">
            {/* Mini Radiant Lightbulb */}
            <circle cx="10" cy="10" r="7" fill="#FFE58A" stroke="#B45309" strokeWidth="1.5" />
            <rect x="7" y="17" width="6" height="3" fill="#94A3B8" rx="1" />
            {/* Light Rays */}
            <line x1="10" y1="0" x2="10" y2="2" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
            <line x1="18" y1="4" x2="16.5" y2="5.5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
            <line x1="2" y1="4" x2="3.5" y2="5.5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      // Legacy onboarding accessories
      case "location":
        return (
          <g transform="translate(70, 75)">
            <circle cx="10" cy="10" r="12" fill="#175C48" />
            <polygon points="10,2 14,14 10,12 6,14" fill="#78D6B0" />
            <polygon points="10,18 14,6 10,8 6,6" fill="#FFF8E8" />
          </g>
        );

      case "household":
        return (
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
          <g transform="translate(70, 72)">
            <rect x="0" y="4" width="22" height="18" rx="4" fill="#FFF8E8" stroke="#175C48" strokeWidth="2" />
            <polygon points="11,-4 25,6 -3,6" fill="#78D6B0" stroke="#175C48" strokeWidth="2" />
            <rect x="7" y="10" width="8" height="12" rx="2" fill="#175C48" />
          </g>
        );

      case "preferences":
        return (
          <g transform="translate(68, 12)">
            <path
              d="M10,0 L12,7 L19,9 L12,11 L10,18 L8,11 L1,9 L8,7 Z"
              fill="#FFE58A"
              stroke="#854D0E"
              strokeWidth="1.5"
            />
          </g>
        );

      // Default healthy sprout flourish
      default:
        return (
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
    <div
      className={cn(
        "relative flex flex-col items-center justify-center",
        interactive && "cursor-pointer transition-transform hover:scale-105 active:scale-95",
        className
      )}
      onClick={onClick}
    >
      {/* Optional Speech Bubble */}
      {showSpeechBubble && speechText && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative mb-3 max-w-[240px] sm:max-w-[280px] rounded-2xl bg-white px-4 py-2.5 text-center text-xs font-bold text-brand-forest-900 border-2 border-brand-mint-300 shadow-soft"
        >
          <span>{speechText}</span>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-0 w-0 border-x-8 border-x-transparent border-t-8 border-t-brand-mint-300" />
        </motion.div>
      )}

      {/* Floating Animated Aero Body */}
      <motion.div
        variants={getMotionVariants()}
        animate="animate"
        className={cn("relative flex items-center justify-center select-none", sizeClasses[size])}
        role="img"
        aria-label={`Aero mascot expressing ${normalizedMood}`}
      >
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-md overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="aeroBodyGradient"
              x1="10"
              y1="10"
              x2="110"
              y2="110"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#9FE1C3" />
              <stop offset="0.55" stopColor="#78D6B0" />
              <stop offset="1" stopColor="#BFE8FF" />
            </linearGradient>

            <linearGradient
              id="aeroBellyGradient"
              x1="30"
              y1="50"
              x2="90"
              y2="105"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFFDF6" stopOpacity="0.95" />
              <stop offset="1" stopColor="#FFF8E8" stopOpacity="0.8" />
            </linearGradient>

            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Ambient Glow */}
          <circle
            cx="60"
            cy="60"
            r="48"
            fill={
              normalizedMood === "concerned"
                ? "#FCA5A5"
                : normalizedMood === "level_up"
                ? "#FDE68A"
                : "#78D6B0"
            }
            opacity="0.22"
            filter="url(#softGlow)"
          />

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

          {/* Expressive Face (Eyes, Brows, Mouth, Cheeks) */}
          {renderFace()}

          {/* Mood Specific Accessories */}
          {renderAccessories()}

          {/* Ambient Clean Air Sparkles */}
          {normalizedMood !== "sleeping" && normalizedMood !== "concerned" && (
            <>
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
            </>
          )}
        </svg>
      </motion.div>
    </div>
  );
}
