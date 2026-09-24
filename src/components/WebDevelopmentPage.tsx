import React from "react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { SiteFooter } from "@/components/ui/site-footer";
import { EnhancedBackgroundPaths } from "@/components/ui/modern-background-paths";

import { FeaturesSectionWithCardGradient } from "@/components/ui/feature-section-with-card-gradient";
import { RulerCarouselDemo } from "@/components/ui/ruler-carousel-demo";
import SqueezeCarouselDemo from "@/components/ui/carousel-squeeze-demo";

import Error404Demo from "@/components/ui/pixeleted-404-not-found-demo";

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

      {/* Enhanced Background Paths Hero Section */}
      <section
        id="web-hero"
        className="relative w-full border-b border-zinc-200/80 overflow-hidden"
      >
        <EnhancedBackgroundPaths
          titleLine1="GLOBAL MOBILE APP"
          titleLine2="AND WEB DESIGN"
          subtitle="We are an interdisciplinary design and development studio in Los Angeles, New York, and London creating transformative digital products and platforms for transformative startups and established global brands."
          sidebarCategory="BRANDING & DESIGN"
          sidebarFooter="STUDIO X © 2024"
          onBackToHome={onBackToHome}
        />
      </section>

      {/* Features With Card Gradient Section (Compliance & Core Capabilities) */}
      <FeaturesSectionWithCardGradient />

      {/* Squeeze Carousel Section */}
      <section className="w-full border-b border-zinc-200/80">
        <SqueezeCarouselDemo />
      </section>

      {/* Ruler Carousel Section */}
      <section className="w-full bg-white">
        <RulerCarouselDemo />
      </section>



      {/* Pixelated 404 Section */}
      <Error404Demo />

      {/* Global Site Footer */}
      <SiteFooter />
    </div>
  );
}

export default WebDevelopmentPage;
