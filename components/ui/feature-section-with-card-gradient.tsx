import React from "react";
import { useId } from "react";

interface FeaturesSectionWithCardGradientProps {
  eyebrow?: string;
  title?: string;
  description?: string;
}

export function FeaturesSectionWithCardGradient({
  eyebrow = "END-TO-END WEB SERVICES",
  title = "Engineered for\nScale & Performance",
  description = "From custom web applications to scalable cloud platforms, we design and build modern digital products tailored to your business goals.",
}: FeaturesSectionWithCardGradientProps = {}) {
  return (
    <div className="py-20 lg:py-28 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
      {/* Title Header Section matching Saras Dynamics standard */}
      <div className="w-full grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6 md:gap-10 lg:gap-12 mb-12 sm:mb-16">
        {/* Left Column: Eyebrow with red accent line & Title */}
        <div className="flex flex-col items-start gap-3">
          {eyebrow && (
            <div className="flex items-center gap-3.5">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-zinc-900 dark:text-zinc-100">
                {eyebrow}
              </span>
              <span
                className="inline-block w-20 sm:w-24 h-[2px] bg-[#c30000] rounded-sm shrink-0"
                aria-hidden="true"
              />
            </div>
          )}
          {title && (
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white sm:text-4xl md:text-5xl leading-[1.08] text-balance">
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
          className="hidden md:block w-px h-16 lg:h-20 bg-zinc-200 dark:bg-zinc-800 shrink-0"
          aria-hidden="true"
        />

        {/* Right Column: Description positioned at right */}
        {description && (
          <div className="flex flex-col justify-center max-w-md md:ml-auto">
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {description}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 md:gap-4">
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
