import React from "react";
import { DIcons } from "dicons";
import { Heart, Github } from "lucide-react";
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
            { name: "About Saras Dynamics", href: "#about" },
            { name: "Recent Hires", href: "#recent-hire" },
            { name: "Production Works", href: "#gallery-preview" },
          ],
        },
        {
          id: "services",
          name: "Services",
          items: [
            { name: "Web Development", href: "#web" },
            { name: "Mobile Development", href: "#mobile" },
            { name: "AI & RAG Systems", href: "#web" },
            { name: "Cloud Architecture", href: "#web" },
          ],
        },
        {
          id: "technologies",
          name: "Technologies",
          items: [
            { name: "React & Next.js", href: "#web" },
            { name: "Swift & Kotlin", href: "#mobile" },
            { name: "Python & PyTorch", href: "#web" },
            { name: "Kubernetes & Docker", href: "#web" },
          ],
        },
        {
          id: "engineering",
          name: "Architecture",
          items: [
            { name: "Design Systems", href: "#web" },
            { name: "Distributed Backends", href: "#web" },
            { name: "Contact & Briefing", href: "#contact" },
          ],
        },
        {
          id: "resources",
          name: "Resources",
          items: [
            { name: "Engineering Journal", href: "#blog" },
            { name: "System Benchmarks", href: "#about" },
            { name: "Technical FAQs", href: "#contact" },
          ],
        },
        {
          id: "company",
          name: "Company",
          items: [
            { name: "Engineering Journal", href: "#blog" },
            { name: "Careers & Openings", href: "#careers" },
            { name: "Contact & Support", href: "#contact" },
            { name: "Privacy Policy", href: "#" },
            { name: "Terms of Service", href: "#" },
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
        <a href="#home" className="flex items-center justify-center rounded-full shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
            <span className="font-mono font-black text-sm tracking-tight">SD</span>
          </div>
        </a>
        <p className="bg-transparent text-center text-xs leading-5 text-zinc-500 md:text-left max-w-4xl">
          At Saras Dynamics, we engineer intelligent software, advanced AI architectures, and robust digital systems for high-growth enterprises and ambitious technical founders. From low-latency RAG retrieval and autonomous agentic pipelines to distributed cloud backends and responsive mobile applications, we build software designed for deterministic performance and long-term maintainability.
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
            href="mailto:hello@sarasdynamics.com"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.Mail strokeWidth={1.5} className="h-5 w-5" />
          </a>
          <a
            aria-label="X / Twitter"
            href="https://x.com"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.X className="h-5 w-5" />
          </a>
          <a
            aria-label="LinkedIn"
            href="https://linkedin.com"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.LinkedIn className="h-5 w-5" />
          </a>
          <a
            aria-label="GitHub"
            href="https://github.com"
            rel="noreferrer"
            target="_blank"
            className={Underline}
          >
            <Github className="h-5 w-5" />
          </a>
        </div>

        {/* Scroll Top Button (Theme toggler removed as requested) */}
        <ScrollTopFooter />
      </div>

      <div className="mx-auto mb-10 mt-8 flex flex-col justify-between text-center text-xs max-w-7xl px-4">
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-zinc-500">
          <span>©</span>
          <span>{currentYear}</span>
          <span className="font-semibold text-zinc-800">Saras Dynamics Inc.</span>
          <span>— All rights reserved. Architected for speed, resilience, and scale.</span>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
