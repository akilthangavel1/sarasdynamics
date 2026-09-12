import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import React, { useState, useId, useRef } from "react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { Button } from "@/components/ui/button";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

// Vite-compatible Image element supporting fill and sizing
type ImageProps = React.ComponentPropsWithoutRef<"img"> & {
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
};

const Image = ({ fill, priority, className, sizes, ...props }: ImageProps) => (
  <img
    className={cn(fill && "absolute inset-0 w-full h-full object-cover", className)}
    loading={priority ? "eager" : "lazy"}
    {...props}
  />
);

// Portfolio project case studies
export interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  src: string;
  alt: string;
  rotation?: number;
  x?: number;
  y?: number;
  zIndex?: number;
}

const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: "project-1",
    title: "Aegis Neural Engine",
    category: "AI & Autonomous Systems",
    description: "Enterprise RAG knowledge engine & real-time autonomous decision agents.",
    tags: ["Python", "PyTorch", "Next.js"],
    src: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
    alt: "Aegis Neural Engine - AI Architecture",
    rotation: -14,
    x: -90,
    y: 10,
    zIndex: 10,
  },
  {
    id: "project-2",
    title: "Apex FinTech Terminal",
    category: "Web Architecture",
    description: "High-frequency trading telemetry console with sub-millisecond execution.",
    tags: ["React", "TypeScript", "WebSockets"],
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    alt: "Apex FinTech Terminal - Financial Web App",
    rotation: -2,
    x: -10,
    y: -15,
    zIndex: 20,
  },
  {
    id: "project-3",
    title: "Nexus Health Wearable",
    category: "Mobile Engineering",
    description: "Offline-first bio-telemetry companion app with biometric sensors integration.",
    tags: ["iOS", "Android", "React Native"],
    src: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80",
    alt: "Nexus Health Wearable - Mobile App",
    rotation: 12,
    x: 75,
    y: 5,
    zIndex: 30,
  },
  {
    id: "project-4",
    title: "Stratos Cloud Mesh",
    category: "Cloud Infrastructure",
    description: "Multi-region Kubernetes mesh orchestrator with zero-downtime rollouts.",
    tags: ["Kubernetes", "Docker", "Go"],
    src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    alt: "Stratos Cloud Mesh - Cloud Architecture",
  },
  {
    id: "project-5",
    title: "OmniFlow Automation",
    category: "Intelligent Automation",
    description: "Autonomous supply chain ETL pipeline and business process automation.",
    tags: ["Node.js", "PostgreSQL", "Kafka"],
    src: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    alt: "OmniFlow Automation - Workflow Engine",
  },
  {
    id: "project-6",
    title: "Lumina Design System",
    category: "UI/UX Architecture",
    description: "Design tokens, accessible component library, and fluid motion system.",
    tags: ["Figma", "Tailwind", "Radix UI"],
    src: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80",
    alt: "Lumina Design System - UI System",
  },
  {
    id: "project-7",
    title: "Pulse Developer Studio",
    category: "Developer Tools",
    description: "Collaborative code analysis and instant containerized sandbox environments.",
    tags: ["Rust", "WASM", "React"],
    src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    alt: "Pulse Developer Studio - Dev Tooling",
  },
  {
    id: "project-8",
    title: "Chrono Global Logistics",
    category: "Enterprise Web",
    description: "Worldwide fleet routing optimization with predictive traffic forecasting.",
    tags: ["Next.js", "Mapbox", "Python"],
    src: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
    alt: "Chrono Global Logistics - Fleet System",
  },
  {
    id: "project-9",
    title: "Veloce Commerce Engine",
    category: "Mobile & Web App",
    description: "Headless luxury digital shopping platform with instant checkout & 3D previews.",
    tags: ["SwiftUI", "GraphQL", "Stripe"],
    src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80",
    alt: "Veloce Commerce Engine - Modern Commerce",
  },
];

const transition = {
  type: "spring",
  stiffness: 160,
  damping: 18,
  mass: 1,
} as const;

