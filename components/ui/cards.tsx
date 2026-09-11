"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

/* -----------------------------------------------------------------------------
 * TYPES & TESTIMONIAL MARQUEE ("What our users say")
 * -------------------------------------------------------------------------- */

export type CardT = {
  image: string;
  name: string;
  handle: string;
  quote?: string;
  date?: string;
};

export const DEFAULT_DATA: CardT[] = [
  {
    image:
      "https://cdn.21st.dev/assets/mirror/20/202f28d9108e13136b34315b1c8dac25678f9dc5cb2f004c713d930cf285e62c.jpg",
    name: "Briar Martin",
    handle: "@neilstellar",
    quote: "Radiant made undercutting all of our competitors an absolute breeze.",
  },
  {
    image:
      "https://cdn.21st.dev/assets/mirror/ce/ce1536afd37b7d4e6c9ffbee65b35e6897d4467ab07efc9b6466b6c1744654f9.jpg",
    name: "Avery Johnson",
    handle: "@averywrites",
    quote: "The speed and architectural precision of this team completely transformed our product launch.",
  },
  {
    image:
      "https://cdn.21st.dev/assets/mirror/b5/b504a8aa09393bdf43a6b1aefe9baa60374c6716947bec200ddaff469b561fa5.jpg",
    name: "Jordan Lee",
    handle: "@jordantalks",
    quote: "Flawless attention to detail. Our conversion rate jumped 42% after the redesign.",
  },
  {
    image:
      "https://cdn.21st.dev/assets/mirror/85/85ba79a1a989b29a505b7b377c77009d124216a8e312f80339cd8c50fdc8e401.jpg",
    name: "Elena Rostova",
    handle: "@elenarostova",
    quote: "Hands down the best engineering and design agency we've ever partnered with.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    name: "Marcus Vance",
    handle: "@marcus_v",
    quote: "The motion system and micro-interactions elevate our software to a whole new level.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    name: "Bilal Ahmed",
    handle: "@bilalahmed",
    quote: "Super fast implementation and pristine code quality throughout the entire engagement.",
  },
];

export const SECOND_ROW_DATA: CardT[] = [
  {
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    name: "Briana Patton",
    handle: "@brianapatton",
    quote: "Streamlined our entire customer workflow and made collaboration seamless across timezones.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    name: "Omar Raza",
    handle: "@omar_raza",
    quote: "An indispensable partner. Their design instincts and velocity are truly unmatched.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    name: "Saman Malik",
    handle: "@samanm",
    quote: "Our users constantly praise the intuitive UX. It drastically cut down our onboarding friction.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    name: "Aliza Khan",
    handle: "@alizakhan",
    quote: "The polish, accessibility, and responsiveness exceeded every benchmark we set.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    name: "Farhan Siddiqui",
    handle: "@farhansid",
    quote: "Delivered on time and within scope. Our retention metrics spiked immediately post-launch.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    name: "Sana Sheikh",
    handle: "@sanasheikh",
    quote: "Truly world-class craftsmanship. Every animation feels intentional, fluid, and crisp.",
  },
];

export const VerifyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 48 48"
    className={cn("inline-block shrink-0", className)}
  >
    <polygon
      fill="#42a5f5"
      points="29.62,3 33.053,8.308 39.367,8.624 39.686,14.937 44.997,18.367 42.116,23.995 45,29.62 39.692,33.053 39.376,39.367 33.063,39.686 29.633,44.997 24.005,42.116 18.38,45 14.947,39.692 8.633,39.376 8.314,33.063 3.003,29.633 5.884,24.005 3,18.38 8.308,14.947 8.624,8.633 14.937,8.314 18.367,3.003 23.995,5.884"
    ></polygon>
    <polygon
      fill="#fff"
      points="21.396,31.255 14.899,24.76 17.021,22.639 21.428,27.046 30.996,17.772 33.084,19.926"
    ></polygon>
  </svg>
);

