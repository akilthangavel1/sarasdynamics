"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

// Lightweight responsive Image component compatible with Vite / standard React
function Image({
  src,
  alt = "",
  fill,
  className,
  sizes,
  ...props
}: {
  src: string;
  alt?: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  [key: string]: any;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn(fill ? "absolute inset-0 w-full h-full object-cover" : "", className)}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
}

export interface PortfolioProject {
  id: string;
  name: string;
  role: string;
  image: string;
  quote: string;
  platform?: string;
  metric?: string;
}

// Portfolio of mobile applications engineered across iOS, Android, and cross-platform
const projects: PortfolioProject[] = [
  {
    id: "1",
    name: "OmniHealth Telehealth",
    role: "iOS & Android • React Native & SQLite",
    image: "",
    quote:
      "Offline-first mobile clinical monitoring app for 120,000+ active patients. Features Apple HealthKit & Google Fit integration, real-time vital telemetry, and automatic conflict-free sync upon reconnection.",
    platform: "Cross-Platform",
    metric: "120k+ Patients • 4.9★",
  },
  {
    id: "2",
    name: "Aura Pay Mobile Wallet",
    role: "Native iOS • Swift & SwiftUI",
    image: "",
    quote:
      "Consumer contactless payment application powered by Apple Pay and biometric Face ID. Engineered with hardware-backed Secure Enclave cryptographic token signing and sub-100ms checkout latency.",
    platform: "Native iOS",
    metric: "99.99% Transaction SLA",
  },
  {
    id: "3",
    name: "Kinetix Pulse AI",
    role: "Cross-Platform • React Native & Reanimated 3",
    image: "",
    quote:
      "Autonomous AI assistant companion featuring fluid 120 FPS gesture-driven canvas interactions, local embedding caching, streaming LLM chat, and push notification triggers.",
    platform: "Cross-Platform",
    metric: "120 FPS ProMotion",
  },
  {
    id: "4",
    name: "Veloce Fleet Dispatch",
    role: "Native Android • Kotlin & Jetpack Compose",
    image: "",
    quote:
      "Enterprise logistics and turn-by-turn navigation system for 30,000+ commercial truck drivers. Built with offline vector map caching, OBD-II vehicle telemetry, and zero crash rates.",
    platform: "Native Android",
    metric: "30k+ Active Drivers",
  },
  {
    id: "5",
    name: "PeakFit Performance",
    role: "iOS & watchOS • SwiftUI & CoreMotion",
    image: "",
    quote:
      "Pro workout coaching suite with gyroscope rep-counting, heart rate zone haptics, and instant Apple Watch companion pairing. Featured in App Store Fitness highlights with 200k+ downloads.",
    platform: "iOS & watchOS",
    metric: "200k+ Downloads • 4.9★",
  },
  {
    id: "6",
    name: "Nova Wealth Mobile",
    role: "Multi-Platform • Flutter & Dart",
    image: "",
    quote:
      "Institutional-grade mobile brokerage and asset tracker featuring high-frequency WebSocket chart tickers, biometric wire authorizations, and instant multi-currency currency conversions.",
    platform: "Flutter",
    metric: "$2.4B Volume Tracked",
  },
  {
    id: "7",
    name: "Strata LiDAR Inspector",
    role: "iOS & iPadOS • Swift & ARKit",
    image: "",
    quote:
      "Augmented reality jobsite surveying app for civil engineers. Generates 3D point-cloud room scans via LiDAR, offline geotagging, and automated technical PDF export.",
    platform: "Native iOS",
    metric: "Sub-centimeter accuracy",
  },
  {
    id: "8",
    name: "Zenith Spatial Audio",
    role: "Cross-Platform • React Native & C++ Audio Bridge",
    image: "",
    quote:
      "Lossless spatial audio streaming player featuring lock-screen audio session controls, dynamic multi-band equalizer sliders, and intelligent background caching.",
    platform: "Cross-Platform",
    metric: "Lossless 24-bit/192kHz",
  },
  {
    id: "9",
    name: "UrbanBite Delivery Network",
    role: "iOS & Android • Flutter & Google Maps SDK",
    image: "",
    quote:
      "Hyper-local food courier network app featuring real-time courier GPS tracking, live status activity widgets on iOS Dynamic Island, and algorithmic route optimization.",
    platform: "Flutter",
    metric: "4M+ Deliveries Completed",
  },
];

