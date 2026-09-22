import React from "react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { SiteFooter } from "@/components/ui/site-footer";
import { EnhancedBackgroundPaths } from "@/components/ui/modern-background-paths";
import HowItWorks09 from "@/components/ui/how-it-works-09";
import { FeaturesSectionWithCardGradient } from "@/components/ui/feature-section-with-card-gradient";
import SqueezeCarouselDemo from "@/components/ui/carousel-squeeze-demo";
import AnimatedTestimonialsBasic from "@/components/ui/animated-testimonials-demo";
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
          title="Web Development"
          subtitle="Saras Dynamics architects high-performance web applications, resilient cloud backends, and responsive design systems with React, TypeScript, and modern distributed architecture."
          badge="Full-Stack Web Engineering • Saras Dynamics"
        />
      </section>

      {/* How It Works Section */}
      <HowItWorks09 />

      {/* Features With Card Gradient Section */}
      <FeaturesSectionWithCardGradient />

      {/* Squeeze Carousel Section */}
      <section className="w-full border-b border-zinc-200/80">
        <SqueezeCarouselDemo />
      </section>

      {/* Animated Testimonials Section */}
      <AnimatedTestimonialsBasic />

      {/* Pixelated 404 Section */}
      <Error404Demo />

      {/* Global Site Footer */}
      <SiteFooter />
    </div>
  );
}

export default WebDevelopmentPage;
