"use client";

import React from "react";
import { WorldMap } from "@/components/ui/map";

export interface MapDemoProps {
  heading?: React.ReactNode;
  description?: string;
  className?: string;
}

export function MapDemo({
  heading,
  description = "We work across time zones so your project keeps moving, even while you sleep.",
  className = "",
}: MapDemoProps = {}) {
  return (
    <section className={`py-24 md:py-36 dark:bg-black bg-white w-full border-t border-zinc-200/80 ${className}`}>
      <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 mb-12">
        <h2 className="font-bold text-2xl md:text-5xl dark:text-white text-black tracking-tight">
          {heading ?? (
            <>
              Global Clients, <span className="text-neutral-400">Local-Level Service</span>
            </>
          )}
        </h2>
        <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto py-4 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <WorldMap
          dots={[
            {
              start: {
                lat: 37.0902,
                lng: -95.7129,
                label: "United States",
              },
              end: {
                lat: -14.235,
                lng: -51.9253,
                label: "Brazil",
              },
            },
            {
              start: {
                lat: -14.235,
                lng: -51.9253,
                label: "Brazil",
              },
              end: {
                lat: 39.3999,
                lng: -8.2245,
                label: "Portugal",
              },
            },
            {
              start: {
                lat: 37.0902,
                lng: -95.7129,
                label: "United States",
              },
              end: {
                lat: 55.3781,
                lng: -3.436,
                label: "United Kingdom",
              },
            },
            {
              start: {
                lat: 55.3781,
                lng: -3.436,
                label: "United Kingdom",
              },
              end: {
                lat: 20.5937,
                lng: 78.9629,
                label: "India",
              },
            },
            {
              start: {
                lat: 20.5937,
                lng: 78.9629,
                label: "India",
              },
              end: {
                lat: 61.524,
                lng: 105.3188,
                label: "Russia",
              },
            },
            {
              start: {
                lat: 20.5937,
                lng: 78.9629,
                label: "India",
              },
              end: {
                lat: -0.0236,
                lng: 37.9062,
                label: "Kenya",
              },
            },
            {
              start: {
                lat: 20.5937,
                lng: 78.9629,
                label: "India",
              },
              end: {
                lat: 36.2048,
                lng: 138.2529,
                label: "Japan",
              },
            },
          ]}
        />
      </div>
    </section>
  );
}

export default MapDemo;
