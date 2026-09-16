import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Search,
  Globe,
  Share2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Save,
  X,
  Sparkles,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import { api, type BlogPost, type SeoMetadata } from "../services/api";

interface AdminSeoModalProps {
  post: BlogPost;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (seo: SeoMetadata | null) => void;
}

export function AdminSeoModal({
  post,
  isOpen,
  onClose,
  onSaved,
}: AdminSeoModalProps) {
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasExistingSeo, setHasExistingSeo] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Active preview tab: "search" | "social"
  const [previewTab, setPreviewTab] = useState<"search" | "social">("search");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!isOpen || !post) return;

    setLoading(true);
    setAlert(null);
    setImageError(false);

    api
      .getBlogPostSeo(post.id)
      .then((res) => {
        if (res.success && res.data) {
          const seo = res.data;
          setMetaTitle(seo.meta_title || seo.metaTitle || "");
          setMetaDescription(seo.meta_description || seo.metaDescription || "");
          setOgTitle(seo.og_title || seo.ogTitle || "");
          setOgDescription(seo.og_description || seo.ogDescription || "");
          setCanonicalUrl(seo.canonical_url || seo.canonicalUrl || "");
          setOgImageUrl(seo.og_image_url || seo.ogImageUrl || "");
          setHasExistingSeo(true);
        } else {
          // Pre-populate sensible defaults from post for convenient authoring
          setMetaTitle(post.title || "");
          setMetaDescription(post.excerpt || "");
          setOgTitle(post.title || "");
          setOgDescription(post.excerpt || "");
          setCanonicalUrl("");
          setOgImageUrl(post.featured_image_url || "");
          setHasExistingSeo(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load SEO metadata:", err);
        setAlert({
          type: "error",
          message: err.message || "Failed to load existing SEO metadata",
        });
      })
      .finally(() => setLoading(false));
  }, [isOpen, post]);

  if (!isOpen) return null;

  // Live computed fallback values for previews
  const previewTitle = metaTitle.trim() || post.title || "Untitled Post";
  const previewDesc =
    metaDescription.trim() ||
    post.excerpt ||
    "Add a meta description to see how this post will appear in search results.";
  const previewCanonical =
    canonicalUrl.trim() ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/blog/${post.slug}`
      : `https://sarasdynamics.com/blog/${post.slug}`);
  const previewOgTitle = ogTitle.trim() || previewTitle;
  const previewOgDesc = ogDescription.trim() || previewDesc;
  const previewOgImage = ogImageUrl.trim() || post.featured_image_url || null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    // Basic frontend checks
    if (!metaTitle.trim()) {
      setAlert({ type: "error", message: "Meta Title is required." });
      setSaving(false);
      return;
    }
    if (metaTitle.trim().length > 60) {
      setAlert({
        type: "error",
        message: `Meta Title must be 60 characters or less (currently ${metaTitle.trim().length}).`,
      });
      setSaving(false);
      return;
    }

    if (!metaDescription.trim()) {
      setAlert({ type: "error", message: "Meta Description is required." });
      setSaving(false);
      return;
    }
    if (metaDescription.trim().length > 160) {
      setAlert({
        type: "error",
        message: `Meta Description must be 160 characters or less (currently ${metaDescription.trim().length}).`,
      });
      setSaving(false);
      return;
    }

    try {
      const payload = {
        meta_title: metaTitle.trim(),
        meta_description: metaDescription.trim(),
        og_title: ogTitle.trim() || null,
        og_description: ogDescription.trim() || null,
        canonical_url: canonicalUrl.trim() || null,
        og_image_url: ogImageUrl.trim() || null,
      };

      const res = await api.upsertBlogPostSeo(post.id, payload);
      if (res.success && res.data) {
        setHasExistingSeo(true);
        setAlert({
          type: "success",
          message: "SEO metadata saved successfully!",
        });
        if (onSaved) onSaved(res.data);
      } else {
        setAlert({
          type: "error",
          message: res.message || "Failed to save SEO metadata",
        });
      }
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err.message || "Network error while saving SEO metadata",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post's custom SEO metadata? Fallbacks will be used.")) {
      return;
    }

    setDeleting(true);
    setAlert(null);

    try {
      const res = await api.deleteBlogPostSeo(post.id);
      if (res.success) {
        setHasExistingSeo(false);
        setMetaTitle(post.title || "");
        setMetaDescription(post.excerpt || "");
        setOgTitle("");
        setOgDescription("");
        setCanonicalUrl("");
        setOgImageUrl("");
        setAlert({
          type: "success",
          message: "SEO metadata deleted. Post will use standard fallback metadata.",
        });
        if (onSaved) onSaved(null);
      } else {
        setAlert({
          type: "error",
          message: res.message || "Failed to delete SEO metadata",
        });
      }
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err.message || "Network error while deleting SEO metadata",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      id="admin-seo-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto"
    >
      <motion.div
        id="admin-seo-modal-card"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                SEO & Open Graph Metadata
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                  Phase 8
                </span>
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-md">
                Post: <span className="text-slate-200 font-medium">{post.title}</span>
              </p>
            </div>
          </div>

          <button
            id="admin-seo-modal-close-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Notification Alert */}
          {alert && (
            <div
              id="admin-seo-alert"
              className={`p-3.5 rounded-xl border flex items-center gap-3 text-sm ${
                alert.type === "success"
                  ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-950/40 border-rose-500/30 text-rose-300"
              }`}
            >
              {alert.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span className="text-xs">{alert.message}</span>
            </div>
          )}

          {/* Live Preview Switcher Section */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Live Previews (Updates in real time)
              </span>
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  id="seo-preview-search-tab"
                  onClick={() => setPreviewTab("search")}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                    previewTab === "search"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Search className="w-3 h-3" />
                  Search Result
                </button>
                <button
                  type="button"
                  id="seo-preview-social-tab"
                  onClick={() => setPreviewTab("social")}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                    previewTab === "social"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Share2 className="w-3 h-3" />
                  Social Card (OG)
                </button>
              </div>
            </div>

            {/* Google Search Engine Preview */}
            {previewTab === "search" && (
              <div
                id="search-engine-preview-box"
                className="bg-white rounded-xl p-4 shadow-sm text-zinc-900 font-sans border border-slate-200"
              >
                <div className="flex items-center gap-2 mb-1 text-[11px] text-zinc-600 truncate">
                  <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
                    S
                  </div>
                  <span className="font-medium text-zinc-800">Saras Dynamics</span>
                  <span className="text-zinc-400">›</span>
                  <span className="text-zinc-500 truncate">{previewCanonical}</span>
                </div>
                <h3 className="text-base sm:text-lg text-[#1a0dab] hover:underline font-normal cursor-pointer leading-snug truncate">
                  {previewTitle}
                </h3>
                <p className="text-xs sm:text-sm text-[#4d5156] mt-1 line-clamp-2 leading-relaxed">
                  {previewDesc}
                </p>
              </div>
            )}

            {/* Open Graph Social Card Preview */}
            {previewTab === "social" && (
              <div
                id="social-card-preview-box"
                className="max-w-md mx-auto rounded-xl overflow-hidden border border-slate-700 bg-slate-900 text-slate-200 shadow-md"
              >
                <div className="aspect-[1.91/1] w-full bg-slate-800 relative flex items-center justify-center overflow-hidden">
                  {previewOgImage && !imageError ? (
                    <img
                      src={previewOgImage}
                      alt="OG Preview"
                      referrerPolicy="no-referrer"
                      onError={() => setImageError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 gap-1.5 p-4 text-center">
                      <ImageIcon className="w-8 h-8 opacity-60" />
                      <span className="text-xs">
                        {imageError ? "Image failed to load (Check URL)" : "No OG image provided (Will use featured image if available)"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3.5 space-y-1 bg-slate-950">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-indigo-400">
                    sarasdynamics.com
                  </div>
                  <h4 className="text-sm font-semibold text-white truncate">
                    {previewOgTitle}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {previewOgDesc}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <form id="admin-seo-form" onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Meta Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="meta_title_input" className="font-medium text-slate-300">
                    Meta Title <span className="text-rose-400">*</span>
                  </label>
                  <span
                    className={`font-mono text-[11px] ${
                      metaTitle.length > 60
                        ? "text-rose-400 font-bold"
                        : metaTitle.length >= 50
                        ? "text-amber-400"
                        : "text-slate-500"
                    }`}
                  >
                    {metaTitle.length}/60
                  </span>
                </div>
                <input
                  id="meta_title_input"
                  type="text"
                  required
                  maxLength={60}
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Primary search title (e.g., Zero-Downtime Migration | Saras Dynamics)"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-500">
                  Optimal length: 50-60 chars. Shown in search results and browser tab.
                </p>
              </div>

              {/* OG Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="og_title_input" className="font-medium text-slate-300">
                    Open Graph Title <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <span
                    className={`font-mono text-[11px] ${
                      ogTitle.length > 60 ? "text-rose-400 font-bold" : "text-slate-500"
                    }`}
                  >
                    {ogTitle.length}/60
                  </span>
                </div>
                <input
                  id="og_title_input"
                  type="text"
                  maxLength={60}
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  placeholder="Defaults to Meta Title if blank"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-500">
                  Used when shared on LinkedIn, X, Slack, and Facebook.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Meta Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="meta_description_input" className="font-medium text-slate-300">
                    Meta Description <span className="text-rose-400">*</span>
                  </label>
                  <span
                    className={`font-mono text-[11px] ${
                      metaDescription.length > 160
                        ? "text-rose-400 font-bold"
                        : metaDescription.length >= 140
                        ? "text-amber-400"
                        : "text-slate-500"
                    }`}
                  >
                    {metaDescription.length}/160
                  </span>
                </div>
                <textarea
                  id="meta_description_input"
                  required
                  maxLength={160}
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Concise, informative summary for search engine snippets."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-500">
                  Optimal length: 120-160 chars.
                </p>
              </div>

              {/* OG Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="og_description_input" className="font-medium text-slate-300">
                    Open Graph Description <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <span
                    className={`font-mono text-[11px] ${
                      ogDescription.length > 160 ? "text-rose-400 font-bold" : "text-slate-500"
                    }`}
                  >
                    {ogDescription.length}/160
                  </span>
                </div>
                <textarea
                  id="og_description_input"
                  maxLength={160}
                  rows={3}
                  value={ogDescription}
                  onChange={(e) => setOgDescription(e.target.value)}
                  placeholder="Defaults to Meta Description if blank"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-500">
                  Card description for social networks.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Canonical URL */}
              <div className="space-y-1.5">
                <label htmlFor="canonical_url_input" className="block text-xs font-medium text-slate-300">
                  Canonical URL <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    id="canonical_url_input"
                    type="url"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://sarasdynamics.com/blog/..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  Prevents duplicate content penalties. Must be absolute HTTP/HTTPS URL.
                </p>
              </div>

              {/* OG Image URL */}
              <div className="space-y-1.5">
                <label htmlFor="og_image_url_input" className="block text-xs font-medium text-slate-300">
                  Open Graph Image URL <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <ImageIcon className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    id="og_image_url_input"
                    type="url"
                    value={ogImageUrl}
                    onChange={(e) => {
                      setOgImageUrl(e.target.value);
                      setImageError(false);
                    }}
                    placeholder="https://... (1200x630 recommended)"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  Must be absolute HTTP/HTTPS URL. Falls back to post featured image if blank.
                </p>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div>
                {hasExistingSeo && (
                  <button
                    type="button"
                    id="admin-seo-delete-btn"
                    disabled={deleting || saving}
                    onClick={handleDelete}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-800/40 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{deleting ? "Deleting..." : "Delete Custom SEO"}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="admin-seo-cancel-btn"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="admin-seo-save-btn"
                  disabled={saving || deleting || loading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : "Save SEO Metadata"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminSeoModal;
