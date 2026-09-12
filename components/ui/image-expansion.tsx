import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, ChevronLeft, ChevronRight, X, Sparkles } from "lucide-react";

export interface SlideItem {
  id: number;
  badge: string;
  title: string;
  buttonText: string;
  image: string;
  techStack?: string;
  client?: string;
  metric?: string;
}

export interface ImageExpansionSliderProps {
  inCard?: boolean;
  defaultDark?: boolean;
  slides?: SlideItem[];
  tabs?: string[];
}

const DEFAULT_WEB_SLIDES: SlideItem[] = [
  {
    id: 1,
    badge: "Enterprise SaaS",
    title: "Strata Cloud: Multi-Region Kubernetes Infrastructure Orchestrator",
    buttonText: "View Architecture",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
    techStack: "React 19 • TypeScript • Tailwind • Docker • Cloud Run",
    client: "Strata Systems",
    metric: "10M+ daily events, 99.99% uptime",
  },
  {
    id: 2,
    badge: "FinTech & Real-Time",
    title: "PulseStream: High-Throughput Trading Telemetry & WebSocket Engine",
    buttonText: "View Case Study",
    image: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1200&auto=format&fit=crop&q=80",
    techStack: "Next.js • Node.js WebSockets • D3.js • Redis",
    client: "Pulse Global",
    metric: "<45ms streaming UI latency",
  },
  {
    id: 3,
    badge: "AI Platforms",
    title: "Kinetix AI: Autonomous Agent Workflow & Drag-and-Drop Canvas",
    buttonText: "View Case Study",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    techStack: "React • Canvas API • Python Microservices • Gemini LLM",
    client: "Kinetix Labs",
    metric: "64% reduction in prompt execution cycle",
  },
  {
    id: 4,
    badge: "Healthcare & HIPAA",
    title: "OmniHealth: Real-Time Patient Biometrics & Teleconsult Portal",
    buttonText: "View Case Study",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80",
    techStack: "TypeScript • WebRTC • PWA Offline Storage • HIPAA Compliant",
    client: "OmniHealth Network",
    metric: "120,000+ active clinical users",
  },
  {
    id: 5,
    badge: "Enterprise SaaS",
    title: "Apex Logistics: Automated Freight Dispatch & Geospatial Tracking",
    buttonText: "View Architecture",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80",
    techStack: "React • Mapbox GL • Node.js REST API • PostgreSQL",
    client: "Apex Global Freight",
    metric: "Eliminated 40+ hrs weekly manual triage",
  },
  {
    id: 6,
    badge: "FinTech & Real-Time",
    title: "Aura Commerce: Headless WebGL Storefront with Global Stripe Checkout",
    buttonText: "View Case Study",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
    techStack: "React 19 • Three.js • Stripe Elements • Cloudflare Workers",
    client: "Aura Design",
    metric: "0.6s FCP, 42% conversion lift",
  },
];

const DEFAULT_TABS = [
  "All Projects",
  "Enterprise SaaS",
  "FinTech & Real-Time",
  "AI Platforms",
];

