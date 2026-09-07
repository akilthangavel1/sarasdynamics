import { useMotionValue, motion, useSpring, useTransform } from "motion/react";
import React, { useRef } from "react";
import { ArrowRight } from "lucide-react";

export interface LinkProps {
  heading: string;
  imgSrc: string;
  subheading: string;
  href: string;
  key?: React.Key;
}

export interface InteractiveHoverLinksProps {
  links?: LinkProps[];
}

export function InteractiveHoverLinks({
  links = INTERACTIVE_LINKS,
}: InteractiveHoverLinksProps) {
  return (
    <section id="interactive-links-section" className="bg-white p-4 md:px-8 md:py-16 w-full border-t border-zinc-200/80 select-none">
      <div className="mx-auto max-w-5xl">
        {links.map((link) => (
          <LinkItem key={link.heading} {...link} />
        ))}
      </div>
    </section>
  );
}

function LinkItem({ heading, imgSrc, subheading, href }: LinkProps) {
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
      className="group relative flex items-center justify-between border-b-2 border-zinc-200 py-6 transition-colors duration-500 hover:border-zinc-900 md:py-10"
    >
      <div>
        <motion.span
          variants={{
            initial: { x: 0 },
            whileHover: { x: -16 },
          }}
          transition={{
            type: "spring",
            staggerChildren: 0.075,
            delayChildren: 0.25,
          }}
          className="relative z-10 block text-4xl font-black text-zinc-400 transition-colors duration-500 group-hover:text-zinc-900 md:text-6xl tracking-tight"
        >
          {heading.split("").map((l, i) => (
            <motion.span
              variants={{
                initial: { x: 0 },
                whileHover: { x: 16 },
              }}
              transition={{ type: "spring" }}
              className="inline-block"
              key={i}
            >
              {l === " " ? "\u00A0" : l}
            </motion.span>
          ))}
        </motion.span>
        <span className="relative z-10 mt-2 block text-sm sm:text-base font-medium text-zinc-500 transition-colors duration-500 group-hover:text-zinc-800">
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
          initial: { scale: 0, rotate: "-12.5deg" },
          whileHover: { scale: 1, rotate: "12.5deg" },
        }}
        transition={{ type: "spring", damping: 20, stiffness: 200 }}
        src={imgSrc}
        className="pointer-events-none absolute z-0 h-24 w-32 rounded-xl object-cover shadow-2xl md:h-48 md:w-64 border border-zinc-200"
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
          className="relative z-10 p-4"
        >
          <ArrowRight className="size-8 text-zinc-900 md:size-12" />
        </motion.div>
      </div>
    </motion.a>
  );
}

export const INTERACTIVE_LINKS: LinkProps[] = [
  {
    heading: "Services",
    subheading: "Discover what we offer",
    imgSrc:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    href: "#",
  },
  {
    heading: "Team",
    subheading: "Meet the amazing people behind it",
    imgSrc:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
    href: "#",
  },
  {
    heading: "Projects",
    subheading: "Explore our recent work",
    imgSrc:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    href: "#",
  },
  {
    heading: "Careers",
    subheading: "Join our growing team",
    imgSrc:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80",
    href: "#",
  },
  {
    heading: "Playground",
    subheading: "Fun experiments and side projects",
    imgSrc:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
    href: "#",
  },
];

export default InteractiveHoverLinks;
