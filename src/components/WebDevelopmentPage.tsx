import React from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Code2,
  Layers,
  Cpu,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  Server,
  Terminal,
  Database,
  Workflow,
  Rocket,
} from "lucide-react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { SiteFooter } from "@/components/ui/site-footer";
import { ImageExpansionSlider } from "@/components/ui/image-expansion";
import { BlogPostCardDemo } from "@/components/ui/card-18-demo";
import { EnhancedBackgroundPaths } from "@/components/ui/modern-background-paths";

interface WebDevelopmentPageProps {
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
    icon: Code2,
    title: "High-Performance Web Applications",
    tag: "SPAs & PWAs",
    description:
      "Engineered with modern React and TypeScript for lightning-fast interactions, responsive layouts, and rock-solid state management.",
    highlights: [
      "Zero-latency reactive user interfaces",
      "Robust state machines & optimistic UI",
      "Progressive Web App (PWA) offline capabilities",
    ],
  },
  {
    icon: Server,
    title: "Cloud APIs & Serverless Backends",
    tag: "Microservices & Edge",
    description:
      "Scalable REST and GraphQL APIs crafted in Node.js, containerized for Cloud Run, and backed by high-throughput database architectures.",
    highlights: [
      "Containerized microservices on Cloud Run",
      "Resilient database schemas & connection pooling",
      "Sub-100ms global edge response times",
    ],
  },
  {
    icon: Zap,
    title: "Core Web Vitals & Speed Optimization",
    tag: "Sub-Second Loads",
    description:
      "Deep audits and structural optimizations ensuring perfect Lighthouse scores, minimal layout shift, and instant bundle delivery.",
    highlights: [
      "Aggressive tree-shaking & code-splitting",
      "Automated image caching and modern formats",
      "Perfect 95+ Core Web Vitals compliance",
    ],
  },
  {
    icon: Layers,
    title: "Design Systems & Component Libraries",
    tag: "Design to Code",
    description:
      "Custom component architectures built on Tailwind CSS and shadcn/ui primitives, strictly harmonized with your company's visual language.",
    highlights: [
      "Accessible WCAG AA/AAA compliant controls",
      "Design token synchronizations",
      "GPU-accelerated micro-interactions",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Auth & Data Security",
    tag: "Security Hardened",
    description:
      "Hardened authentication pipelines with OAuth 2.0, role-based access control (RBAC), CSRF/XSS mitigations, and encrypted storage.",
    highlights: [
      "Role-Based Access Control (RBAC)",
      "Strict Content Security Policy (CSP)",
      "Secure credential & token storage",
    ],
  },
  {
    icon: Cpu,
    title: "Modern Full-Stack Integrations",
    tag: "Ecosystems",
    description:
      "Seamless connectivity with payment processors (Stripe), AI models, transactional emails, search indexes, and custom third-party SDKs.",
    highlights: [
      "Stripe payment & subscription webhooks",
      "Real-time event streaming & WebSockets",
      "Cloud storage & automated CDN pipelines",
    ],
  },
];

const TECH_STACK = [
  { name: "React 19", category: "Frontend" },
  { name: "TypeScript", category: "Language" },
  { name: "Next.js / Vite", category: "Tooling" },
  { name: "Tailwind CSS", category: "Styling" },
  { name: "Node.js", category: "Runtime" },
  { name: "PostgreSQL", category: "Database" },
  { name: "Cloud Run", category: "Infrastructure" },
  { name: "Docker", category: "Containers" },
  { name: "Redis", category: "Caching" },
  { name: "GraphQL", category: "Data Layer" },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Architectural Discovery",
    desc: "We analyze technical requirements, database topologies, security profiles, and define the core blueprint before writing code.",
    icon: Terminal,
  },
  {
    step: "02",
    title: "Iterative Sprint Builds",
    desc: "Rapid delivery of testable, production-grade features every week with live preview staging and continuous client collaboration.",
    icon: Workflow,
  },
  {
    step: "03",
    title: "Automated QA & Security",
    desc: "Comprehensive automated test suites, end-to-end user journeys, performance stress testing, and vulnerability auditing.",
    icon: ShieldCheck,
  },
  {
    step: "04",
    title: "Zero-Downtime Launch",
    desc: "Seamless container deployment with automated CI/CD pipelines, SSL provisioning, and real-time observability telemetry.",
    icon: Rocket,
  },
];

