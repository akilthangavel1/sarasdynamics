import React, { useState } from "react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { SiteFooter } from "@/components/ui/site-footer";
import {
  GraduationCap,
  BookOpen,
  Award,
  Video,
  CheckCircle2,
  Users,
  BarChart3,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
  Laptop,
  Play,
  RotateCcw,
  ShieldCheck,
  Zap,
  Globe2,
  FileCheck,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Lock,
  FileCode2,
  MessageSquare,
  Building2,
  Lightbulb,
  Clock,
  Sparkle
} from "lucide-react";

interface LMSPageProps {
  onBackToHome?: () => void;
}

type TabKey = "learner" | "authoring" | "analytics" | "aitutor";

const faqs = [
  {
    q: "Do your custom LMS platforms support SCORM and xAPI (Tin Can)?",
    a: "Yes. We engineer full native support for SCORM 1.2, SCORM 2004 (2nd, 3rd, and 4th Editions), xAPI (Tin Can API), and LTI 1.3 Advantage. This allows you to import third-party authoring packages from Articulate 360, Adobe Captivate, or iSpring, as well as emit granular learning activity statements to an external Learning Record Store (LRS)."
  },
  {
    q: "How does the platform handle high concurrency (e.g. 50,000+ simultaneous learners)?",
    a: "Our architectures utilize horizontal auto-scaling container clusters (Kubernetes/ECS), serverless edge functions for student telemetry, and multi-region CDN caching for video delivery. Databases use read-replicas and distributed Redis caching to ensure sub-100ms API response times during simultaneous exam or corporate compliance deadlines."
  },
  {
    q: "Can the LMS integrate with enterprise HRIS and Single Sign-On (SSO)?",
    a: "Absolutely. We build native SAML 2.0, OpenID Connect, and OAuth integrations for Okta, Azure AD, Google Workspace, and Ping Identity. We also connect bidirectionally with HRIS systems like Workday, BambooHR, and SAP SuccessFactors for automated employee provisioning, role assignment, and completion sync."
  },
  {
    q: "Can we run live virtual classrooms and webinars directly inside the platform?",
    a: "Yes. We integrate low-latency WebRTC live streaming (via LiveKit, Agora, or Amazon IVS) allowing instructors to host live lectures with screen sharing, breakout rooms, real-time whiteboards, and interactive polls without requiring third-party Zoom licenses."
  },
  {
    q: "How does the AI automated grading and tutoring engine work?",
    a: "Our AI engine indexes course lecture videos, transcripts, syllabus documents, and rubrics using vector embeddings. It acts as an always-available 24/7 AI tutor for students, answers conceptual queries with timestamp citations, and assists instructors by evaluating open-ended essays, short answers, and coding submissions against strict grading criteria."
  },
  {
    q: "Can you migrate data and course histories from our legacy LMS?",
    a: "Yes. We have executed large-scale migrations from Moodle, Canvas, Blackboard, Teachable, and TalentLMS. We extract and transform user profiles, enrollment histories, course packages, video assets, and certificate records with zero downtime."
  }
];

