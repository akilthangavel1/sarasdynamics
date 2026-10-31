"use client";

import React from "react";
import { Zap, Cpu, Fingerprint, Pencil, Settings2, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { FeatureCard, type FeatureType } from "@/components/ui/grid-feature-cards";
import { cn } from "@/lib/utils";

const defaultFeatures: FeatureType[] = [
  {
    title: "Faaast",
    icon: Zap,
    description: "It supports an entire helping developers and innovate.",
  },
  {
    title: "Powerful",
    icon: Cpu,
    description: "It supports an entire helping developers and businesses.",
  },
  {
    title: "Security",
    icon: Fingerprint,
    description: "It supports an helping developers businesses.",
  },
  {
    title: "Customization",
    icon: Pencil,
    description: "It supports helping developers and businesses innovate.",
  },
  {
    title: "Control",
    icon: Settings2,
    description: "It supports helping developers and businesses innovate.",
  },
  {
    title: "Built for AI",
    icon: Sparkles,
    description: "It supports helping developers and businesses innovate.",
  },
];

interface GridFeatureCardsDemoProps {
  className?: string;
  title?: string;
  subtitle?: string;
  features?: FeatureType[];
}

export default function GridFeatureCardsDemo({
  className,
  title = "Power. Speed. Control.",
  subtitle = "Everything you need to build fast, secure, scalable apps.",
  features = defaultFeatures,
}: GridFeatureCardsDemoProps) {
  return (
    <section className={cn("w-full py-16 md:py-24 border-t border-zinc-200/80 bg-white dark:bg-background text-zinc-900 dark:text-zinc-100", className)}>
      <div className="mx-auto w-full max-w-6xl space-y-12 px-4 sm:px-6">
        <AnimatedContainer className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="text-muted-foreground mt-4 text-sm tracking-wide text-balance md:text-base">
            {subtitle}
          </p>
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

