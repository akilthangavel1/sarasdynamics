import { motion } from 'motion/react';
import {
  Sun,
  Shield,
  Waves,
  Zap,
  Sparkles,
  CircleDot,
  Layers,
  Orbit,
} from 'lucide-react';

const brands = [
  {
    name: 'Logoipsum',
    icon: (
      <div className="flex items-center gap-1">
        <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-current" />
        </div>
        <div className="w-3.5 h-3.5 rounded-full border-2 border-current -ml-1.5" />
      </div>
    ),
  },
  {
    name: 'Logoipsum',
    icon: <CircleDot className="w-5 h-5" strokeWidth={2.2} />,
  },
  {
    name: 'Logoipsum',
    icon: <Sun className="w-5 h-5" strokeWidth={2.2} />,
  },
  {
    name: 'Logoipsum',
    icon: <Shield className="w-5 h-5" strokeWidth={2.2} />,
  },
  {
    name: 'Logoipsum',
    icon: <Orbit className="w-5 h-5" strokeWidth={2.2} />,
  },
  {
    name: 'Logoipsum',
    icon: <Waves className="w-5 h-5" strokeWidth={2.2} />,
  },
  {
    name: 'Logoipsum',
    icon: <Zap className="w-5 h-5 fill-current" strokeWidth={1} />,
  },
  {
    name: 'Logoipsum',
    icon: <Sparkles className="w-5 h-5" strokeWidth={2.2} />,
  },
  {
    name: 'Logoipsum',
    icon: <Layers className="w-5 h-5" strokeWidth={2.2} />,
  },
];

export default function AboutSection() {
  return (
    <section
      id="about-section"
      className="w-full bg-white text-black py-20 md:py-28 px-6 sm:px-10 lg:px-16 border-t border-zinc-200/80 select-none overflow-hidden"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-16 md:gap-24">
        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Category Indicator */}
          <div className="lg:col-span-3 pt-2">
            <span
              id="about-tag"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black tracking-[0.2em] uppercase text-zinc-900"
            >
              <span className="text-base font-bold leading-none">®</span> ABOUT
            </span>
          </div>

          {/* Right Main Text Content */}
          <div className="lg:col-span-9">
            <motion.h2
              id="about-statement"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-black tracking-[-0.03em] uppercase leading-[1.25] text-left"
            >
              <span className="text-black">
                WE&apos;RE UI/UX DESIGNERS FOCUSED ON CREATING USER-CENTERED DIGITAL PRODUCTS THAT ARE FUNCTIONAL,{' '}
              </span>
              <span className="text-[#8c8c8c] transition-colors duration-300 hover:text-zinc-600">
                ACCESSIBLE, AND VISUALLY ENGAGING. FROM MOBILE APPS TO COMPLEX DASHBOARDS, WE TURN IDEAS INTO INTUITIVE, ENJOYABLE EXPERIENCES.
              </span>
            </motion.h2>
          </div>
        </div>

        {/* Brand Logos Bar */}
        <div
          id="about-brand-logos"
          className="pt-10 md:pt-14 border-t border-zinc-200/90 w-full"
        >
          <div className="relative w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-2">
            <div className="flex items-center justify-between min-w-[850px] gap-8 lg:gap-12 text-zinc-800">
              {brands.map((brand, idx) => (
                <div
                  key={idx}
                  id={`brand-logo-${idx}`}
                  className="flex items-center gap-2.5 opacity-75 hover:opacity-100 transition-opacity duration-200 cursor-pointer shrink-0"
                >
                  <div className="text-zinc-900">{brand.icon}</div>
                  <span className="text-sm md:text-base font-bold tracking-tight text-zinc-900">
                    {brand.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
