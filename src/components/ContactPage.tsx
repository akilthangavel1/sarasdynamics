import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Mail, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  Lock, 
  ArrowRight,
  Terminal,
  Cpu,
  Layers,
  Smartphone,
  Server
} from "lucide-react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { FAQSection } from "@/components/ui/faqsection";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/ui/site-footer";
import { Cta69 } from "@/components/ui/cta69";
import { BackgroundLines } from "@/components/ui/animated-svg-background";

interface ContactPageProps {
  onBackToHome?: () => void;
}

const PROJECT_CATEGORIES = [
  { id: "ai-systems", label: "AI & RAG Systems", icon: Cpu },
  { id: "web-apps", label: "Web Architecture", icon: Layers },
  { id: "mobile-apps", label: "Mobile iOS / Android", icon: Smartphone },
  { id: "cloud-devops", label: "Cloud & Distributed Backend", icon: Server },
  { id: "full-stack", label: "End-to-End Product", icon: Terminal },
];

const BUDGET_TIERS = [
  "$10k - $25k",
  "$25k - $50k",
  "$50k - $100k",
  "$100k+"
];

const SARAS_FAQS_LEFT = [
  {
    id: "item-1",
    question: "How quickly can Saras Dynamics kick off a new engineering sprint?",
    answer:
      "Following our initial 30-minute technical discovery and mutual NDA execution, we deliver an architecture proposal within 48 hours. Active engineering sprints typically commence within 5 to 7 business days.",
  },
  {
    id: "item-2",
    question: "Who owns the code, intellectual property, and models developed?",
    answer:
      "You retain 100% full intellectual property ownership from day one. All Git repositories, cloud infrastructure definitions, fine-tuned weights, and design tokens belong solely to your organization.",
  },
  {
    id: "item-3",
    question: "Do you integrate with our existing team or work autonomously?",
    answer:
      "We support both models: our senior engineers can seamlessly embed into your existing GitHub/Slack workflows and daily standups, or operate as an autonomous vertical pod delivering turnkey production milestones.",
  },
];

const SARAS_FAQS_RIGHT = [
  {
    id: "item-4",
    question: "What is your standard deployment cadence and observability setup?",
    answer:
      "We ship working preview environments on every Git push with automated CI/CD canary deployments. Every production system includes APM tracing, structured logging, and automated metric dashboards.",
  },
  {
    id: "item-5",
    question: "Can you sign a mutual Non-Disclosure Agreement (NDA) before we share data?",
    answer:
      "Yes, absolutely. We execute mutual NDAs as standard operating procedure prior to receiving any proprietary system diagrams, data schemas, or codebases.",
  },
  {
    id: "item-6",
    question: "What technical stacks and frameworks does Saras Dynamics specialize in?",
    answer:
      "We specialize in TypeScript, React, Next.js, Node.js, Python, Swift (iOS), Kotlin (Android), Flutter, PostgreSQL, Redis, Kubernetes, Docker, and enterprise cloud infrastructure across AWS and Google Cloud.",
  },
];

