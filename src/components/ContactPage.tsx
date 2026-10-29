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
  const scrollToContact = () => {
    document.getElementById("contact-globe-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToFaq = (e?: React.MouseEvent) => {
    e?.preventDefault();
    document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div id="contact-page-wrapper" className="w-full min-h-screen bg-white text-zinc-900 flex flex-col font-serif">
      {/* Sticky Responsive Header Navigation */}
      <Navbar1Demo />

      {/* Hero Section with Pixel-Perfect Canvas Physics */}
      <section id="contact-hero" className="w-full border-b border-zinc-200/80">
        <PixelHero
          word1="Get in"
          word2="Touch."
          description="Let's build something exceptional together. Reach out to discuss your AI, digital engineering, or systems architecture goals."
          primaryCta="Message Us"
          primaryCtaMobile="Message"
          secondaryCta="View FAQs"
          secondaryCtaMobile="FAQs"
          onPrimaryClick={scrollToContact}
          onSecondaryClick={scrollToFaq}
          githubUrl="#faq-section"
          marqueeLabel="Trusted by innovative ventures & enterprise clients"
          logosMode="clients"
        />
      </section>

      {/* Contact With Globe Section */}
      <section id="contact-globe-section" className="w-full border-b border-zinc-200/80">
        <ContactWithGlobe />
      </section>

      {/* FAQ Section */}
      <main id="faq-section" className="flex-1 w-full max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <Faq />
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}

export default ContactPage;
