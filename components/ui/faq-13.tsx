"use client";

import { FancyButton } from "@/components/ui/faq-13-utils/fancy-button";

const faqs = [
  {
    id: 1,
    trigger: "How do engagements work (fixed price vs. hourly vs. retainer)?",
    content:
      "We adapt to your project scope and workflow. Fixed-price contracts work best for clearly defined deliverables and MVPs. Dedicated retainers or time-and-materials arrangements offer flexible, sprint-based velocity for scaling teams and evolving architectures.",
  },
  {
    id: 2,
    trigger: "Do you sign NDAs, and who owns the code and IP?",
    content:
      "Yes, we sign comprehensive mutual non-disclosure agreements before reviewing any proprietary specifications. You own 100% of the intellectual property, source code, repositories, and architectural assets upon project delivery.",
  },
  {
    id: 3,
    trigger: "How do you handle time zones and communication?",
    content:
      "We establish guaranteed daily overlapping windows for live collaboration across US, European, and APAC time zones. Daily standups, transparent communication channels, and regular milestone demos keep everyone aligned.",
  },
  {
    id: 4,
    trigger: "What’s a typical timeline and budget range?",
    content:
      "Targeted MVPs and technical discovery sprints typically take 2–6 weeks, while production-grade platforms and AI systems span 2–4 months. Engagements are scoped transparently with clear milestone deliverables to match your budget.",
  },
  {
    id: 5,
    trigger: "What happens after launch (support and maintenance)?",
    content:
      "We don't disappear after deployment. We provide dedicated hypercare periods, continuous performance and security monitoring, SLA-backed maintenance retainers, and on-demand engineering support as your user base expands.",
  },
  {
    id: 6,
    trigger: "Can you augment our existing team or take over an existing codebase?",
    content:
      "Yes. We frequently embed senior engineers directly into in-house teams or take ownership of existing codebases. We begin with a comprehensive architectural and code audit, then implement robust testing, CI/CD, and sprint cycles seamlessly.",
  },
];

export function Faq() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-3 md:items-center md:text-center">
        <p className="w-fit rounded-md bg-muted p-2 text-sm text-foreground">
          FAQ
        </p>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground">
            Clear answers about how we partner, build, and deliver engineering excellence.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-12 md:gap-y-10">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="flex items-start gap-4"
          >
            <span className="min-w-fit font-mono text-sm font-semibold text-muted-foreground pt-0.5">
              {String(faq.id).padStart(2, "0")}
            </span>
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-semibold text-foreground tracking-tight">
                {faq.trigger}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{faq.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-start md:justify-center">
        <FancyButton
          size="lg"
          onClick={() => {
            const el = document.getElementById("contact-globe-section");
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            } else {
              window.location.hash = "#contact";
            }
          }}
        >
          Have more questions? Get in touch
        </FancyButton>
      </div>
    </div>
  );
}
export default Faq;
