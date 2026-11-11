"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Flame,
  Utensils,
  Compass,
  Sparkles,
  PawPrint,
  ShoppingBag,
  Wallet,
  HardHat,
  Receipt,
  Package,
  CalendarCheck,
  Users,
  GraduationCap,
  Stethoscope,
  PhoneCall,
  Award,
  Bot,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BuiltApp {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  colorBg: string;
  colorText: string;
  description: string;
}

// Row 1: consumer & lifestyle
const row1Apps: BuiltApp[] = [
  {
    id: "r1-1",
    name: "Fitrack",
    subtitle: "Fitness · iOS & Android",
    category: "Consumer & Lifestyle",
    icon: Flame,
    colorBg: "bg-orange-500/10 dark:bg-orange-500/20",
    colorText: "text-orange-600 dark:text-orange-400",
    description:
      "Daily workout tracking, heart rate telemetry, and community fitness challenges engineered for active lifestyles.",
  },
  {
    id: "r1-2",
    name: "Bitewise",
    subtitle: "Food Delivery · Flutter",
    category: "Consumer & Lifestyle",
    icon: Utensils,
    colorBg: "bg-amber-500/10 dark:bg-amber-500/20",
    colorText: "text-amber-600 dark:text-amber-400",
    description:
      "On-demand food ordering with live courier routing, automated kitchen dispatch, and one-tap checkout.",
  },
  {
    id: "r1-3",
    name: "Wanderly",
    subtitle: "Travel Planner · iOS",
    category: "Consumer & Lifestyle",
    icon: Compass,
    colorBg: "bg-sky-500/10 dark:bg-sky-500/20",
    colorText: "text-sky-600 dark:text-sky-400",
    description:
      "Collaborative travel itineraries, real-time flight alerts, offline maps, and shared group expense tracking.",
  },
  {
    id: "r1-4",
    name: "Moodly",
    subtitle: "Wellness · React Native",
    category: "Consumer & Lifestyle",
    icon: Sparkles,
    colorBg: "bg-purple-500/10 dark:bg-purple-500/20",
    colorText: "text-purple-600 dark:text-purple-400",
    description:
      "Daily mindfulness check-ins, guided cognitive breathwork sessions, and emotional wellness analytics.",
  },
  {
    id: "r1-5",
    name: "Petpal",
    subtitle: "Pet Care · Android",
    category: "Consumer & Lifestyle",
    icon: PawPrint,
    colorBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    colorText: "text-emerald-600 dark:text-emerald-400",
    description:
      "Digital pet medical records, automated vaccination alerts, vet consultations, and diet schedules.",
  },
  {
    id: "r1-6",
    name: "Snapcart",
    subtitle: "E-commerce · iOS & Android",
    category: "Consumer & Lifestyle",
    icon: ShoppingBag,
    colorBg: "bg-rose-500/10 dark:bg-rose-500/20",
    colorText: "text-rose-600 dark:text-rose-400",
    description:
      "High-speed mobile shopping with instant visual search, live package tracking, and personalized recommendations.",
  },
];

// Row 2: business & fintech
const row2Apps: BuiltApp[] = [
  {
    id: "r2-1",
    name: "PayNest",
    subtitle: "Fintech · iOS & Android",
    category: "Business & Fintech",
    icon: Wallet,
    colorBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    colorText: "text-emerald-600 dark:text-emerald-400",
    description:
      "Multi-currency mobile wallet, contactless NFC payments, and instant peer-to-peer transfers with biometric auth.",
  },
  {
    id: "r2-2",
    name: "FieldOps",
    subtitle: "Field Service · Android",
    category: "Business & Fintech",
    icon: HardHat,
    colorBg: "bg-yellow-500/10 dark:bg-yellow-500/20",
    colorText: "text-yellow-600 dark:text-yellow-400",
    description:
      "Real-time dispatch management, offline field checklists, equipment telemetry, and live GPS crew tracking.",
  },
  {
    id: "r2-3",
    name: "Ledgerly",
    subtitle: "Accounting · Flutter",
    category: "Business & Fintech",
    icon: Receipt,
    colorBg: "bg-blue-500/10 dark:bg-blue-500/20",
    colorText: "text-blue-600 dark:text-blue-400",
    description:
      "Automated receipt scanning, recurring invoice generation, expense categorization, and tax preparation.",
  },
  {
    id: "r2-4",
    name: "StockSense",
    subtitle: "Inventory · React Native",
    category: "Business & Fintech",
    icon: Package,
    colorBg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    colorText: "text-indigo-600 dark:text-indigo-400",
    description:
      "Barcode & RFID warehouse inventory audits, automated reorder thresholds, and ERP synchronization.",
  },
  {
    id: "r2-5",
    name: "BookIt",
    subtitle: "Appointment Booking · iOS",
    category: "Business & Fintech",
    icon: CalendarCheck,
    colorBg: "bg-cyan-500/10 dark:bg-cyan-500/20",
    colorText: "text-cyan-600 dark:text-cyan-400",
    description:
      "Frictionless client scheduling, automated calendar sync, SMS reminder blasts, and deposit processing.",
  },
  {
    id: "r2-6",
    name: "TeamPulse",
    subtitle: "HR & Team Chat · Cross-platform",
    category: "Business & Fintech",
    icon: Users,
    colorBg: "bg-teal-500/10 dark:bg-teal-500/20",
    colorText: "text-teal-600 dark:text-teal-400",
    description:
      "Asynchronous internal team messaging, automated standups, employee directory, and peer appreciation shoutouts.",
  },
];

