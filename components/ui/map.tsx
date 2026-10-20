"use client";

import React, { useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DottedMapPkg from "dotted-map";
import { useTheme } from "next-themes";

const DottedMap = (DottedMapPkg as any).default || DottedMapPkg;

export interface MapDot {
  start: { lat: number; lng: number; label?: string };
  end: { lat: number; lng: number; label?: string };
}

export interface MapProps {
  dots?: MapDot[];
  lineColor?: string;
  showLabels?: boolean;
  labelClassName?: string;
  animationDuration?: number;
  loop?: boolean;
  className?: string;
}

export function WorldMap({
  dots = [],
  lineColor = "#0ea5e9",
  showLabels = true,
  labelClassName = "",
  animationDuration = 2,
  loop = true,
  className,
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  let currentTheme = "light";
  try {
    const themeContext = useTheme();
    if (themeContext && themeContext.theme) {
      currentTheme = themeContext.theme;
    }
  } catch {
    currentTheme = "light";
  }

  const map = useMemo(
    () => new DottedMap({ height: 100, grid: "diagonal" }),
    []
  );

  const svgMap = useMemo(
    () =>
      map.getSVG({
        radius: 0.22,
        color: currentTheme === "dark" ? "#FFFF7F40" : "#00000040",
        shape: "circle",
        backgroundColor: currentTheme === "dark" ? "black" : "white",
      }),
    [map, currentTheme]
  );

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  // Calculate animation timing
  const staggerDelay = 0.35;
  const totalAnimationTime = dots.length * staggerDelay + animationDuration;
  const pauseTime = 2; // Pause when all paths are drawn
  const fullCycleDuration = totalAnimationTime + pauseTime;

  // Extract unique points to render each country beacon and label cleanly once
  const uniquePoints = useMemo(() => {
    const pointsMap = new Map<
      string,
      { x: number; y: number; label?: string }
    >();
    dots.forEach((dot) => {
      const s = projectPoint(dot.start.lat, dot.start.lng);
      const e = projectPoint(dot.end.lat, dot.end.lng);
      const k1 = `${s.x.toFixed(1)},${s.y.toFixed(1)}`;
      const k2 = `${e.x.toFixed(1)},${e.y.toFixed(1)}`;
      if (!pointsMap.has(k1)) pointsMap.set(k1, { ...s, label: dot.start.label });
      if (!pointsMap.has(k2)) pointsMap.set(k2, { ...e, label: dot.end.label });
    });
    return Array.from(pointsMap.values());
  }, [dots]);

  return (
    <div
      className={`w-full aspect-[2/1] md:aspect-[2.6/1] lg:aspect-[2.8/1] max-h-[420px] dark:bg-black bg-white rounded-lg relative font-sans overflow-hidden ${
        className || ""
      }`}
    >
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_8%,white_90%,transparent)] pointer-events-none select-none object-cover object-top"
        alt="world map"
        height="495"
        width="1056"
        draggable={false}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0 pointer-events-auto select-none"
        preserveAspectRatio="xMidYMin slice"
      >
        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          <filter id="glow">
            <feMorphology operator="dilate" radius="0.5" />
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Traveling Connecting Lines */}
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);

          const startTime = (i * staggerDelay) / fullCycleDuration;
          const endTime =
            (i * staggerDelay + animationDuration) / fullCycleDuration;
          const resetTime = totalAnimationTime / fullCycleDuration;

          return (
            <g key={`path-group-${i}`}>
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={
                  loop
                    ? {
                        pathLength: [0, 0, 1, 1, 0],
                      }
                    : {
                        pathLength: 1,
                      }
                }
                transition={
                  loop
                    ? {
                        duration: fullCycleDuration,
                        times: [0, startTime, endTime, resetTime, 1],
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 0,
                      }
                    : {
                        duration: animationDuration,
                        delay: i * staggerDelay,
                        ease: "easeInOut",
                      }
                }
              />
            </g>
          );
        })}

        {/* Fixed Country Beacons & Labels */}
        {uniquePoints.map((point, i) => (
          <g key={`point-node-${i}`}>
            <motion.g
              onHoverStart={() =>
                setHoveredLocation(point.label || `Location ${i}`)
              }
              onHoverEnd={() => setHoveredLocation(null)}
              className="cursor-pointer"
              whileHover={{ scale: 1.25 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {/* Outer pulsing ring */}
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill={lineColor}
                opacity="0.4"
              >
                <animate
                  attributeName="r"
                  from="3"
                  to="11"
                  dur="2s"
                  begin={`${(i * 0.25) % 2}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.6"
                  to="0"
                  dur="2s"
                  begin={`${(i * 0.25) % 2}s`}
                  repeatCount="indefinite"
                />
              </circle>

              {/* Glowing center point */}
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill={lineColor}
                filter="url(#glow)"
                className="drop-shadow-lg"
              />
              <circle cx={point.x} cy={point.y} r="1.2" fill="#ffffff" />
            </motion.g>

            {/* Country Name Badge */}
            {showLabels && point.label && (
              <motion.g
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * i + 0.2, duration: 0.4 }}
                className="pointer-events-none"
              >
                <foreignObject
                  x={point.x - 60}
                  y={point.y - 30}
                  width="120"
                  height="24"
                  className="block"
                >
                  <div className="flex items-center justify-center h-full">
                    <span
                      className={`font-medium px-1.5 py-0.5 rounded bg-white/95 dark:bg-black/95 text-black dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm whitespace-nowrap text-[9px] sm:text-[11px] ${labelClassName}`}
                    >
                      {point.label}
                    </span>
                  </div>
                </foreignObject>
              </motion.g>
            )}
          </g>
        ))}
      </svg>

      {/* Mobile Tooltip */}
      <AnimatePresence>
        {hoveredLocation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/90 text-black dark:text-white px-3 py-2 rounded-lg text-xs font-medium backdrop-blur-sm sm:hidden border border-gray-200 dark:border-gray-700"
          >
            {hoveredLocation}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WorldMap;
