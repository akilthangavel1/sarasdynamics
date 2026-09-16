import React, { useState, useEffect } from "react";
import {
  Globe,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Tag,
  Share2,
  Edit2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api, type BlogPost } from "../../services/api";
import { AdminSeoModal } from "../AdminSeoModal";

export function SeoManagement() {
  const { hasPermission } = useAuth();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPostForSeo, setSelectedPostForSeo] = useState<BlogPost | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminBlogPosts({
        search: search || undefined,
        limit: 50,
      });
      if (res.success && res.data) {
        setPosts(res.data);
      }
    } catch (err) {
      console.error("Failed to load blog posts for SEO management:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  return (
    <div id="seo-management-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            SEO &amp; OpenGraph Metadata
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Configure search engine metadata, canonical URLs, and OpenGraph social preview tags across all published content.
          </p>
        </div>

        <button
          onClick={fetchPosts}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Filter articles for SEO audit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 bg-white shadow-2xs"
        />
      </form>

      {/* SEO Articles Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <th className="py-3 px-4">Article Title &amp; Slug</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Meta Title &amp; Description</th>
                <th className="py-3 px-4">OpenGraph Tags</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-400">
                    Loading content metadata...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-400">
                    No articles found.
                  </td>
                </tr>
              ) : (
                posts.map((post) => {
                  const hasSeo = Boolean(post.seo?.meta_title || post.seo?.metaTitle);
                  return (
                    <tr key={post.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-zinc-900">{post.title}</div>
                        <div className="text-zinc-400 font-mono text-[11px]">/blog/{post.slug}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            post.status === "PUBLISHED"
                              ? "bg-emerald-100 text-emerald-800"
                              : post.status === "DRAFT"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-zinc-100 text-zinc-700"
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        {hasSeo ? (
                          <div>
                            <div className="font-medium text-zinc-800 truncate">
                              {post.seo?.meta_title || post.seo?.metaTitle}
                            </div>
                            <div className="text-zinc-500 text-[11px] truncate">
                              {post.seo?.meta_description || post.seo?.metaDescription}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-medium border border-amber-200">
                            <AlertTriangle className="size-3" /> Default fallback active
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {post.seo?.og_image_url || post.seo?.ogImageUrl ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-200">
                            <Share2 className="size-3" /> Custom Card Configured
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-[11px]">Default Image</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {hasPermission("seo.manage") ? (
                          <button
                            onClick={() => setSelectedPostForSeo(post)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                          >
                            <Edit2 className="size-3" />
                            <span>Edit SEO</span>
                          </button>
                        ) : (
                          <span className="text-zinc-400 text-xs italic">Read Only</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEO Modal */}
      {selectedPostForSeo && (
        <AdminSeoModal
          post={selectedPostForSeo}
          isOpen={Boolean(selectedPostForSeo)}
          onClose={() => {
            setSelectedPostForSeo(null);
            fetchPosts();
          }}
        />
      )}
    </div>
  );
}
