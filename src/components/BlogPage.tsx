import React from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { SiteFooter } from "@/components/ui/site-footer";
import { BlogSection } from "@/components/ui/blog-section";

interface BlogPageProps {
  onBackToHome?: () => void;
}

export function BlogPage({ onBackToHome }: BlogPageProps) {
  return (
    <div id="blog-page-wrapper" className="w-full min-h-screen bg-white text-zinc-900 flex flex-col selection:bg-zinc-900 selection:text-white">
      {/* Sticky Responsive Header Navigation */}
      <Navbar1Demo />

      {/* Main Blog Page Content */}
      <main className="flex-1 w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-200 bg-white text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 transition-colors shadow-2xs cursor-pointer active:scale-98"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Home</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-600">
            <BookOpen className="size-3.5 text-zinc-800" />
            <span>Articles & Insights</span>
          </div>
        </div>

        {/* The BlogSection Component with exact design */}
        <BlogSection />
      </main>

      {/* Global Footer */}
      <SiteFooter />
    </div>
  );
}

export default BlogPage;
