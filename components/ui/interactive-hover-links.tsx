import { useMotionValue, motion, useSpring, useTransform } from "motion/react";
import React, { useRef } from "react";
import { ArrowRight } from "lucide-react";

export interface LinkProps {
  heading: string;
  imgSrc: string;
  subheading: string;
  href: string;
  tag?: string;
  key?: React.Key;
}

export interface InteractiveHoverLinksProps {
  links?: LinkProps[];
}

export function InteractiveHoverLinks({
  links = INTERACTIVE_LINKS,
}: InteractiveHoverLinksProps) {
  return (
    <section id="interactive-links-section" className="bg-white p-6 sm:p-8 md:px-12 md:py-20 w-full border-t border-zinc-200/80 select-none">
      <div className="mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="mb-10 sm:mb-14 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
          <div>
            <div className="inline-flex items-center gap-2 mb-2.5">
              <span className="w-2 h-2 rounded-full bg-[#c30000]" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-zinc-900">
                Services &amp; Solutions
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 uppercase">
              What We Build &amp; Deliver
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-medium text-zinc-500 max-w-sm leading-relaxed">
            Enterprise software, autonomous intelligence, and high-performance digital experiences crafted for scale.
          </p>
        </div>

        <div className="divide-y divide-zinc-200">
          {links.map((link) => (
            <LinkItem key={link.heading} {...link} />
          ))}
        </div>
      </div>
    </section>
  );
}

function LinkItem({ heading, imgSrc, subheading, href, tag }: LinkProps) {
  const ref = useRef<HTMLAnchorElement | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const top = useTransform(mouseYSpring, [0.5, -0.5], ["40%", "60%"]);
  const left = useTransform(mouseXSpring, [0.5, -0.5], ["60%", "40%"]);

  const handleMouseMove = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  return (
    <motion.a
      href={href}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      initial="initial"
      whileHover="whileHover"
      className="group relative flex items-center justify-between py-6 transition-colors duration-500 hover:bg-zinc-50/60 px-2 sm:px-4 md:py-8 rounded-xl"
    >
      <div>
        {tag && (
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#c30000] mb-1">
            {tag}
          </span>
        )}
        <motion.span
          variants={{
            initial: { x: 0 },
            whileHover: { x: -12 },
          }}
          transition={{
            type: "spring",
            staggerChildren: 0.05,
            delayChildren: 0.15,
          }}
          className="relative z-10 block text-3xl font-black text-zinc-400 transition-colors duration-500 group-hover:text-zinc-900 sm:text-4xl md:text-5xl tracking-tight"
        >
          {heading.split("").map((l, i) => (
            <motion.span
              variants={{
                initial: { x: 0 },
                whileHover: { x: 12 },
              }}
              transition={{ type: "spring" }}
              className="inline-block"
              key={i}
            >
              {l === " " ? "\u00A0" : l}
            </motion.span>
          ))}
        </motion.span>
        <span className="relative z-10 mt-2 block text-xs sm:text-sm md:text-base font-medium text-zinc-500 transition-colors duration-500 group-hover:text-zinc-800">
          {subheading}
        </span>
      </div>

      <motion.img
        style={{
          top,
          left,
          translateX: "-10%",
          translateY: "-50%",
        }}
        variants={{
          initial: { scale: 0, rotate: "-10deg" },
          whileHover: { scale: 1, rotate: "8deg" },
        }}
        transition={{ type: "spring", damping: 20, stiffness: 200 }}
        src={imgSrc}
        referrerPolicy="no-referrer"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src =
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80";
        }}
        className="pointer-events-none absolute z-20 h-28 w-40 rounded-xl object-cover shadow-2xl md:h-44 md:w-60 border border-zinc-200 hidden sm:block"
        alt={`Image representing ${heading}`}
      />
      <div className="overflow-hidden">
        <motion.div
          variants={{
            initial: {
              x: "100%",
              opacity: 0,
            },
            whileHover: {
              x: "0%",
              opacity: 1,
            },
          }}
          transition={{ type: "spring" }}
          className="relative z-10 p-3 sm:p-4"
        >
          <ArrowRight className="size-6 text-[#c30000] sm:size-8 md:size-10" />
        </motion.div>
      </div>
    </motion.a>
  );
}

export const INTERACTIVE_LINKS: LinkProps[] = [
  {
    heading: "AI & Autonomous Systems",
    tag: "Artificial Intelligence",
    subheading: "Custom LLM integrations, RAG pipelines, autonomous agents & predictive modeling",
    imgSrc:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
    href: "#contact",
  },
  {
    heading: "Web Architecture",
    tag: "Full-Stack Development",
    subheading: "High-performance web apps, Next.js, distributed micro-frontends & API platforms",
    imgSrc:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    href: "#web",
  },
  {
    heading: "Mobile Engineering",
    tag: "Native & Cross-Platform",
    subheading: "Fluid iOS & Android applications with offline-first synchronization and real-time speed",
    imgSrc:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80",
    href: "#mobile",
  },
  {
    heading: "Cloud Infrastructure",
    tag: "DevOps & Reliability",
    subheading: "Resilient Kubernetes clusters, multi-cloud deployments, Docker & CI/CD pipelines",
    imgSrc:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    href: "#contact",
  },
  {
    heading: "Intelligent Automation",
    tag: "Workflow Systems",
    subheading: "Automated business workflows, ETL data pipelines, robotic tasks & ERP integrations",
    imgSrc:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    href: "#contact",
  },
  {
    heading: "UI/UX & Product Design",
    tag: "Experience Architecture",
    subheading: "Comprehensive design systems, rapid interactive prototyping & accessibility-first UI",
    imgSrc:
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80",
    href: "#about",
  },
];

export default InteractiveHoverLinks;