export function ExpandableGallery() {
  const [isExpanded, setIsExpanded] = useState(false);
  const layoutGroupId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useOutsideClick(containerRef, () => {
    if (isExpanded) {
      setIsExpanded(false);
    }
  });

  return (
    <section
      id="expandable-gallery-section"
      className="relative w-full px-4 md:px-8 bg-white flex flex-col items-center justify-start min-h-[750px] md:min-h-[850px] overflow-hidden py-16 md:py-20 border-t border-zinc-200/80 select-none"
    >
      <LayoutGroup id={layoutGroupId}>
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
          {/* Portfolio Section Header */}
          <div className="w-full mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
            <div>
              <div className="inline-flex items-center gap-2 mb-2.5">
                <span className="w-2 h-2 rounded-full bg-[#c30000]" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-zinc-900">
                  Featured Portfolio
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 uppercase">
                Selected Works &amp; Deployments
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-medium text-zinc-500 max-w-sm leading-relaxed">
              Production architectures, enterprise AI platforms, and bespoke digital products built by Saras Dynamics.
            </p>
          </div>

          <div className="w-full h-12 flex items-center justify-between px-2 mb-2">
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  key="expanded-bar"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full flex items-center justify-between"
                >
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="flex items-center gap-2 text-zinc-700 hover:text-black transition-colors group z-50 cursor-pointer"
                  >
                    <div className="p-2 rounded-full bg-zinc-100 group-hover:bg-zinc-200 transition-colors text-zinc-900">
                      <HugeiconsIcon
                        icon={ArrowLeft01Icon}
                        width={20}
                        height={20}
                      />
                    </div>
                    <span className="font-bold text-sm tracking-wide">Back to Overview</span>
                  </button>

                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest hidden sm:inline-block">
                    9 Featured Case Studies
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            ref={containerRef}
            layout
            className={cn(
              "relative w-full",
              isExpanded
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-2"
                : "flex flex-col items-center justify-start pt-4"
            )}
            transition={transition}
          >
            <div
              className={cn(
                "relative",
                isExpanded
                  ? "contents"
                  : "h-[450px] w-full flex items-center justify-center mb-8"
              )}
            >
              {PORTFOLIO_PROJECTS.map((project, index) => {
                const isPrimary = index < 3;
                if (!isPrimary && !isExpanded) return null;

                return (
                  <motion.div
                    key={`card-${project.id}`}
                    layoutId={`card-container-${project.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: !isExpanded ? project.rotation || 0 : 0,
                      x: !isExpanded ? project.x || 0 : 0,
                      y: !isExpanded ? project.y || 0 : 0,
                      zIndex: !isExpanded ? project.zIndex || index : 10,
                    }}
                    transition={transition}
                    whileHover={
                      !isExpanded
                        ? {
                            scale: 1.05,
                            y: (project.y || 0) - 15,
                            rotate: (project.rotation || 0) * 0.8,
                            zIndex: 50,
                            transition: {
                              type: "spring",
                              stiffness: 400,
                              damping: 25,
                            },
                          }
                        : { scale: 1.02 }
                    }
                    className={cn(
                      "cursor-pointer overflow-hidden group transition-shadow duration-300",
                      isExpanded
                        ? "relative rounded-2xl md:rounded-3xl border border-zinc-200 bg-white shadow-sm hover:shadow-xl flex flex-col"
                        : "absolute w-44 h-44 md:w-60 md:h-60 rounded-[2.5rem] md:rounded-[3rem] border-[6px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.12)] bg-zinc-100"
                    )}
                    onClick={() => !isExpanded && setIsExpanded(true)}
                  >
                    <motion.div
                      layoutId={`image-inner-${project.id}`}
                      layout="position"
                      className={cn(
                        "relative w-full overflow-hidden",
                        isExpanded ? "aspect-[16/10]" : "h-full"
                      )}
                      transition={transition}
                    >
                      <Image
                        src={project.src}
                        alt={project.alt}
                        fill
                        referrerPolicy="no-referrer"
                        className="object-cover select-none pointer-events-none group-hover:scale-105 transition-transform duration-500"
                        sizes={
                          isExpanded
                            ? "(max-width: 1024px) 50vw, 33vw"
                            : "240px"
                        }
                        priority={isPrimary}
                      />
                      {/* Gradient overlay in expanded view */}
                      {isExpanded && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                    </motion.div>

                    {/* Metadata displayed in expanded view */}
                    {isExpanded && (
                      <div className="p-5 flex flex-col flex-1 justify-between bg-white border-t border-zinc-100">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#c30000]">
                              {project.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-zinc-900 group-hover:text-[#c30000] transition-colors">
                            {project.title}
                          </h3>
                          <p className="mt-1 text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                            {project.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-zinc-100 flex flex-wrap gap-1.5">
                          {project.tags.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-700"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <AnimatePresence>
              {!isExpanded && (
                <motion.div
                  key="stack-content"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center max-w-2xl space-y-6"
                >
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-zinc-900 uppercase leading-tight">
                    ARCHITECTED FOR SCALE. <br className="hidden md:block" />
                    ENGINEERED FOR IMPACT.
                  </h3>
                  <p className="text-sm md:text-base text-zinc-600 font-medium">
                    From autonomous AI decision platforms to high-frequency web architectures, examine our selected client and proprietary deployments.
                  </p>

                  <div className="flex justify-center pt-2">
                    <Button
                      variant="default"
                      onClick={() => setIsExpanded(true)}
                      className="rounded-full cursor-pointer py-6 px-8 bg-zinc-900 text-white hover:bg-zinc-800 font-semibold group gap-2 shadow-md hover:shadow-lg transition-all"
                    >
                      <span>Explore Portfolio Case Studies (9)</span>
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className="transition-transform group-hover:translate-x-1 text-[#c30000]"
                        width={20}
                        height={20}
                      />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </LayoutGroup>
    </section>
  );
}

export default ExpandableGallery;
