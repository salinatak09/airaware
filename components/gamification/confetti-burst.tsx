"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  shape: "circle" | "square" | "strip";
}

const CONFETTI_COLORS = [
  "#175C48", // Forest
  "#78D6B0", // Mint
  "#FFE58A", // Gold / Yellow
  "#38BDF8", // Sky blue
  "#F43F5E", // Rose
  "#A855F7", // Purple
  "#FB923C", // Amber
];

export function ConfettiBurst({
  active,
  duration = 3500,
  count = 45,
  onComplete,
}: {
  active: boolean;
  duration?: number;
  count?: number;
  onComplete?: () => void;
}) {
  const [pieces, setPieces] = React.useState<ConfettiPiece[]>([]);

  React.useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    const generated: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 500,
      y: -(Math.random() * 320 + 80),
      rotation: Math.random() * 720 - 360,
      scale: Math.random() * 0.6 + 0.6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      shape: (["circle", "square", "strip"] as const)[Math.floor(Math.random() * 3)],
    }));

    setPieces(generated);

    const timer = setTimeout(() => {
      setPieces([]);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [active, count, duration, onComplete]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              x: 0,
              y: 0,
              scale: 0,
              opacity: 1,
              rotate: 0,
            }}
            animate={{
              x: piece.x,
              y: piece.y + (Math.random() > 0.5 ? 450 : 350),
              scale: piece.scale,
              opacity: [1, 1, 0],
              rotate: piece.rotation,
            }}
            transition={{
              duration: duration / 1000,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{
              position: "absolute",
              width: piece.shape === "strip" ? 14 : 10,
              height: piece.shape === "strip" ? 5 : 10,
              backgroundColor: piece.color,
              borderRadius: piece.shape === "circle" ? "50%" : piece.shape === "strip" ? "2px" : "3px",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
