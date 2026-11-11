import React from "react";
import { ArrowUpRight } from "lucide-react";

import {
  Section,
  SectionHeader,
} from "@/components/ui/services-01-utils/section";
import { cn } from "@/lib/utils";

const header = {
  eyebrow: "OUR SERVICES",
  title: "Pick a service, start building.",
  description:
    "Focused engagements with a clear scope, a fixed price and a date you can plan around.",
};

const services = [
  {
    title: "AI & Autonomous Systems",
    description:
      "We build AI agents and intelligent systems that handle repetitive work, answer questions and make decisions inside your business tools.",
    deliverables: ["AI Agents", "LLM Integration", "Custom AI Systems"],
    price: "From $2,500",
    href: "#contact",
  },
  {
    title: "Web Application Engineering",
    description:
      "Custom dashboards, portals and web platforms engineered for speed and reliability.",
    deliverables: ["Next.js", "SaaS", "Performance"],
    price: "From $1,000",
    href: "#web",
  },
  {
    title: "Mobile App Development",
    description:
      "We take your app from idea to App Store and Google Play launch, with one team handling every step.",
    deliverables: ["iOS & Android", "App Store", "Google Play"],
    price: "From $2,500",
    href: "#mobile",
  },
  {
    title: "Voice AI & Autonomous Agents",
    description:
      "Real-time voice agents that answer calls, book appointments and update your CRM, with natural turn-taking. Voice agents that answer calls, qualify leads and book meetings around the clock.",
    deliverables: ["Streaming STT/TTS", "SIP Trunking", "CRM Sync"],
    price: "From $2,500",
    href: "#voice-agent",
  },
];

export interface Services01Props {
  id?: string;
  className?: string;
}

export function Services01({ id = "services", className }: Services01Props) {
  return (
    <Section id={id} className={className}>
      <SectionHeader {...header} align="left" />
      <ul className="mt-16 divide-y border-y border-border divide-border">
        {services.map((service, index) => (
          <li key={service.title}>
            <a
              href={service.href}
              className="group grid grid-cols-1 gap-4 py-8 transition-colors hover:bg-muted/30 sm:grid-cols-[3rem_1fr_auto] sm:gap-6 lg:grid-cols-[3rem_1fr_1.5fr_auto] lg:gap-10 sm:px-2 rounded-lg"
            >
              <span className="font-mono text-xs text-muted-foreground sm:pt-1.5">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground font-medium">
                  {service.price}
                </p>
              </div>
              <div className="sm:col-start-2 lg:col-start-auto">
                <p className="text-sm leading-6 text-muted-foreground">
                  {service.description}
                </p>
                <ul
                  aria-label="Deliverables"
                  className="mt-4 flex flex-wrap gap-2"
                >
                  {service.deliverables.map((deliverable) => (
                    <li
                      key={deliverable}
                      className="rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-foreground/80"
                    >
                      {deliverable}
                    </li>
                  ))}
                </ul>
              </div>
              <span className="hidden size-10 items-center justify-center rounded-full border border-border bg-background transition-all group-hover:bg-foreground group-hover:text-background sm:col-start-3 sm:row-start-1 sm:flex lg:col-start-4 shadow-2xs">
                <ArrowUpRight className="size-4" aria-hidden />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export default Services01;

