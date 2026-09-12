import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, MapPin, Send, CheckCircle2, Clock, Sparkles } from "lucide-react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { FAQSection } from "@/components/ui/faqsection";
import { defaultFaqsLeft, defaultFaqsRight } from "@/components/ui/faq-demo";
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
    subject: "General Inquiry",
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
      subject: "General Inquiry",
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

      {/* Hero Section: Animated SVG Background with Contact Us CTA in White Theme */}
      <section id="contact-hero" className="relative w-full border-b border-zinc-200/80 overflow-hidden bg-white">
        <BackgroundLines
          className="h-[500px] md:h-[500px] py-6 flex flex-col justify-center items-center w-full bg-white dark:bg-white text-zinc-900"
          svgOptions={{
            duration: 14,
            colors: [
              "#e2e8f0",
              "#cbd5e1",
              "#e4e4e7",
              "#d4d4d8",
              "#94a3b8",
              "#a1a1aa",
              "#cbd5e1",
              "#e2e8f0",
              "#d4d4d8",
              "#e4e4e7",
              "#94a3b8",
              "#cbd5e1",
              "#e2e8f0",
              "#d4d4d8",
              "#cbd5e1",
              "#e4e4e7",
              "#94a3b8",
              "#d4d4d8",
              "#e2e8f0",
              "#cbd5e1",
              "#e4e4e7",
            ],
          }}
        >
          {/* Subtle soft white radial highlight for pristine text contrast */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0.45)_55%,rgba(255,255,255,0)_100%)] z-1" />

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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Direct Engineering Access</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-900 mb-4">
            Let's Build What Comes Next
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed">
            Have an ambitious software system, native mobile app, or custom enterprise AI project in mind? Connect directly with our lead architects and engineers.
          </p>
        </div>

        {/* Contact Grid: Form + Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20 items-start">
          {/* Contact Details Cards */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="p-6 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-300 shadow-2xs transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-1">Email Our Engineering Team</h3>
              <p className="text-xs sm:text-sm text-zinc-500 mb-3">
                For architectural evaluations, enterprise RFPs, and confidential project discussions.
              </p>
              <a
                href="mailto:partnerships@sarasdynamics.com"
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 underline underline-offset-4 transition-colors"
              >
                partnerships@sarasdynamics.com
              </a>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-300 shadow-2xs transition-all">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-1">Rapid Technical Triage</h3>
              <p className="text-xs sm:text-sm text-zinc-500">
                A senior solutions architect reviews all project briefs within <strong className="text-zinc-800">2-4 business hours</strong> with mutual NDA execution available upon request.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-300 shadow-2xs transition-all">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-1">Global Delivery Hubs</h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                Operating distributed engineering sprints across North America, Europe, and Asia-Pacific to ensure high-velocity, round-the-clock delivery cycles.
              </p>
            </div>
          </div>

          {/* Interactive Contact Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl border border-zinc-200 bg-white shadow-xs">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-2">Project Brief Received!</h3>
                <p className="text-sm text-zinc-500 max-w-md mb-6">
                  Thank you for contacting Saras Dynamics, <strong className="text-zinc-800">{formData.name}</strong>. Our engineering leads will review your inquiry and reach out to <strong className="text-zinc-800">{formData.email}</strong> shortly.
                </p>
                <Button onClick={handleReset} variant="outline" className="rounded-full">
                  Send Another Message
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-2">
                  <h3 className="text-xl font-bold text-zinc-900">Initiate a Technical Consultation</h3>
                  <p className="text-xs sm:text-sm text-zinc-500">
                    Tell us about your technical goals, platform requirements, and estimated timelines.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                    Engineering Focus Area
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all cursor-pointer"
                  >
                    <option value="Enterprise Web Applications">Enterprise Web Applications &amp; Cloud Platforms</option>
                    <option value="Mobile App Development">Mobile App Development (iOS, Android, Cross-Platform)</option>
                    <option value="AI & LLM Integration">Custom AI, Agentic Workflows &amp; RAG Systems</option>
                    <option value="Distributed Infrastructure">Cloud Architecture &amp; High-Throughput Microservices</option>
                    <option value="Dedicated Engineering Pod">Dedicated Senior Engineering Pod / Staff Augmentation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                    Project Scope &amp; Deliverables *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your project, target tech stack, timeline, or key technical challenges..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all resize-none"
                  ></textarea>
                </div>

                <Button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Project Brief</span>
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* The Requested Integrated FAQ Component */}
        <div id="faq-section" className="border-t border-zinc-200 pt-8">
          <FAQSection
            title="Engineering & Engagement FAQs"
            subtitle="Frequently Asked Questions"
            description="Clear answers regarding our engagement models, sprint rhythms, code ownership, IP protection, and technical delivery standards."
            buttonLabel="Explore Saras Dynamics Solutions →"
            onButtonClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            faqsLeft={defaultFaqsLeft}
            faqsRight={defaultFaqsRight}
          />
        </div>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}

export default ContactPage;
