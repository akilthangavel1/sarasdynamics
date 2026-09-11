import React, { useState } from "react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import WorldMapDemo from "@/components/ui/world-map-demo";
import { SiteFooter } from "@/components/ui/site-footer";
import { PixelHero } from "@/components/ui/pixel-perfect-hero";
import { CtaCard } from "@/components/ui/call-to-action-cta";
import { CheckCircle2 } from "lucide-react";

interface AboutPageProps {
  onBackToHome?: () => void;
}

export function AboutPage({ onBackToHome }: AboutPageProps) {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const handleSignUp = (email: string) => {
    setSubmittedEmail(email);
  };

  return (
    <div id="about-page" className="w-full min-h-screen bg-white flex flex-col selection:bg-zinc-900 selection:text-white">
      {/* Sticky Responsive Header Navigation */}
      <Navbar1Demo />

      {/* Replaced Hero Section with Pixel-Perfect Canvas Physics Hero */}
      <main className="w-full">
        <PixelHero
          word1="Silent"
          word2="Precision."
          description="Minimalist interfaces driven by refined motion. Every calculated detail delivers an elevated digital experience for ambitious teams."
          primaryCta="Work with us"
          primaryCtaMobile="Work"
          secondaryCta="Back to Home"
          secondaryCtaMobile="Home"
          onPrimaryClick={() => {
            const ctaSection = document.getElementById("about-cta-section");
            if (ctaSection) {
              ctaSection.scrollIntoView({ behavior: "smooth" });
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
      </main>

      {/* Global Remote Connectivity World Map Section */}
      <WorldMapDemo />

      {/* Call to Action Section */}
      <section id="about-cta-section" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <CtaCard
          theme="light"
          title="Let's build from here"
          description="Harnessed for productivity. Designed for collaboration. Celebrated for built-in security. Welcome to the platform developers love."
          buttonText="Sign up for GitHub"
          inputPlaceholder="Email address"
          imageSrc="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80"
          onButtonClick={handleSignUp}
        />

        {submittedEmail && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-sm text-emerald-800 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>
                Thank you for connecting with <strong>{submittedEmail}</strong>! Our engineering team will reach out shortly.
              </span>
            </div>
            <button
              onClick={() => setSubmittedEmail(null)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-medium underline underline-offset-2 ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </section>

      {/* Global Footer */}
      <SiteFooter />
    </div>
  );
}

export default AboutPage;
