"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

/* -----------------------------------------------------------------------------
 * TYPES & TESTIMONIAL MARQUEE ("What our users say")
 * -------------------------------------------------------------------------- */

export type CardT = {
  name: string;
  role: string;
  company?: string;
  handle?: string;
  quote: string;
  rating?: number;
  date?: string;
  image?: string;
};

export const CommonAvatar: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      "size-11 rounded-full flex items-center justify-center bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200/90 shrink-0 select-none",
      className
    )}
    aria-hidden="true"
  >
    <svg
      className="size-6 text-zinc-400"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        fillRule="evenodd"
        d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695Z"
        clipRule="evenodd"
      />
    </svg>
  </div>
);

const StarRating: React.FC<{ rating?: number }> = ({ rating = 5 }) => (
  <div className="flex items-center gap-0.5 text-amber-500 mb-2.5">
    {Array.from({ length: rating }).map((_, i) => (
      <svg key={i} className="size-3.5 fill-current" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export const DEFAULT_DATA: CardT[] = [
  {
    name: "David Lin",
    role: "VP of Engineering",
    company: "Kinetix AI",
    quote: "Saras Dynamics re-architected our RAG pipelines and autonomous agents. Query latency dropped 64% while generation accuracy improved noticeably. Outstanding engineering rigor.",
    rating: 5,
  },
  {
    name: "Sarah Jenkins",
    role: "Head of Product",
    company: "OmniHealth Systems",
    quote: "They delivered our offline-first mobile patient monitoring app ahead of deadline. The real-time biometric synchronization is rock-solid and passed HIPAA audits cleanly.",
    rating: 5,
  },
  {
    name: "Michael Vance",
    role: "Founder & CTO",
    company: "StrataPay Financial",
    quote: "The high-throughput trading telemetry console they built handles millions of live events without a hiccup. Their attention to UX, latency, and code structure is world-class.",
    rating: 5,
  },
  {
    name: "Elena Rostova",
    role: "Director of Infrastructure",
    company: "CloudScale Tech",
    quote: "Containerizing our legacy monolith into Kubernetes with zero customer downtime was an immense task. Saras Dynamics finished it in 8 weeks flat with full observability.",
    rating: 5,
  },
  {
    name: "Rajesh Patel",
    role: "Chief Digital Officer",
    company: "Apex Global Logistics",
    quote: "Their automated workflow pipelines eliminated over 40 hours of manual data reconciliation each week. Easily one of the most capable engineering teams we've hired.",
    rating: 5,
  },
  {
    name: "Claire Beaumont",
    role: "Design Engineering Lead",
    company: "Atelier Studio",
    quote: "Most engineering agencies struggle with precision micro-interactions and design tokens. Saras Dynamics implemented our motion physics and layout down to the pixel.",
    rating: 5,
  },
];

export const SECOND_ROW_DATA: CardT[] = [
  {
    name: "Brian Connolly",
    role: "VP of Technology",
    company: "Summit Capital Group",
    quote: "Finding engineers who master enterprise cloud security alongside fluid frontend architecture is rare. Saras Dynamics delivered an exceptional institutional platform.",
    rating: 5,
  },
  {
    name: "Anita Desai",
    role: "Product Principal",
    company: "Novus Platforms",
    quote: "Their WebSocket state management and real-time multiplayer canvas engine operate without friction. Our active user engagement surged 35% following release.",
    rating: 5,
  },
  {
    name: "Marcus Sterling",
    role: "Co-Founder & CEO",
    company: "Veloce Technologies",
    quote: "From discovery sprint to high-availability deployment on Docker and Vercel, communication was crystal-clear and the engineering quality exceeded expectations.",
    rating: 5,
  },
  {
    name: "Emily Zhang",
    role: "Senior Director of Ops",
    company: "Beacon Cloud",
    quote: "The autonomous ETL ingestion pipeline processes multi-gigabyte data streams around the clock without failures. Zero critical downtime since launching.",
    rating: 5,
  },
  {
    name: "Tariq Al-Mansoor",
    role: "Technical Co-Founder",
    company: "Quantiva Labs",
    quote: "Their custom LLM fine-tuning and agentic routing integrated directly into our internal ERP, transforming how our team triages system anomalies in real time.",
    rating: 5,
  },
  {
    name: "Laura Miller",
    role: "Head of Growth",
    company: "Pulse Analytics",
    quote: "Our application load times plummeted from 3.6s to 0.7s after their web architecture refactor. That speed improvement directly drove a 38% increase in trial conversions.",
    rating: 5,
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
      "p-5 rounded-2xl mx-3 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 w-84 shrink-0 bg-white border border-zinc-200/90 cursor-default select-none flex flex-col justify-between",
      className
    )}
  >
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <CommonAvatar />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-sm text-zinc-900 leading-none">{card.name}</p>
              <VerifyIcon />
            </div>
            <span className="text-xs text-zinc-500 mt-1 font-medium">
              {card.role}{card.company ? ` • ${card.company}` : ""}
            </span>
          </div>
        </div>
      </div>
      <StarRating rating={card.rating || 5} />
      <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-normal">
        "{card.quote}"
      </p>
    </div>

    <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
      <span className="text-[#c30000] font-semibold">Verified Client Review</span>
      <span>Enterprise Delivery</span>
    </div>
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
