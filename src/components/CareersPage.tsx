import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Briefcase,
  ArrowRight,
  MapPin,
  Clock,
  CheckCircle2,
  Sparkles,
  Laptop,
  Heart,
  Globe2,
  ChevronRight,
  Send,
} from "lucide-react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { SiteFooter } from "@/components/ui/site-footer";

interface CareersPageProps {
  onBackToHome?: () => void;
}

interface JobPosition {
  id: string;
  title: string;
  department: "Engineering" | "Design" | "Product" | "Operations";
  location: string;
  type: string;
  experience: string;
  description: string;
}

const OPEN_POSITIONS: JobPosition[] = [
  {
    id: "eng-1",
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    location: "Remote (Global)",
    type: "Full-time",
    experience: "5+ years",
    description: "Architect high-performance web applications using TypeScript, React, Node.js, and modern cloud infrastructure.",
  },
  {
    id: "des-1",
    title: "Lead Product & Interaction Designer",
    department: "Design",
    location: "Remote / San Francisco",
    type: "Full-time",
    experience: "4+ years",
    description: "Shape minimalist visual languages, design systems, fluid micro-interactions, and high-fidelity prototype flows.",
  },
  {
    id: "eng-2",
    title: "Frontend Systems & Animation Specialist",
    department: "Engineering",
    location: "Remote (Global)",
    type: "Full-time",
    experience: "3+ years",
    description: "Craft pixel-precise canvases, GPU-accelerated motion interfaces, and smooth component library foundations.",
  },
  {
    id: "prod-1",
    title: "Technical Product Manager",
    department: "Product",
    location: "Remote / New York",
    type: "Full-time",
    experience: "4+ years",
    description: "Partner with founders and engineering leaders to translate ambitious product visions into clean, ship-ready roadmaps.",
  },
];

const PERKS = [
  {
    icon: Globe2,
    title: "Work From Anywhere",
    desc: "100% remote-first culture across global time zones.",
  },
  {
    icon: Laptop,
    title: "Top-Tier Hardware",
    desc: "Modern MacBook Pro or workstation setup with a home office budget.",
  },
  {
    icon: Heart,
    title: "Comprehensive Wellness",
    desc: "Premium health coverage, mental wellness stipend, and unlimited PTO.",
  },
  {
    icon: Sparkles,
    title: "Growth & Learning",
    desc: "Generous annual stipends for conferences, courses, and craft books.",
  },
];

export function CareersPage({ onBackToHome }: CareersPageProps) {
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [appliedRole, setAppliedRole] = useState<JobPosition | null>(null);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantNote, setApplicantNote] = useState("");

  const filteredPositions =
    selectedDept === "All"
      ? OPEN_POSITIONS
      : OPEN_POSITIONS.filter((p) => p.department === selectedDept);

  const scrollToOpenings = () => {
    document.getElementById("open-positions")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantEmail) return;
    setApplicationSubmitted(true);
  };

  const resetModal = () => {
    setAppliedRole(null);
    setApplicationSubmitted(false);
    setApplicantName("");
    setApplicantEmail("");
    setApplicantNote("");
  };

  return (
    <div id="careers-page-wrapper" className="w-full min-h-screen bg-white text-zinc-900 flex flex-col selection:bg-zinc-900 selection:text-white">
      {/* Sticky Responsive Header Navigation */}
      <Navbar1Demo />

      {/* Simple, Polished Hero Section */}
      <section
        id="careers-hero"
        className="relative w-full border-b border-zinc-200/80 bg-zinc-50/50 py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>We&apos;re Hiring &bull; Join the Studio</span>
          </motion.div>

          {/* Simple Hero Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.08] text-balance"
          >
            Build thoughtful digital products with us.
          </motion.h1>

          {/* Simple Supportive Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 text-base sm:text-lg md:text-xl text-zinc-600 max-w-2xl text-balance font-normal leading-relaxed"
          >
            We are a tight-knit collective of engineers, designers, and creators crafting minimalist software and precision web experiences.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
          >
            <button
              onClick={scrollToOpenings}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer active:scale-98"
            >
              <Briefcase className="size-4" />
              <span>View Open Roles</span>
              <ArrowRight className="size-4 ml-0.5" />
            </button>

            <button
              onClick={onBackToHome}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-700 text-sm font-medium hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer active:scale-98"
            >
              <span>Back to Home</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Perks / Culture Section */}
      <section className="w-full py-12 md:py-16 border-b border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PERKS.map((perk, idx) => {
              const Icon = perk.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 transition-all hover:border-zinc-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 mb-4 shadow-xs">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900">{perk.title}</h3>
                  <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{perk.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section id="open-positions" className="w-full py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                Current Openings
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mt-1">
                Find your place at the studio
              </h2>
            </div>

            {/* Department Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {["All", "Engineering", "Design", "Product"].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    selectedDept === dept
                      ? "bg-zinc-900 text-white shadow-xs"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Positions List */}
          <div className="space-y-4">
            {filteredPositions.map((position) => (
              <div
                key={position.id}
                className="group p-6 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-xs font-medium">
                      {position.department}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <MapPin className="size-3.5" />
                      {position.location}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <Clock className="size-3.5" />
                      {position.type}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors">
                    {position.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                    {position.description}
                  </p>
                </div>

                <div className="shrink-0 flex items-center">
                  <button
                    onClick={() => {
                      setAppliedRole(position);
                      setApplicationSubmitted(false);
                    }}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <span>Apply Now</span>
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {filteredPositions.length === 0 && (
              <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 text-zinc-500">
                No open positions currently listed in this category. Check back soon!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Application Modal */}
      {appliedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-zinc-200">
            {applicationSubmitted ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="size-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">Application Received</h3>
                <p className="mt-2 text-sm text-zinc-600 max-w-sm mx-auto">
                  Thank you, <span className="font-semibold">{applicantName}</span>! Our team will review your application for the{" "}
                  <span className="font-semibold">{appliedRole.title}</span> role and reach out to {applicantEmail}.
                </p>
                <button
                  onClick={resetModal}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-5">
                  <div>
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                      Apply for Position
                    </span>
                    <h3 className="text-lg font-bold text-zinc-900">{appliedRole.title}</h3>
                  </div>
                  <button
                    onClick={resetModal}
                    className="text-zinc-400 hover:text-zinc-600 text-sm font-semibold p-1 cursor-pointer"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleApplySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Portfolio / LinkedIn / GitHub URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://github.com/janedoe"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Brief Note or Introduction
                    </label>
                    <textarea
                      rows={3}
                      value={applicantNote}
                      onChange={(e) => setApplicantNote(e.target.value)}
                      placeholder="Tell us about your background, projects, or why you want to work together..."
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={resetModal}
                      className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <Send className="size-3.5" />
                      <span>Submit Application</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Footer */}
      <SiteFooter />
    </div>
  );
}

export default CareersPage;