export function ContactPage({ onBackToHome }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    category: "ai-systems",
    budget: "$25k - $50k",
    timeline: "1-3 months",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      company: "",
      category: "ai-systems",
      budget: "$25k - $50k",
      timeline: "1-3 months",
      message: "",
    });
    setIsSubmitted(false);
  };

  const scrollToContactForm = () => {
    document.getElementById("contact-form-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div id="contact-page-wrapper" className="w-full min-h-screen bg-white text-zinc-900 flex flex-col">
      {/* Sticky Responsive Header Navigation */}
      <Navbar1Demo />

      {/* Hero Section: Animated SVG Background with Contact Us CTA */}
      <section id="contact-hero" className="relative w-full border-b border-zinc-200/80 overflow-hidden">
        <BackgroundLines
          className="h-[500px] md:h-[500px] py-6 flex flex-col justify-center items-center w-full bg-slate-50/40"
          svgOptions={{ duration: 14 }}
        >
          <div className="relative z-10 w-full">
            <Cta69
              className="bg-transparent py-4 md:py-8"
              badge={{ label: "Get in touch" }}
              heading="Let's make something worth keeping."
              button={{
                label: "Start the conversation",
                href: "#contact-form-section",
              }}
              labels={{
                note: "No decks, no detours: one room, your problem, and a studio that ships.",
                footnote: "Booking two new partners for the autumn cycle.",
              }}
              onButtonClick={scrollToContactForm}
            />
          </div>
        </BackgroundLines>
      </section>

      {/* Contact Form and Details Section */}
      <main id="contact-form-section" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>DIRECT SENIOR ENGINEERING PARTNERSHIP</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-4">
            Architect Your Next System
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Discuss your technical roadmap, RAG architecture, or mobile application with our principal engineers. No sales reps, only direct technical dialogue.
          </p>
        </div>

        {/* Contact Grid: Direct Info Hub + Architecture Evaluation Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-24 items-start">
          {/* Left Column: Direct Info Hub & Trust Signals */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Direct Email Card */}
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center mb-4 shadow-xs">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
                Direct Engineering Mailbox
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                Send us project specs, RFCs, or request technical availability directly:
              </p>
              <a
                href="mailto:hello@sarasdynamics.com"
                className="text-base font-bold text-zinc-900 dark:text-white hover:underline underline-offset-4 tracking-tight flex items-center gap-1.5"
              >
                <span>hello@sarasdynamics.com</span>
                <ArrowRight className="w-4 h-4 text-emerald-500" />
              </a>
            </div>

            {/* SLA Response Guarantee Card */}
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/60 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Sprints Open
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
                Fast Technical Evaluation
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Initial technical replies delivered within <strong className="text-zinc-800 dark:text-zinc-200">2 to 4 business hours</strong> by a principal software architect.
              </p>
            </div>

            {/* Global Remote Engineering HQ */}
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
                Global Engineering Hub
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Distributed technical operations supporting partners across North America (PST/EST), Europe (GMT/CET), and Asia-Pacific time zones.
              </p>
            </div>

            {/* Security & Mutual NDA Assurance Banner */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-start gap-3.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  Enterprise Confidentiality
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  We gladly sign a bilateral mutual NDA before exchanging proprietary code, architecture topology, or datasets.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Architecture Evaluation Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-14 flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mb-3">
                  Technical Brief Received
                </h3>
                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-md mb-8 leading-relaxed">
                  Thank you, <strong className="text-zinc-900 dark:text-white">{formData.name}</strong>. A Saras Dynamics principal engineer is reviewing your brief for <strong className="text-zinc-900 dark:text-white">{formData.company || "your project"}</strong> and will follow up at <strong className="text-zinc-900 dark:text-white">{formData.email}</strong> within 2-4 business hours.
                </p>
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 dark:text-zinc-400 mb-8 max-w-md text-left flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>Your submission is encrypted and safeguarded under our strict internal confidentiality policy.</span>
                </div>
                <Button onClick={handleReset} variant="outline" className="rounded-xl px-6">
                  Submit Another Project Brief
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mb-1">
                    Project &amp; Architecture Brief
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                    Share your requirements to receive a structured technical breakdown and roadmap.
                  </p>
                </div>

                {/* Project Category Selection Chips */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Primary Domain / Architecture *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PROJECT_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = formData.category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat.id })}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                            isSelected
                              ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 shadow-xs"
                              : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name & Work Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Alex Mercer"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/40 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/40 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                    />
                  </div>
                </div>

                {/* Company & Timeline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      placeholder="Acme Technologies Inc."
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/40 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Desired Timeline
                    </label>
                    <select
                      value={formData.timeline}
                      onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/40 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all cursor-pointer"
                    >
                      <option value="Urgent (under 4 weeks)">Urgent (under 4 weeks)</option>
                      <option value="1-3 months">Standard (1-3 months)</option>
                      <option value="3-6 months">Comprehensive (3-6 months)</option>
                      <option value="Ongoing Retainer">Ongoing Senior Retainer</option>
                    </select>
                  </div>
                </div>

                {/* Estimated Budget Range */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Estimated Project Budget
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {BUDGET_TIERS.map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setFormData({ ...formData, budget: tier })}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          formData.budget === tier
                            ? "border-zinc-900 bg-zinc-100 text-zinc-900 dark:border-white dark:bg-zinc-800 dark:text-white shadow-2xs"
                            : "border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600"
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Project Details */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Project Details &amp; Technical Scope *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe what you are looking to build or optimize (e.g., migrating to Kubernetes, building an agentic RAG pipeline, shipping an offline-first iOS/Android app)..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/40 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all resize-none"
                  ></textarea>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Includes 30-min discovery call &amp; written roadmap</span>
                  </div>

                  <Button
                    type="submit"
                    className="px-8 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Project Brief</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* The Requested Integrated FAQ Component */}
        <div id="faq-section" className="border-t border-zinc-200 dark:border-zinc-800 pt-16">
          <FAQSection
            title="Partnership & Engineering FAQ"
            subtitle="Frequently Asked Questions"
            description="Clear answers regarding our development process, intellectual property rights, security audits, and deployment cadences."
            buttonLabel="Schedule Technical Call →"
            onButtonClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            faqsLeft={SARAS_FAQS_LEFT}
            faqsRight={SARAS_FAQS_RIGHT}
          />
        </div>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}

export default ContactPage;
