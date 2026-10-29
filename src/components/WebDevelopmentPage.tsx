import React from "react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { SiteFooter } from "@/components/ui/site-footer";
import { EnhancedBackgroundPaths } from "@/components/ui/modern-background-paths";

import { FeaturesSectionWithCardGradient } from "@/components/ui/feature-section-with-card-gradient";
import LogoCloud04 from "@/components/ui/logo-cloud-04";
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
          titleLine1="WEB DEVELOPMENT"
          titleLine2="BUILT TO SCALE"
          subtitle="We engineer mission-critical web platforms, high-performance distributed systems, and intelligent digital interfaces with architectural precision and enterprise scalability."
          sidebarCategory="WEB ENGINEERING"
          sidebarFooter="SARAS DYNAMICS © 2026"
          ctaText="Contact Us"
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



      {/* Web Project Call to Action Section */}
      <Error404Demo />

      {/* Global Site Footer */}
      <SiteFooter />
    </div>
  );
}

export default WebDevelopmentPage;
