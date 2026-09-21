"use client";

import React from "react";
import { motion } from "framer-motion";
import { GridPulse } from "@/components/ui/grid-pulse";

export interface EnhancedBackgroundPathsProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  onSecondaryClick?: () => void;
  onBackToHome?: () => void;
}

export function EnhancedBackgroundPaths({
  title = "Neural Dynamics",
  subtitle = "Experience the future of interactive design with dynamic pattern generation",
}: EnhancedBackgroundPathsProps) {
  return (
    <div className="relative min-h-[60vh] md:min-h-[68vh] w-full flex items-center overflow-hidden bg-white">
      {/* GridPulse interactive background */}
      <GridPulse
        cell={28}
        reach={1.4}
        ambient={2}
        maxLit={80}
        className="[--grid-pulse-line:color-mix(in_oklab,#000_6%,transparent)]"
      />

      {/* Main Content — left-aligned, vertically centered */}
      <div className="relative z-10 w-full px-8 sm:px-14 md:px-20 lg:px-28 py-14 md:py-20">
        {/* Title + Subtitle grouped to share the same width */}
        <div className="w-fit">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1] text-zinc-900 mb-5"
            data-grid-avoid
          >
            {title}
          </motion.h1>

          {/* Subtitle — constrained to title width via parent w-fit */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: "easeOut" }}
            className="text-sm sm:text-base md:text-lg text-zinc-500 font-normal leading-relaxed w-0 min-w-full"
            data-grid-avoid
          >
            {subtitle}
          </motion.p>
        </div>
      </div>
    </div>
  );
}

export default EnhancedBackgroundPaths;
