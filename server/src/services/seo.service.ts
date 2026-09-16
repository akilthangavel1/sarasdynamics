import { seoRepository } from "../repositories/seo.repository.js";
import { blogRepository } from "../repositories/blog.repository.js";
import { auditService } from "./audit.service.js";
import { validateSeoPayload, type ValidatedSeoInput } from "../utils/seoValidation.js";
import type { SeoMetadataRecord } from "../db/schema.js";

export function formatSeoRecord(record: SeoMetadataRecord | null) {
  if (!record) return null;
  return {
    id: record.id,
    blog_post_id: record.blog_post_id,
    blogPostId: record.blog_post_id,
    meta_title: record.meta_title,
    metaTitle: record.meta_title,
    meta_description: record.meta_description,
    metaDescription: record.meta_description,
    og_title: record.og_title,
    ogTitle: record.og_title,
    og_description: record.og_description,
    ogDescription: record.og_description,
    og_image_url: record.og_image_url,
    ogImageUrl: record.og_image_url,
    canonical_url: record.canonical_url,
    canonicalUrl: record.canonical_url,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

export function extractUser(currentUser?: any): { id: string | null; roles: string[] } | undefined {
  if (!currentUser) return undefined;
  const id = currentUser?.user?.id || currentUser?.id || null;
  const roles = Array.isArray(currentUser?.roles)
    ? currentUser.roles.map((r: any) => (typeof r === "string" ? r : r?.name))
    : [];
  return { id, roles };
}

export class SeoService {
  /**
   * Helper: verify blog post existence and return it
   */
  private async getBlogPostOrThrow(blogPostId: string) {
    if (!blogPostId || typeof blogPostId !== "string") {
      const error: any = new Error("Valid blog post ID is required.");
      error.status = 400;
      throw error;
    }

    const post = await blogRepository.findPostById(blogPostId.trim());
    if (!post) {
      const error: any = new Error(`Blog post not found: ${blogPostId}`);
      error.status = 404;
      throw error;
    }
    return post;
  }

  /**
   * Get SEO metadata by blog post ID (Admin)
   */
  public async getSeoByBlogPostId(
    blogPostId: string,
    currentUser?: any
  ) {
    const post = await this.getBlogPostOrThrow(blogPostId);
    const user = extractUser(currentUser);

    // IDOR check for content writers: if not admin/super_admin, check post author
    if (user && user.roles.length > 0) {
      const isAdmin =
        user.roles.includes("ADMIN") ||
        user.roles.includes("SUPER_ADMIN");
      if (!isAdmin && post.author_id !== user.id) {
        const error: any = new Error(
          "Forbidden: You do not have permission to view SEO metadata for this post."
        );
        error.status = 403;
        throw error;
      }
    }

    const record = await seoRepository.findByBlogPostId(post.id);
    return formatSeoRecord(record);
  }

  /**
   * Upsert SEO metadata for a blog post
   */
  public async upsertSeo(
    blogPostId: string,
    payload: any,
    currentUser?: any
  ) {
    const post = await this.getBlogPostOrThrow(blogPostId);
    const user = extractUser(currentUser);

    // IDOR check: if not admin/super_admin, must be post author
    if (user && user.roles.length > 0) {
      const isAdmin =
        user.roles.includes("ADMIN") ||
        user.roles.includes("SUPER_ADMIN");
      if (!isAdmin && post.author_id !== user.id) {
        const error: any = new Error(
          "Forbidden: You do not have permission to modify SEO metadata for this post."
        );
        error.status = 403;
        throw error;
      }
    }

    const validated: ValidatedSeoInput = validateSeoPayload(payload);

    const oldRecord = await seoRepository.findByBlogPostId(post.id);
    const record = await seoRepository.upsert(post.id, validated);

    await auditService.record({
      userId: user?.id || null,
      action: oldRecord ? "UPDATE" : "CREATE",
      module: "SEO",
      entityType: "SEO_METADATA",
      entityId: record.id,
      oldValues: oldRecord
        ? {
            meta_title: oldRecord.meta_title,
            meta_description: oldRecord.meta_description,
          }
        : null,
      newValues: {
        meta_title: record.meta_title,
        meta_description: record.meta_description,
      },
    });

    return formatSeoRecord(record);
  }

  /**
   * Delete SEO metadata for a blog post
   */
  public async deleteSeo(
    blogPostId: string,
    currentUser?: any
  ) {
    const post = await this.getBlogPostOrThrow(blogPostId);
    const user = extractUser(currentUser);

    // IDOR check: if not admin/super_admin, must be post author
    if (user && user.roles.length > 0) {
      const isAdmin =
        user.roles.includes("ADMIN") ||
        user.roles.includes("SUPER_ADMIN");
      if (!isAdmin && post.author_id !== user.id) {
        const error: any = new Error(
          "Forbidden: You do not have permission to delete SEO metadata for this post."
        );
        error.status = 403;
        throw error;
      }
    }

    const oldRecord = await seoRepository.findByBlogPostId(post.id);
    const deleted = await seoRepository.deleteByBlogPostId(post.id);

    if (deleted && oldRecord) {
      await auditService.record({
        userId: user?.id || null,
        action: "DELETE",
        module: "SEO",
        entityType: "SEO_METADATA",
        entityId: oldRecord.id,
        oldValues: {
          blog_post_id: post.id,
          meta_title: oldRecord.meta_title,
          meta_description: oldRecord.meta_description,
        },
      });
    }

    return { success: true, deleted };
  }

  /**
   * Public retrieval: Get SEO metadata for a published post by ID or Slug
   */
  public async getPublicSeoForPost(post: { id: string; status: string }) {
    if (post.status !== "PUBLISHED") {
      return null;
    }
    const record = await seoRepository.findByBlogPostId(post.id);
    return formatSeoRecord(record);
  }
}

export const seoService = new SeoService();
export default seoService;