// Row 3: education, health & AI
const row3Apps: BuiltApp[] = [
  {
    id: "r3-1",
    name: "SkillPath",
    subtitle: "Learning App · iOS & Android",
    category: "Education, Health & AI",
    icon: GraduationCap,
    colorBg: "bg-violet-500/10 dark:bg-violet-500/20",
    colorText: "text-violet-600 dark:text-violet-400",
    description:
      "Bite-sized interactive learning modules, skill mastery benchmarks, and SCORM/xAPI-compliant progress tracking.",
  },
  {
    id: "r3-2",
    name: "MediLink",
    subtitle: "Healthcare · Flutter",
    category: "Education, Health & AI",
    icon: Stethoscope,
    colorBg: "bg-rose-500/10 dark:bg-rose-500/20",
    colorText: "text-rose-600 dark:text-rose-400",
    description:
      "HIPAA-compliant telemedicine consultations, prescription renewals, and secure electronic health record exchange.",
  },
  {
    id: "r3-3",
    name: "Callwise",
    subtitle: "Voice AI Assistant · iOS",
    category: "Education, Health & AI",
    icon: PhoneCall,
    colorBg: "bg-blue-500/10 dark:bg-blue-500/20",
    colorText: "text-blue-600 dark:text-blue-400",
    description:
      "Conversational voice AI agent with real-time turn-taking, SIP telephony integration, and CRM sync.",
  },
  {
    id: "r3-4",
    name: "QuizPilot",
    subtitle: "Exam Prep · Android",
    category: "Education, Health & AI",
    icon: Award,
    colorBg: "bg-amber-500/10 dark:bg-amber-500/20",
    colorText: "text-amber-600 dark:text-amber-400",
    description:
      "Spaced repetition test preparation, adaptive mock examinations, and granular subject performance analytics.",
  },
  {
    id: "r3-5",
    name: "Tutorly",
    subtitle: "AI Tutor · React Native",
    category: "Education, Health & AI",
    icon: Bot,
    colorBg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    colorText: "text-indigo-600 dark:text-indigo-400",
    description:
      "Interactive 24/7 AI-guided problem solving, step-by-step concept explanations, and personalized study paths.",
  },
  {
    id: "r3-6",
    name: "FleetGo",
    subtitle: "Logistics · Cross-platform",
    category: "Education, Health & AI",
    icon: Truck,
    colorBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    colorText: "text-emerald-600 dark:text-emerald-400",
    description:
      "Route optimization algorithms, driver safety analytics, vehicle telemetry, and predictive maintenance dispatch.",
  },
];

interface Testimonial2Props {
  eyebrow?: string;
  title?: string;
  description?: string;
}

