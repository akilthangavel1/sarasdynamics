import React from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Smartphone,
  Layers,
  Cpu,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  WifiOff,
  Fingerprint,
  Workflow,
  Rocket,
  AppWindow,
  DownloadCloud,
} from "lucide-react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { SiteFooter } from "@/components/ui/site-footer";
import Testimonial2 from "@/components/ui/testimonial-section-2";
import StatsBento from "@/components/ui/stats-bento";

interface MobileDevelopmentPageProps {
  onBackToHome?: () => void;
}

interface CapabilityItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tag: string;
  description: string;
  highlights: string[];
}

const CAPABILITIES: CapabilityItem[] = [
  {
    icon: Smartphone,
    title: "Native iOS & Android Engineering",
    tag: "Swift & Kotlin",
    description:
      "Precision-built native applications utilizing Swift, SwiftUI, Kotlin, and Jetpack Compose for platform-native responsiveness and deep OS integration.",
    highlights: [
      "Hardware-accelerated 120 FPS rendering",
      "Native widgets, live activities, & dynamic island support",
      "Direct integration with Camera, Bluetooth LE, & GPS sensors",
    ],
  },
  {
    icon: AppWindow,
    title: "Cross-Platform React Native & Flutter",
    tag: "Multi-Platform",
    description:
      "A unified, type-safe codebase that runs natively on both iOS and Android, dramatically reducing time to market without compromising on UI fidelity.",
    highlights: [
      "Shared TypeScript business logic & state machines",
      "Over 90% cross-platform code reuse",
      "High-performance Hermes JS engine optimization",
    ],
  },
  {
    icon: WifiOff,
    title: "Offline-First Data Architecture",
    tag: "Zero-Drop Sync",
    description:
      "Resilient offline architecture powered by local SQLite, MMKV, and reactive background workers ensuring full usability without an active network.",
    highlights: [
      "Instant local reads & writes with optimistic UI",
      "Conflict-free replicated data types (CRDTs)",
      "Automatic background queue sync upon reconnection",
    ],
  },
  {
    icon: Zap,
    title: "Fluid Gesture Physics & Microinteractions",
    tag: "Haptics & Motion",
    description:
      "Silky-smooth touch tracking and physics-driven spring animations driven by react-native-reanimated and integrated system haptics.",
    highlights: [
      "Continuous 60-120Hz ProMotion gesture responsiveness",
      "Tactile Taptic Engine and vibration feedback",
      "Shared element transitions and modal sheets",
    ],
  },
  {
    icon: Fingerprint,
    title: "On-Device Security & Biometrics",
    tag: "Zero-Trust Mobile",
    description:
      "Enterprise-grade security using Apple Keychain, Android Keystore, biometric authentication (Face ID / Touch ID), and SSL certificate pinning.",
    highlights: [
      "Biometric enrollment and cryptographic authentication",
      "Hardware-backed encryption at rest",
      "Strict man-in-the-middle (MitM) protections",
    ],
  },
  {
    icon: DownloadCloud,
    title: "CI/CD & App Store Delivery",
    tag: "Automated Deployments",
    description:
      "Automated build and signing pipelines with Fastlane and GitHub Actions, enabling seamless TestFlight distribution and instant Over-the-Air updates.",
    highlights: [
      "Automated provisioning profiles & code signing",
      "Instant hot-patching via Expo EAS / CodePush",
      "Guaranteed compliance with Apple & Google review standards",
    ],
  },
];

