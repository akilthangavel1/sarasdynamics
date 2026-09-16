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
import AuthPage from './components/auth/AuthPage';
import AuthModal from './components/auth/AuthModal';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ManagementConsolePage } from './components/management/ManagementConsolePage';

export type PageRoute =
  | 'home'
  | 'contact'
  | 'about'
  | 'recent-hires'
  | 'careers'
  | 'blog'
  | 'web'
  | 'mobile'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'management';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [managementSubTab, setManagementSubTab] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#management')) {
        const sub = hash.replace(/^#management\/?/, '');
        setManagementSubTab(sub || undefined);
        setCurrentPage('management');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#contact') {
        setCurrentPage('contact');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#about') {
        setCurrentPage('about');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (
        hash === '#recent-hires' ||
        hash === '#admin-recent-hires' ||
        hash === '#recent-hire'
      ) {
        setCurrentPage('recent-hires');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#careers' || hash === '#career') {
        setCurrentPage('careers');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#admin') {
        // Redirect legacy #admin to #management
        window.location.hash = '#management';
      } else if (hash === '#blog' || hash === '#blogs') {
        setCurrentPage('blog');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (
        hash === '#web' ||
        hash === '#web-development' ||
        hash === '#web-dev'
      ) {
        setCurrentPage('web');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (
        hash === '#mobile' ||
        hash === '#mobile-development' ||
        hash === '#mobile-dev'
      ) {
        setCurrentPage('mobile');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#login' || hash === '#signin' || hash === '#auth') {
        setCurrentPage('login');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#register' || hash === '#signup') {
        setCurrentPage('register');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#forgot-password' || hash === '#reset-password') {
        setCurrentPage('forgot-password');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#home' || hash === '' || hash === '#') {
        setCurrentPage('home');
      }
    };

    // Check initial hash
    const initialHash = window.location.hash;
    if (initialHash.startsWith('#management')) {
      const sub = initialHash.replace(/^#management\/?/, '');
      setManagementSubTab(sub || undefined);
      setCurrentPage('management');
    } else if (initialHash === '#contact') {
      setCurrentPage('contact');
    } else if (initialHash === '#about') {
      setCurrentPage('about');
    } else if (initialHash === '#careers' || initialHash === '#career') {
      setCurrentPage('careers');
    } else if (initialHash === '#admin') {
      window.location.hash = '#management';
    } else if (initialHash === '#blog' || initialHash === '#blogs') {
      setCurrentPage('blog');
    } else if (
      initialHash === '#web' ||
      initialHash === '#web-development' ||
      initialHash === '#web-dev'
    ) {
      setCurrentPage('web');
    } else if (
      initialHash === '#mobile' ||
      initialHash === '#mobile-development' ||
      initialHash === '#mobile-dev'
    ) {
      setCurrentPage('mobile');
    } else if (
      initialHash === '#recent-hires' ||
      initialHash === '#admin-recent-hires' ||
      initialHash === '#recent-hire'
    ) {
      setCurrentPage('recent-hires');
    } else if (initialHash === '#login' || initialHash === '#signin' || initialHash === '#auth') {
      setCurrentPage('login');
    } else if (initialHash === '#register' || initialHash === '#signup') {
      setCurrentPage('register');
    } else if (initialHash === '#forgot-password' || initialHash === '#reset-password') {
      setCurrentPage('forgot-password');
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: PageRoute) => {
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
        : page === 'management'
        ? '#management'
        : page === 'blog'
        ? '#blog'
        : page === 'web'
        ? '#web'
        : page === 'mobile'
        ? '#mobile'
        : page === 'login'
        ? '#login'
        : page === 'register'
        ? '#register'
        : page === 'forgot-password'
        ? '#forgot-password'
        : '#';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentPage === 'management') {
    return (
      <ProtectedRoute fallbackMessage="You must sign in with an authorized administrative account to access the Management Console.">
        <AuthModal />
        <ManagementConsolePage
          initialSubTab={managementSubTab}
          onNavigateHome={() => navigateTo('home')}
        />
      </ProtectedRoute>
    );
  }

  if (currentPage === 'login') {
    return (
      <>
        <AuthModal />
        <AuthPage initialView="login" onBackToHome={() => navigateTo('home')} />
      </>
    );
  }

  if (currentPage === 'register') {
    return (
      <>
        <AuthModal />
        <AuthPage initialView="register" onBackToHome={() => navigateTo('home')} />
      </>
    );
  }

  if (currentPage === 'forgot-password') {
    return (
      <>
        <AuthModal />
        <AuthPage initialView="forgot-password" onBackToHome={() => navigateTo('home')} />
      </>
    );
  }

  if (currentPage === 'contact') {
    return (
      <>
        <AuthModal />
        <ContactPage onBackToHome={() => navigateTo('home')} />
      </>
    );
  }

  if (currentPage === 'about') {
    return (
      <>
        <AuthModal />
        <AboutPage onBackToHome={() => navigateTo('home')} />
      </>
    );
  }

  if (currentPage === 'recent-hires') {
    return (
      <>
        <AuthModal />
        <RecentHirePage onBackToHome={() => navigateTo('home')} />
      </>
    );
  }

  if (currentPage === 'careers') {
    return (
      <>
        <AuthModal />
        <CareersPage onBackToHome={() => navigateTo('home')} />
      </>
    );
  }

  if (currentPage === 'blog') {
    return (
      <>
        <AuthModal />
        <BlogPage onBackToHome={() => navigateTo('home')} />
      </>
    );
  }

  if (currentPage === 'web') {
    return (
      <>
        <AuthModal />
        <WebDevelopmentPage onBackToHome={() => navigateTo('home')} />
      </>
    );
  }

  if (currentPage === 'mobile') {
    return (
      <>
        <AuthModal />
        <MobileDevelopmentPage onBackToHome={() => navigateTo('home')} />
      </>
    );
  }

  return (
    <div id="page-wrapper" className="w-full min-h-screen bg-white flex flex-col">
      {/* Global Auth Modal for instant dialog popups */}
      <AuthModal />

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
            {/* Brand Eyebrow Tag */}
            <div
              id="hero-brand-tag"
              className="mb-6 sm:mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-200/90 bg-zinc-50 text-zinc-900 text-xs sm:text-sm font-semibold tracking-wide shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#c30000] animate-pulse" />
              <span>SARAS DYNAMICS &bull; SOFTWARE &amp; AI SYSTEMS</span>
            </div>

            {/* Main Display Headline */}
            <h1
              id="hero-headline"
              className="flex flex-col items-center justify-center font-black tracking-[-0.045em] leading-[0.87] select-text"
            >
              <span
                id="hero-line-1"
                className="text-black text-[clamp(3.8rem,13vw,10.2rem)] block transition-transform duration-300"
              >
                SARAS
              </span>
              <span
                id="hero-line-2"
                className="text-[#c30000] text-[clamp(3.8rem,13vw,10.2rem)] block transition-transform duration-300"
              >
                DYNAMICS.
              </span>
            </h1>

            {/* Statement / Subtitle */}
            <p
              id="hero-statement"
              className="mt-8 sm:mt-10 md:mt-12 font-extrabold text-[0.8rem] sm:text-xs md:text-sm lg:text-[0.98rem] tracking-[0.05em] sm:tracking-[0.07em] text-zinc-900 max-w-3xl sm:max-w-4xl leading-relaxed uppercase px-2"
            >
              BUILDING NEXT-GENERATION SOFTWARE,{' '}
              <span
                id="hero-highlight-ai"
                onClick={() => navigateTo('web')}
                className="text-[#c30000] hover:underline cursor-pointer transition-all duration-200 underline-offset-4"
              >
                AI SYSTEMS
              </span>
              ,
              <br className="hidden sm:inline" />{' '}
              AND INTELLIGENT AUTOMATION WITH{' '}
              <span
                id="hero-highlight-engineering"
                onClick={() => navigateTo('mobile')}
                className="text-[#c30000] hover:underline cursor-pointer transition-all duration-200 underline-offset-4"
              >
                ARCHITECTURAL PRECISION
              </span>
              .
            </p>

            {/* Hero Action Buttons */}
            <div
              id="hero-actions"
              className="mt-9 sm:mt-11 flex flex-wrap items-center justify-center gap-3.5 z-20"
            >
              <button
                id="hero-primary-cta"
                onClick={() => {
                  document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-black text-white font-semibold text-sm hover:bg-zinc-800 transition-all duration-200 shadow-sm cursor-pointer"
              >
                Explore Ecosystem &darr;
              </button>
              <button
                id="hero-secondary-cta"
                onClick={() => navigateTo('contact')}
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-zinc-300 bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-50 hover:border-zinc-400 transition-all duration-200 cursor-pointer"
              >
                Contact Us
              </button>
            </div>
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
