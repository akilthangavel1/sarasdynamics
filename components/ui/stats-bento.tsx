"use client";
import React from "react";
import { Star, Smartphone, ShieldCheck, Activity } from "lucide-react";

export interface StatsBentoProps {
  className?: string;
  badge?: string;
  title?: string;
  subtitle?: string;
  primaryBadge?: string;
  primaryStat?: string;
  primaryDesc?: string;
  secondaryBadge?: string;
  secondaryStat?: string;
  secondaryDesc?: string;
  tertiaryStatValue?: string;
  tertiaryStatLabel?: string;
  ratingValue?: string;
  ratingLabel?: string;
  ratingDesc?: string;
}

export const StatsBento: React.FC<StatsBentoProps> = ({
  className = "",
  badge = "Proven Mobile Impact",
  title = "Engineered for Millions of Active Mobile Users",
  subtitle = "Production-hardened performance, crash-free stability, and stellar store ratings across iOS and Android.",
  primaryBadge = "Global Mobile Installs",
  primaryStat = "25M+",
  primaryDesc = "Combined iOS App Store and Google Play downloads across enterprise and consumer mobile applications engineered by Saras Dynamics.",
  secondaryBadge = "Crash-Free Sessions",
  secondaryStat = "99.98%",
  secondaryDesc = "Benchmarked across 4,200+ unique iOS & Android device profiles.",
  tertiaryStatValue = "120 FPS",
  tertiaryStatLabel = "ProMotion Gestures",
  ratingValue = "4.9 / 5.0",
  ratingLabel = "App Store & Play Store Avg",
  ratingDesc = "350,000+ verified ratings",
}) => {
  return (
    <section
      id="mobile-stats-bento"
      className={`w-full py-16 sm:py-20 bg-background flex flex-col justify-center px-4 sm:px-6 lg:px-8 ${className}`}
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-700 mb-3">
            <Smartphone className="size-3.5 text-red-600" />
            <span>{badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
            {title}
          </h2>
          <p className="mt-3 text-base text-zinc-600 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-4">
          {/* Primary Stat - Global Installs */}
          <div className="md:col-span-3 md:row-span-2 bg-zinc-950 text-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between overflow-hidden relative min-h-[320px] border border-zinc-800 shadow-sm">
            <div className="absolute bottom-0 left-0 right-0 top-0 bg-[repeating-linear-gradient(45deg,#808080_0px_1px,transparent_1px_10px)] opacity-20 mask-[radial-gradient(ellipse_80%_50%_at_100%_0%,#000_70%,transparent_110%)] pointer-events-none" />
            
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-semibold text-zinc-200 tracking-wider uppercase">
                  <Smartphone className="size-3 text-red-400" />
                  {primaryBadge}
                </span>
              </div>
              <h3 className="text-6xl sm:text-7xl font-bold tracking-tighter text-white font-mono">
                {primaryStat}
              </h3>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-md">
                {primaryDesc}
              </p>
              <div className="flex items-center gap-4 mt-4 text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  iOS App Store
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Google Play Store
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Stat A - Crash-Free Rate */}
          <div className="md:col-span-3 bg-zinc-50 rounded-3xl p-7 sm:p-8 border border-zinc-200/90 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                  <ShieldCheck className="size-3.5 text-red-600" />
                  <span>{secondaryBadge}</span>
                </div>
                <p className="text-3xl sm:text-4xl text-zinc-900 font-bold font-mono tracking-tight">
                  {secondaryStat}
                </p>
              </div>
              <div className="flex gap-1.5 items-end h-10 pt-2">
                {[80, 85, 90, 88, 94, 96, 95, 98, 97, 100, 100].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-red-600 rounded-full transition-all"
                    style={{ height: `${h}%` }}
                    title={`Stability: ${h}%`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 mt-4">
              {secondaryDesc}
            </p>
          </div>

          {/* Tertiary Stat B - FPS / Refresh Rate */}
          <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-zinc-200/90 flex flex-col justify-center text-center shadow-2xs">
            <div className="mx-auto w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mb-2">
              <Activity className="size-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-zinc-900 font-mono tracking-tight">
              {tertiaryStatValue}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mt-1">
              {tertiaryStatLabel}
            </p>
          </div>

          {/* Tertiary Stat C - Store Ratings */}
          <div className="md:col-span-2 bg-zinc-50 rounded-3xl p-6 flex items-center gap-4 border border-zinc-200/90">
            <div className="size-12 rounded-2xl bg-white border border-zinc-200 text-amber-500 flex items-center justify-center shrink-0 shadow-2xs">
              <Star className="size-6 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-zinc-900 leading-none font-mono">
                  {ratingValue}
                </p>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  Top Tier
                </span>
              </div>
              <p className="text-xs font-semibold text-zinc-700 mt-1">
                {ratingLabel}
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {ratingDesc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsBento;

