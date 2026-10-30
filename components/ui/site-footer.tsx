import React from "react";
import { DIcons } from "dicons";
import ScrollTopFooter from "@/components/ui/footer";

const footerColumns = [
  {
    title: "Services",
    items: [
      { name: "AI & Autonomous Systems", href: "#services" },
      { name: "Web Application Engineering", href: "#web" },
      { name: "Mobile App Development", href: "#mobile" },
      { name: "Cloud & Systems Architecture", href: "#services" },
      { name: "UI/UX & Product Design", href: "#web" },
    ],
  },
  {
    title: "Work",
    items: [
      { name: "Featured Case Studies", href: "#gallery-preview" },
      { name: "Interactive Showcase", href: "#expandable-gallery-section" },
      { name: "Client Architecture", href: "#about" },
      { name: "Recent Hires & Team", href: "#recent-hires" },
    ],
  },
  {
    title: "Company",
    items: [
      { name: "About Saras Dynamics", href: "#about" },
      { name: "Careers & Culture", href: "#careers" },
      { name: "Engineering Blog", href: "#blog" },
      { name: "Contact & Consultations", href: "#contact" },
    ],
  },
  {
    title: "Legal",
    items: [
      { name: "Privacy Policy", href: "#privacy" },
      { name: "Terms of Service", href: "#terms" },
      { name: "Security & Compliance", href: "#security" },
      { name: "Mutual NDA & IP Rights", href: "#contact" },
    ],
  },
];

const Underline =
  "hover:-translate-y-1 border border-dotted border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 transition-transform text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:border-zinc-500 dark:hover:border-zinc-400 inline-flex items-center justify-center bg-white dark:bg-zinc-900 shadow-xs";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="site-footer"
      className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 transition-colors"
    >
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 pb-10">
          {footerColumns.map((col) => (
            <div key={col.title} className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-4">
                {col.title}
              </span>
              <ul className="flex flex-col space-y-2.5 list-none p-0 m-0">
                {col.items.map((item) => (
                  <li key={item.name} className="flow-root">
                    <a
                      href={item.href}
                      className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-b border-dotted border-zinc-200 dark:border-zinc-800 mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a
              aria-label="Email"
              href="mailto:info@sarasdynamics.com"
              className={Underline}
            >
              <DIcons.Mail strokeWidth={1.5} className="h-5 w-5" />
            </a>
            <a
              aria-label="WhatsApp"
              href="https://wa.me/919971999100"
              rel="noreferrer"
              target="_blank"
              className={Underline}
            >
              <DIcons.WhatsApp className="h-5 w-5" />
            </a>
            <a
              aria-label="LinkedIn"
              href="https://in.linkedin.com/company/sarasdynamics?trk=public_jobs_topcard-org-name"
              rel="noreferrer"
              target="_blank"
              className={Underline}
            >
              <DIcons.LinkedIn className="h-5 w-5" />
            </a>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center sm:text-right">
            © {currentYear} Saras Dynamics. AI automation and software engineering.
          </p>

          <ScrollTopFooter />
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
