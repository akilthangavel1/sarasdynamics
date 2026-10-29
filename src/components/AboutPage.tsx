import React from "react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { SiteFooter } from "@/components/ui/site-footer";
import AboutSection3 from "@/components/ui/about-section";
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

      <main className="w-full font-serif">
        {/* Hero Section */}
        <section id="about-hero" className="w-full border-b border-zinc-200/80">
          <AboutSection3 />
        </section>

        {/* Story of Growth Timeline */}
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
