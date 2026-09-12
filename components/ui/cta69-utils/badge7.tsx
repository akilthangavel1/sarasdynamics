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
        "inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100/90 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-800 shadow-xs backdrop-blur-sm transition-all duration-300 hover:bg-zinc-200/80",
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/40 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
      </span>
      <span>{label}</span>
    </div>
  );
}

export default Badge7;
