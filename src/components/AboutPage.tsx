import React from "react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { SiteFooter } from "@/components/ui/site-footer";
import { PixelHero } from "@/components/ui/pixel-perfect-hero";
import Timeline from "@/components/ui/timeline-02";
import TimelineBlock01 from "@/components/ui/timeline-01";
import MapDemo from "@/components/ui/map-demo";
import CtaCardDemo from "@/components/ui/call-to-action-cta-demo";

interface AboutPageProps {
  onBackToHome?: () => void;
}

export function AboutPage({ onBackToHome }: AboutPageProps) {
  return (
    <div id="about-page" className="w-full min-h-screen bg-white flex flex-col selection:bg-zinc-900 selection:text-white font-serif">
      {/* Sticky Responsive Header Navigation */}
      <Navbar1Demo />

      {/* Hero Section with Pixel-Perfect Canvas Physics */}
      <main className="w-full font-serif">
        <PixelHero
          word1="We Build the AI and Software"
          word2="That Runs Your Business Better"
          description="A senior engineering team in India delivering world-class AI and software for clients across time zones, at a fraction of local costs."
          primaryCta="Book a Discovery Call"
          primaryCtaMobile="Book Call"
          secondaryCta="What We Build"
          secondaryCtaMobile="What We Build"
          onPrimaryClick={() => {
            window.location.hash = "#contact";
          }}
          onSecondaryClick={(e) => {
            e.preventDefault();
            window.scrollBy({ top: 580, behavior: "smooth" });
          }}
          githubUrl="#timeline"
        />

        {/* Story of Growth Timeline - Below About Hero */}
        <TimelineBlock01 />

        {/* Timeline Section */}
        <section className="py-24 bg-background overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
            <Timeline />
          </div>
        </section>
      </main>

      {/* Global Network World Map Section */}
      <MapDemo />

      {/* Call to Action CTA Section */}
      <div className="w-full">
        <CtaCardDemo />
      </div>

      {/* Global Footer */}
      <SiteFooter />
    </div>
  );
}

export default AboutPage;
