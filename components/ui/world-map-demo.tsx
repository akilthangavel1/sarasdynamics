"use client";

import React from "react";
import { WorldMap } from "@/components/ui/world-map";
import { motion } from "framer-motion";

export function WorldMapDemo() {
  return (
    <section
      id="world-map-section"
      className="py-16 md:py-24 bg-white w-full border-t border-zinc-200/80 relative overflow-hidden"
    >
      {/* Subtle Background Decorative Dots */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div
        id="world-map-container"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Content & Metrics */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col justify-center text-left"
          >
            {/* Top Accent Gradient Bar */}
            <div className="w-40 h-[3px] bg-gradient-to-r from-blue-600 via-blue-400 to-transparent rounded-full mb-6" />

            {/* Main Section Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-950 tracking-tight leading-[1.1] mb-5">
              How It All <span className="text-blue-600">Started</span>
            </h2>

            {/* Narrative Story Description */}
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal mb-8 max-w-lg">
              EcoFlow was founded in 2017 by a group of battery engineers with a shared vision: to make clean, reliable energy accessible everywhere. Today, we deliver industry-leading portable power, solar technology, and smart home energy solutions.
            </p>

            {/* 4-Column Stat Metrics with Vertical Dividers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2 pt-4 border-t border-zinc-200/90">
              {/* Metric 1 */}
              <div className="flex flex-col pr-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight">
                  5M+
                </span>
                <span className="text-xs font-medium text-zinc-600 mt-1">
                  Global Users
                </span>
              </div>

              {/* Metric 2 */}
              <div className="flex flex-col sm:border-l sm:border-zinc-200/90 sm:pl-3 pr-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight">
                  140+
                </span>
                <span className="text-xs font-medium text-zinc-600 mt-1 leading-tight">
                  Countries & Regions
                </span>
              </div>

              {/* Metric 3 */}
              <div className="flex flex-col sm:border-l sm:border-zinc-200/90 sm:pl-3 pr-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight">
                  1,129
                </span>
                <span className="text-xs font-medium text-zinc-600 mt-1">
                  Patents
                </span>
              </div>

              {/* Metric 4 */}
              <div className="flex flex-col sm:border-l sm:border-zinc-200/90 sm:pl-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight">
                  60+
                </span>
                <span className="text-xs font-medium text-zinc-600 mt-1 leading-tight">
                  Global Business Partners
                </span>
              </div>
            </div>

            {/* Faint Caption Footer */}
            <span className="text-xs text-zinc-400 font-medium mt-6">
              Global footprint at a glance
            </span>
          </motion.div>

          {/* Right Column: World Map with Continuous Laser Flow & Glowing Radar Nodes */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            <div className="w-full bg-white/80 rounded-2xl p-2 sm:p-4">
              <WorldMap
                lineColor="#0ea5e9"
                theme="light"
                showLabels={false}
                loop={false}
                dots={[
                  {
                    start: { lat: 37.7749, lng: -122.4194 },
                    end: { lat: -14.235, lng: -51.9253 },
                  },
                  {
                    start: { lat: -14.235, lng: -51.9253 },
                    end: { lat: 51.1657, lng: 10.4515 },
                  },
                  {
                    start: { lat: 51.1657, lng: 10.4515 },
                    end: { lat: 20.5937, lng: 78.9629 },
                  },
                  {
                    start: { lat: 20.5937, lng: 78.9629 },
                    end: { lat: 36.2048, lng: 138.2529 },
                  },
                  {
                    start: { lat: 36.2048, lng: 138.2529 },
                    end: { lat: -25.2744, lng: 133.7751 },
                  },
                  {
                    start: { lat: -25.2744, lng: 133.7751 },
                    end: { lat: 37.7749, lng: -122.4194 },
                  },
                ]}
              />

              {/* Bottom Right Presence Legend */}
              <div className="flex items-center justify-end gap-2.5 mt-4 pr-3 text-xs font-semibold text-zinc-600">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600" />
                </span>
                <span>Global network active</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default WorldMapDemo;
