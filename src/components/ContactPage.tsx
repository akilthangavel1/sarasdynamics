import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  ShieldCheck,
  Building2,
  Copy,
  Check,
  Globe,
  MessageSquare,
  Loader2,
  ChevronRight,
} from "lucide-react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import Faq from "@/components/ui/faq-13";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/ui/site-footer";
import { Cta69 } from "@/components/ui/cta69";
import { BackgroundLines } from "@/components/ui/animated-svg-background";

interface ContactPageProps {
  onBackToHome?: () => void;
}

export function ContactPage({ onBackToHome }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    timeline: "Immediate Deployment (< 30 days)",
    subject: "Enterprise AI & Agentic Systems",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [submissionId, setSubmissionId] = useState("SD-8392");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setSubmissionId(`SD-${Math.floor(1000 + Math.random() * 9000)}`);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 500);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      company: "",
      timeline: "Immediate Deployment (< 30 days)",
      subject: "Enterprise AI & Agentic Systems",
      message: "",
    });
    setIsSubmitted(false);
    setIsSubmitting(false);
  };

  const handleCopyEmail = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("contact@sarasdynamics.com");
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
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
      <main id="contact-form-section" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>We are here to help</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-900 mb-4">
            Get in Touch with Us
          </h2>
          <p className="text-base sm:text-lg text-zinc-500 leading-relaxed">
            Have questions about our designs, licensing, or custom agency collaborations?
            Reach out directly or explore answers to common questions below.
          </p>
        </div>

        {/* Contact Grid: Form + Info Cards */}
        <div id="contact-interaction-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20 items-start">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Direct Triage Card (High-contrast dark card) */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-7 text-white shadow-lg relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-red-600/15 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between gap-2 mb-5">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-xs font-medium text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Systems Online · Direct Triage
                </span>
                <span className="text-[11px] text-zinc-400 font-mono tracking-wider">SLA: &lt; 2 hrs</span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Direct Channels</h3>
              <p className="text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed">
                Connect directly with our solutions team and principal architects for rapid project evaluations.
              </p>

              <div className="space-y-4">
                {/* Email item with 1-click copy */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Primary Inbox</p>
                      <a
                        href="mailto:contact@sarasdynamics.com"
                        className="text-xs sm:text-sm font-semibold text-zinc-100 hover:text-white truncate block transition-colors"
                      >
                        contact@sarasdynamics.com
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="shrink-0 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Copy email to clipboard"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 text-xs hidden sm:inline">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-xs hidden sm:inline">Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Phone / Hotline item */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Advisory Hotline</p>
                      <a
                        href="tel:+14158907272"
                        className="text-xs sm:text-sm font-semibold text-zinc-100 hover:text-white truncate block transition-colors"
                      >
                        +1 (415) 890-7272
                      </a>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-zinc-400 bg-zinc-800/80 px-2 py-1 rounded-md">
                    Mon-Fri PST
                  </span>
                </div>
              </div>
            </div>

            {/* Office Locations Card */}
            <div className="p-6 rounded-3xl border border-zinc-200/80 bg-zinc-50/70 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-900/10 border border-zinc-200 flex items-center justify-center text-zinc-900">
                  <MapPin className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Office Locations</h3>
                  <p className="text-xs text-zinc-500">Physical engineering centers &amp; labs</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Coimbatore Location */}
                <div className="p-3.5 rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">📍</span>
                      <h4 className="text-sm font-bold text-zinc-900">Coimbatore</h4>
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-full">
                      Tamil Nadu
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed pl-6">
                    24, Avinashi Road, Peelamedu,<br />
                    Coimbatore, Tamil Nadu – 641004
                  </p>
                </div>

                {/* Bangalore Location */}
                <div className="p-3.5 rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">📍</span>
                      <h4 className="text-sm font-bold text-zinc-900">Bangalore</h4>
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-full">
                      Karnataka
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed pl-6">
                    18, 5th Cross, Indiranagar,<br />
                    Bengaluru, Karnataka – 560038
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Project Inquiry Form Column */}
          <div className="lg:col-span-7 p-6 sm:p-8 md:p-9 rounded-3xl border border-zinc-200/90 bg-white shadow-sm">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-5 shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-xs font-mono font-bold text-emerald-800 mb-3">
                  Inquiry Reference #{submissionId}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-2">Inquiry Successfully Transmitted</h3>
                <p className="text-sm text-zinc-600 max-w-lg mb-8 leading-relaxed">
                  Thank you, <strong className="text-zinc-900">{formData.name}</strong>. A Principal Systems Architect from Saras Dynamics has received your brief. We will review and respond to <strong className="text-zinc-900">{formData.email}</strong> within 2-4 business hours.
                </p>

                {/* Milestone Next Steps */}
                <div className="w-full max-w-md bg-zinc-50 rounded-2xl border border-zinc-200 p-4 mb-8 text-left text-xs space-y-2.5">
                  <div className="flex items-center gap-2.5 text-zinc-700">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]">1</span>
                    <span>Automated intake receipt sent to your email</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-700">
                    <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-[10px]">2</span>
                    <span>Engineering team conducts technical feasibility review</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-700">
                    <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-[10px]">3</span>
                    <span>Introductory 30-min technical roadmap consultation scheduled</span>
                  </div>
                </div>

                <Button onClick={handleReset} variant="outline" className="rounded-xl px-6 py-2.5 cursor-pointer font-medium">
                  Submit Another Project Brief
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700 mb-2.5">
                    <MessageSquare className="w-3.5 h-3.5 text-red-600" />
                    <span>Project Intake & Consultation</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
                    Initiate a Project Discussion
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                    Fill out your contact details and project requirements below. We will reply promptly with an architect&apos;s evaluation.
                  </p>
                </div>

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Elena Rostova"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white focus:bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/15 focus:border-zinc-900 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="elena@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white focus:bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/15 focus:border-zinc-900 transition-all"
                    />
                  </div>
                </div>

                {/* Project Message / Requirements */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
                      Project Overview &amp; Objectives <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-zinc-400">Technical briefs welcome</span>
                  </div>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell us about your technical goals, target scale, tech stack preferences, or current architectural bottlenecks..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white focus:bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/15 focus:border-zinc-900 transition-all resize-none"
                  ></textarea>
                </div>

                {/* Submit & Guarantee */}
                <div className="space-y-3 pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-[0.99] text-white font-semibold flex items-center justify-center gap-2.5 cursor-pointer shadow-xs transition-all disabled:opacity-75"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                        <span>Transmitting Brief...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Project Brief</span>
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 text-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>256-bit encrypted · Strict privacy · Direct review by Principal Engineers</span>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* The Requested Integrated FAQ Component */}
        <div id="faq-section" className="border-t border-zinc-200 py-16 px-4 sm:px-6 lg:px-8">
          <Faq />
        </div>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}

export default ContactPage;