export interface CardProps {
  card: CardT;
  className?: string;
  key?: React.Key;
}

export const Card: React.FC<CardProps> = ({ card, className }) => (
  <div
    className={cn(
      "p-5 rounded-2xl mx-3 shadow-md shadow-zinc-900/[0.04] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-80 shrink-0 bg-white border border-zinc-200/80 cursor-default select-none",
      className
    )}
  >
    <div className="flex items-center gap-3">
      <img
        className="size-11 rounded-full object-cover ring-2 ring-zinc-100"
        src={card.image}
        alt={card.name}
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <p className="font-semibold text-sm text-zinc-900 leading-none">{card.name}</p>
          <VerifyIcon />
        </div>
        <span className="text-xs text-slate-500 mt-1">{card.handle}</span>
      </div>
    </div>
    <p className="text-sm pt-4 text-zinc-700 leading-relaxed font-normal">
      {card.quote || "Radiant made undercutting all of our competitors an absolute breeze."}
    </p>
  </div>
);

export function MarqueeRow({
  data,
  reverse = false,
  speed = 28,
}: {
  data: CardT[];
  reverse?: boolean;
  speed?: number;
}) {
  const tripled = React.useMemo(() => [...data, ...data, ...data], [data]);
  return (
    <div className="relative w-full mx-auto max-w-7xl overflow-hidden isolation-isolate group">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-24 md:w-40 z-10 bg-gradient-to-r from-white via-white/80 to-transparent" />
      <div
        className={cn(
          "flex transform-gpu min-w-[200%] group-hover:[animation-play-state:paused] will-change-transform",
          reverse ? "pt-3 pb-6" : "pt-6 pb-3"
        )}
        style={{
          animation: `marqueeScroll ${speed}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {tripled.map((c, i) => (
          <Card key={i} card={c} />
        ))}
      </div>
      <div className="pointer-events-none absolute right-0 top-0 h-full w-24 md:w-40 z-10 bg-gradient-to-l from-white via-white/80 to-transparent" />
    </div>
  );
}

export function Marquee({
  row1 = DEFAULT_DATA,
  row2 = SECOND_ROW_DATA,
}: {
  row1?: CardT[];
  row2?: CardT[];
}) {
  return (
    <>
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
      <div className="flex flex-col gap-2 w-full select-none">
        <MarqueeRow data={row1} reverse={false} speed={32} />
        <MarqueeRow data={row2} reverse={true} speed={36} />
      </div>
    </>
  );
}

/* -----------------------------------------------------------------------------
 * FULL "WHAT OUR USERS SAY" SECTION
 * -------------------------------------------------------------------------- */

export function WhatOurUsersSaySection() {
  return (
    <section
      id="what-our-users-say-section"
      aria-labelledby="users-say-heading"
      className="bg-white py-24 relative overflow-hidden border-t border-zinc-200/80 w-full"
    >
      <div className="container px-4 z-10 mx-auto">
        <div className="flex flex-col items-center justify-center max-w-xl mx-auto mb-14 text-center">
          <div className="inline-flex items-center gap-2 border border-zinc-300/80 py-1 px-4 rounded-full text-xs font-semibold tracking-wide uppercase text-zinc-700 bg-zinc-100/80 mb-4">
            Testimonials
          </div>

          <h2
            id="users-say-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900"
          >
            What our users say
          </h2>
          <p className="mt-4 text-zinc-600 text-base sm:text-lg leading-relaxed max-w-md">
            Discover how visionary founders and global product teams accelerate their growth with our studio.
          </p>
        </div>

        {/* Dual Marquee Rows */}
        <Marquee />
      </div>
    </section>
  );
}

/* -----------------------------------------------------------------------------
 * HOVER REVEAL CARDS (backward compatibility)
 * -------------------------------------------------------------------------- */

export interface CardItem {
  id: number | string;
  title: string;
  subtitle: string;
  imageUrl: string;
}

export function HoverRevealCards({ items }: { items: CardItem[] }) {
  const [hoveredId, setHoveredId] = React.useState<number | string | null>(null);

  return (
    <div className="flex flex-wrap justify-center gap-4 max-w-6xl w-full">
      {items.map((item) => {
        const isHovered = hoveredId === item.id;
        const isOtherHovered = hoveredId !== null && !isHovered;

        return (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={cn(
              "relative h-72 w-64 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-md",
              isOtherHovered && "opacity-50 scale-95 blur-[1px]",
              isHovered && "scale-105 shadow-xl z-10"
            )}
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
              <span className="text-xs uppercase tracking-wider text-zinc-300">{item.subtitle}</span>
              <h3 className="text-lg font-bold mt-1">{item.title}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -----------------------------------------------------------------------------
 * LATEST BLOG CARDS (cards.tsx component as requested)
 * -------------------------------------------------------------------------- */

export function Example() {
  const [images, setImages] = useState({
    img1: "https://cdn.21st.dev/assets/mirror/6f/6f1c926bae8d6e71a611ff4516129defb81169307e6ed04bb285252af9a35082.jpg",
    img2: "https://cdn.21st.dev/assets/mirror/53/532743c99df6086cd352dddd6c4123c731174ce078fbf8aa6b95d66a239ffb9b.jpg",
    img3: "https://cdn.21st.dev/assets/mirror/6c/6cfc99c18d9a71ed731d82d84406a209b30f7fa76f3e5b7ecdfa48efbd62f613.jpg",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .cards-poppins-scope, .cards-poppins-scope * {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

      {/* Контейнер с колонкой */}
      <section id="latest-blog-section" className="cards-poppins-scope flex flex-col items-center w-full py-16 px-4 bg-white border-t border-zinc-200/80">
        {/* Заголовок сверху */}
        <h1 className="text-3xl font-semibold text-slate-900">Latest Blog</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-lg text-center">
          Stay ahead of the curve with fresh content on code, design, startups, and everything in between.
        </p>

        {/* Карточки */}
        <div className="mt-10 flex flex-wrap justify-center gap-8">
          <div className="max-w-72 w-full hover:-translate-y-0.5 transition duration-300">
            <img
              className="rounded-xl w-full aspect-[16/10] object-cover"
              src={images.img1}
              onError={() =>
                setImages((prev) => ({
                  ...prev,
                  img1: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80",
                }))
              }
              alt="Color Psychology in UI"
            />
            <h3 className="text-base text-slate-900 font-medium mt-3">
              Color Psychology in UI: How to Choose the Right Palette
            </h3>
            <p className="text-xs text-indigo-600 font-medium mt-1">UI/UX design</p>
          </div>

          <div className="max-w-72 w-full hover:-translate-y-0.5 transition duration-300">
            <img
              className="rounded-xl w-full aspect-[16/10] object-cover"
              src={images.img2}
              onError={() =>
                setImages((prev) => ({
                  ...prev,
                  img2: "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=600&auto=format&fit=crop&q=80",
                }))
              }
              alt="Understanding Typography"
            />
            <h3 className="text-base text-slate-900 font-medium mt-3">
              Understanding Typography: Crafting a Visual Voice for Your Brand
            </h3>
            <p className="text-xs text-indigo-600 font-medium mt-1">Branding</p>
          </div>

          <div className="max-w-72 w-full hover:-translate-y-0.5 transition duration-300">
            <img
              className="rounded-xl w-full aspect-[16/10] object-cover"
              src={images.img3}
              onError={() =>
                setImages((prev) => ({
                  ...prev,
                  img3: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80",
                }))
              }
              alt="Design Thinking in Practice"
            />
            <h3 className="text-base text-slate-900 font-medium mt-3">
              Design Thinking in Practice: How to Solve Real User Problems
            </h3>
            <p className="text-xs text-indigo-600 font-medium mt-1">Product Design</p>
          </div>
        </div>
      </section>
    </>
  );
}

export const BlogCards = Example;

export default Example;
