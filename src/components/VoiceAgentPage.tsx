import React from "react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { SiteFooter } from "@/components/ui/site-footer";
import { ArrowRight } from "lucide-react";

interface VoiceAgentPageProps {
  onBackToHome?: () => void;
}

export function VoiceAgentPage({ onBackToHome }: VoiceAgentPageProps) {
  return (
    <div
      id="voice-agent-page-wrapper"
      className="w-full min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-serif selection:bg-zinc-900 selection:text-white transition-colors duration-300"
    >
      {/* Sticky Responsive Header Navigation */}
      <Navbar1Demo />

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1 w-full flex flex-col justify-center">
        {/* ===================== CALL TO ACTION SECTION ===================== */}
        <section
          id="voice-cta"
          className="w-full py-20 sm:py-28 md:py-36 bg-zinc-950 text-white relative overflow-hidden flex-1 flex items-center"
        >
          {/* Subtle Ambient Red Glow */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-red-600/20 blur-[130px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c30000]">
                Ready to Automate Telephony?
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-white uppercase leading-tight">
                Build Your Production Voice Agent with Saras Dynamics
              </h2>
              <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed">
                Schedule a technical discovery sprint. We will construct a prototype tailored to your API endpoints and telephony numbers within 5 business days.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <a
                href="https://calendar.app.google/4JkJc4kyNoDSfL699"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#c30000] hover:bg-[#a50000] text-white font-bold text-sm tracking-wide shadow-lg shadow-red-900/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Book Technical Discovery</span>
                <ArrowRight className="size-4" />
              </a>

              <a
                href="https://wa.me/919971999100"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-white hover:bg-zinc-800 font-semibold text-sm transition-colors"
              >
                <span>WhatsApp Us</span>
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

export default VoiceAgentPage;