export function WebDevelopmentPage({ onBackToHome }: WebDevelopmentPageProps) {
  const scrollToCapabilities = () => {
    document.getElementById("web-capabilities")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleStartProject = () => {
    window.location.hash = "#contact";
  };

  return (
    <div
      id="web-development-page-wrapper"
      className="w-full min-h-screen bg-white text-zinc-900 flex flex-col selection:bg-zinc-900 selection:text-white"
    >
      {/* Sticky Responsive Header Navigation */}
      <Navbar1Demo />

      {/* Enhanced Background Paths Hero Section */}
      <section
        id="web-hero"
        className="relative w-full border-b border-zinc-200/80 overflow-hidden"
      >
        <EnhancedBackgroundPaths
          title="Web Development"
          subtitle="Saras Dynamics architects high-performance web applications, resilient cloud backends, and responsive design systems with React, TypeScript, and modern distributed architecture."
          badge="Full-Stack Web Engineering • Saras Dynamics"
          ctaText="Explore Capabilities"
          onCtaClick={scrollToCapabilities}
          onSecondaryClick={handleStartProject}
        />
      </section>

      {/* Capabilities Section */}
      <section
        id="web-capabilities"
        className="w-full py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-700 mb-3">
            <Code2 className="size-3.5 text-red-600" />
            <span>Web Engineering Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
            Full-Stack Web Architecture & Engineering
          </h2>
          <p className="mt-3.5 text-base sm:text-lg text-zinc-600 leading-relaxed">
            From responsive, high-framerate client applications to containerized microservices and automated CI/CD pipelines, we architect resilient web systems built for scale.
          </p>
        </div>

        {/* Performance Benchmark Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-14">
          <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-2xs">
            <div className="text-2xl sm:text-3xl font-bold text-zinc-900 font-mono tracking-tight">&lt; 0.8s</div>
            <div className="text-xs font-medium text-zinc-500 mt-1">First Contentful Paint</div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-2xs">
            <div className="text-2xl sm:text-3xl font-bold text-red-600 font-mono tracking-tight">99.99%</div>
            <div className="text-xs font-medium text-zinc-500 mt-1">Production Uptime SLA</div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-2xs">
            <div className="text-2xl sm:text-3xl font-bold text-zinc-900 font-mono tracking-tight">98+</div>
            <div className="text-xs font-medium text-zinc-500 mt-1">Core Web Vitals Benchmark</div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-2xs">
            <div className="text-2xl sm:text-3xl font-bold text-zinc-900 font-mono tracking-tight">100%</div>
            <div className="text-xs font-medium text-zinc-500 mt-1">TypeScript Strict Mode</div>
          </div>
        </div>

        {/* 6 Core Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
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

                <div className="pt-4 border-t border-zinc-100">
                  <div className="space-y-2">
                    {cap.highlights.map((h) => (
                      <div key={h} className="flex items-start gap-2 text-xs text-zinc-600">
                        <CheckCircle2 className="size-3.5 text-red-600 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Case Studies & Engineering Deep-Dives Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 pt-12 border-t border-zinc-200">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-700 mb-3">
            <Sparkles className="size-3.5 text-red-600" />
            <span>Engineering Case Studies</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            Real-World Web Architecture Deep Dives
          </h3>
          <p className="mt-2 text-sm sm:text-base text-zinc-600">
            How we solve complex throughput, latency, and design system challenges in production environments.
          </p>
        </div>

        <BlogPostCardDemo className="p-0" />
      </section>

      {/* Tech Stack Banner */}
      <section className="w-full py-12 border-y border-zinc-200/80 bg-zinc-50/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-6">
            Technologies & Frameworks We Master
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

      {/* Web Development Portfolio Section */}
      <section
        id="web-portfolio"
        className="w-full py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
      >
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-700 mb-3">
            <Globe className="size-3.5 text-red-600" />
            <span>Client Work & Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
            Featured Web Development Portfolio
          </h2>
          <p className="mt-3 text-base text-zinc-600">
            Explore live production web apps, cloud telemetry consoles, and SaaS platforms engineered by Saras Dynamics.
          </p>
        </div>

        <ImageExpansionSlider />
      </section>

      {/* Delivery Process */}
      <section className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-700 mb-3">
            <Workflow className="size-3.5 text-red-600" />
            <span>Structured Delivery</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
            How we take products from concept to live production.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROCESS_STEPS.map((p, idx) => {
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
              <span>Let&apos;s Build Together</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Have a web application or digital platform in mind?
            </h2>
            <p className="mt-4 text-zinc-300 text-sm sm:text-base leading-relaxed max-w-lg">
              Partner with Saras Dynamics to architect, design, and deploy web software engineered for peak reliability.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleStartProject}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-100 transition-colors cursor-pointer shadow-sm"
              >
                <span>Request Project Scoping</span>
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

export default WebDevelopmentPage;
