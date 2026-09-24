import React from "react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { SiteFooter } from "@/components/ui/site-footer";
import StatsBento from "@/components/ui/stats-bento";
import CinematicHeroDemo from "@/components/ui/cinematic-hero-demo";

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

      {/* Cinematic Landing Hero Section */}
      <CinematicHeroDemo />

      {/* Stats Bento Section */}
      <StatsBento />

      {/* Global Site Footer */}
      <SiteFooter />
    </div>
  );
}

export default MobileDevelopmentPage;
