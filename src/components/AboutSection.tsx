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
                WE&apos;RE UI/UX DESIGNERS FOCUSED ON CREATING USER-CENTERED DIGITAL PRODUCTS THAT ARE FUNCTIONAL,{' '}
              </span>
              <span className="text-[#8c8c8c] transition-colors duration-300 hover:text-zinc-600">
                ACCESSIBLE, AND VISUALLY ENGAGING. FROM MOBILE APPS TO COMPLEX DASHBOARDS, WE TURN IDEAS INTO INTUITIVE, ENJOYABLE EXPERIENCES.
              </span>
            </motion.h2>
          </div>
        </div>

        {/* Animated Technology Logos Carousel */}
        <div
          id="about-brand-logos"
          className="pt-10 md:pt-14 border-t border-zinc-200/90 w-full"
        >
          <div className="w-full flex items-center justify-center">
            <LogoCarousel columnCount={7} logos={allLogos} />
          </div>
        </div>
      </div>
    </section>
  );
}
