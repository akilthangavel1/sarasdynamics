"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { GridPulse } from "@/components/ui/grid-pulse";

export interface EnhancedBackgroundPathsProps {
  title?: string;
  titleLine1?: string;
  titleLine2?: string;
  subtitle?: string;
  badge?: string;
  sidebarCategory?: string;
  sidebarFooter?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  onSecondaryClick?: () => void;
  onBackToHome?: () => void;
}

export function EnhancedBackgroundPaths({
  title,
  titleLine1 = "WEB DEVELOPMENT",
  titleLine2 = "BUILT TO SCALE",
  subtitle = "We build fast, modern websites and web applications that look great, work flawlessly on every device, and grow with your business, from first launch to thousands of users.",
  sidebarCategory = "WEB ENGINEERING",
  sidebarFooter = "SARAS DYNAMICS © 2026",
  ctaText = "Start Your Project",
  onCtaClick,
  onBackToHome,
}: EnhancedBackgroundPathsProps) {
  // If a single title is passed with no explicit line1/line2 override, split or format appropriately
  const displayLine1 = title && !titleLine1 ? title : titleLine1;
  const displayLine2 = titleLine2;

  const handleBack = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      window.location.hash = "#home";
    }
  };

  const handleContact = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      window.location.hash = "#contact";
    }
  };

  return (
    <div className="relative min-h-[70vh] md:min-h-[82vh] w-full flex flex-row overflow-hidden bg-white">
      {/* GridPulse interactive background with original spectrum & pink hues intact */}
      <GridPulse
        cell={28}
        reach={1.4}
        ambient={2}
        maxLit={80}
        className="[--grid-pulse-line:color-mix(in_oklab,#000_6%,transparent)]"
      />

      {/* Left Sidebar Rail */}
      <div className="relative z-10 w-14 sm:w-16 md:w-20 lg:w-24 shrink-0 border-r border-zinc-300/80 flex flex-col justify-between items-center py-7 sm:py-9 select-none bg-white/40 backdrop-blur-[2px]">
        {/* Top Back Chevron */}
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back to home"
          className="group p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-800 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 cursor-pointer"
          data-grid-avoid
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8] group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Center Vertical Text */}
        <div
          className="my-auto py-6 [writing-mode:vertical-rl] rotate-180 uppercase tracking-[0.24em] text-[11px] sm:text-xs font-semibold text-zinc-900 select-none whitespace-nowrap"
          data-grid-avoid
        >
          {sidebarCategory}
        </div>

        {/* Bottom Vertical Studio / Copyright Text */}
        <div
          className="[writing-mode:vertical-rl] rotate-180 uppercase tracking-[0.18em] text-[10px] sm:text-[11px] font-medium text-zinc-700 select-none whitespace-nowrap"
          data-grid-avoid
        >
          {sidebarFooter}
        </div>
      </div>

      {/* Main Hero Content Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-24 py-12 md:py-20 min-w-0">
        <div className="w-full max-w-5xl">
          {/* Main Headline */}
          <div data-grid-avoid className="w-fit">
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="font-['Bebas_Neue',sans-serif] text-5xl sm:text-7xl md:text-8xl lg:text-[7.2rem] xl:text-[8.5rem] tracking-tight leading-[0.88] select-none uppercase"
            >
              <span className="block text-black">{displayLine1}</span>
              {displayLine2 && (
                <span className="block text-zinc-500">{displayLine2}</span>
              )}
            </motion.h1>
          </div>

          {/* Horizontal Divider Line */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.65, ease: "easeOut" }}
            className="w-full h-px bg-zinc-300 my-6 sm:my-8 origin-left"
            data-grid-avoid
          />

          {/* Subtitle Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6, ease: "easeOut" }}
            className="text-base sm:text-lg md:text-xl text-zinc-600 font-normal leading-relaxed max-w-2xl"
            data-grid-avoid
          >
            {subtitle}
          </motion.p>

          {/* Contact Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6, ease: "easeOut" }}
            className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4"
            data-grid-avoid
          >
            <button
              type="button"
              onClick={handleContact}
              className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-black text-white font-semibold text-sm hover:bg-zinc-800 transition-all duration-200 shadow-sm cursor-pointer active:scale-[0.98]"
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedBackgroundPaths;
