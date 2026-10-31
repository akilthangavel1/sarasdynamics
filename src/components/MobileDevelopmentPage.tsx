import React from "react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { SiteFooter } from "@/components/ui/site-footer";
import StatsBento from "@/components/ui/stats-bento";
import DownloadWithColumnLines from "@/components/ui/download-with-columnlines";
import GridFeatureCardsDemo from "@/components/ui/grid-feature-cards-demo";
import Testimonial2 from "@/components/ui/testimonial-section-2";
import { Newsletter } from "@/components/ui/newsletter";

interface MobileDevelopmentPageProps {
  onBackToHome?: () => void;
}

export function MobileDevelopmentPage({ onBackToHome }: MobileDevelopmentPageProps) {
  return (
    <div
      id="mobile-development-page-wrapper"
      className="w-full min-h-screen bg-white text-zinc-900 flex flex-col selection:bg-zinc-900 selection:text-white"
    >
      {/* Sticky Responsive Header Navigation */}
      <Navbar1Demo />

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1 w-full flex flex-col">
        {/* Download With Column Lines Hero Section */}
        <section id="mobile-download-hero" className="w-full border-b border-zinc-200/80 dark:border-zinc-800">
          <DownloadWithColumnLines />
        </section>

        {/* Stats Bento Section */}
        <StatsBento />

        {/* Grid Feature Cards Section */}
        <GridFeatureCardsDemo />

        {/* Testimonials Section */}
        <Testimonial2 />

        {/* Newsletter Section */}
        <Newsletter
          variant="plain"
          className="w-full border-t border-zinc-200/80 bg-zinc-50/60 dark:bg-zinc-900/30 py-16 sm:py-20"
          containerClassName="w-full max-w-7xl px-4 sm:px-6 lg:px-8"
          title="Stay in the loop"
          description="Get product updates, tips and release notes in your inbox once a month."
          onSubscribe={async (email) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log("subscribed", email);
          }}
        />
      </main>

      {/* Global Site Footer */}
      <SiteFooter />
    </div>
  );
}

export default MobileDevelopmentPage;
