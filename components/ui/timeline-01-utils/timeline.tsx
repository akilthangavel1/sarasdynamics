"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  title: string;
  description: string;
  date: string;
  image?: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

export default function Timeline({ items }: TimelineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 60%", "end 60%"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });
  const dotTop = useTransform(progress, (v) => `${v * 100}%`);

  return (
    <div ref={ref} className="relative">
      {/* Base line */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-6 top-0 w-px bg-border md:left-1/2"
      />
      {/* Scroll-progress fill */}
      <motion.div
        aria-hidden="true"
        style={{ scaleY: progress }}
        className="absolute bottom-0 left-6 top-0 w-px origin-top bg-foreground md:left-1/2"
      />
      {/* Progress dot */}
      <motion.div
        aria-hidden="true"
        style={{ top: dotTop }}
        className="absolute left-6 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground shadow-[0_0_0_4px_var(--background,#fff)] md:left-1/2"
      />

      <ol>
        {items.map((item, index) => {
          const textLeft = index % 2 === 0;
          return (
            <li
              key={`${item.date}-${item.title}`}
              className="grid grid-cols-1 items-center md:grid-cols-2"
            >
              {/* Text */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={cn(
                  "space-y-3 pb-6 pl-14 pr-6 pt-12 md:px-16 md:py-24 lg:px-20",
                  textLeft
                    ? "md:order-1 md:text-right"
                    : "md:order-2 md:text-left",
                )}
              >
                <h3 className="text-4xl font-medium tracking-tighter text-foreground md:text-5xl">
                  {item.title}
                </h3>
                <p
                  className={cn(
                    "text-base leading-relaxed text-muted-foreground md:text-lg",
                    textLeft ? "md:ml-auto" : "",
                    "max-w-md",
                  )}
                >
                  {item.description}
                </p>
              </motion.div>

              {/* Image */}
              {item.image && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                  className={cn(
                    "pb-12 pl-14 pr-6 md:px-16 md:py-24 lg:px-20",
                    textLeft ? "md:order-2" : "md:order-1",
                  )}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-3xl object-cover"
                  />
                </motion.div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
