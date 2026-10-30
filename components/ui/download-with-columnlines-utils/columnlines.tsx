import React from "react";
import { cn } from "@/lib/utils";

export interface ColumnLinesProps extends React.HTMLAttributes<HTMLDivElement> {
  columnWidth?: number;
  columnCount?: number;
  radialFadeStart?: number;
  radialFadeEnd?: number;
  opacity?: number;
  showNoise?: boolean;
  noiseOpacity?: number;
}

export function ColumnLines({
  columnWidth = 80,
  columnCount = 14,
  radialFadeStart = 30,
  radialFadeEnd = 70,
  opacity = 1,
  showNoise = true,
  noiseOpacity = 0.05,
  className,
  children,
  ...props
}: ColumnLinesProps) {
  return (
    <div className={cn("relative overflow-hidden w-full", className)} {...props}>
      {/* Background Column Lines Layer */}
      <div
        className="pointer-events-none absolute inset-0 z-0 flex justify-center"
        style={{
          opacity,
          maskImage: `radial-gradient(circle at center, black ${radialFadeStart}%, transparent ${radialFadeEnd}%)`,
          WebkitMaskImage: `radial-gradient(circle at center, black ${radialFadeStart}%, transparent ${radialFadeEnd}%)`,
        }}
      >
        <div
          className="flex h-full"
          style={{
            width: `${columnWidth * columnCount}px`,
          }}
        >
          {Array.from({ length: columnCount }).map((_, index) => (
            <div
              key={index}
              style={{ width: `${columnWidth}px` }}
              className="h-full border-r border-zinc-300/60 dark:border-zinc-700/60 first:border-l"
            />
          ))}
        </div>
      </div>

      {/* Optional Noise / Grain Texture */}
      {showNoise && (
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-repeat"
          style={{
            opacity: noiseOpacity,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* Foreground Content */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}

export default ColumnLines;

