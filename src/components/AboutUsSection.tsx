import { useState } from "react";
import { motion } from "motion/react";
import { 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Terminal, 
  CheckCircle2, 
  ArrowUpRight, 
  Sparkles,
  Target,
  Users,
  Compass
} from "lucide-react";

export function AboutUsSection() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const pillars = [
    {
      id: "architecture",
      icon: Layers,
      title: "Zero-Compromise Architecture",
      subtitle: "Deterministic performance and resilience",
      description:
        "We build scalable distributed backends and modular frontend systems designed for peak concurrency. Every schema, event queue, and API endpoint is hardened against edge-case failures with comprehensive telemetry and automated testing.",
      highlights: [
        "Distributed event-driven microservices",
        "Sub-50ms query latency & multi-region caching",
        "Type-safe contracts end-to-end with TypeScript & gRPC",
        "Zero-downtime blue/green CI/CD deployment pipelines"
      ],
      metric: "99.99%",
      metricLabel: "Historical production uptime"
    },
    {
      id: "ai",
      icon: Cpu,
      title: "Production-Grade AI & RAG",
      subtitle: "Beyond prototypes to enterprise inference",
      description:
        "We move machine intelligence from playground experiments to enterprise workflows. We architect low-latency retrieval-augmented generation (RAG), domain-tuned agentic models, and multi-modal neural pipelines tailored to proprietary data.",
      highlights: [
        "Hybrid vector & lexical search with reranking",
        "Self-correcting agentic tool-use loops",
        "Fine-tuned lightweight SLMs for edge execution",
        "Strict hallucination guardrails & PII redaction"
      ],
      metric: "64%",
      metricLabel: "Average drop in pipeline latency"
    },
    {
      id: "craft",
      icon: Sparkles,
      title: "High-Craft Digital Experience",
      subtitle: "120 FPS motion and ergonomic design systems",
      description:
        "Software should feel effortless to use. We combine technical engineering depth with meticulous visual polish—pairing mathematical typography scales, fluid micro-interactions, and accessible tokens that elevate tools into delight.",
      highlights: [
        "Pixel-level alignment and mathematical grid ratios",
        "Smooth hardware-accelerated 120 FPS transitions",
        "WCAG AAA contrast & keyboard-first navigation",
        "Scalable Figma-to-Code design token pipelines"
      ],
      metric: "120 FPS",
      metricLabel: "ProMotion fluid render targets"
    },
    {
      id: "velocity",
      icon: Zap,
      title: "Direct Senior Engineering",
      subtitle: "No middlemen, direct technical partnership",
      description:
        "You work directly with principal engineers, systems architects, and ML practitioners. We embed with your team, align on clear business KPIs, and ship production-ready milestones with weekly deployable builds.",
      highlights: [
        "Dedicated principal architect on every project",
        "Transparent codebases with clear documentation",
        "Weekly demonstrable product sprints",
        "Seamless knowledge transfer to your in-house team"
      ],
      metric: "2.4x",
      metricLabel: "Faster time-to-market delivery"
    }
  ];

  const milestones = [
    { value: "140+", label: "Production Deployments", detail: "Shipped across enterprise cloud and mobile app stores" },
    { value: "99.99%", label: "Uptime Reliability", detail: "Engineered with resilient failovers & multi-zone clusters" },
    { value: "<45ms", label: "Average Edge Latency", detail: "Worldwide distributed compute & CDN acceleration" },
    { value: "10M+", label: "Daily Data Transactions", detail: "High-throughput message queues & streaming pipelines" }
  ];

  const coreValues = [
    {
      icon: Terminal,
      title: "Algorithmic Precision",
      desc: "Every query, cache layer, and memory allocation is measured. We write clean, idiomatic code built for speed and maintainability."
    },
    {
      icon: ShieldCheck,
      title: "Security by Architecture",
      desc: "Security isn't a patch applied at the end—it's built into our schema designs, encrypted token exchanges, and role-based policies."
    },
    {
      icon: Target,
      title: "Outcome-Driven Delivery",
      desc: "We measure success not by lines of code, but by business outcomes: reduced compute costs, faster checkouts, and happier end-users."
    },
    {
      icon: Users,
      title: "Collaborative Ownership",
      desc: "We treat your software as if it were our own proprietary platform, bringing candid technical advice and proactive guidance."
    }
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Deep Technical Discovery",
      desc: "We audit existing architecture, map data flows, identify bottlenecks, and define precise performance SLAs before writing a line of code."
    },
    {
      step: "02",
      title: "Iterative Rapid Prototyping",
      desc: "We build functioning vertical slices in short sprints, putting real software in your hands early to validate assumptions."
    },
    {
      step: "03",
      title: "Hardening & Stress Testing",
      desc: "Comprehensive load testing, vulnerability scans, edge-case simulations, and chaos engineering under simulated peak loads."
    },
    {
      step: "04",
      title: "Production Launch & Telemetry",
      desc: "Zero-downtime deployment backed by full observability, structured logging, real-time APM monitoring, and automated alerting."
    }
  ];

  return (
    <section
      id="about-us-detailed-section"
      className="w-full bg-white text-zinc-900 py-20 sm:py-28 border-t border-zinc-200 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col gap-20 sm:gap-28">
        {/* Section 1: Editorial Header & Origin Story */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Eyebrow & Sticky Overview */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200/90 text-xs font-semibold tracking-wide text-zinc-700 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>WHO WE ARE • ABOUT SARAS DYNAMICS</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-zinc-900">
              Engineering Intelligence. <br />
              <span className="text-zinc-500 font-medium">
                Building What Comes Next.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed">
              Saras Dynamics was founded with a singular conviction: modern businesses don't need another generic digital agency. They need deeply skilled technical partners capable of turning complex engineering challenges into rock-solid, production software.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const footerEl = document.querySelector("footer");
                  if (footerEl) {
                    footerEl.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-semibold text-sm hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
              >
                <span>Partner With Us</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <a
                href="#our-philosophy"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-800 font-semibold text-sm hover:border-zinc-400 hover:bg-zinc-50 transition-colors shadow-2xs"
              >
                <Compass className="w-4 h-4 text-zinc-500" />
                <span>Our Philosophy</span>
              </a>
            </div>
          </div>

          {/* Right Column: Mission Narrative & Core Principles */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col gap-5">
              <span className="text-xs font-bold tracking-wider uppercase text-zinc-400">
                The Saras Dynamics Philosophy
              </span>
              <p className="text-base sm:text-lg font-medium text-zinc-800 leading-relaxed">
                "We believe exceptional software is an expression of craftsmanship. From high-throughput distributed systems to pixel-level mobile motion, we reject technical shortcuts in pursuit of longevity, elegance, and raw performance."
              </p>
              <div className="h-px w-full bg-zinc-100" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-zinc-600">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Full-lifecycle engineering ownership</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Native AI &amp; custom RAG integrations</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Cloud-native distributed reliability</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Senior engineering on every sprint</span>
                </div>
              </div>
            </div>

            {/* Core Values 2x2 Grid */}
            <div id="our-philosophy" className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {coreValues.map((val, idx) => {
                const Icon = val.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/60 transition-all hover:shadow-xs flex flex-col gap-2.5"
                  >
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900 border border-zinc-200/60">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-zinc-900 tracking-tight">
                      {val.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 2: Numbers & Impact Bento */}
        <div className="w-full flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <span className="text-xs font-bold tracking-widest uppercase text-zinc-500">
              MEASURABLE ENGINEERING IMPACT
            </span>
            <span className="text-xs text-zinc-400">
              Verified Production Metrics
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {milestones.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white border border-zinc-200 flex flex-col gap-2 shadow-2xs hover:border-zinc-300 transition-colors"
              >
                <div className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900">
                  {item.value}
                </div>
                <div className="text-sm font-bold text-zinc-800">
                  {item.label}
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed mt-1">
                  {item.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section 3: Interactive Deep-Dive Pillars */}
        <div className="w-full flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold tracking-widest uppercase text-zinc-500">
                WHAT SETS US APART
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
                Four Pillars of Technical Excellence
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-md">
              Select any pillar below to inspect our architectural methodologies, tooling standards, and measurable benchmarks.
            </p>
          </div>

          {/* Interactive Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 p-1.5 bg-zinc-100 rounded-2xl border border-zinc-200">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              const isActive = activeTab === idx;
              return (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center justify-center sm:justify-start gap-2.5 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/80"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-600" : "text-zinc-400"}`} />
                  <span className="truncate">{pillar.title.split(" ")[0]} {pillar.title.split(" ")[1]}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Active Panel */}
          {(() => {
            const currentPillar = pillars[activeTab];
            const Icon = currentPillar.icon;
            return (
              <motion.div
                key={currentPillar.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-6 sm:p-10 rounded-2xl bg-white border border-zinc-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-8 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 border border-zinc-200/70">
                      <Icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                        {currentPillar.title}
                      </h4>
                      <p className="text-xs sm:text-sm font-medium text-zinc-500">
                        {currentPillar.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    {currentPillar.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {currentPillar.highlights.map((item, hi) => (
                      <div key={hi} className="flex items-center gap-2 text-xs sm:text-sm text-zinc-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4 p-6 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col items-center text-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Validated Metric
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight">
                    {currentPillar.metric}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-zinc-600 max-w-[200px]">
                    {currentPillar.metricLabel}
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </div>

        {/* Section 4: The 4-Step Engineering Lifecycle */}
        <div className="w-full flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold tracking-widest uppercase text-zinc-500">
              OUR PROCESS
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
              How We Architect &amp; Ship
            </h3>
            <p className="text-sm text-zinc-600 max-w-2xl">
              Predictable execution from initial architecture review to long-term cloud stability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-zinc-200 flex flex-col gap-4 relative group hover:border-zinc-400 hover:shadow-xs transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-zinc-300 group-hover:text-emerald-600 transition-colors font-mono">
                    {step.step}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-zinc-200 group-hover:bg-emerald-500 transition-colors" />
                </div>
                <h4 className="text-base font-bold text-zinc-900 tracking-tight">
                  {step.title}
                </h4>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Team & Technical Culture Banner */}
        <div className="w-full p-8 sm:p-12 rounded-3xl bg-zinc-50 border border-zinc-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
          <div className="flex flex-col gap-3 max-w-2xl relative z-10">
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-600 font-mono">
              START A CONVERSATION
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug text-zinc-900">
              Have a challenging software, AI, or mobile project in mind?
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              We collaborate with high-growth startups, product teams, and enterprises seeking rigorous engineering and rapid delivery.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10 shrink-0">
            <button
              type="button"
              onClick={() => {
                const footerEl = document.querySelector("footer");
                if (footerEl) {
                  footerEl.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="px-6 py-3 rounded-xl bg-zinc-900 text-white font-bold text-sm hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutUsSection;
