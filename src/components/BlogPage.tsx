import React, { useState } from "react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { SiteFooter } from "@/components/ui/site-footer";
import { BlogSection } from "@/components/ui/blog-section";
import { BlogPostDetailModal } from "./BlogPostDetailModal";
import { api, type BlogPost } from "../services/api";

interface BlogPageProps {
  onBackToHome?: () => void;
}

export function BlogPage({ onBackToHome }: BlogPageProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectPost = async (slug: string) => {
    try {
      const res = await api.getPublicBlogPostBySlug(slug);
      if (res.success && res.data) {
        setSelectedPost(res.data);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to load blog post by slug:", slug, err);
    }
  };

  return (
    <div id="blog-page-wrapper" className="w-full min-h-screen bg-white text-zinc-900 flex flex-col selection:bg-zinc-900 selection:text-white">
      {/* Sticky Responsive Header Navigation */}
      <Navbar1Demo />

      {/* Main Blog Page Content */}
      <main className="flex-1 w-full py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
        {/* The BlogSection Component with exact design */}
        <BlogSection onSelectPost={handleSelectPost} />
      </main>

      {/* Public Blog Post Detail with Phase 8 SEO Rendering */}
      {selectedPost && (
        <BlogPostDetailModal
          post={selectedPost}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPost(null);
          }}
        />
      )}

      {/* Global Footer */}
      <SiteFooter />
    </div>
  );
}

export default BlogPage;
