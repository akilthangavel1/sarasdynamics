import { useEffect } from "react";
import type { BlogPost } from "../services/api";

export interface ComputedSeoTags {
  title: string;
  metaDescription: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string | null;
}

/**
 * Computes canonical SEO tags adhering strictly to Phase 8 specifications:
 * - Title: meta_title -> fallback to blog post title
 * - Meta Description: meta_description -> fallback to blog post excerpt
 * - Canonical URL: canonical_url -> fallback to canonical public blog post URL
 * - OG Title: og_title -> fallback to meta_title -> fallback to post title
 * - OG Description: og_description -> fallback to meta_description -> fallback to post excerpt
 * - OG Image: og_image_url -> fallback to featured image public URL if available
 */
export function computeBlogPostSeo(post: BlogPost): ComputedSeoTags {
  const metaTitle = (post.seo?.meta_title || post.seo?.metaTitle || "").trim();
  const metaDesc = (post.seo?.meta_description || post.seo?.metaDescription || "").trim();
  const rawCanonical = (post.seo?.canonical_url || post.seo?.canonicalUrl || "").trim();
  const rawOgTitle = (post.seo?.og_title || post.seo?.ogTitle || "").trim();
  const rawOgDesc = (post.seo?.og_description || post.seo?.ogDescription || "").trim();
  const rawOgImage = (post.seo?.og_image_url || post.seo?.ogImageUrl || "").trim();

  // 18. Title fallback: if meta_title is missing, fallback to blog post title
  const title = metaTitle || post.title;

  // 18. Description fallback: if meta_description is missing, fallback to blog post excerpt
  const metaDescription = metaDesc || post.excerpt || "";

  // 19. Canonical fallback: if canonical_url is missing, fallback to canonical public blog post URL
  const defaultCanonical =
    typeof window !== "undefined"
      ? `${window.location.origin}/#blog/${post.slug}`
      : `https://sarasdynamics.com/blog/${post.slug}`;
  const canonicalUrl = rawCanonical || defaultCanonical;

  // 19. OG Title fallback: if og_title is missing, fallback to meta_title or post title
  const ogTitle = rawOgTitle || metaTitle || post.title;

  // 19. OG Description fallback: if og_description is missing, fallback to meta_description or post excerpt
  const ogDescription = rawOgDesc || metaDesc || post.excerpt || "";

  // 19. OG Image fallback: if og_image_url is missing, fallback to featured image public URL if available
  const ogImageUrl = rawOgImage || post.featured_image_url || null;

  return {
    title,
    metaDescription,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImageUrl,
  };
}

/**
 * React hook to safely update document head with SEO and OpenGraph tags.
 * Ensures cleanup on unmount or when the active post changes.
 */
export function useBlogPostSeo(post: BlogPost | null) {
  useEffect(() => {
    if (!post || typeof document === "undefined") return;

    const prevTitle = document.title;
    const computed = computeBlogPostSeo(post);

    // 1. Document Title
    if (computed.title) {
      document.title = computed.title;
    }

    const createdElements: HTMLElement[] = [];

    // Helper to set or create meta tag
    const setMetaTag = (attributeName: string, attributeValue: string, content: string | null) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attributeName}="${attributeValue}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attributeName, attributeValue);
        document.head.appendChild(el);
        createdElements.push(el);
      }
      el.setAttribute("content", content);
    };

    // Helper to set or create link canonical
    const setLinkTag = (rel: string, href: string | null) => {
      if (!href) return;
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
        createdElements.push(el);
      }
      el.setAttribute("href", href);
    };

    // Meta Description
    setMetaTag("name", "description", computed.metaDescription);

    // Canonical link
    setLinkTag("canonical", computed.canonicalUrl);

    // OpenGraph tags
    setMetaTag("property", "og:title", computed.ogTitle);
    setMetaTag("property", "og:description", computed.ogDescription);
    setMetaTag("property", "og:url", computed.canonicalUrl);
    if (computed.ogImageUrl) {
      setMetaTag("property", "og:image", computed.ogImageUrl);
    }

    // Twitter card tags
    setMetaTag("name", "twitter:card", computed.ogImageUrl ? "summary_large_image" : "summary");
    setMetaTag("name", "twitter:title", computed.ogTitle);
    setMetaTag("name", "twitter:description", computed.ogDescription);
    if (computed.ogImageUrl) {
      setMetaTag("name", "twitter:image", computed.ogImageUrl);
    }

    return () => {
      // Revert title
      document.title = prevTitle;
      // Clean up injected elements
      createdElements.forEach((el) => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    };
  }, [post]);
}
