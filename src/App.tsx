import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Navbar1Demo from '@/components/ui/navbar-demo';
import AboutSection from './components/AboutSection';
import InteractiveHoverLinks from '@/components/ui/interactive-hover-links';
import ExpandableGallery from '@/components/ui/expandable-gallery';
import { TestimonialsSection } from '@/components/ui/testimonial-v2';
import { SiteFooter } from '@/components/ui/site-footer';
import { BlogCards } from '@/components/ui/cards';
import ContactPage from './components/ContactPage';
import AboutPage from './components/AboutPage';
import RecentHirePage from './components/RecentHirePage';
import CareersPage from './components/CareersPage';
import BlogPage from './components/BlogPage';
import WebDevelopmentPage from './components/WebDevelopmentPage';
import MobileDevelopmentPage from './components/MobileDevelopmentPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'contact' | 'about' | 'recent-hires' | 'careers' | 'blog' | 'web' | 'mobile'>('home');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#contact') {
        setCurrentPage('contact');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#about') {
        setCurrentPage('about');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#recent-hires' || hash === '#admin-recent-hires' || hash === '#recent-hire' || hash === '#admin') {
        setCurrentPage('recent-hires');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#careers' || hash === '#career') {
        setCurrentPage('careers');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#blog' || hash === '#blogs') {
        setCurrentPage('blog');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#web' || hash === '#web-development' || hash === '#web-dev') {
        setCurrentPage('web');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#mobile' || hash === '#mobile-development' || hash === '#mobile-dev') {
        setCurrentPage('mobile');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#home' || hash === '' || hash === '#') {
        setCurrentPage('home');
      }
    };

    // Check initial hash
    if (window.location.hash === '#contact') {
      setCurrentPage('contact');
    } else if (window.location.hash === '#about') {
      setCurrentPage('about');
    } else if (window.location.hash === '#careers' || window.location.hash === '#career') {
      setCurrentPage('careers');
    } else if (window.location.hash === '#blog' || window.location.hash === '#blogs') {
      setCurrentPage('blog');
    } else if (
      window.location.hash === '#web' ||
      window.location.hash === '#web-development' ||
      window.location.hash === '#web-dev'
    ) {
      setCurrentPage('web');
    } else if (
      window.location.hash === '#mobile' ||
      window.location.hash === '#mobile-development' ||
      window.location.hash === '#mobile-dev'
    ) {
      setCurrentPage('mobile');
    } else if (
      window.location.hash === '#recent-hires' ||
      window.location.hash === '#admin-recent-hires' ||
      window.location.hash === '#recent-hire' ||
      window.location.hash === '#admin'
    ) {
      setCurrentPage('recent-hires');
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: 'home' | 'contact' | 'about' | 'recent-hires' | 'careers' | 'blog' | 'web' | 'mobile') => {
    setCurrentPage(page);
    window.location.hash =
      page === 'contact'
        ? '#contact'
        : page === 'about'
        ? '#about'
        : page === 'recent-hires'
        ? '#recent-hires'
        : page === 'careers'
        ? '#careers'
        : page === 'blog'
        ? '#blog'
        : page === 'web'
        ? '#web'
        : page === 'mobile'
        ? '#mobile'
        : '#';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentPage === 'contact') {
    return <ContactPage onBackToHome={() => navigateTo('home')} />;
  }

  if (currentPage === 'about') {
    return <AboutPage onBackToHome={() => navigateTo('home')} />;
  }

  if (currentPage === 'recent-hires') {
    return <RecentHirePage onBackToHome={() => navigateTo('home')} />;
  }

  if (currentPage === 'careers') {
    return <CareersPage onBackToHome={() => navigateTo('home')} />;
  }

  if (currentPage === 'blog') {
    return <BlogPage onBackToHome={() => navigateTo('home')} />;
  }

  if (currentPage === 'web') {
    return <WebDevelopmentPage onBackToHome={() => navigateTo('home')} />;
  }

  if (currentPage === 'mobile') {
    return <MobileDevelopmentPage onBackToHome={() => navigateTo('home')} />;
  }

  return (
    <div id="page-wrapper" className="w-full min-h-screen bg-white flex flex-col">
      {/* Sticky Responsive Header Navigation */}
      <Navbar1Demo />

      <main
        id="hero-canvas"
        className="min-h-screen w-full bg-[#ffffff] flex flex-col justify-center items-center relative overflow-hidden px-6 py-12 select-none"
      >
        {/* Primary Hero Content */}
        <section
          id="hero-content"
          className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center justify-center text-center my-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center"
          >
            {/* Main Display Headline */}
            <h1
              id="hero-headline"
              className="flex flex-col items-center justify-center font-black tracking-[-0.045em] leading-[0.87] select-text"
            >
              <span
                id="hero-line-1"
                className="text-black text-[clamp(3.8rem,13vw,10.2rem)] block transition-transform duration-300"
              >
                THE JOURNEY
              </span>
              <span
                id="hero-line-2"
                className="text-[#c30000] text-[clamp(3.8rem,13vw,10.2rem)] block transition-transform duration-300"
              >
                CONTINUES.
              </span>
            </h1>

            {/* Statement / Subtitle */}
            <p
              id="hero-statement"
              className="mt-8 sm:mt-10 md:mt-14 font-extrabold text-[0.8rem] sm:text-xs md:text-sm lg:text-[0.98rem] tracking-[0.05em] sm:tracking-[0.07em] text-black max-w-3xl sm:max-w-4xl leading-relaxed uppercase px-2"
            >
              EXPERIENCE VISCERAL DIGITAL STORYTELLING THROUGH{' '}
              <span
                id="hero-highlight-motion"
                className="text-[#c30000] hover:underline cursor-pointer transition-all duration-200 underline-offset-4"
              >
                UNCOMPROMISING MOTION
              </span>
              ,
              <br className="hidden sm:inline" />{' '}
              ARCHITECTURAL DEPTH, AND{' '}
              <span
                id="hero-highlight-interaction"
                className="text-[#c30000] hover:underline cursor-pointer transition-all duration-200 underline-offset-4"
              >
                BESPOKE INTERACTION
              </span>
              .
            </p>
          </motion.div>
        </section>
      </main>

      {/* About Section (White Theme) */}
      <AboutSection />

      {/* Interactive Hover Links Section */}
      <InteractiveHoverLinks />

      {/* Expandable Gallery Section */}
      <ExpandableGallery />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Latest Blog Cards Section */}
      <BlogCards />

      {/* Site Footer */}
      <SiteFooter />
    </div>
  );
}