const TECH_STACK = [
  { name: "React Native", category: "Framework" },
  { name: "Swift / SwiftUI", category: "iOS Native" },
  { name: "Kotlin", category: "Android Native" },
  { name: "Flutter", category: "Cross-Platform" },
  { name: "Expo EAS", category: "Tooling & CI/CD" },
  { name: "SQLite / MMKV", category: "Local Storage" },
  { name: "Fastlane", category: "Automation" },
  { name: "Reanimated 3", category: "Gestures & Physics" },
  { name: "TypeScript", category: "Core Language" },
  { name: "Firebase Cloud Messaging", category: "Push Notifications" },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Mobile Architecture & UX",
    desc: "We define user journeys, native screen hierarchies, offline data flows, and device permission models prior to development.",
    icon: Layers,
  },
  {
    step: "02",
    title: "Sprint Prototyping & Builds",
    desc: "Rapid delivery of testable internal builds every week directly to your phone via Apple TestFlight and Google Play Internal Testing.",
    icon: Workflow,
  },
  {
    step: "03",
    title: "Device Matrix & Stress Testing",
    desc: "Exhaustive QA across diverse screen sizes, orientations, OS versions, low-battery states, and erratic network conditions.",
    icon: ShieldCheck,
  },
  {
    step: "04",
    title: "App Store & Play Store Launch",
    desc: "Complete management of App Store Connect and Google Play Console submissions, privacy manifests, and global store rollout.",
    icon: Rocket,
  },
];

