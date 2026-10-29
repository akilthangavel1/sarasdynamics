// Logo Cloud 4 from Hirael <https://hirael.com/blocks/logo-cloud/logo-cloud-04>
// MIT · Mohammad Shehadeh · https://github.com/MohammadShehadeh/hirael

"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/logo-cloud-04-utils/tabs";

const ENTER =
  "animate-in fade-in slide-in-from-bottom-4 duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] fill-mode-both motion-reduce:animate-none";
const SWAP =
  "animate-in fade-in slide-in-from-bottom-2 duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] fill-mode-both motion-reduce:animate-none";

const stagger = (
  index: number,
  step = 60,
  offset = 0,
): React.CSSProperties => ({
  animationDelay: `${offset + index * step}ms`,
});

const AUTO_ADVANCE_MS = 6000;

interface Story {
  value: string;
  name: string;
  wordmark: string;
  metric: string;
  metricLabel: string;
  period: string;
  quote: string;
  person: string;
  role: string;
  href: string;
}

const STORIES: readonly Story[] = [
  {
    value: "discovery",
    name: "Discovery",
    wordmark: "text-lg font-semibold tracking-tight",
    metric: "Phase 1",
    metricLabel: "Technical Alignment",
    period: "Scope, feasibility & milestones",
    quote:
      "We dissect your business goals, target audience, performance targets, and data structures to formulate an actionable technical blueprint.",
    person: "Discovery & Strategy",
    role: "Technical Specification & Milestone Plan",
    href: "#contact",
  },
  {
    value: "architecture",
    name: "Architecture",
    wordmark: "text-xs font-medium uppercase tracking-[0.25em]",
    metric: "100%",
    metricLabel: "Scalable Foundation",
    period: "Engineered for longevity",
    quote:
      "We design modular system architectures, database schemas, secure API boundaries, and cloud infrastructure to eliminate future technical debt.",
    person: "System Architecture",
    role: "Data Modeling & Infrastructure Design",
    href: "#contact",
  },
  {
    value: "interface",
    name: "design & ux",
    wordmark: "text-xl font-bold lowercase tracking-tighter",
    metric: "Pixel",
    metricLabel: "Design System Precision",
    period: "Component-driven design",
    quote:
      "We craft intuitive user journeys, high-fidelity prototypes, and cohesive component token systems engineered for seamless developer handoff.",
    person: "UI/UX Engineering",
    role: "Design Tokens & Interactive Prototypes",
    href: "#contact",
  },
  {
    value: "engineering",
    name: "Engineering",
    wordmark: "font-serif text-xl font-medium italic",
    metric: "Clean",
    metricLabel: "Type-Safe Codebase",
    period: "React, Next.js, TypeScript",
    quote:
      "Our engineers build responsive, resilient frontends paired with high-throughput backend services, clean APIs, and automated pipelines.",
    person: "Full-Stack Development",
    role: "Production-Grade Modern Stack Build",
    href: "#contact",
  },
  {
    value: "qa",
    name: "Testing & QA",
    wordmark: "text-lg font-light tracking-wide",
    metric: "99.9%",
    metricLabel: "Stability & Core Vitals",
    period: "Rigorous quality verification",
    quote:
      "Every release undergoes stringent end-to-end integration testing, accessibility compliance, responsive validation, and sub-second speed optimization.",
    person: "Quality Assurance",
    role: "Automated Test Suites & CWV Audits",
    href: "#contact",
  },
  {
    value: "deployment",
    name: "LAUNCH & SCALE",
    wordmark: "text-base font-black uppercase tracking-tight",
    metric: "Zero",
    metricLabel: "Downtime Cutover",
    period: "CI/CD & 24/7 Monitoring",
    quote:
      "We execute seamless production cutovers with automated CI/CD pipelines, edge CDN caching, and continuous telemetry monitoring to support your growth.",
    person: "DevOps & Scale",
    role: "Global Edge Deployment & Ongoing SLAs",
    href: "#contact",
  },
];

const formatIndex = (index: number) => String(index + 1).padStart(2, "0");

