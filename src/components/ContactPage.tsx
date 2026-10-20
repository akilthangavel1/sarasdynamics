import React from "react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import ContactWithGlobe from "@/components/ui/contact-with-globe";
import Faq from "@/components/ui/faq-13";
import { SiteFooter } from "@/components/ui/site-footer";
import AboutSectionDemo from "@/components/ui/about-section-demo";

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

      {/* Hero Section: About Section with Timeline Animations */}
      <section id="contact-hero" className="relative w-full border-b border-zinc-200/80 overflow-hidden">
        <AboutSectionDemo />
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
