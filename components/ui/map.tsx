"use client";

import React, { useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DottedMapPkg from "dotted-map";

// Safe interop for dotted-map ESM/CJS bundling
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
  theme?: "light" | "dark";
}

export function WorldMap({
  dots = [],
  lineColor = "#0ea5e9",
  showLabels = false,
  labelClassName = "text-sm",
  animationDuration = 2,
  loop = false,
  theme = "light",
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  const map = useMemo(
    () => new DottedMap({ height: 100, grid: "diagonal" }),
    []
  );

  const svgMap = useMemo(
    () =>
      map.getSVG({
        radius: 0.25,
        color: theme === "dark" ? "#FFFF7F40" : "#94a3b8",
        shape: "circle",
        backgroundColor: theme === "dark" ? "black" : "white",
      }),
    [map, theme]
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
  const pauseTime = 1.5; // Pause when all paths are drawn
  const fullCycleDuration = totalAnimationTime + pauseTime;

  // Extract all unique point coordinates
  const uniquePoints = useMemo(() => {
    const pointsMap = new Map<string, { x: number; y: number; label?: string }>();
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
    <div className="w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[2/1] bg-white rounded-2xl relative font-sans overflow-hidden select-none">
      {svgMap && (
        <img
          src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
          className="h-full w-full pointer-events-none select-none object-contain opacity-95"
          alt="world map"
          height="400"
          width="800"
          draggable={false}
        />
      )}

      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0 pointer-events-auto select-none"
        preserveAspectRatio="xMidYMid meet"
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
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Curved Connection Lines with smooth stroke-path animation */}
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          const pathD = createCurvedPath(startPoint, endPoint);

          const startTime = (i * staggerDelay) / fullCycleDuration;
          const endTime = (i * staggerDelay + animationDuration) / fullCycleDuration;
          const resetTime = totalAnimationTime / fullCycleDuration;

          return (
            <g key={`path-group-${i}`}>
              {/* Animated Glowing Connection Line */}
              <motion.path
                d={pathD}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="1.8"
                strokeLinecap="round"
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

        {/* Fixed Location Pulsing Beacons */}
        {uniquePoints.map((point, i) => (
          <g key={`point-node-${i}`} className="cursor-pointer">
            <motion.g
              onHoverStart={() => setHoveredLocation(point.label || `Location ${i}`)}
              onHoverEnd={() => setHoveredLocation(null)}
              whileHover={{ scale: 1.25 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {/* Pulse Outer Ripple */}
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
                  to="13"
                  dur="2.2s"
                  begin={`${(i * 0.3) % 2}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.6"
                  to="0"
                  dur="2.2s"
                  begin={`${(i * 0.3) % 2}s`}
                  repeatCount="indefinite"
                />
              </circle>

              {/* Solid Glow Center Point */}
              <circle
                cx={point.x}
                cy={point.y}
                r="3.5"
                fill={lineColor}
                filter="url(#glow)"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="1.5"
                fill="#ffffff"
              />
            </motion.g>

            {showLabels && point.label && (
              <motion.g
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 * i + 0.2, duration: 0.4 }}
                className="pointer-events-none"
              >
                <foreignObject
                  x={point.x - 50}
                  y={point.y - 32}
                  width="100"
                  height="28"
                  className="block"
                >
                  <div className="flex items-center justify-center h-full">
                    <span
                      className={`font-medium px-2 py-0.5 rounded-md bg-white/95 text-zinc-900 border border-zinc-200 shadow-sm ${labelClassName}`}
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
            className="absolute bottom-4 left-4 bg-white/95 text-zinc-900 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md border border-zinc-200"
          >
            {hoveredLocation}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WorldMap;
