import React from "react";
import { useId } from "react";

interface FeaturesSectionWithCardGradientProps {
  eyebrow?: string;
  title?: string;
}

export function FeaturesSectionWithCardGradient({
  eyebrow = "END-TO-END WEB SERVICES",
  title = "ENGINEERED FOR SCALE & PERFORMANCE",
}: FeaturesSectionWithCardGradientProps = {}) {
  return (
    <div className="py-20 lg:py-32 px-4 sm:px-6 md:px-8">
      {/* Title Header Section */}
      <div className="text-center max-w-4xl mx-auto mb-12 md:mb-16">
        <h2 className="font-['Bebas_Neue',sans-serif] tracking-tight uppercase select-none">
          <span className="block text-lg sm:text-2xl md:text-3xl lg:text-[2.1rem] text-neutral-500 dark:text-neutral-400 mb-1 leading-tight tracking-normal">
            {eyebrow}
          </span>
          <span className="block text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-black dark:text-white leading-[0.9]">
            {title}
          </span>
        </h2>
        {/* Red accent line below title */}
        <div className="w-36 sm:w-56 md:w-72 lg:w-[360px] max-w-[80%] h-[2px] bg-[#c30000] mx-auto mt-3 rounded-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 md:gap-4 max-w-7xl mx-auto">
        {grid.map((feature) => (
          <div
            key={feature.title}
            className="relative bg-gradient-to-b dark:from-neutral-900 from-neutral-100 dark:to-neutral-950 to-white p-6 rounded-3xl overflow-hidden border border-zinc-200/60 dark:border-zinc-800/60"
          >
            <Grid size={20} />
            <p className="text-base font-bold text-neutral-800 dark:text-white relative z-20">
              {feature.title}
            </p>
            <p className="text-neutral-600 dark:text-neutral-400 mt-4 text-sm sm:text-base font-normal leading-relaxed relative z-20">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const grid = [
  {
    title: "Custom Websites",
    description:
      "Bespoke brand and marketing websites built for high engagement, pixel-perfect visual fidelity, and fluid interactivity.",
  },
  {
    title: "Web Apps",
    description:
      "High-performance, reactive web applications built with modern frontend frameworks, real-time sync, and scalable cloud architectures.",
  },
  {
    title: "E-commerce",
    description:
      "High-converting digital commerce storefronts, custom checkout pipelines, payment gateway integrations, and inventory workflows.",
  },
  {
    title: "SaaS Platforms",
    description:
      "Multi-tenant cloud architectures, subscription billing, client management portals, and secure role-based dashboards.",
  },
  {
    title: "CMS & Headless",
    description:
      "Flexible headless CMS architectures enabling rapid content authoring, decoupled frontends, and unified omnichannel distribution.",
  },
  {
    title: "APIs & Integrations",
    description:
      "Resilient REST & GraphQL APIs, microservice orchestrations, webhooks, and seamless enterprise system integrations.",
  },
  {
    title: "Performance & SEO",
    description:
      "Sub-second load times, Core Web Vitals optimization, edge caching, serverless rendering, and top-tier search visibility.",
  },
  {
    title: "Security & Maintenance",
    description:
      "Enterprise-grade security audits, automated testing, continuous deployment pipelines, and proactive 24/7 system monitoring.",
  },
];

export const Grid = ({
  pattern,
  size,
}: {
  pattern?: number[][];
  size?: number;
}) => {
  const p = pattern ?? [
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
  ];
  return (
    <div className="pointer-events-none absolute left-1/2 top-0  -ml-20 -mt-2 h-full w-full [mask-image:linear-gradient(white,transparent)]">
      <div className="absolute inset-0 bg-gradient-to-r  [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-zinc-900/30 from-zinc-100/30 to-zinc-300/30 dark:to-zinc-900/30 opacity-100">
        <GridPattern
          width={size ?? 20}
          height={size ?? 20}
          x="-12"
          y="4"
          squares={p}
          className="absolute inset-0 h-full w-full  mix-blend-overlay dark:fill-white/10 dark:stroke-white/10 stroke-black/10 fill-black/10"
        />
      </div>
    </div>
  );
};

export function GridPattern({ width, height, x, y, squares, ...props }: any) {
  const patternId = useId();

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y]: any) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}`}
              width={width + 1}
              height={height + 1}
              x={x * width}
              y={y * height}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}
