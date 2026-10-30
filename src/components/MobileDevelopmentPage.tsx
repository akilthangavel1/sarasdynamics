import React from "react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { SiteFooter } from "@/components/ui/site-footer";
import StatsBento from "@/components/ui/stats-bento";
import CinematicHeroDemo from "@/components/ui/cinematic-hero-demo";
import DownloadWithColumnLines from "@/components/ui/download-with-columnlines";

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

        {/* Cinematic Landing Hero Section */}
        <CinematicHeroDemo />

        {/* Stats Bento Section */}
        <StatsBento />
      </main>

      {/* Global Site Footer */}
      <SiteFooter />
    </div>
  );
}

export default MobileDevelopmentPage;
