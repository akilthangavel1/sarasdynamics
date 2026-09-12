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
      <main className="flex-1 w-full py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200/90 bg-white text-xs font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-2xs cursor-pointer active:scale-98"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Home</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100/90 border border-zinc-200/80 text-xs font-medium text-zinc-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <BookOpen className="size-3.5 text-zinc-900" />
            <span>Engineering Dispatches &bull; Saras Dynamics</span>
          </div>
        </div>

        {/* The BlogSection Component with updated engineering publications */}
        <BlogSection />
      </main>

      {/* Global Footer */}
      <SiteFooter />
    </div>
  );
}

export default BlogPage;