const LogoCloud04 = () => {
  const [active, setActive] = React.useState(STORIES[0].value);
  const [picked, setPicked] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  const paused = hovered || focused;
  const autoAdvance = !picked;

  const advance = (event: React.AnimationEvent<HTMLSpanElement>) => {
    if (event.target !== event.currentTarget || !autoAdvance) return;
    const current = STORIES.findIndex((story) => story.value === active);
    setActive(STORIES[(current + 1) % STORIES.length].value);
  };

  const pick = (value: string) => {
    if (!value) return;
    setActive(value);
    setPicked(true);
  };

  return (
    <section data-slot="logo-cloud" className="bg-background py-20 md:py-28">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 md:px-10">
        <div
          data-slot="logo-cloud-header"
          className="flex max-w-xl flex-col gap-4"
        >
          <span
            className={cn(ENTER, "text-xs uppercase text-muted-foreground")}
          >
            Our process
          </span>
          <h2
            style={stagger(1, 80)}
            className={cn(
              ENTER,
              "text-balance text-3xl font-semibold tracking-tight sm:text-4xl",
            )}
          >
            Six phases from concept to production
          </h2>
          <p
            style={stagger(2, 80)}
            className={cn(
              ENTER,
              "text-base leading-relaxed text-muted-foreground",
            )}
          >
            Explore our end-to-end engineering methodology, designed to build and scale modern web systems with architectural precision.
          </p>
        </div>

        <Tabs
          value={active}
          onValueChange={pick}
          data-slot="logo-cloud-stories"
          className="gap-0"
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            )
              setFocused(false);
          }}
        >
          <TabsList
            variant="line"
            aria-label="Process Phases"
            style={stagger(3, 80)}
            className={cn(
              ENTER,
              "grid w-full grid-cols-2 gap-0 border-y border-border p-0 sm:grid-cols-3 lg:grid-cols-6",
              "group-data-[orientation=horizontal]/tabs:h-auto",
            )}
          >
            {STORIES.map((story) => {
              const isActive = story.value === active;
              return (
                <TabsTrigger
                  key={story.value}
                  value={story.value}
                  data-slot="logo-cloud-logo"
                  className="h-20 rounded-none border-0 px-4 after:hidden hover:bg-muted/30"
                >
                  <span
                    className={cn(
                      "whitespace-nowrap transition-colors duration-150",
                      story.wordmark,
                    )}
                  >
                    {story.name}
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-4 bottom-0 h-0.5 overflow-hidden"
                  >
                    {isActive && (
                      <span
                        data-slot="logo-cloud-progress"
                        onAnimationEnd={advance}
                        style={
                          autoAdvance
                            ? {
                                animationDuration: `${AUTO_ADVANCE_MS}ms`,
                                animationPlayState: paused
                                  ? "paused"
                                  : "running",
                              }
                            : undefined
                        }
                        className={cn(
                          "block size-full bg-warm",
                          autoAdvance &&
                            "animate-in slide-in-from-start ease-linear fill-mode-both motion-reduce:animate-none",
                        )}
                      />
                    )}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {STORIES.map((story, index) => (
            <TabsContent
              key={story.value}
              value={story.value}
              data-slot="logo-cloud-proof"
              className="grid gap-10 pt-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:pt-14"
            >
              <div className="flex flex-col gap-3">
                <span
                  dir="ltr"
                  className={cn(
                    SWAP,
                    "text-xs tabular-nums text-muted-foreground rtl:text-end",
                  )}
                >
                  {formatIndex(index)}
                  <span className="mx-1.5 text-border">|</span>
                  {String(STORIES.length).padStart(2, "0")}
                </span>
                <p
                  style={stagger(1)}
                  className={cn(SWAP, "mt-3 flex flex-col gap-1")}
                >
                  <span
                    dir="ltr"
                    className="text-6xl font-semibold tracking-tight tabular-nums rtl:text-end sm:text-7xl"
                  >
                    {story.metric}
                  </span>
                  <span className="text-lg font-medium">
                    {story.metricLabel}
                  </span>
                </p>
                <span
                  style={stagger(2)}
                  className={cn(SWAP, "text-sm text-muted-foreground")}
                >
                  {story.period}
                </span>
              </div>

              <figure className="flex flex-col gap-6 md:border-s md:border-border md:ps-16">
                <blockquote
                  style={stagger(2)}
                  className={cn(
                    SWAP,
                    "text-xl leading-relaxed font-medium tracking-tight text-pretty sm:text-2xl",
                  )}
                >
                  &ldquo;{story.quote}&rdquo;
                </blockquote>
                <figcaption
                  style={stagger(3)}
                  className={cn(
                    SWAP,
                    "flex flex-wrap items-end justify-between gap-x-6 gap-y-4",
                  )}
                >
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{story.person}</span>
                    <span className="text-sm text-muted-foreground">
                      {story.role}
                    </span>
                  </span>
                  <Button variant="link" className="group h-auto p-0" asChild>
                    <a href={story.href}>
                      Start a project
                      <span className="sr-only"> with {story.name}</span>
                      <ArrowRight
                        aria-hidden
                        className="size-3.5 transition-transform duration-150 ease-out group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                      />
                    </a>
                  </Button>
                </figcaption>
              </figure>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default LogoCloud04;
