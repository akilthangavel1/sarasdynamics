"use client";

import React from "react";
import { WorldMap } from "@/components/ui/world-map";
import { motion } from "framer-motion";

export function WorldMapDemo() {
  return (
    <section
      id="world-map-section"
      className="py-12 md:py-16 bg-white w-full border-t border-zinc-200/80 relative overflow-hidden"
    >
      {/* Subtle Background Decorative Dots */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div
        id="world-map-container"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        <div className="flex flex-col gap-8 sm:gap-10">
          {/* Top-aligned Statement Header matching requested design */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full text-left max-w-4xl"
          >
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-[2rem] font-normal text-zinc-900 leading-snug sm:leading-relaxed tracking-tight">
              We’re a collective of individuals from across the world driven by bold ideas and diverse perspectives, working together to transform big vision into brand value through clarity & chemistry.
            </p>
          </motion.div>

          {/* Full-width Map Container directly beneath statement with reduced height */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col justify-center"
          >
            <div className="w-full bg-white rounded-2xl p-1 sm:p-2">
              <WorldMap
                className="max-h-[280px] sm:max-h-[330px] md:max-h-[360px]"
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
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default WorldMapDemo;

