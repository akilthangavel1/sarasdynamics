import React from "react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { SiteFooter } from "@/components/ui/site-footer";
import { EnhancedBackgroundPaths } from "@/components/ui/modern-background-paths";

import { FeaturesSectionWithCardGradient } from "@/components/ui/feature-section-with-card-gradient";
import LogoCloud04 from "@/components/ui/logo-cloud-04";
import { RulerCarouselDemo } from "@/components/ui/ruler-carousel-demo";
import SqueezeCarouselDemo from "@/components/ui/carousel-squeeze-demo";
import CTASection1 from "@/components/ui/cta-1";

interface WebDevelopmentPageProps {
  onBackToHome?: () => void;
}

export function WebDevelopmentPage({ onBackToHome }: WebDevelopmentPageProps) {
  return (
    <div
      id="web-development-page-wrapper"
      className="w-full min-h-screen bg-white text-zinc-900 flex flex-col selection:bg-zinc-900 selection:text-white"
    >
      {/* Sticky Responsive Header Navigation */}
      <Navbar1Demo />

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1 w-full flex flex-col">
        {/* Enhanced Background Paths Hero Section */}
        <section
          id="web-hero"
          className="relative w-full border-b border-zinc-200/80 overflow-hidden"
        >
          <EnhancedBackgroundPaths
            titleLine1="WEB DEVELOPMENT"
            titleLine2="BUILT TO SCALE"
            subtitle="We build fast, modern websites and web applications that look great, work flawlessly on every device, and grow with your business, from first launch to thousands of users."
            sidebarCategory="WEB ENGINEERING"
            sidebarFooter="SARAS DYNAMICS © 2026"
            ctaText="Start Your Project"
            onCtaClick={() => {
              window.location.hash = "#contact";
            }}
            onBackToHome={onBackToHome}
          />
        </section>

        {/* Web Services & Capabilities Section */}
        <FeaturesSectionWithCardGradient />

        {/* Our Engineering Process Section */}
        <LogoCloud04 />

        {/* Squeeze Carousel Section */}
        <section className="w-full border-b border-zinc-200/80">
          <SqueezeCarouselDemo />
        </section>

        {/* Ruler Carousel Section */}
        <section className="w-full bg-white">
          <RulerCarouselDemo />
        </section>

        {/* CTA 1 Section Above Footer */}
        <CTASection1 />
      </main>

      {/* Global Site Footer */}
      <SiteFooter />
    </div>
  );
}

export default WebDevelopmentPage;
