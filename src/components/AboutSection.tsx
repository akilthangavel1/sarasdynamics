import { motion } from 'motion/react';
import { LogoCarousel } from '@/components/ui/logo-carousel';
import { allLogos } from '@/components/ui/logo-carousel-demo';

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
                AT SARAS DYNAMICS, WE ENGINEER INTELLIGENT SOFTWARE, ADVANCED AI ARCHITECTURES, AND ROBUST DIGITAL SYSTEMS,{' '}
              </span>
              <span className="text-[#8c8c8c] transition-colors duration-300 hover:text-zinc-600">
                COMBINING TECHNICAL DEPTH WITH UNCOMPROMISING CRAFTSMANSHIP. FROM HIGH-THROUGHPUT WEB PLATFORMS TO INTUITIVE MOBILE APPS, WE BUILD TECHNOLOGY SHAPING WHAT COMES NEXT.
              </span>
            </motion.h2>
          </div>
        </div>

        {/* Animated Technology Logos Carousel */}
        <div
          id="about-brand-logos"
          className="pt-10 md:pt-14 border-t border-zinc-200/90 w-full flex flex-col gap-6 sm:gap-8"
        >
          {/* Section Header Label */}
          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#c30000]" />
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-zinc-900">
                Core Technologies &amp; Architecture We Use
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-medium text-zinc-500 tracking-wide">
              Full-Stack &bull; Autonomous AI &bull; Cloud Infrastructure &bull; High-Performance Data
            </p>
          </div>

          <div className="w-full flex items-center justify-center py-2">
            <LogoCarousel columnCount={7} logos={allLogos} />
          </div>
        </div>
      </div>
    </section>
  );
}