export function ImageExpansionSlider({
  inCard = false,
  defaultDark = false,
  slides = DEFAULT_WEB_SLIDES,
  tabs = DEFAULT_TABS,
}: ImageExpansionSliderProps) {
  const [activeTab, setActiveTab] = useState(tabs[0] || "All Projects");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(defaultDark);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Filter slides based on active tab
  const filteredSlides = slides.filter(
    (slide) =>
      activeTab === "All Projects" ||
      slide.badge === activeTab ||
      (activeTab === "Enterprise SaaS" &&
        (slide.badge === "Enterprise SaaS" || slide.badge === "Healthcare & HIPAA"))
  );

  const totalDots = filteredSlides.length;

  const handleNext = () => {
    if (currentIdx < totalDots - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setCurrentIdx(0); // Loop back
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    } else {
      setCurrentIdx(totalDots - 1); // Loop to end
    }
  };

  // Scroll to active index
  useEffect(() => {
    if (sliderRef.current) {
      const card = sliderRef.current.children[0] as HTMLElement;
      if (card) {
        const cardWidth = card.clientWidth + 24; // width + gap
        sliderRef.current.scrollTo({
          left: currentIdx * cardWidth,
          behavior: "smooth",
        });
      }
    }
  }, [currentIdx]);

  // Reset index when changing tabs
  useEffect(() => {
    setCurrentIdx(0);
  }, [activeTab]);

  return (
    <div
      className={`w-full overflow-hidden font-sans select-none transition-all duration-300 ${
        inCard
          ? `p-6 md:p-10 rounded-2xl border shadow-2xl ${
              isDarkMode
                ? "bg-[#0a0a0c] text-white border-zinc-900"
                : "bg-[#f4f4f5] text-zinc-900 border-zinc-200"
            }`
          : isDarkMode
          ? "text-white"
          : "text-zinc-900"
      }`}
    >
      {/* Header Tabs Navigation */}
      <div className="flex flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === tab
                  ? isDarkMode
                    ? "bg-zinc-800 text-white shadow-xs"
                    : "bg-zinc-900 text-white shadow-xs"
                  : isDarkMode
                  ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                  : "text-zinc-600 hover:text-zinc-900 bg-zinc-100/80 hover:bg-zinc-200/80"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full border flex items-center justify-center transition-all duration-200 active:scale-95 shadow-xs cursor-pointer ${
              isDarkMode
                ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-yellow-400"
                : "bg-white border-zinc-200 hover:bg-zinc-100 text-purple-600"
            }`}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            className={`flex items-center gap-1 text-xs md:text-sm font-semibold transition-colors duration-200 group cursor-pointer ${
              isDarkMode ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-black"
            }`}
          >
            Explore all
            <span className="transform group-hover:translate-x-0.5 transition-transform duration-200">
              &gt;
            </span>
          </button>
        </div>
      </div>

      {/* Slider Carousel Container */}
      <div
        ref={sliderRef}
        className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-6"
        style={{ scrollbarWidth: "none" }}
      >
        {filteredSlides.map((slide, idx) => (
          <div
            key={slide.id}
            onClick={() => setSelectedImageIndex(idx)}
            className={`min-w-[100%] sm:min-w-[48%] lg:min-w-[31.8%] snap-start group relative aspect-[1.5/1] rounded-2xl overflow-hidden border transition-all duration-500 cursor-pointer ${
              isDarkMode
                ? "border-zinc-900 bg-zinc-950/40 hover:border-zinc-800"
                : "border-zinc-200 bg-white/50 hover:border-zinc-300"
            }`}
          >
            {/* Background Image with Zoom & Dark Vignette */}
            <div className="absolute inset-0 z-0">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Slide Badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-black/70 backdrop-blur-md border border-white/15 rounded-full text-[10px] font-bold text-zinc-100">
              <Sparkles className="w-3 h-3 text-red-400" />
              {slide.badge}
            </div>

            {/* Metric pill if available */}
            {slide.metric && (
              <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center px-2.5 py-1 bg-black/70 backdrop-blur-md border border-white/10 rounded-md text-[10px] font-mono text-zinc-300">
                {slide.metric}
              </div>
            )}

            {/* Content overlay */}
            <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 sm:p-6">
              {slide.techStack && (
                <p className="text-[11px] font-mono text-zinc-300 mb-1.5 opacity-90 truncate">
                  {slide.techStack}
                </p>
              )}
              <h3
                className="text-sm sm:text-base lg:text-lg font-bold text-white mb-3.5 leading-tight tracking-tight line-clamp-2 max-w-[98%]"
                title={slide.title}
              >
                {slide.title}
              </h3>
              <button
                type="button"
                className="w-fit px-3.5 py-1.5 bg-white text-zinc-900 font-bold text-[11px] tracking-tight rounded-md transition-all duration-300 hover:bg-zinc-100 active:scale-95 shadow-md shadow-black/30 cursor-pointer flex items-center gap-1.5"
              >
                <span>{slide.buttonText}</span>
                <span className="text-xs">&rarr;</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between mt-4">
        {/* Step Indicators */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalDots }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIdx === idx
                  ? isDarkMode
                    ? "w-8 bg-white"
                    : "w-8 bg-zinc-900"
                  : isDarkMode
                  ? "w-2 bg-zinc-700 hover:bg-zinc-500"
                  : "w-2 bg-zinc-300 hover:bg-zinc-400"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Arrow Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md cursor-pointer ${
              isDarkMode
                ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white"
                : "bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900"
            }`}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md cursor-pointer ${
              isDarkMode
                ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white"
                : "bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900"
            }`}
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm"
          onClick={() => setSelectedImageIndex(null)}
        >
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 w-10 h-10 bg-zinc-900/50 hover:bg-zinc-800 rounded-full flex items-center justify-center text-white border border-zinc-700 transition-all duration-200 z-50 shadow-lg cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIndex(null);
            }}
            aria-label="Close image modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Arrow */}
          <button
            className="absolute left-4 md:left-12 w-12 h-12 bg-zinc-900/80 hover:bg-zinc-800 rounded-full flex items-center justify-center text-white border border-zinc-700 transition-all duration-200 z-50 shadow-lg active:scale-95 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIndex((prev) =>
                prev !== null && prev > 0 ? prev - 1 : totalDots - 1
              );
            }}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Image Container */}
          <div
            className="relative max-w-full max-h-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filteredSlides[selectedImageIndex].image}
              alt={filteredSlides[selectedImageIndex].title}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-zinc-800"
              referrerPolicy="no-referrer"
            />
            <div className="mt-4 text-center max-w-xl px-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-xs text-red-400 font-semibold mb-2">
                <span>{filteredSlides[selectedImageIndex].badge}</span>
                {filteredSlides[selectedImageIndex].client && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-300">{filteredSlides[selectedImageIndex].client}</span>
                  </>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                {filteredSlides[selectedImageIndex].title}
              </h3>
              {filteredSlides[selectedImageIndex].techStack && (
                <p className="text-xs font-mono text-zinc-400 mb-2">
                  {filteredSlides[selectedImageIndex].techStack}
                </p>
              )}
              {filteredSlides[selectedImageIndex].metric && (
                <p className="text-xs text-emerald-400 font-medium">
                  Outcome: {filteredSlides[selectedImageIndex].metric}
                </p>
              )}
              <p className="text-[11px] text-zinc-500 mt-2">
                Project {selectedImageIndex + 1} of {totalDots}
              </p>
            </div>
          </div>

          {/* Right Arrow */}
          <button
            className="absolute right-4 md:right-12 w-12 h-12 bg-zinc-900/80 hover:bg-zinc-800 rounded-full flex items-center justify-center text-white border border-zinc-700 transition-all duration-200 z-50 shadow-lg active:scale-95 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIndex((prev) =>
                prev !== null && prev < totalDots - 1 ? prev + 1 : 0
              );
            }}
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
