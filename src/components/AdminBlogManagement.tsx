import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  Send,
  Archive,
  Eye,
  Tag,
  RefreshCw,
  Search as SearchIcon,
  Globe,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api, type BlogPost, type SeoMetadata } from "../services/api";
import { AdminSeoModal } from "./AdminSeoModal";

interface AdminBlogManagementProps {
  onClose?: () => void;
}

export function AdminBlogManagement({ onClose }: AdminBlogManagementProps) {
  const { dbUser, roles, hasPermission } = useAuth();

  const isSuperAdmin = roles.includes("SUPER_ADMIN");
  const isAdmin = isSuperAdmin || roles.includes("ADMIN");
  const canReadSeo = hasPermission("seo.read");
  const canUpdateSeo = hasPermission("seo.update");
  const canCreatePost = hasPermission("blog.create");
  const canUpdatePost = hasPermission("blog.update");
  const canPublishPost = hasPermission("blog.publish");
  const canDeletePost = hasPermission("blog.delete");

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Active post for SEO editing modal
  const [seoModalPost, setSeoModalPost] = useState<BlogPost | null>(null);

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminBlogPosts({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
        limit: 50,
      });

      if (res.success && res.data) {
        setPosts(res.data);
      } else {
        showAlert("error", res.message || "Failed to load blog posts");
      }
    } catch (err: any) {
      showAlert("error", err.message || "Network error loading blog posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [statusFilter]);

  const handlePublish = async (post: BlogPost) => {
    try {
      const res = await api.publishAdminBlogPost(post.id);
      if (res.success) {
        showAlert("success", `Post '${post.title}' published.`);
        loadPosts();
      } else {
        showAlert("error", res.message || "Failed to publish post");
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to publish post");
    }
  };

  const handleArchive = async (post: BlogPost) => {
    try {
      const res = await api.archiveAdminBlogPost(post.id);
      if (res.success) {
        showAlert("success", `Post '${post.title}' archived.`);
        loadPosts();
      } else {
        showAlert("error", res.message || "Failed to archive post");
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to archive post");
    }
  };

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Are you sure you want to permanently delete '${post.title}'? All associated SEO metadata will be removed.`)) {
      return;
    }
    try {
      const res = await api.deleteAdminBlogPost(post.id);
      if (res.success) {
        showAlert("success", `Post '${post.title}' deleted.`);
        loadPosts();
      } else {
        showAlert("error", res.message || "Failed to delete post");
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to delete post");
    }
  };

  return (
    <div id="admin-blog-management" className="space-y-6">
      {/* Alert Banner */}
      {alert && (
        <div
          id="admin-blog-alert"
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
            alert.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
              : "bg-rose-950/40 border-rose-500/30 text-rose-300"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          )}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Status:</span>
            <select
              id="admin-blog-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Search Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadPosts();
            }}
            className="relative flex-1 sm:w-64"
          >
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              id="admin-blog-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden"
            />
          </form>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            id="admin-blog-refresh-btn"
            onClick={loadPosts}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Posts Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
              <th className="p-3.5">Post Title & Slug</th>
              <th className="p-3.5">Author</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">SEO Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading && posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                  Loading posts...
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  No blog posts found matching criteria.
                </td>
              </tr>
            ) : (
              posts.map((post) => {
                const isAuthor = post.author?.id === dbUser?.id;
                const canManagePost = isAdmin || isAuthor;

                return (
                  <tr key={post.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-100 text-sm">{post.title}</div>
                      <div className="font-mono text-[11px] text-slate-400">/{post.slug}</div>
                      {post.category && (
                        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {post.category.name}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-300">
                      {post.author?.full_name || "Unknown"}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          post.status === "PUBLISHED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : post.status === "DRAFT"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {post.seo ? (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="font-mono text-[11px]">Customized</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <span className="font-mono text-[11px]">Default Fallback</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* SEO Button */}
                        {(canReadSeo || canUpdateSeo) && canManagePost && (
                          <button
                            id={`edit-seo-btn-${post.id}`}
                            onClick={() => setSeoModalPost(post)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30 transition-colors"
                            title="Manage SEO & Social Metadata"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>SEO</span>
                          </button>
                        )}

                        {/* Publish / Archive Actions */}
                        {canPublishPost && post.status === "DRAFT" && (
                          <button
                            onClick={() => handlePublish(post)}
                            className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-950/40 transition-colors"
                            title="Publish Post"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canUpdatePost && post.status === "PUBLISHED" && (
                          <button
                            onClick={() => handleArchive(post)}
                            className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-950/40 transition-colors"
                            title="Archive Post"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete Action */}
                        {canDeletePost && (
                          <button
                            onClick={() => handleDelete(post)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors"
                            title="Delete Post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* SEO Modal */}
      {seoModalPost && (
        <AdminSeoModal
          post={seoModalPost}
          isOpen={true}
          onClose={() => setSeoModalPost(null)}
          onSaved={(newSeo) => {
            loadPosts();
          }}
        />
      )}
    </div>
  );
}

export default AdminBlogManagement;
