"use client";

import React, { useRef, type RefObject } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const defaultVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(8px)",
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.3,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

interface TimelineContentProps {
  as?: React.ElementType;
  animationNum: number;
  timelineRef: RefObject<HTMLElement | null>;
  customVariants?: Variants;
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

export function TimelineContent({
  as: Component = "div",
  animationNum,
  timelineRef,
  customVariants,
  className,
  children,
  ...props
}: TimelineContentProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(timelineRef, {
    once: true,
    amount: 0.2,
  });

  const MotionComponent = motion.create(Component as React.ElementType);

  return (
    <MotionComponent
      ref={ref}
      custom={animationNum}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={customVariants || defaultVariants}
      className={cn(className)}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}

export default TimelineContent;
