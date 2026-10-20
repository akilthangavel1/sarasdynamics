"use client";

import { motion } from "framer-motion";

export default function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Soft gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-50/60 via-white to-white" />

      {/* Grid pattern overlay */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.035]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="hero17-grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M40 0H0V40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero17-grid)" />
      </svg>

      {/* Top-left teal orb */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.25, 0.35, 0.25],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl"
      />

      {/* Bottom-right emerald orb */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute -right-32 -bottom-32 h-[28rem] w-[28rem] rounded-full bg-emerald-200/25 blur-3xl"
      />

      {/* Center accent dot cluster */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="relative h-[500px] w-[500px] opacity-[0.04]"
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-teal-600"
              style={{
                top: `${50 + 45 * Math.sin((i * Math.PI * 2) / 6)}%`,
                left: `${50 + 45 * Math.cos((i * Math.PI * 2) / 6)}%`,
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
