import React from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, CheckCircle2, Award, Users2, Globe2 } from "lucide-react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import WorldMapDemo from "@/components/ui/world-map-demo";
import { SiteFooter } from "@/components/ui/site-footer";

interface AboutPageProps {
  onBackToHome?: () => void;
}

export function AboutPage({ onBackToHome }: AboutPageProps) {
  return (
    <div id="about-page" className="w-full min-h-screen bg-white flex flex-col selection:bg-zinc-900 selection:text-white">
      {/* Sticky Responsive Header Navigation */}
      <Navbar1Demo />

      {/* Simple, Elegant Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 flex flex-col justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto text-center flex flex-col items-center gap-8"
        >
          {/* Subtle Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-200/80 bg-zinc-50 text-xs font-semibold text-zinc-700 tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
            <span>ABOUT OUR STUDIO</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.03em] uppercase text-zinc-950 leading-[1.08]">
            Designing Digital Experiences That Matter.
          </h1>

          {/* Subtitle & Story */}
          <p className="text-base sm:text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed font-normal">
            We are an independent design and engineering studio partnering with ambitious founders and global teams to craft intuitive, user-centered digital products and scalable design systems.
          </p>

          {/* Quick Metrics / Highlights */}
          <div className="w-full pt-8 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 border-t border-zinc-200/90 mt-4">
            <div className="flex flex-col items-center text-center">
              <span className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-950 tracking-tight">
                9+
              </span>
              <span className="text-xs sm:text-sm font-medium text-zinc-500 mt-1">
                Years of Craft
              </span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-950 tracking-tight">
                120+
              </span>
              <span className="text-xs sm:text-sm font-medium text-zinc-500 mt-1">
                Products Shipped
              </span>
            </div>
            <div className="flex flex-col items-center text-center col-span-2 sm:col-span-1">
              <span className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-950 tracking-tight">
                99.4%
              </span>
              <span className="text-xs sm:text-sm font-medium text-zinc-500 mt-1">
                Client Satisfaction
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-950 text-white font-semibold text-sm hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
            >
              <span>Work with us</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#home"
              onClick={(e) => {
                if (onBackToHome) {
                  e.preventDefault();
                  onBackToHome();
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-200 text-zinc-800 font-semibold text-sm hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <span>Back to Home</span>
            </a>
          </div>
        </motion.div>
      </main>

      {/* Global Remote Connectivity World Map Section */}
      <WorldMapDemo />

      {/* Global Footer */}
      <SiteFooter />
    </div>
  );
}

export default AboutPage;
