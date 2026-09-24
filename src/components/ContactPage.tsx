import React from "react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import ContactWithGlobe from "@/components/ui/contact-with-globe";
import Faq from "@/components/ui/faq-13";
import { SiteFooter } from "@/components/ui/site-footer";
import { Cta69 } from "@/components/ui/cta69";
import { BackgroundLines } from "@/components/ui/animated-svg-background";

interface ContactPageProps {
  onBackToHome?: () => void;
}

export function ContactPage({ onBackToHome }: ContactPageProps) {
  const scrollToContact = () => {
    document.getElementById("contact-globe-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div id="contact-page-wrapper" className="w-full min-h-screen bg-white text-zinc-900 flex flex-col">
      {/* Sticky Responsive Header Navigation */}
      <Navbar1Demo />

      {/* Hero Section: Animated SVG Background with Contact Us CTA */}
      <section id="contact-hero" className="relative w-full border-b border-zinc-200/80 overflow-hidden">
        <BackgroundLines
          className="h-[500px] md:h-[500px] py-6 flex flex-col justify-center items-center w-full bg-slate-50/40"
          svgOptions={{ duration: 14 }}
        >
          <div className="relative z-10 w-full">
            <Cta69
              className="bg-transparent py-4 md:py-8"
              badge={{ label: "Get in touch" }}
              heading="Let's make something worth keeping."
              button={{
                label: "Start the conversation",
                href: "#contact-globe-section",
              }}
              labels={{
                note: "No decks, no detours: one room, your problem, and a studio that ships.",
                footnote: "Booking two new partners for the autumn cycle.",
              }}
              onButtonClick={scrollToContact}
            />
          </div>
        </BackgroundLines>
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
