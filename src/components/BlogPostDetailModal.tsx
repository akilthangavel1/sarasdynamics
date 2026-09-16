import React, { useState } from "react";
import { motion } from "motion/react";
import {
  X,
  Calendar,
  User,
  Tag,
  Share2,
  Globe,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import type { BlogPost } from "../services/api";
import { useBlogPostSeo, computeBlogPostSeo } from "../utils/seoRenderer";

interface BlogPostDetailModalProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BlogPostDetailModal({
  post,
  isOpen,
  onClose,
}: BlogPostDetailModalProps) {
  // Activate SEO tags in head
  useBlogPostSeo(isOpen ? post : null);

  const [showSeoInspector, setShowSeoInspector] = useState(false);

  if (!isOpen || !post) return null;

  const computedSeo = computeBlogPostSeo(post);

  return (
    <div
      id="blog-post-detail-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto"
    >
      <motion.div
        id="blog-post-detail-card"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              {post.category?.name || "Insights"}
            </span>
            <span className="text-xs text-slate-500">/{post.slug}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* SEO Inspector Toggle */}
            <button
              id="toggle-seo-inspector-btn"
              onClick={() => setShowSeoInspector(!showSeoInspector)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
              title="Inspect rendered SEO and OpenGraph metadata"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>SEO Tags</span>
              {showSeoInspector ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            <button
              id="blog-detail-modal-close-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SEO Inspector Drawer */}
        {showSeoInspector && (
          <motion.div
            id="seo-metadata-inspector-drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-slate-800 bg-slate-950 p-4 space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-indigo-400 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                Active SEO & OpenGraph Tags (Computed with Fallbacks)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {post.seo ? "Custom Record Applied" : "System Fallback Active"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <div>
                  <span className="text-slate-400">Title: </span>
                  <span className="text-slate-100 font-medium">{computedSeo.title}</span>
                </div>
                <div>
                  <span className="text-slate-400">Canonical: </span>
                  <span className="text-indigo-300 font-mono text-[11px] truncate block">
                    {computedSeo.canonicalUrl}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Description: </span>
                  <span className="text-slate-300">{computedSeo.metaDescription}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div>
                  <span className="text-slate-400">OG Title: </span>
                  <span className="text-slate-100 font-medium">{computedSeo.ogTitle}</span>
                </div>
                <div>
                  <span className="text-slate-400">OG Description: </span>
                  <span className="text-slate-300">{computedSeo.ogDescription}</span>
                </div>
                <div>
                  <span className="text-slate-400">OG Image: </span>
                  <span className="text-indigo-300 font-mono text-[11px] truncate block">
                    {computedSeo.ogImageUrl || "None"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Post Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="rounded-xl overflow-hidden aspect-[2/1] max-h-72 w-full bg-slate-950 border border-slate-800">
              <img
                src={post.featured_image_url}
                alt={post.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title & Metadata */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>{post.author?.full_name || "Saras Dynamics Team"}</span>
              </div>
              {post.published_at && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {new Date(post.published_at).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Excerpt Lead */}
          {post.excerpt && (
            <div className="p-4 rounded-xl bg-slate-950/50 border-l-2 border-indigo-500 text-slate-300 text-sm italic">
              {post.excerpt}
            </div>
          )}

          {/* Content Body */}
          <div className="prose prose-invert prose-indigo max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-4 border-t border-slate-800 flex items-center gap-2 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              {post.tags.map((t) => (
                <span
                  key={t.id}
                  className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-mono"
                >
                  #{t.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default BlogPostDetailModal;
