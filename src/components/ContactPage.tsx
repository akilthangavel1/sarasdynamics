import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, MapPin, Send, CheckCircle2, Clock, Sparkles } from "lucide-react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { FAQSection } from "@/components/ui/faqsection";
import { defaultFaqsLeft, defaultFaqsRight } from "@/components/ui/faq-demo";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/ui/site-footer";
import { Cta69 } from "@/components/ui/cta69";

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

      {/* Hero Section: Cta69 */}
      <Cta69
        badge={{ label: "Last word" }}
        heading="Let's make something worth keeping."
        button={{
          label: "Start the conversation",
          href: "#contact-form-section",
        }}
        labels={{
          marqueePhrase: "Worth keeping",
          note: "No decks, no detours: one room, your problem, and a studio that ships.",
          footnote: "Booking two new partners for the autumn cycle.",
        }}
        onButtonClick={scrollToContactForm}
      />

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20 items-start">
          {/* Contact Details Cards */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="p-6 rounded-2xl border border-zinc-200 bg-zinc-50/50 hover:bg-white transition-colors">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-200 flex items-center justify-center text-red-600 mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-1">Email Us Directly</h3>
              <p className="text-xs sm:text-sm text-zinc-500 mb-3">
                For partnerships, press inquiries, and design consultations.
              </p>
              <a
                href="mailto:contact@designali.in"
                className="text-sm font-semibold text-red-600 hover:text-red-700 underline underline-offset-4"
              >
                contact@designali.in
              </a>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-200 bg-zinc-50/50 hover:bg-white transition-colors">
              <div className="w-10 h-10 rounded-xl bg-zinc-900/10 border border-zinc-200 flex items-center justify-center text-zinc-900 mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-1">Response Time</h3>
              <p className="text-xs sm:text-sm text-zinc-500">
                We typically respond to all customer and agency inquiries within <strong className="text-zinc-800">2-4 business hours</strong>.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-200 bg-zinc-50/50 hover:bg-white transition-colors">
              <div className="w-10 h-10 rounded-xl bg-zinc-900/10 border border-zinc-200 flex items-center justify-center text-zinc-900 mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-1">Global Studio</h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                Operating internationally across remote hubs, crafting visual experiences for global brands.
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
                <h3 className="text-2xl font-bold text-zinc-900 mb-2">Message Received!</h3>
                <p className="text-sm text-zinc-500 max-w-md mb-6">
                  Thank you for reaching out, <strong className="text-zinc-800">{formData.name}</strong>. Our team will get back to you shortly at <strong className="text-zinc-800">{formData.email}</strong>.
                </p>
                <Button onClick={handleReset} variant="outline" className="rounded-full">
                  Send Another Message
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-2">
                  <h3 className="text-xl font-bold text-zinc-900">Send us a Message</h3>
                  <p className="text-xs sm:text-sm text-zinc-500">
                    Fill out the form below and we will get back to you promptly.
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
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                    Topic / Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all cursor-pointer"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Agency & Project Consultation">Agency & Project Consultation</option>
                    <option value="Licensing & Custom Assets">Licensing & Custom Assets</option>
                    <option value="Technical Support">Technical Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about your project or questions..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all resize-none"
                  ></textarea>
                </div>

                <Button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry</span>
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* The Requested Integrated FAQ Component */}
        <div id="faq-section" className="border-t border-zinc-200 pt-8">
          <FAQSection
            title="Platform & Product Support"
            subtitle="Frequently Asked Questions"
            description="Everything you need to know about how our platform works, from setup and customization to integrations and updates."
            buttonLabel="Browse All Knowledge Base →"
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
