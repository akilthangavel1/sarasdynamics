import React from "react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { PixelHero } from "@/components/ui/pixel-perfect-hero";
import ContactWithGlobe from "@/components/ui/contact-with-globe";
import Faq from "@/components/ui/faq-13";
import { SiteFooter } from "@/components/ui/site-footer";

interface ContactPageProps {
  onBackToHome?: () => void;
}

export function ContactPage({ onBackToHome }: ContactPageProps) {
  const scrollToContact = (e?: React.MouseEvent) => {
    e?.preventDefault();
    document.getElementById("contact-globe-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBookCall = () => {
    window.open(
      "https://wa.me/919971999100?text=Hi%20Saras%20Dynamics%2C%20I'd%20like%20to%20book%20a%2030-minute%20call%20regarding%20a%20project.",
      "_blank"
    );
  };

  return (
    <div id="contact-page-wrapper" className="w-full min-h-screen bg-white text-zinc-900 flex flex-col font-serif">
      {/* Sticky Responsive Header Navigation */}
      <Navbar1Demo />

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1 w-full flex flex-col">
        {/* Hero Section with Pixel-Perfect Canvas Physics */}
        <section id="contact-hero" className="w-full border-b border-zinc-200/80">
          <PixelHero
            title="Your engineering partner, wherever you are."
            word1="Your engineering partner,"
            word2="wherever you are."
            description="We work with teams across the US, UK, Europe and the Middle East, with overlap hours that suit your time zone. Tell us about your project, and we’ll reply within one business day."
            primaryCta="Book a 30-min call"
            primaryCtaMobile="Book a 30-min call"
            primaryHref="https://wa.me/919971999100?text=Hi%20Saras%20Dynamics%2C%20I'd%20like%20to%20book%20a%2030-minute%20call%20regarding%20a%20project."
            onPrimaryClick={handleBookCall}
            secondaryCta="Send a message"
            secondaryCtaMobile="Send a message"
            githubUrl="#contact-globe-section"
            onSecondaryClick={scrollToContact}
            marqueeLabel="Trusted by innovative ventures & enterprise clients"
            logosMode="clients"
          />
        </section>

        {/* Contact With Globe Section */}
        <section id="contact-globe-section" className="w-full border-b border-zinc-200/80">
          <ContactWithGlobe
            title="Start a conversation"
            description="Share a few details and we’ll come back with honest feedback on your idea, a rough approach, and next steps. There’s no obligation and no hard sell."
          />
        </section>

        {/* FAQ Section */}
        <section id="faq-section" className="w-full max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <Faq />
        </section>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}

export default ContactPage;
