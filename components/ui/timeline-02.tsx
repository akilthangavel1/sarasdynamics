"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface TimelineItem {
  year: string;
  title: string;
  description: string;
  image: string;
  link?: string;
  badge?: string;
}

interface TimelineProps {
  items?: TimelineItem[];
  className?: string;
}

const defaultItems: TimelineItem[] = [
  {
    year: "01",
    title: "Clarity",
    description:
      "No jargon, no hidden costs. You get clear timelines, honest updates and always know exactly where your project stands.",
    image: "/images/clarity-lens.jpg",
    badge: "Our Values",
  },
  {
    year: "02",
    title: "Ownership",
    description:
      "Everything we build is yours: the code, the data and the IP. No lock-in, no strings attached, ever.",
    image:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80",
    badge: "Our Values",
  },
  {
    year: "03",
    title: "Quality",
    description:
      "We build software that lasts, not quick fixes. Every system is tested thoroughly and designed to scale with you.",
    image: "/images/quality-gears.jpg",
    badge: "Our Values",
  },
  {
    year: "04",
    title: "Speed",
    description:
      "Fast replies and steady weekly progress, across every time zone. Your project keeps moving, even while you sleep.",
    image: "/images/speed-plane.jpg",
    badge: "Our Values",
  },
  {
    year: "05",
    title: "Transparency",
    description:
      "No surprises, ever. You get honest timelines, clear pricing and regular updates, so you always know what’s happening and why.",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    badge: "Our Values",
  },
  {
    year: "06",
    title: "Curiosity",
    description:
      "We keep learning and experimenting, so your business always benefits from the latest in AI.",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    badge: "Our Values",
  },
];

export const Timeline = ({
  items = defaultItems,
  className,
}: TimelineProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex];
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeRef = buttonRefs.current[activeIndex];
    if (activeRef) {
      activeRef.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [activeIndex]);

  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-12 gap-6">
        <div className="relative flex flex-col items-center shrink-0 w-full lg:w-auto lg:col-span-1 col-span-12">
          <div
            className="flex flex-row lg:flex-col gap-6 lg:h-105 overflow-auto no-scrollbar md:snap-y snap-x lg:py-40 lg:px-0 px-40 snap-mandatory w-full"
            style={{ scrollBehavior: "smooth" }}
          >
            {items.map((item, index) => (
              <Button
                variant={activeIndex === index ? "default" : "outline"}
                key={item.year}
                ref={(el) => {
                  buttonRefs.current[index] = el;
                }}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "rounded-full px-5! transition-all duration-300 shrink-0 snap-center",
                )}
              >
                <span className="text-sm font-medium tracking-tight">
                  {item.year}
                </span>
              </Button>
            ))}
          </div>

          {/* Gradient Overlays */}
          <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-background to-transparent pointer-events-none z-10 lg:block hidden" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background to-transparent pointer-events-none z-10 lg:block hidden" />
        </div>

        <div className="flex-1 flex flex-col lg:flex-row items-center gap-12 lg:gap-24 w-full overflow-hidden lg:col-span-11 col-span-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem.year}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="flex-1 grid lg:grid-cols-11 grid-cols-1 items-center gap-6 w-full"
            >
              <div className="flex-1 flex flex-col items-start gap-3 xl:ps-10 xl:pe-16 lg:col-span-6">
                <Badge
                  variant="secondary"
                  className="rounded-full h-6 px-2 py-1 font-normal"
                >
                  {activeItem.badge}
                </Badge>
                <h2 className="text-5xl md:text-5xl lg:text-8xl font-medium tracking-tight text-foreground">
                  {activeItem.year}
                </h2>
                <h3 className="text-2xl font-medium text-foreground leading-tight">
                  {activeItem.title}
                </h3>
                <p className="sm:text-lg text-base text-muted-foreground leading-relaxed max-w-xl">
                  {activeItem.description}
                </p>
              </div>

              <div className="w-full flex flex-col gap-4 lg:ps-5 lg:col-span-5">
                <div className="w-full rounded-lg overflow-hidden bg-muted max-h-68 md:max-h-91 aspect-11/9 md:aspect-6/3 lg:aspect-11/9">
                  <img
                    src={activeItem.image}
                    alt={activeItem.title}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {activeItem.link && (
                  <a
                    href={activeItem.link}
                    target="_blank"
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 group-hover:-rotate-45 duration-200 transition-all" />
                  </a>
                )}

                {!activeItem.link && (
                  <a
                    href="#"
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left group"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 group-hover:-rotate-45 duration-200 transition-all" />
                  </a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
