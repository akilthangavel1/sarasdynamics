"use client";

import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColumnLines } from "@/components/ui/download-with-columnlines-utils/columnlines";

interface DownloadWithColumnLinesProps {
  badge?: string;
  headline?: string;
  subheadline?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  linuxHref?: string;
  windowsHref?: string;
  className?: string;
}

export default function DownloadWithColumnLines({
  badge,
  headline = "Launch on iOS and Android, together",
  subheadline = "One team, one codebase, one launch date, with performance that feels fully native on both platforms.",
  primaryCtaText = "Talk to us",
  primaryCtaHref = "#contact",
  secondaryCtaText = "See our apps",
  secondaryCtaHref = "#apps",
  className = "",
}: DownloadWithColumnLinesProps) {
  return (
    <ColumnLines
      columnWidth={80}
      columnCount={14}
      radialFadeStart={30}
      radialFadeEnd={70}
      className={cn("relative w-full bg-zinc-50 dark:bg-zinc-950", className)}
    >
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4 pt-16 pb-12 md:pt-24 md:pb-16">
        {badge && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-zinc-900 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              {badge}
            </span>
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-4 max-w-3xl text-center text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl dark:text-zinc-100"
        >
          {headline.split("\n").map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < headline.split("\n").length - 1 && <br />}
            </React.Fragment>
          ))}
        </motion.h1>

        {subheadline && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10 max-w-xl text-center text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed"
          >
            {subheadline}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3.5"
        >
          <a
            href={primaryCtaHref}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 cursor-pointer active:scale-98"
          >
            <span>{primaryCtaText}</span>
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href={secondaryCtaHref}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white/80 px-6 py-3 text-sm font-semibold text-zinc-900 backdrop-blur-sm transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100 dark:hover:bg-zinc-800 cursor-pointer active:scale-98"
          >
            <Smartphone className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            <span>{secondaryCtaText}</span>
          </a>
        </motion.div>
      </div>
    </ColumnLines>
  );
}

export { DownloadWithColumnLines };
