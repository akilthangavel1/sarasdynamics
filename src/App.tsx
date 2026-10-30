import { useState, useEffect } from 'react';
import Navbar1Demo from '@/components/ui/navbar-demo';
import InteractiveHoverLinks from '@/components/ui/interactive-hover-links';
import ExpandableGallery from '@/components/ui/expandable-gallery';
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
import FloatingAIChat from '@/components/ui/floating-ai-chat';
import PerspectiveTunnelHero from '@/components/ui/perspective-tunnel-hero';
import FinalCtaBanner from '@/components/ui/final-cta-banner';

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
      } else if (
        hash === '#home' ||
        hash === '' ||
        hash === '#' ||
        hash === '#services' ||
        hash === '#work' ||
        hash.startsWith('#gallery') ||
        hash.startsWith('#expandable')
      ) {
        setCurrentPage('home');
        if (hash && hash !== '#home' && hash !== '#') {
          setTimeout(() => {
            const targetEl = document.querySelector(hash);
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: 'smooth' });
            }
          }, 60);
        }
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
    } else if (
      initialHash === '#services' ||
      initialHash === '#work' ||
      initialHash.startsWith('#gallery') ||
      initialHash.startsWith('#expandable')
    ) {
      setCurrentPage('home');
      setTimeout(() => {
        const targetEl = document.querySelector(initialHash);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
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

  const renderPageContent = () => {
    if (currentPage === 'management') {
      return (
        <ProtectedRoute fallbackMessage="You must sign in with an authorized administrative account to access the Management Console.">
          <ManagementConsolePage
            initialSubTab={managementSubTab}
            onNavigateHome={() => navigateTo('home')}
          />
        </ProtectedRoute>
      );
    }

    if (currentPage === 'login') {
      return <AuthPage initialView="login" onBackToHome={() => navigateTo('home')} />;
    }

    if (currentPage === 'register') {
      return <AuthPage initialView="register" onBackToHome={() => navigateTo('home')} />;
    }

    if (currentPage === 'forgot-password') {
      return <AuthPage initialView="forgot-password" onBackToHome={() => navigateTo('home')} />;
    }

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
      <div id="page-wrapper" className="w-full min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-300">
        {/* Sticky Responsive Header Navigation */}
        <Navbar1Demo />

        {/* Semantic Main Content Landmark */}
        <main id="main-content" className="flex-1 w-full flex flex-col">
          {/* Perspective Tunnel Hero Section */}
          <section id="hero" aria-label="Hero">
            <PerspectiveTunnelHero />
          </section>

          {/* Interactive Hover Links / Services Section */}
          <section id="services" aria-label="Services & Solutions">
            <InteractiveHoverLinks />
          </section>

          {/* Expandable Gallery / Work Showcase */}
          <section id="work" aria-label="Selected Works & Case Studies">
            <ExpandableGallery />
          </section>

          {/* Latest Blog Cards Section */}
          <section id="blog-preview" aria-label="Engineering Blog">
            <BlogCards />
          </section>

          {/* Final CTA Banner Section */}
          <section id="cta" aria-label="Get Started" className="w-full">
            <FinalCtaBanner />
          </section>
        </main>

        {/* Global Site Footer */}
        <SiteFooter />
      </div>
    );
  };

  return (
    <>
      {/* Global Auth Modal for instant dialog popups */}
      <AuthModal />

      {/* Render Current Page Content */}
      {renderPageContent()}

      {/* Floating AI Chat Widget across all pages at bottom-right */}
      <FloatingAIChat />
    </>
  );
}