export function LMSPage({ onBackToHome }: LMSPageProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("learner");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [aiTutorPrompt, setAiTutorPrompt] = useState<string>("Can you explain how WebRTC achieves sub-second latency in virtual classrooms?");
  const [aiTutorResponse, setAiTutorResponse] = useState<string>(
    "WebRTC establishes peer-to-peer UDP channels with SRTP encryption directly between browser runtimes, bypassing TCP retransmission bottlenecks to stream audio/video frames in under 200 milliseconds."
  );
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  const handleAskTutor = (prompt: string) => {
    setIsAiThinking(true);
    setAiTutorPrompt(prompt);
    setTimeout(() => {
      if (prompt.toLowerCase().includes("scorm")) {
        setAiTutorResponse(
          "SCORM packages communicate with the LMS runtime via a JavaScript API wrapper (LMSInitialize, LMSSetValue, LMSFinish). In our architecture, these calls synchronize asynchronously with local storage to prevent session loss during spotty connectivity."
        );
      } else if (prompt.toLowerCase().includes("grading")) {
        setAiTutorResponse(
          "Our AI Auto-Grading evaluates student submissions against instructor rubrics using semantic similarity, citation verification, and code execution sandboxes, generating detailed feedback in under 3 seconds."
        );
      } else {
        setAiTutorResponse(
          "WebRTC establishes direct UDP audio/video media pipelines with adaptive bitrate codecs (Opus for audio, VP9/AV1 for video), maintaining sub-200ms latency even on constrained corporate networks."
        );
      }
      setIsAiThinking(false);
    }, 600);
  };

  return (
    <div
      id="lms-page-wrapper"
      className="w-full min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-serif selection:bg-zinc-900 selection:text-white transition-colors duration-300"
    >
      {/* Sticky Responsive Header Navigation */}
      <Navbar1Demo />

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1 w-full flex flex-col">
        {/* ===================== HERO SECTION ===================== */}
        <section
          id="lms-hero"
          className="relative w-full overflow-hidden border-b border-zinc-200/80 dark:border-zinc-800 bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900/60 dark:to-zinc-950 pt-16 pb-20 md:pt-24 md:pb-28"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-red-600/10 dark:bg-red-600/15 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xs mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c30000]" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Enterprise EdTech Engineering
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                AI-Driven Learning Platforms
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-zinc-950 dark:text-white uppercase max-w-4xl leading-[1.08]">
              Scalable LMS Platforms &amp; Intelligent Learning Systems
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              We architect custom Learning Management Systems, multi-tenant corporate training academies, and interactive EdTech portals with adaptive AI tutoring, automated compliance certification, and carrier-grade streaming.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <a
                href="#contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#c30000] hover:bg-[#a50000] text-white font-bold text-sm tracking-wide shadow-lg shadow-red-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Build Custom LMS</span>
                <ArrowRight className="size-4" />
              </a>

              <a
                href="https://lms.sarasdynamics.com"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
              >
                <GraduationCap className="size-4 text-[#c30000]" />
                <span>Visit Live Saras LMS</span>
                <ExternalLink className="size-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
              </a>
            </div>

            {/* Performance Metrics Row */}
            <div className="mt-14 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md">
              <div className="flex flex-col items-center py-2 px-4 border-r border-zinc-200/60 dark:border-zinc-800/80 last:border-none">
                <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
                  100k+
                </span>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">
                  Concurrent Learners
                </span>
              </div>

              <div className="flex flex-col items-center py-2 px-4 border-r border-zinc-200/60 dark:border-zinc-800/80 last:border-none">
                <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
                  SCORM &amp; LTI
                </span>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">
                  Industry Standards
                </span>
              </div>

              <div className="flex flex-col items-center py-2 px-4 border-r border-zinc-200/60 dark:border-zinc-800/80 last:border-none">
                <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
                  99.99%
                </span>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">
                  Platform Uptime SLA
                </span>
              </div>

              <div className="flex flex-col items-center py-2 px-4">
                <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
                  Sub-1.2s
                </span>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">
                  HLS Video Startup
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== INTERACTIVE LMS STUDIO SIMULATOR ===================== */}
        <section
          id="lms-simulator"
          className="w-full py-16 sm:py-24 border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/80"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c30000]">
                Interactive Architecture
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
                Explore The Saras LMS Engine
              </h2>
              <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                Toggle through key modules: student experience, course authoring, compliance analytics, and AI tutoring.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {[
                { id: "learner", label: "Learner Experience", icon: Laptop },
                { id: "authoring", label: "Course Studio & SCORM", icon: BookOpen },
                { id: "analytics", label: "Compliance & Analytics", icon: BarChart3 },
                { id: "aitutor", label: "AI Tutor & Auto-Grading", icon: BrainCircuit }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabKey)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-md scale-105"
                        : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Interactive Sandbox Console */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden min-h-[460px]">
              {/* Top Window Bar */}
              <div className="w-full flex items-center justify-between px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-950/60">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-red-500/80" />
                  <span className="size-3 rounded-full bg-amber-500/80" />
                  <span className="size-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
                    saras-lms-core // {activeTab.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Production Ready
                  </span>
                  <a
                    href="https://lms.sarasdynamics.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#c30000] hover:underline"
                  >
                    <span>Open Live Portal</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>

              {/* Tab 1: Learner Experience */}
              {activeTab === "learner" && (
                <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Player & Video */}
                  <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 aspect-video flex items-center justify-center group">
                      <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-red-950/40 opacity-80" />
                      <div className="relative z-10 flex flex-col items-center text-center p-6 text-white">
                        <div className="size-14 rounded-full bg-[#c30000] text-white flex items-center justify-center shadow-lg shadow-red-900/40 mb-3 group-hover:scale-110 transition-transform">
                          <Play className="size-6 ml-0.5" />
                        </div>
                        <span className="text-xs font-mono uppercase tracking-widest text-red-400 font-semibold">
                          Module 4.2 • High Availability Systems
                        </span>
                        <h4 className="text-lg font-bold mt-1">
                          Zero-Downtime Distributed Architecture
                        </h4>
                        <span className="text-xs text-zinc-400 mt-2">
                          1080p 60fps • HLS Multi-Bitrate Adaptive Stream
                        </span>
                      </div>

                      {/* Video Player Controls Bar */}
                      <div className="absolute bottom-0 inset-x-0 bg-zinc-950/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between text-xs text-zinc-300">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-red-500" />
                          <span className="font-mono text-[11px]">18:42 / 32:10</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono">1.25x</span>
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono">CC (EN)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span>Curriculum Progress: 72% Completed</span>
                      <span className="font-bold text-zinc-900 dark:text-white">Badge eligible upon quiz completion</span>
                    </div>
                  </div>

                  {/* Right Column: In-Module Interactive Knowledge Check */}
                  <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 lg:pl-8 pt-4 lg:pt-0">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#c30000]">
                          Checkpoint Assessment
                        </span>
                        <span className="text-xs font-mono text-zinc-500">Question 3 of 4</span>
                      </div>

                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white mt-4">
                        Which protocol allows third-party SCORM packages to send live gradebook updates into our LMS database?
                      </h4>

                      <div className="mt-4 space-y-2.5">
                        {[
                          "SCORM CMI Data Model & LMSSetValue() API",
                          "Unencrypted HTTP GET polling",
                          "Manual CSV upload by instructor",
                          "Simple DNS TXT record lookup"
                        ].map((option, idx) => {
                          const isSelected = selectedQuizOption === idx;
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedQuizOption(idx);
                                setQuizSubmitted(false);
                              }}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                                isSelected
                                  ? "border-red-500 bg-red-500/10 text-zinc-900 dark:text-white font-semibold"
                                  : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="size-5 rounded-full border border-current flex items-center justify-center text-[10px] font-mono shrink-0">
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span>{option}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400">
                          <div className="flex items-center gap-2 font-bold">
                            <CheckCircle2 className="size-4 shrink-0" />
                            <span>Correct! SCORM CMI bridge verified.</span>
                          </div>
                          <p className="mt-1 text-[11px] leading-relaxed">
                            Data model elements like cmi.core.lesson_status and cmi.core.score.raw commit automatically.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (selectedQuizOption !== null) {
                            setQuizSubmitted(true);
                          }
                        }}
                        disabled={selectedQuizOption === null}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#c30000] hover:bg-[#a50000] disabled:opacity-40 text-white font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer"
                      >
                        Submit Answer
                      </button>

                      <button
                        onClick={() => {
                          setSelectedQuizOption(null);
                          setQuizSubmitted(false);
                        }}
                        className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                        title="Reset"
                      >
                        <RotateCcw className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Course Studio & SCORM */}
              {activeTab === "authoring" && (
                <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-6 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#c30000]">
                        Curriculum Studio
                      </span>
                      <h3 className="text-xl font-black text-zinc-900 dark:text-white mt-1">
                        Modular Course Builder &amp; SCORM Ingestion
                      </h3>
                      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Design multi-chapter certifications with rich multimedia, code execution sandboxes, downloadable resources, and SCORM/xAPI packages.
                      </p>

                      <div className="mt-6 space-y-3">
                        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Video className="size-4 text-red-500" />
                            <div>
                              <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                                Chapter 1: Architectural Foundations
                              </span>
                              <span className="text-[11px] text-zinc-500">4 video lessons • 45 mins</span>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                            Published
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileCode2 className="size-4 text-indigo-500" />
                            <div>
                              <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                                Chapter 2: Interactive Sandbox Lab
                              </span>
                              <span className="text-[11px] text-zinc-500">Node.js + Postgres code environment</span>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                            Auto-Graded
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl border border-dashed border-red-500/40 bg-red-500/5 p-4 flex items-center justify-center text-center cursor-pointer hover:bg-red-500/10 transition-colors">
                          <span className="text-xs font-bold text-[#c30000] flex items-center gap-1.5">
                            <Layers className="size-4" />
                            <span>+ Drag &amp; Drop SCORM / xAPI Zip Package</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                      <span>Standards: SCORM 1.2, 2004 4th Ed, LTI 1.3</span>
                      <span className="font-mono text-zinc-700 dark:text-zinc-300 font-semibold">Auto-Sync On</span>
                    </div>
                  </div>

                  <div className="lg:col-span-6 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-white flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs">
                        <span className="font-mono text-zinc-400 font-semibold">SCORM Manifest Parser</span>
                        <span className="text-emerald-400 font-mono text-[11px]">imsmanifest.xml: Valid</span>
                      </div>

                      <pre className="mt-4 font-mono text-[11px] text-zinc-300 bg-zinc-950 p-4 rounded-lg overflow-x-auto leading-relaxed">
{`<manifest identifier="saras_course_v3" version="1.3">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>2004 4th Edition</schemaversion>
  </metadata>
  <organizations default="org_sd">
    <organization identifier="org_sd">
      <title>Enterprise Cloud Architecture</title>
      <item identifier="item_1" identifierref="res_1">
        <title>Unit 1: Security Posture</title>
      </item>
    </organization>
  </organizations>
</manifest>`}
                      </pre>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800 pt-3">
                      <span>Auto-indexed into Knowledge Graph for AI Tutoring</span>
                      <span className="text-red-400 font-bold">SHA-256 Verified</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Compliance & Analytics */}
              {activeTab === "analytics" && (
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60">
                      <span className="text-xs font-semibold text-zinc-500 uppercase">Enterprise Completion Rate</span>
                      <h4 className="text-2xl font-black text-zinc-900 dark:text-white mt-1">94.8%</h4>
                      <span className="text-[11px] text-emerald-600 font-medium">+12% vs legacy LMS</span>
                    </div>

                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60">
                      <span className="text-xs font-semibold text-zinc-500 uppercase">Active Compliance Certs</span>
                      <h4 className="text-2xl font-black text-zinc-900 dark:text-white mt-1">14,280</h4>
                      <span className="text-[11px] text-zinc-500">ISO 27001, OSHA, HIPAA</span>
                    </div>

                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60">
                      <span className="text-xs font-semibold text-zinc-500 uppercase">Median Time to Certify</span>
                      <h4 className="text-2xl font-black text-zinc-900 dark:text-white mt-1">4.2 Days</h4>
                      <span className="text-[11px] text-indigo-500 font-medium">Automated reminder alerts</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 text-xs">
                      <span className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                        Real-Time Learning Audit Log &bull; xAPI Stream
                      </span>
                      <span className="text-zinc-500 font-mono text-[11px]">Auto-Export to HRIS / Workday</span>
                    </div>

                    <div className="mt-4 space-y-2.5 text-xs font-mono">
                      {[
                        { time: "14:22:01", user: "devon.v@enterprise.co", event: "completed_assessment", score: "98%", status: "CERTIFIED" },
                        { time: "14:21:40", user: "sarah.k@fintech.io", event: "watched_video_segment", score: "100%", status: "IN_PROGRESS" },
                        { time: "14:20:15", user: "marcus.t@defense.gov", event: "submitted_code_sandbox", score: "PASSED", status: "VERIFIED" },
                        { time: "14:18:50", user: "elena.r@logistics.net", event: "earned_micro_credential", score: "A+", status: "ISSUED" }
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 text-[11px]"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-zinc-400">{item.time}</span>
                            <span className="font-bold text-zinc-900 dark:text-white">{item.user}</span>
                            <span className="text-zinc-500">{item.event}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-indigo-400 font-semibold">{item.score}</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: AI Tutor & Auto-Grading */}
              {activeTab === "aitutor" && (
                <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-5 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold mb-3">
                        <Sparkles className="size-3.5" />
                        <span>Saras Learning Assistant</span>
                      </div>
                      <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                        24/7 Context-Aware AI Tutoring
                      </h3>
                      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Trained exclusively on your verified course videos, slide decks, and codebases. Never hallucinates; always provides timestamped lecture citations.
                      </p>

                      <div className="mt-5 space-y-2">
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                          Suggested Questions:
                        </span>
                        {[
                          "Explain how WebRTC achieves sub-second latency in virtual classrooms?",
                          "How does the SCORM CMI bridge prevent data loss?",
                          "How does AI Auto-Grading evaluate student code submissions?"
                        ].map((q, i) => (
                          <button
                            key={i}
                            onClick={() => handleAskTutor(q)}
                            className="w-full text-left p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 text-xs text-zinc-700 dark:text-zinc-300 hover:border-red-500/40 transition-colors cursor-pointer"
                          >
                            💬 {q}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500">
                      RAG Vector DB: Milvus + Gemini Pro Inference
                    </div>
                  </div>

                  <div className="lg:col-span-7 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 p-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Learner message */}
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-mono text-zinc-400 mb-1">Student Inquiry</span>
                        <div className="p-3 rounded-2xl rounded-tr-xs bg-red-500 text-white text-xs max-w-[85%] leading-relaxed">
                          {aiTutorPrompt}
                        </div>
                      </div>

                      {/* AI Tutor response */}
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-red-500 mb-1 font-bold">
                          <Sparkles className="size-3" />
                          <span>AI Course Mentor</span>
                        </div>
                        <div className="p-3.5 rounded-2xl rounded-tl-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 max-w-[90%] leading-relaxed shadow-xs">
                          {isAiThinking ? (
                            <div className="flex items-center gap-2 text-zinc-400 py-1">
                              <span className="size-2 rounded-full bg-red-500 animate-ping" />
                              <span>Searching curriculum index...</span>
                            </div>
                          ) : (
                            <>
                              <p>{aiTutorResponse}</p>
                              <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                                <span>Citation: Chapter 4.2 @ 18:42</span>
                                <span className="text-emerald-500 font-bold">Confidence: 99.4%</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Ask the AI Tutor anything about the course..."
                        className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-red-500"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.currentTarget.value.trim()) {
                            handleAskTutor(e.currentTarget.value.trim());
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                          if (input && input.value.trim()) {
                            handleAskTutor(input.value.trim());
                            input.value = "";
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-[#c30000] hover:bg-[#a50000] text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Ask
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ===================== CORE CAPABILITIES GRID ===================== */}
        <section
          id="capabilities"
          className="w-full py-16 sm:py-24 border-b border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/30"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-14">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c30000]">
                Enterprise Features
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
                Purpose-Built for High-Stakes Education
              </h2>
              <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                Architectural depth designed to meet stringent accreditation standards, international compliance, and massive student traffic.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="size-12 rounded-xl bg-red-500/10 text-[#c30000] flex items-center justify-center mb-6">
                    <Building2 className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Multi-Tenant White-Labeling
                  </h3>
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Deploy distinct branded portals for different business units, clients, or campus departments with custom domains, isolated databases, and customized themes.
                  </p>
                </div>
                <ul className="mt-6 space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Custom domain &amp; SSL automation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Per-tenant role-based permissions</span>
                  </li>
                </ul>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="size-12 rounded-xl bg-red-500/10 text-[#c30000] flex items-center justify-center mb-6">
                    <Award className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Verifiable Digital Credentials
                  </h3>
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Generate tamper-proof PDF certificates with unique QR verification codes, blockchain micro-credentials, and direct 1-click publishing to LinkedIn profiles.
                  </p>
                </div>
                <ul className="mt-6 space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Cryptographic QR code verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Automated expiration &amp; re-certification</span>
                  </li>
                </ul>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="size-12 rounded-xl bg-red-500/10 text-[#c30000] flex items-center justify-center mb-6">
                    <ShieldCheck className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Audit-Ready Regulatory Compliance
                  </h3>
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Automate OSHA, HIPAA, SOC2, and ISO training cycles with strict audit trails, electronic signature verification, and automated escalation to department managers.
                  </p>
                </div>
                <ul className="mt-6 space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>21 CFR Part 11 electronic signatures</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Full-fidelity immutable activity logs</span>
                  </li>
                </ul>
              </div>

              {/* Feature 4 */}
              <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="size-12 rounded-xl bg-red-500/10 text-[#c30000] flex items-center justify-center mb-6">
                    <Video className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    HLS Streaming &amp; DRM Protection
                  </h3>
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Prevent content piracy with dynamic forensic watermarking, Widevine/FairPlay DRM encryption, and multi-bitrate HLS streaming that plays smoothly on any mobile device.
                  </p>
                </div>
                <ul className="mt-6 space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Dynamic user email forensic watermarks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Offline encrypted mobile caching</span>
                  </li>
                </ul>
              </div>

              {/* Feature 5 */}
              <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="size-12 rounded-xl bg-red-500/10 text-[#c30000] flex items-center justify-center mb-6">
                    <Zap className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Gamification &amp; Retention Engine
                  </h3>
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Boost completion rates from industry standard 15% to 85%+ with streak counters, XP leaderboards, unlockable badges, and interactive peer forums.
                  </p>
                </div>
                <ul className="mt-6 space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Configurable point and badge rules</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Cohort &amp; departmental leaderboards</span>
                  </li>
                </ul>
              </div>

              {/* Feature 6 */}
              <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="size-12 rounded-xl bg-red-500/10 text-[#c30000] flex items-center justify-center mb-6">
                    <Lock className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Enterprise SSO &amp; HRIS Sync
                  </h3>
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Single sign-on via SAML 2.0 / Okta / Azure AD with automatic SCIM user provisioning. Sync enrollments and completions directly to Workday, BambooHR, or Salesforce.
                  </p>
                </div>
                <ul className="mt-6 space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>SCIM 2.0 automated deprovisioning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Bi-directional HRIS webhooks</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== INDUSTRY USE CASES ===================== */}
        <section
          id="use-cases"
          className="w-full py-16 sm:py-24 border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c30000]">
                Proven Across Industries
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
                EdTech Architectures Built For Scale
              </h2>
              <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                From internal corporate workforces to consumer subscription academies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between">
                <div>
                  <span className="text-3xl mb-3 block">🏢</span>
                  <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                    Corporate Compliance &amp; Upskilling
                  </h3>
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Automate annual security, harassment, and compliance training with strict audit logging and direct Workday sync.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  98% Completion Guarantee
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between">
                <div>
                  <span className="text-3xl mb-3 block">🎓</span>
                  <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                    Universities &amp; Higher Education
                  </h3>
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Hybrid semester degree programs, automated plagiarism detection, proctored testing, and SIS student information integration.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-indigo-500 font-bold">
                  LTI 1.3 Advantage Ready
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between">
                <div>
                  <span className="text-3xl mb-3 block">🚀</span>
                  <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                    Commercial EdTech &amp; Bootcamps
                  </h3>
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Cohort-based academies with Stripe recurring billing, interactive coding terminals, and community breakout channels.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-red-500 font-bold">
                  Stripe Subscription Billing
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between">
                <div>
                  <span className="text-3xl mb-3 block">🤝</span>
                  <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                    Customer &amp; Partner Certification
                  </h3>
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Train and certify system integrators and customers on your SaaS platform to drive product adoption and reduce churn.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-amber-500 font-bold">
                  Verifiable Credential Badges
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== FAQ ACCORDION ===================== */}
        <section
          id="faq"
          className="w-full py-16 sm:py-24 border-b border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c30000]">
                Engineering FAQ
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
                Frequently Asked Questions
              </h2>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                Technical details on architecting, deploying, and maintaining your custom LMS.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => {
                const isOpen = expandedFaq === i;
                return (
                  <div
                    key={i}
                    className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/60 overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : i)}
                      className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer"
                    >
                      <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white pr-4">
                        {faq.q}
                      </span>
                      <div className="size-7 rounded-full bg-zinc-200/70 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-700 dark:text-zinc-300">
                        {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-200/60 dark:border-zinc-800/60 pt-4">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================== CALL TO ACTION SECTION ===================== */}
        <section
          id="lms-cta"
          className="w-full py-16 sm:py-20 bg-zinc-950 text-white relative overflow-hidden"
        >
          {/* Subtle Ambient Red Glow */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-red-600/20 blur-[130px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c30000]">
                Ready to Scale Your Learning Platform?
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-white uppercase leading-tight">
                Architect Your Custom LMS With Saras Dynamics
              </h2>
              <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed">
                Whether you need a bespoke corporate academy or an accredited degree portal, our engineers deliver secure, compliant, high-throughput systems on time and within budget.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <a
                href="#contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#c30000] hover:bg-[#a50000] text-white font-bold text-sm tracking-wide shadow-lg shadow-red-900/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Start LMS Project</span>
                <ArrowRight className="size-4" />
              </a>

              <a
                href="https://lms.sarasdynamics.com"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-white hover:bg-zinc-800 font-semibold text-sm transition-colors"
              >
                <GraduationCap className="size-4 text-[#c30000]" />
                <span>Visit Live Saras LMS</span>
                <ExternalLink className="size-3.5 text-zinc-400" />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Global Site Footer */}
      <SiteFooter />
    </div>
  );
}

export default LMSPage;
