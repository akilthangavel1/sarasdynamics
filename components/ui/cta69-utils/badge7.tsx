"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface Badge7Props {
  label: string;
  className?: string;
}

export function Badge7({ label, className }: Badge7Props) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-secondary/80 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-foreground shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-secondary",
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
      <span>{label}</span>
    </div>
  );
}

export default Badge7;