export default function Testimonial2() {
  const [selected, setSelected] = useState<PortfolioProject | null>(null);

  // Split portfolio items into 3 rows for visual variance
  const row1 = projects.slice(0, 3);
  const row2 = projects.slice(3, 6);
  const row3 = projects.slice(6, 9);

  return (
    <div
      id="mobile-portfolio-marquee"
      className="relative w-full py-20 overflow-hidden [--color-primary:#c30000] bg-white text-neutral-900 border-t border-zinc-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-700 mb-3">
          <Smartphone className="size-3.5 text-red-600" />
          <span>Featured Mobile Portfolio</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900">
          Mobile Applications We&apos;ve Shipped
        </h2>
        <p className="mt-3 text-base text-zinc-600 max-w-xl mx-auto">
          Explore production iOS and Android apps engineered by Saras Dynamics. Tap any project to inspect its architecture and outcomes.
        </p>
      </div>

      {/* Main Container acting as the viewport for background and fades */}
      <div className="relative w-full">
        {/* Shaded Background - Matches the height of this container exactly */}
        <div className="absolute inset-0 z-0 opacity-10 bg-[repeating-linear-gradient(315deg,currentColor_0,currentColor_1px,transparent_0,transparent_50%)] bg-[length:10px_10px] border-y border-black pointer-events-none"></div>

        {/* Fades - Match the height of this container exactly */}
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none"></div>

        {/* Content Rows */}
        <div className="relative z-10 flex flex-col gap-8 py-12 items-center justify-center overflow-hidden">
          {[row1, row2, row3].map((row, rowIndex) => (
            <motion.div
              key={rowIndex}
              className="flex items-center gap-6 min-w-max"
              animate={{
                x: rowIndex % 2 === 0 ? ["0%", "-25%"] : ["-25%", "0%"],
              }}
              transition={{
                duration: 40,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {[...row, ...row, ...row, ...row].map((project, i) => (
                <Capsule
                  key={`${project.id}-${i}`}
                  project={project}
                  onClick={() => setSelected(project)}
                />
              ))}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 10,
                transition: { duration: 0.15 },
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-lg bg-zinc-950 text-white p-8 md:p-10 rounded-2xl border border-zinc-800 shadow-2xl z-50"
            >
              <button
                onClick={() => setSelected(null)}
                aria-label="Close modal"
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-zinc-800"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-red-400 mb-4">
                  <Smartphone className="size-3.5" />
                  <span>{selected.role}</span>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
                  {selected.name}
                </h3>

                <p className="text-base text-zinc-300 leading-relaxed mb-6 font-normal">
                  {selected.quote}
                </p>

                {selected.metric && (
                  <div className="inline-block px-3.5 py-1.5 rounded-lg bg-white/10 text-xs font-mono text-emerald-400 font-semibold mb-6">
                    Impact: {selected.metric}
                  </div>
                )}

                <div className="w-full pt-5 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                  <span>Stack: {selected.role.split("•")[1]?.trim() || "Mobile Engineering"}</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    In Production
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Capsule({
  project,
  onClick,
}: {
  project: PortfolioProject;
  onClick: () => void;
  key?: React.Key;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="group flex items-center gap-4 p-2 pr-8 rounded-full bg-white border border-neutral-300 hover:border-zinc-800 hover:border-dashed cursor-pointer transition-all shadow-xs hover:shadow-md select-none"
    >
      <div className="size-12 rounded-full flex items-center justify-center bg-zinc-100 text-zinc-700 border border-zinc-200 shrink-0 font-bold text-xs uppercase tracking-wider group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
        <Smartphone className="size-5" />
      </div>
      <div className="flex flex-col items-start leading-tight">
        <span className="text-sm font-bold text-neutral-900 group-hover:text-red-600 transition-colors">
          {project.name}
        </span>
        <span className="text-xs text-neutral-500">
          {project.role}
        </span>
      </div>
    </motion.div>
  );
}

