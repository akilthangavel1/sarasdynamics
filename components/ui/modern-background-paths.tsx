"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

// Geometric Grid Paths
function GeometricPaths() {
  const gridSize = 40;
  const paths: { id: string; d: string; delay: number }[] = [];

  for (let x = 0; x < 20; x++) {
    for (let y = 0; y < 12; y++) {
      if (Math.random() > 0.7) {
        paths.push({
          id: `grid-${x}-${y}`,
          d: `M${x * gridSize},${y * gridSize} L${(x + 1) * gridSize},${y * gridSize} L${(x + 1) * gridSize},${(y + 1) * gridSize} L${x * gridSize},${(y + 1) * gridSize} Z`,
          delay: Math.random() * 5,
        });
      }
    }
  }

  return (
    <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 800 480">
      {paths.map((path) => (
        <motion.path
          key={path.id}
          d={path.d}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 0],
            opacity: [0, 0.6, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            delay: path.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
}

// Organic Flow Paths
function FlowPaths() {
  const flowPaths = Array.from({ length: 12 }, (_, i) => {
    const amplitude = 50 + i * 10;
    const offset = i * 60;

    return {
      id: `flow-${i}`,
      d: `M-100,${200 + offset} Q200,${200 + offset - amplitude} 500,${200 + offset} T900,${200 + offset}`,
      strokeWidth: 1 + i * 0.3,
      opacity: 0.1 + i * 0.05,
      delay: i * 0.8,
    };
  });

  return (
    <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 800 800">
      {flowPaths.map((path) => (
        <motion.path
          key={path.id}
          d={path.d}
          fill="none"
          stroke="currentColor"
          strokeWidth={path.strokeWidth}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{
            pathLength: [0, 1, 0.8, 0],
            opacity: [0, path.opacity, path.opacity * 0.7, 0],
          }}
          transition={{
            duration: 15,
            delay: path.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
}

// Neural Network Paths
function NeuralPaths() {
  const nodes = Array.from({ length: 50 }, (_, i) => ({
    x: Math.random() * 800,
    y: Math.random() * 600,
    id: `node-${i}`,
  }));

  const connections: { id: string; d: string; delay: number }[] = [];
  nodes.forEach((node, i) => {
    const nearbyNodes = nodes.filter((other, j) => {
      if (i === j) return false;
      const distance = Math.sqrt(
        Math.pow(node.x - other.x, 2) + Math.pow(node.y - other.y, 2)
      );
      return distance < 120 && Math.random() > 0.6;
    });

    nearbyNodes.forEach((target) => {
      connections.push({
        id: `conn-${i}-${target.id}`,
        d: `M${node.x},${node.y} L${target.x},${target.y}`,
        delay: Math.random() * 10,
      });
    });
  });

  return (
    <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 800 600">
      {connections.map((conn) => (
        <motion.path
          key={conn.id}
          d={conn.d}
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 6,
            delay: conn.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      {nodes.map((node) => (
        <motion.circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r="2"
          fill="currentColor"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 1.2, 1],
            opacity: [0, 0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
}

// Spiral Paths
function SpiralPaths() {
  const spirals = Array.from({ length: 8 }, (_, i) => {
    const centerX = 400 + ((i % 4) - 1.5) * 200;
    const centerY = 300 + Math.floor(i / 4 - 0.5) * 200;
    const radius = 80 + i * 15;
    const turns = 3 + i * 0.5;

    let path = `M${centerX + radius},${centerY}`;
    for (let angle = 0; angle <= turns * 360; angle += 5) {
      const radian = (angle * Math.PI) / 180;
      const currentRadius = radius * (1 - angle / (turns * 360));
      const x = centerX + currentRadius * Math.cos(radian);
      const y = centerY + currentRadius * Math.sin(radian);
      path += ` L${x},${y}`;
    }

    return {
      id: `spiral-${i}`,
      d: path,
      delay: i * 1.2,
    };
  });

  return (
    <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 800 600">
      {spirals.map((spiral) => (
        <motion.path
          key={spiral.id}
          d={spiral.d}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{
            pathLength: [0, 1, 0],
            rotate: [0, 360],
          }}
          transition={{
            pathLength: { duration: 12, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            delay: spiral.delay,
          }}
        />
      ))}
    </svg>
  );
}

export interface EnhancedBackgroundPathsProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  onSecondaryClick?: () => void;
  onBackToHome?: () => void;
}

export function EnhancedBackgroundPaths({
  title = "Neural Dynamics",
  subtitle = "Experience the future of interactive design with dynamic pattern generation",
  badge,
  ctaText = "Explore Patterns",
  onCtaClick,
  onSecondaryClick,
  onBackToHome,
}: EnhancedBackgroundPathsProps) {
  const [currentPattern, setCurrentPattern] = useState(0);
  const patterns = ["neural", "flow", "geometric", "spiral"];
  const words = title.split(" ");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPattern((prev) => (prev + 1) % patterns.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const renderPattern = () => {
    switch (currentPattern) {
      case 0:
        return <NeuralPaths />;
      case 1:
        return <FlowPaths />;
      case 2:
        return <GeometricPaths />;
      case 3:
        return <SpiralPaths />;
      default:
        return <NeuralPaths />;
    }
  };

  return (
    <div className="relative min-h-[75vh] md:min-h-[85vh] w-full flex items-center justify-center overflow-hidden bg-white">
      {/* Dynamic Background Patterns */}
      <div className="absolute inset-0 text-zinc-300 pointer-events-none opacity-40">
        <motion.div
          key={currentPattern}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
        >
          {renderPattern()}
        </motion.div>
      </div>

      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/70 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          {badge && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-zinc-200 text-xs font-semibold uppercase tracking-wider text-zinc-800 shadow-xs mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c30000]" />
              </span>
              <span>{badge}</span>
            </motion.div>
          )}

          {/* Main Title */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-4 tracking-tight leading-[1.05]">
              {words.map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block mr-3 sm:mr-5 last:mr-0">
                  {word.split("").map((letter, letterIndex) => (
                    <motion.span
                      key={`${wordIndex}-${letterIndex}`}
                      initial={{ y: 60, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        delay: wordIndex * 0.12 + letterIndex * 0.04,
                        type: "spring",
                        stiffness: 120,
                        damping: 18,
                      }}
                      className="inline-block text-zinc-900 hover:text-[#c30000] transition-colors duration-300 cursor-default"
                      whileHover={{ scale: 1.04, y: -2 }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </span>
              ))}
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-base sm:text-lg md:text-xl text-zinc-600 font-normal tracking-normal max-w-2xl mx-auto leading-relaxed"
            >
              {subtitle}
            </motion.p>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.8,
              duration: 0.6,
              ease: "easeOut",
            }}
            className="flex flex-wrap items-center justify-center gap-3.5"
          >
            <button
              onClick={onCtaClick}
              className="group inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm sm:text-base font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-sm active:scale-98 cursor-pointer"
            >
              <span>{ctaText}</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>

            {onSecondaryClick && (
              <button
                onClick={onSecondaryClick}
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm sm:text-base font-semibold bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50 transition-all shadow-2xs active:scale-98 cursor-pointer"
              >
                Start a Project
              </button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default EnhancedBackgroundPaths;