export default function Testimonial2({
  eyebrow = "RECENT LAUNCHES",
  title = "Apps We’ve Built",
  description = "A look at the mobile apps we’ve designed, built and launched across industries.",
}: Testimonial2Props = {}) {
  const [selected, setSelected] = useState<BuiltApp | null>(null);

  const rows = [row1Apps, row2Apps, row3Apps];

  return (
    <div className="relative w-full py-20 overflow-hidden [--color-primary:#003AF9] bg-white dark:bg-background text-neutral-900 dark:text-white">
      {/* Title Header matching Saras Dynamics standard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-12 sm:mb-16">
        <div className="w-full grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6 md:gap-10 lg:gap-12">
          {/* Left Column: Eyebrow with red accent line & Title */}
          <div className="flex flex-col items-start gap-3">
            {eyebrow && (
              <div className="flex items-center gap-3.5">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-neutral-900 dark:text-white">
                  {eyebrow}
                </span>
                <span
                  className="inline-block w-20 sm:w-24 h-[2px] bg-[#c30000] rounded-sm shrink-0"
                  aria-hidden="true"
                />
              </div>
            )}
            {title && (
              <h2 className="text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-white sm:text-4xl md:text-5xl leading-[1.08] text-balance">
                {typeof title === "string" ? (
                  title.split("\n").map((line, idx, arr) => (
                    <React.Fragment key={idx}>
                      {line}
                      {idx < arr.length - 1 && <br className="hidden sm:inline" />}
                    </React.Fragment>
                  ))
                ) : (
                  title
                )}
              </h2>
            )}
          </div>

          {/* Center Divider: Vertical separator line */}
          <div
            className="hidden md:block w-px h-16 lg:h-20 bg-zinc-200 dark:bg-zinc-800 shrink-0"
            aria-hidden="true"
          />

          {/* Right Column: Description positioned at right */}
          {description && (
            <div className="flex flex-col justify-center max-w-md md:ml-auto">
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Container acting as the viewport for background and fades */}
      <div className="relative w-full">
        {/* Shaded Background - Matches the height of this container exactly */}
        <div className="absolute inset-0 z-0 opacity-10 bg-[repeating-linear-gradient(315deg,currentColor_0,currentColor_1px,transparent_0,transparent_50%)] bg-[length:10px_10px] border-y border-black dark:border-white pointer-events-none"></div>

        {/* Fades - Match the height of this container exactly */}
        <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-44 bg-gradient-to-r from-white dark:from-black to-transparent z-20 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-44 bg-gradient-to-l from-white dark:from-black to-transparent z-20 pointer-events-none"></div>

        {/* Content Rows */}
        <div className="relative z-10 flex flex-col gap-6 sm:gap-8 py-10 sm:py-12 items-center justify-center overflow-hidden">
          {rows.map((row, rowIndex) => (
            <motion.div
              key={rowIndex}
              className="flex items-center gap-5 sm:gap-6 min-w-max"
              animate={{
                x: rowIndex % 2 === 0 ? ["0%", "-25%"] : ["-25%", "0%"],
              }}
              transition={{
                duration: 45,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {[...row, ...row, ...row, ...row].map((app, i) => (
                <Capsule
                  key={`${app.id}-${i}`}
                  app={app}
                  onClick={() => setSelected(app)}
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
              className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 8,
                transition: { duration: 0.15 },
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-950 text-neutral-900 dark:text-white p-7 sm:p-9 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50"
            >
              <button
                onClick={() => setSelected(null)}
                aria-label="Close details"
                className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border border-neutral-200 dark:border-neutral-800 shadow-sm",
                    selected.colorBg
                  )}
                >
                  <selected.icon className={cn("w-8 h-8", selected.colorText)} />
                </div>

                <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1">
                  {selected.category}
                </span>

                <h3 className="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white mb-1.5">
                  {selected.name}
                </h3>

                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 mb-5">
                  {selected.subtitle}
                </span>

                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6">
                  {selected.description}
                </p>

                <div className="w-full pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
                  <span>Engineered by Saras Dynamics</span>
                  <span className="font-mono uppercase tracking-wider text-[10px] text-[#c30000] font-semibold">
                    Production Ready
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
  app,
  onClick,
}: {
  app: BuiltApp;
  onClick: () => void;
}) {
  const Icon = app.icon;
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="group flex items-center gap-3.5 p-2 pr-6 rounded-full bg-white dark:bg-black/90 border border-neutral-300 hover:border-[#c30000] dark:border-neutral-800 dark:hover:border-[#c30000] cursor-pointer transition-all shadow-sm hover:shadow-md"
    >
      <div
        className={cn(
          "w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-800 transition-colors group-hover:scale-105",
          app.colorBg
        )}
      >
        <Icon className={cn("w-5 h-5", app.colorText)} />
      </div>
      <div className="flex flex-col items-start leading-tight">
        <span className="text-sm font-bold text-neutral-900 dark:text-white">
          {app.name}
        </span>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {app.subtitle}
        </span>
      </div>
    </motion.div>
  );
}