export function MobileDevelopmentPage({ onBackToHome }: MobileDevelopmentPageProps) {
  const scrollToCapabilities = () => {
    document.getElementById("mobile-capabilities")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleStartProject = () => {
    window.location.hash = "#contact";
  };

  return (
    <div
      id="mobile-development-page-wrapper"
      className="w-full min-h-screen bg-white text-zinc-900 flex flex-col selection:bg-zinc-900 selection:text-white"
    >
      {/* Sticky Responsive Header Navigation */}
      <Navbar1Demo />

      {/* Simple, Polished Hero Section */}
      <section
        id="mobile-hero"
        className="relative w-full border-b border-zinc-200/80 bg-zinc-50/60 py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        {/* Subtle grid background accent */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center">
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200 text-xs font-medium text-zinc-800 shadow-xs mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span>Native & Cross-Platform Mobile Engineering &bull; iOS & Android</span>
          </motion.div>

          {/* Simple Hero Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.08] text-balance"
          >
            High-performance mobile apps crafted for iOS, Android, and beyond.
          </motion.h1>

          {/* Simple Supportive Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 text-base sm:text-lg md:text-xl text-zinc-600 max-w-2xl text-balance font-normal leading-relaxed"
          >
            We build fluid, responsive mobile experiences with React Native, Swift, Kotlin, and Flutter — engineered for 120 FPS performance, offline reliability, and seamless app store launches.
          </motion.p>

          {/* Action Controls */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
          >
            <button
              onClick={scrollToCapabilities}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 text-white font-medium text-sm hover:bg-zinc-800 transition-all shadow-sm active:scale-98 cursor-pointer"
            >
              <span>Explore Capabilities</span>
              <ArrowRight className="size-4" />
            </button>

            <button
              onClick={handleStartProject}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-200 bg-white text-zinc-800 font-medium text-sm hover:bg-zinc-100 transition-all shadow-2xs active:scale-98 cursor-pointer"
            >
              <Sparkles className="size-4 text-red-600" />
              <span>Start a Project</span>
            </button>

            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full text-zinc-500 hover:text-zinc-900 text-sm font-medium transition-colors cursor-pointer"
              >
                <ArrowLeft className="size-4" />
                <span>Home</span>
              </button>
            )}
          </motion.div>

          {/* Performance Guarantee Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl pt-8 border-t border-zinc-200/80"
          >
            <div className="p-3 bg-white/70 rounded-xl border border-zinc-200/80 shadow-2xs">
              <div className="text-xl sm:text-2xl font-bold text-zinc-900 font-mono">120 FPS</div>
              <div className="text-xs text-zinc-500 mt-0.5">Smooth Gestures</div>
            </div>
            <div className="p-3 bg-white/70 rounded-xl border border-zinc-200/80 shadow-2xs">
              <div className="text-xl sm:text-2xl font-bold text-red-600 font-mono">100%</div>
              <div className="text-xs text-zinc-500 mt-0.5">Offline-First Sync</div>
            </div>
            <div className="p-3 bg-white/70 rounded-xl border border-zinc-200/80 shadow-2xs">
              <div className="text-xl sm:text-2xl font-bold text-zinc-900 font-mono">4.9 ★</div>
              <div className="text-xs text-zinc-500 mt-0.5">App Store Standards</div>
            </div>
            <div className="p-3 bg-white/70 rounded-xl border border-zinc-200/80 shadow-2xs">
              <div className="text-xl sm:text-2xl font-bold text-zinc-900 font-mono">OTA</div>
              <div className="text-xs text-zinc-500 mt-0.5">Instant Updates</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bento Showcase */}
      <StatsBento />

      {/* Capabilities Section */}
      <section
        id="mobile-capabilities"
        className="w-full py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-700 mb-3">
            <Smartphone className="size-3.5 text-red-600" />
            <span>Mobile Engineering Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
            End-to-end native & cross-platform mobile solutions.
          </h2>
          <p className="mt-3 text-base text-zinc-600">
            From low-level gesture physics to automated App Store releases, we engineer mobile software ready for millions of downloads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAPABILITIES.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="group p-6 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-zinc-100 group-hover:bg-red-50 flex items-center justify-center transition-colors">
                      <Icon className="size-5 text-zinc-800 group-hover:text-red-600 transition-colors" />
                    </div>
                    <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-600">
                      {cap.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-900 tracking-tight mb-2">
                    {cap.title}
                  </h3>
                  <p className="text-sm text-zinc-600 leading-relaxed mb-5">
                    {cap.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100 space-y-2">
                  {cap.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-zinc-600">
                      <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section className="w-full py-12 border-y border-zinc-200/80 bg-zinc-50/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-6">
            Mobile Frameworks & Tooling We Master
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {TECH_STACK.map((tech) => (
              <div
                key={tech.name}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-xs font-medium text-zinc-800 shadow-2xs hover:border-zinc-300 transition-colors"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="font-semibold text-zinc-900">{tech.name}</span>
                <span className="text-zinc-400">&bull;</span>
                <span className="text-zinc-500 text-[11px]">{tech.category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By The Best People Testimonials Section */}
      <Testimonial2 />

      {/* Delivery Process */}
      <section className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-700 mb-3">
            <Workflow className="size-3.5 text-red-600" />
            <span>Structured App Release Lifecycle</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
            How we take mobile apps from idea to the App Store.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROCESS_STEPS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.step}
                className="p-6 rounded-2xl border border-zinc-200 bg-white relative overflow-hidden"
              >
                <div className="text-3xl font-mono font-extrabold text-zinc-200 mb-4">
                  {p.step}
                </div>
                <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center mb-3">
                  <Icon className="size-4 text-zinc-800" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 tracking-tight mb-2">
                  {p.title}
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Project Kickoff Call to Action */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mb-16">
        <div className="rounded-3xl border border-zinc-900 bg-zinc-900 text-white p-8 sm:p-12 md:p-16 text-center relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-xs text-zinc-300 mb-4 border border-zinc-700">
              <Sparkles className="size-3.5 text-red-400" />
              <span>iOS & Android Development</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Ready to bring your mobile application to life?
            </h2>
            <p className="mt-4 text-zinc-300 text-sm sm:text-base leading-relaxed max-w-lg">
              Partner with Saras Dynamics to build, polish, and launch native or cross-platform mobile software users love to touch.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleStartProject}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-100 transition-colors cursor-pointer shadow-sm"
              >
                <span>Request Mobile Project Scoping</span>
                <ArrowRight className="size-4" />
              </button>
              <button
                onClick={onBackToHome}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-700 bg-zinc-800/80 text-zinc-200 font-medium text-sm hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Global Site Footer */}
      <SiteFooter />
    </div>
  );
}

export default MobileDevelopmentPage;
