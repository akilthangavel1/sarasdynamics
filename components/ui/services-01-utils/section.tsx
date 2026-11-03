import React from "react";
import { cn } from "@/lib/utils";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  children?: React.ReactNode;
}

export function Section({ className, children, ...props }: SectionProps) {
  return (
    <section
      className={cn(
        "w-full py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-border/80 bg-background text-foreground transition-colors duration-300",
        className
      )}
      {...props}
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

export interface SectionHeaderProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "w-full grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6 md:gap-10 lg:gap-12 mb-10 sm:mb-12",
        className
      )}
    >
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
        {title && (
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
        )}
      </div>

      {/* Center Divider: Vertical separator line */}
      <div
        className="hidden md:block w-px h-16 lg:h-20 bg-border/80 dark:bg-zinc-800 shrink-0"
        aria-hidden="true"
      />

      {/* Right Column: Description positioned at right */}
      {description && (
        <div className="flex flex-col justify-center max-w-md md:ml-auto">
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      )}
    </div>
  );
}

export default Section;

