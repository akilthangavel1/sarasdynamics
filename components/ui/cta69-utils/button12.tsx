"use client";

import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Button12Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  label?: string;
  className?: string;
}

export const Button12 = React.forwardRef<HTMLButtonElement, Button12Props>(
  ({ asChild = false, label, className, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    if (asChild && React.isValidElement(children)) {
      const existingChildren = (children.props as any)?.children;
      return (
        <Comp
          ref={ref}
          className={cn(
            "group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-zinc-900 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-zinc-800 hover:shadow-2xl active:scale-95 cursor-pointer",
            className
          )}
          {...props}
        >
          {React.cloneElement(children as React.ReactElement<any>, {
            children: (
              <>
                <span className="relative z-10 font-semibold tracking-wide">
                  {existingChildren || label}
                </span>
                <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
              </>
            ),
          })}
        </Comp>
      );
    }

    return (
      <Comp
        ref={ref}
        className={cn(
          "group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-zinc-900 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-zinc-800 hover:shadow-2xl active:scale-95 cursor-pointer",
          className
        )}
        {...props}
      >
        <span className="relative z-10 font-semibold tracking-wide">
          {children || label}
        </span>
        <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
      </Comp>
    );
  }
);
Button12.displayName = "Button12";

export default Button12;
