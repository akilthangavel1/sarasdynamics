import React from "react";
import { DIcons } from "dicons";
import { Heart } from "lucide-react";
import ScrollTopFooter from "@/components/ui/footer";

const navigation = {
  categories: [
    {
      id: "explore",
      name: "Explore",
      sections: [
        {
          id: "about",
          name: "About",
          items: [
            { name: "About Story", href: "#about-section" },
            { name: "Brand Works", href: "#gallery-preview" },
            { name: "Interactive Showcase", href: "#expandable-gallery-section" },
          ],
        },
        {
          id: "features",
          name: "Features",
          items: [
            { name: "Products", href: "#" },
            { name: "Agency", href: "#" },
            { name: "Dashboard", href: "#" },
          ],
        },
        {
          id: "products",
          name: "Products",
          items: [
            { name: "DIcons", href: "https://dicons.designali.in" },
            { name: "DShapes", href: "#" },
            { name: "Graaadients", href: "#" },
          ],
        },
        {
          id: "designs",
          name: "Designs",
          items: [
            { name: "Design System", href: "#" },
            { name: "Components", href: "#" },
            { name: "Blogs", href: "#blog-heading" },
          ],
        },
        {
          id: "other",
          name: "Others",
          items: [
            { name: "Graphic Assets", href: "#" },
            { name: "3D Icons", href: "#" },
            { name: "Palette Generator", href: "#" },
          ],
        },
        {
          id: "company",
          name: "Company",
          items: [
            { name: "Contact", href: "mailto:contact@designali.in" },
            { name: "Terms of Service", href: "#" },
            { name: "Privacy Policy", href: "#" },
          ],
        },
      ],
    },
  ],
};

const Underline = "hover:-translate-y-1 border border-dotted border-zinc-300 rounded-xl p-2.5 transition-transform text-zinc-700 hover:text-zinc-950 hover:border-zinc-500 inline-flex items-center justify-center bg-white shadow-xs";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="site-footer" className="w-full border-t border-zinc-200 bg-white text-zinc-800 transition-colors">
      <div className="relative mx-auto grid max-w-7xl items-center justify-center gap-6 p-8 sm:p-10 pb-0 md:flex">
        <a href="#hero-canvas" className="flex items-center justify-center rounded-full shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-200 flex items-center justify-center text-red-600 group-hover:scale-105 transition-transform">
            <DIcons.Sparkles className="w-5 h-5 text-red-600" />
          </div>
        </a>
        <p className="bg-transparent text-center text-xs leading-5 text-zinc-500 md:text-left max-w-4xl">
          Welcome to Designali, where creativity meets strategy to bring your vision to life.
          Transforming ideas into compelling visual experiences, crafting unique brand identities,
          immersive digital experiences, and engaging content that resonates with your audience.
          Quality, deliberate design, and visceral storytelling.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="border-b border-dotted border-zinc-200"></div>
        <div className="py-8">
          {navigation.categories.map((category) => (
            <div
              key={category.name}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 leading-6"
            >
              {category.sections.map((section) => (
                <div key={section.name} className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                    {section.name}
                  </span>
                  <ul
                    role="list"
                    aria-labelledby={`${category.id}-${section.id}-heading`}
                    className="flex flex-col space-y-2 list-none p-0 m-0"
                  >
                    {section.items.map((item) => (
                      <li key={item.name} className="flow-root">
                        <a
                          href={item.href}
                          className="text-xs sm:text-sm text-zinc-600 hover:text-zinc-950 transition-colors"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="border-b border-dotted border-zinc-200"></div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 px-6">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            aria-label="Email"
            href="mailto:contact@designali.in"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.Mail strokeWidth={1.5} className="h-5 w-5" />
          </a>
          <a
            aria-label="X / Twitter"
            href="https://x.com/designali_in"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.X className="h-5 w-5" />
          </a>
          <a
            aria-label="Instagram"
            href="https://www.instagram.com/designali.in/"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.Instagram className="h-5 w-5" />
          </a>
          <a
            aria-label="Threads"
            href="https://www.threads.net/designali.in"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.Threads className="h-5 w-5" />
          </a>
          <a
            aria-label="WhatsApp"
            href="https://chat.whatsapp.com/LWsNPcz5BlWDVOha41vzuh"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.WhatsApp className="h-5 w-5" />
          </a>
          <a
            aria-label="Behance"
            href="https://www.behance.net/designali-in"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.Behance className="h-5 w-5" />
          </a>
          <a
            aria-label="Facebook"
            href="https://www.facebook.com/designali.agency"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.Facebook className="h-5 w-5" />
          </a>
          <a
            aria-label="LinkedIn"
            href="https://www.linkedin.com/company/designali"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.LinkedIn className="h-5 w-5" />
          </a>
          <a
            aria-label="YouTube"
            href="https://www.youtube.com/@designali-in"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.YouTube className="h-5 w-5" />
          </a>
        </div>

        {/* Scroll Top Button (Theme toggler removed as requested) */}
        <ScrollTopFooter />
      </div>

      <div className="mx-auto mb-10 mt-8 flex flex-col justify-between text-center text-xs max-w-7xl px-4">
        <div className="flex flex-row items-center justify-center gap-1 text-zinc-500">
          <span>©</span>
          <span>{currentYear}</span>
          <span>Made with</span>
          <Heart className="text-red-600 mx-1 h-3.5 w-3.5 fill-red-600 animate-pulse inline-block" />
          <span>by</span>
          <a
            aria-label="Ali Imam"
            className="font-semibold text-zinc-800 hover:text-zinc-950 transition-colors underline-offset-2 hover:underline"
            href="https://www.instagram.com/aliimam.in/"
            target="_blank"
            rel="noreferrer"
          >
            Ali Imam
          </a>
          <span>-</span>
          <a
            aria-label="Designali"
            className="text-zinc-600 hover:text-red-600 transition-colors"
            href="/"
          >
            Designali
          </a>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
