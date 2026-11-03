"use client";

import React from "react";
import {
  Smartphone,
  Layers,
  ShieldCheck,
  Palette,
  Server,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { FeatureCard, type FeatureType } from "@/components/ui/grid-feature-cards";
import { cn } from "@/lib/utils";

const defaultFeatures: FeatureType[] = [
  {
    title: "Native Android & iOS Development",
    icon: Smartphone,
    description:
      "Build high-performance mobile applications for Android and iOS with intuitive interfaces, reliable functionality, and seamless user experiences.",
  },
  {
    title: "Cross-Platform App Development",
    icon: Layers,
    description:
      "Develop applications for multiple platforms using modern frameworks like Flutter and React Native, reducing development time and costs.",
  },
  {
    title: "Secure App Architecture",
    icon: ShieldCheck,
    description:
      "Protect your mobile applications with secure authentication, encrypted data communication, and industry-standard security practices.",
  },
  {
    title: "UI/UX Design & Customization",
    icon: Palette,
    description:
      "Create engaging mobile experiences with user-centric UI/UX design, intuitive navigation, and customized application interfaces.",
  },
  {
    title: "API & Backend Integration",
    icon: Server,
    description:
      "Connect mobile applications with powerful backend systems, REST APIs, cloud services, and third-party integrations.",
  },
  {
    title: "Scalable & AI-Powered Applications",
    icon: Sparkles,
    description:
      "Build future-ready mobile applications with scalable architecture, AI-powered capabilities, and optimized application performance.",
  },
];

interface GridFeatureCardsDemoProps {
  className?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  features?: FeatureType[];
}

export default function GridFeatureCardsDemo({
  className,
  eyebrow = "MOBILE APP SERVICES",
  title = "Mobile Apps.\nBuilt for Performance.",
  subtitle = "Transform your ideas into powerful mobile applications with scalable architecture, intuitive UI/UX, and seamless performance.",
  features = defaultFeatures,
}: GridFeatureCardsDemoProps) {
  return (
    <section className={cn("w-full py-16 md:py-24 border-t border-zinc-200/80 bg-white dark:bg-background text-zinc-900 dark:text-zinc-100", className)}>
      <div className="mx-auto w-full max-w-6xl space-y-12 px-4 sm:px-6">
        {/* Title Header Section matching Saras Dynamics standard */}
        <AnimatedContainer className="w-full grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6 md:gap-10 lg:gap-12">
          {/* Left Column: Eyebrow with red accent line & Title */}
          <div className="flex flex-col items-start gap-3">
            {eyebrow && (
              <div className="flex items-center gap-3.5">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-foreground">
                  {eyebrow}
                </span>
                <span
                  className="inline-block w-20 sm:w-24 h-[2px] bg-[#c30000] rounded-sm shrink-0"
                  aria-hidden="true"
                />
              </div>
            )}
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl leading-[1.08] text-balance">
              {typeof title === "string" ? (
                title.split("\n").map((line, idx, arr) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx < arr.length - 1 && <br />}
                  </React.Fragment>
                ))
              ) : (
                title
              )}
            </h2>
          </div>

          {/* Center Divider: Vertical separator line */}
          <div
            className="hidden md:block w-px h-16 lg:h-20 bg-border/80 dark:bg-zinc-800 shrink-0"
            aria-hidden="true"
          />

          {/* Right Column: Subtitle positioned at right */}
          {subtitle && (
            <div className="flex flex-col justify-center max-w-md md:ml-auto">
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {subtitle}
              </p>
            </div>
          )}
        </AnimatedContainer>

        <AnimatedContainer
          delay={0.3}
          className="grid grid-cols-1 divide-x divide-y divide-dashed divide-zinc-200 dark:divide-zinc-800 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden sm:grid-cols-2 md:grid-cols-3 bg-zinc-50/30 dark:bg-zinc-900/20"
        >
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} />
          ))}
        </AnimatedContainer>
      </div>
    </section>
  );
}

type ViewAnimationProps = {
  delay?: number;
  className?: React.ComponentProps<typeof motion.div>["className"];
  children: React.ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export { GridFeatureCardsDemo };

