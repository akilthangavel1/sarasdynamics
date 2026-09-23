import React from "react";

export function AboutUsSection() {
  return (
    <section
      id="about-us-detailed-section"
      className="w-full bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-zinc-100 py-16 sm:py-20 border-t border-zinc-200/80 dark:border-zinc-800/80 relative overflow-hidden"
    >
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col">
        {/* Team & Technical Culture Banner */}
        <div className="w-full p-8 sm:p-12 rounded-3xl bg-zinc-900 text-white dark:bg-zinc-900 dark:border dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
          <div className="flex flex-col gap-3 max-w-2xl relative z-10">
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-400">
              START A CONVERSATION
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              Have a challenging software, AI, or mobile project in mind?
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              We collaborate with high-growth startups, product teams, and enterprises seeking rigorous engineering and rapid delivery.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10 shrink-0">
            <button
              type="button"
              onClick={() => {
                const footerEl = document.querySelector("footer");
                if (footerEl) {
                  footerEl.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="px-6 py-3 rounded-xl bg-white text-zinc-900 font-bold text-sm hover:bg-zinc-100 transition-colors shadow-sm cursor-pointer"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutUsSection;
