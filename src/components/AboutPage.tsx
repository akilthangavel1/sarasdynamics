import React from "react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { SiteFooter } from "@/components/ui/site-footer";
import { PixelHero } from "@/components/ui/pixel-perfect-hero";
import Timeline from "@/components/ui/timeline-02";
import WorldMapDemo from "@/components/ui/world-map-demo";
import HeroSectionDemo from "@/components/ui/hero-section-9-demo";

interface AboutPageProps {
  onBackToHome?: () => void;
}

export function AboutPage({ onBackToHome }: AboutPageProps) {
  return (
    <div id="about-page" className="w-full min-h-screen bg-white flex flex-col selection:bg-zinc-900 selection:text-white">
      {/* Sticky Responsive Header Navigation */}
      <Navbar1Demo />

      {/* Hero Section with Pixel-Perfect Canvas Physics */}
      <main className="w-full">
        <PixelHero
          word1="Minds Behind"
          word2="The Machine"
          description="SarasDynamics builds software, AI systems and intelligent automation for people creating the next generation of technology."
          primaryCta="Work with us"
          primaryCtaMobile="Work"
          secondaryCta="Back to Home"
          secondaryCtaMobile="Home"
          onPrimaryClick={() => {
            const footerEl = document.querySelector("footer");
            if (footerEl) {
              footerEl.scrollIntoView({ behavior: "smooth" });
            }
          }}
          onSecondaryClick={(e) => {
            if (onBackToHome) {
              e.preventDefault();
              onBackToHome();
            }
          }}
          githubUrl="#home"
        />

        {/* Hero Section 9 - Below Hero */}
        <HeroSectionDemo />

        {/* Timeline Section */}
        <section className="py-24 bg-background overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
            <Timeline />
          </div>
        </section>
      </main>

      {/* Remote Connectivity World Map Section */}
      <WorldMapDemo />

      {/* Global Footer */}
      <SiteFooter />
    </div>
  );
}

export default AboutPage;
