import { blogRepository, type BlogPostWithRelations } from "../repositories/blog.repository.js";
import { seoRepository } from "../repositories/seo.repository.js";
import { storageService } from "./storage.service.js";
import { auditService } from "./audit.service.js";
import { validateBlogImageFile } from "../utils/fileValidation.js";
import config from "../config/index.js";
import type { BlogCategoryRecord, BlogTagRecord, BlogPostStatus } from "../db/schema.js";

export class BlogService {
  /**
   * Helper to extract user ID from authenticated request user context
   */
  public extractUserId(currentUser: any): string | null {
    return currentUser?.user?.id || currentUser?.id || null;
  }

  /**
   * Helper to check if user has admin/super_admin oversight roles
   */
  public isAdminUser(currentUser: any): boolean {
    const userRoles: string[] = Array.isArray(currentUser?.roles)
      ? currentUser.roles.map((r: any) => (typeof r === "string" ? r : r?.name))
      : [];
    return userRoles.includes("ADMIN") || userRoles.includes("SUPER_ADMIN");
  }

  /**
   * Enforces author ownership or administrative privileges.
   * CONTENT_WRITER can only modify their own posts.
   * ADMIN and SUPER_ADMIN can modify any post.
   */
  private verifyPostOwnership(post: BlogPostWithRelations, currentUser: any): void {
    const userId = this.extractUserId(currentUser);
    const isAdmin = this.isAdminUser(currentUser);

    if (!isAdmin && (!userId || post.author_id !== userId)) {
      const error: any = new Error("Forbidden: You do not have permission to modify another author's blog post.");
      error.status = 403;
      throw error;
    }
  }

  /* =========================================================================
   * 1. CATEGORIES
   * ========================================================================= */

  public async getCategories(options?: { onlyActive?: boolean }): Promise<BlogCategoryRecord[]> {
    return blogRepository.listCategories(options);
  }

  public async getCategoryById(id: string): Promise<BlogCategoryRecord> {
    const cat = await blogRepository.findCategoryById(id);
    if (!cat) {
      const error: any = new Error(`Category not found with id: ${id}`);
      error.status = 404;
      throw error;
    }
    return cat;
  }

  public async createCategory(
    data: {
      name: string;
      slug?: string;
      description?: string;
      is_active?: boolean;
      display_order?: number;
    },
    currentUser?: any
  ): Promise<BlogCategoryRecord> {
    if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
      const error: any = new Error("Category name is required.");
      error.status = 400;
      throw error;
    }
    const created = await blogRepository.createCategory(data);

    await auditService.record({
      userId: this.extractUserId(currentUser),
      action: "CREATE",
      module: "BLOG",
      entityType: "BLOG_CATEGORY",
      entityId: created.id,
      newValues: {
        name: created.name,
        slug: created.slug,
      },
    });

    return created;
  }

  public async updateCategory(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      description: string | null;
      is_active: boolean;
      display_order: number;
    }>,
    currentUser?: any
  ): Promise<BlogCategoryRecord> {
    const existing = await this.getCategoryById(id);
    if (data.name !== undefined && data.name.trim().length === 0) {
      const error: any = new Error("Category name cannot be empty.");
      error.status = 400;
      throw error;
    }
    const updated = await blogRepository.updateCategory(id, data);

    await auditService.record({
      userId: this.extractUserId(currentUser),
      action: "UPDATE",
      module: "BLOG",
      entityType: "BLOG_CATEGORY",
      entityId: id,
      oldValues: {
        name: existing.name,
        slug: existing.slug,
      },
      newValues: {
        name: updated?.name,
        slug: updated?.slug,
      },
    });

    return updated!;
  }

  public async deleteCategory(id: string, currentUser?: any): Promise<void> {
    const existing = await this.getCategoryById(id);
    const result = await blogRepository.deleteCategory(id);
    if (!result.success) {
      const error: any = new Error(result.conflictReason || "Cannot delete category");
      error.status = 409;
      throw error;
    }

    await auditService.record({
      userId: this.extractUserId(currentUser),
      action: "DELETE",
      module: "BLOG",
      entityType: "BLOG_CATEGORY",
      entityId: id,
      oldValues: {
        name: existing.name,
        slug: existing.slug,
      },
    });
  }

  /* =========================================================================
   * 2. TAGS
   * ========================================================================= */

  public async getTags(): Promise<BlogTagRecord[]> {
    return blogRepository.listTags();
  }

  public async getTagById(id: string): Promise<BlogTagRecord> {
    const tag = await blogRepository.findTagById(id);
    if (!tag) {
      const error: any = new Error(`Tag not found with id: ${id}`);
      error.status = 404;
      throw error;
    }
    return tag;
  }

  public async createTag(
    data: { name: string; slug?: string },
    currentUser?: any
  ): Promise<BlogTagRecord> {
    if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
      const error: any = new Error("Tag name is required.");
      error.status = 400;
      throw error;
    }
    const created = await blogRepository.createTag(data);

    await auditService.record({
      userId: this.extractUserId(currentUser),
      action: "CREATE",
      module: "BLOG",
      entityType: "BLOG_TAG",
      entityId: created.id,
      newValues: {
        name: created.name,
        slug: created.slug,
      },
    });

    return created;
  }

  public async updateTag(
    id: string,
    data: Partial<{ name: string; slug: string }>,
    currentUser?: any
  ): Promise<BlogTagRecord> {
    const existing = await this.getTagById(id);
    if (data.name !== undefined && data.name.trim().length === 0) {
      const error: any = new Error("Tag name cannot be empty.");
      error.status = 400;
      throw error;
    }
    const updated = await blogRepository.updateTag(id, data);

    await auditService.record({
      userId: this.extractUserId(currentUser),
      action: "UPDATE",
      module: "BLOG",
      entityType: "BLOG_TAG",
      entityId: id,
      oldValues: {
        name: existing.name,
        slug: existing.slug,
      },
      newValues: {
        name: updated?.name,
        slug: updated?.slug,
      },
    });

    return updated!;
  }

  public async deleteTag(id: string, currentUser?: any): Promise<void> {
    const existing = await this.getTagById(id);
    const result = await blogRepository.deleteTag(id);
    if (!result.success) {
      const error: any = new Error(result.conflictReason || "Cannot delete tag");
      error.status = 409;
      throw error;
    }

    await auditService.record({
      userId: this.extractUserId(currentUser),
      action: "DELETE",
      module: "BLOG",
      entityType: "BLOG_TAG",
      entityId: id,
      oldValues: {
        name: existing.name,
        slug: existing.slug,
      },
    });
  }

  /* =========================================================================
   * 3. PUBLIC BLOG POSTS
   * ========================================================================= */

  public async getPublicPosts(filter: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    tag?: string;
  }) {
    const result = await blogRepository.listPublicPosts(filter);

    const safePosts = await Promise.all(
      result.posts.map(async (post) => {
        let featured_image_url: string | null = null;
        if (post.featured_image_key) {
          try {
            featured_image_url = await storageService.getPresignedDownloadUrl(post.featured_image_key);
          } catch {
            featured_image_url = `/api/blog/posts/${post.slug}/image`;
          }
        }

        return {
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          featured_image_key: post.featured_image_key,
          featured_image_url,
          status: post.status,
          published_at: post.published_at,
          created_at: post.created_at,
          category: post.category,
          tags: post.tags,
          author: {
            id: post.author.id,
            full_name: post.author.full_name,
            profile_photo_url: post.author.profile_photo_url,
          },
        };
      })
    );

    return {
      ...result,
      posts: safePosts,
    };
  }

  public async getPublicPostBySlug(slug: string) {
    if (!slug || typeof slug !== "string") {
      const error: any = new Error("Valid slug is required.");
      error.status = 400;
      throw error;
    }

    const post = await blogRepository.findPostBySlug(slug.trim());
    // Public post access strictly requires PUBLISHED status
    if (!post || post.status !== "PUBLISHED") {
      const error: any = new Error(`Blog post not found: ${slug}`);
      error.status = 404;
      throw error;
    }

    let featured_image_url: string | null = null;
    if (post.featured_image_key) {
      try {
        featured_image_url = await storageService.getPresignedDownloadUrl(post.featured_image_key);
      } catch {
        featured_image_url = `/api/blog/posts/${post.slug}/image`;
      }
    }

    const seoRecord = await seoRepository.findByBlogPostId(post.id);
    const seo = seoRecord
      ? {
          id: seoRecord.id,
          blog_post_id: seoRecord.blog_post_id,
          blogPostId: seoRecord.blog_post_id,
          meta_title: seoRecord.meta_title,
          metaTitle: seoRecord.meta_title,
          meta_description: seoRecord.meta_description,
          metaDescription: seoRecord.meta_description,
          og_title: seoRecord.og_title,
          ogTitle: seoRecord.og_title,
          og_description: seoRecord.og_description,
          ogDescription: seoRecord.og_description,
          og_image_url: seoRecord.og_image_url,
          ogImageUrl: seoRecord.og_image_url,
          canonical_url: seoRecord.canonical_url,
          canonicalUrl: seoRecord.canonical_url,
          created_at: seoRecord.created_at,
          updated_at: seoRecord.updated_at,
        }
      : null;

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featured_image_key: post.featured_image_key,
      featured_image_url,
      status: post.status,
      published_at: post.published_at,
      created_at: post.created_at,
      updated_at: post.updated_at,
      category: post.category,
      tags: post.tags,
      seo,
      author: {
        id: post.author.id,
        full_name: post.author.full_name,
        profile_photo_url: post.author.profile_photo_url,
      },
    };
  }

  public async getPublicPostImage(slug: string) {
    const post = await blogRepository.findPostBySlug(slug.trim());
    if (!post || post.status !== "PUBLISHED" || !post.featured_image_key) {
      const error: any = new Error("Image not found");
      error.status = 404;
      throw error;
    }

    // Attempt mock retrieval or presigned redirect
    const file = await storageService.getFile(post.featured_image_key);
    if (file) {
      return { buffer: file.buffer, mimeType: file.mimeType };
    }

    const presignedUrl = await storageService.getPresignedDownloadUrl(post.featured_image_key);
    return { redirectUrl: presignedUrl };
  }

  /* =========================================================================
   * 4. ADMIN BLOG POSTS
   * ========================================================================= */

  public async getAdminPosts(
    filter: {
      page?: number;
      limit?: number;
      search?: string;
      status?: BlogPostStatus;
      categoryId?: string;
      tagId?: string;
      authorId?: string;
    },
    currentUser: any
  ) {
    const result = await blogRepository.listAdminPosts(filter);

    const hydratedPosts = await Promise.all(
      result.posts.map(async (post) => {
        let featured_image_url: string | null = null;
        if (post.featured_image_key) {
          try {
            featured_image_url = await storageService.getPresignedDownloadUrl(post.featured_image_key);
          } catch {
            featured_image_url = `/api/blog/posts/${post.slug}/image`;
          }
        }
        return {
          ...post,
          featured_image_url,
        };
      })
    );

    return {
      ...result,
      posts: hydratedPosts,
    };
  }

  public async getAdminPostById(id: string, currentUser: any): Promise<BlogPostWithRelations & { featured_image_url: string | null; seo?: any }> {
    const post = await blogRepository.findPostById(id);
    if (!post) {
      const error: any = new Error(`Blog post not found with id: ${id}`);
      error.status = 404;
      throw error;
    }

    let featured_image_url: string | null = null;
    if (post.featured_image_key) {
      try {
        featured_image_url = await storageService.getPresignedDownloadUrl(post.featured_image_key);
      } catch {
        featured_image_url = `/api/blog/posts/${post.slug}/image`;
      }
    }

    const seoRecord = await seoRepository.findByBlogPostId(post.id);
    const seo = seoRecord
      ? {
          id: seoRecord.id,
          blog_post_id: seoRecord.blog_post_id,
          blogPostId: seoRecord.blog_post_id,
          meta_title: seoRecord.meta_title,
          metaTitle: seoRecord.meta_title,
          meta_description: seoRecord.meta_description,
          metaDescription: seoRecord.meta_description,
          og_title: seoRecord.og_title,
          ogTitle: seoRecord.og_title,
          og_description: seoRecord.og_description,
          ogDescription: seoRecord.og_description,
          og_image_url: seoRecord.og_image_url,
          ogImageUrl: seoRecord.og_image_url,
          canonical_url: seoRecord.canonical_url,
          canonicalUrl: seoRecord.canonical_url,
          created_at: seoRecord.created_at,
          updated_at: seoRecord.updated_at,
        }
      : null;

    return {
      ...post,
      featured_image_url,
      seo,
    };
  }

  public async createPost(
    data: {
      title: string;
      category_id?: string | null;
      slug?: string;
      excerpt?: string | null;
      content: string;
      status?: BlogPostStatus;
      tag_ids?: string[];
    },
    currentUser: any
  ): Promise<BlogPostWithRelations> {
    const authorId = this.extractUserId(currentUser);
    if (!authorId) {
      const error: any = new Error("Unauthenticated: Unable to determine author identity.");
      error.status = 401;
      throw error;
    }

    if (!data.title || typeof data.title !== "string" || data.title.trim().length === 0) {
      const error: any = new Error("Post title is required.");
      error.status = 400;
      throw error;
    }

    // Verify category if provided
    if (data.category_id) {
      const category = await blogRepository.findCategoryById(data.category_id);
      if (!category) {
        const error: any = new Error(`Assigned category not found: ${data.category_id}`);
        error.status = 400;
        throw error;
      }
    }

    // Verify tag IDs if provided
    if (data.tag_ids && data.tag_ids.length > 0) {
      for (const tagId of data.tag_ids) {
        const tag = await blogRepository.findTagById(tagId);
        if (!tag) {
          const error: any = new Error(`Assigned tag not found: ${tagId}`);
          error.status = 400;
          throw error;
        }
      }
    }

    const created = await blogRepository.createPost({
      author_id: authorId,
      title: data.title,
      category_id: data.category_id || null,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content || "",
      status: data.status || "DRAFT",
      tag_ids: data.tag_ids,
    });

    await auditService.record({
      userId: authorId,
      action: "CREATE",
      module: "BLOG",
      entityType: "BLOG_POST",
      entityId: created.id,
      newValues: {
        title: created.title,
        slug: created.slug,
        status: created.status,
      },
    });

    return created;
  }

  public async updatePost(
    id: string,
    data: Partial<{
      title: string;
      category_id: string | null;
      slug: string;
      excerpt: string | null;
      content: string;
      status: BlogPostStatus;
      tag_ids: string[];
    }>,
    currentUser: any
  ): Promise<BlogPostWithRelations> {
    const existing = await blogRepository.findPostById(id);
    if (!existing) {
      const error: any = new Error(`Blog post not found with id: ${id}`);
      error.status = 404;
      throw error;
    }

    // Enforce ownership or admin
    this.verifyPostOwnership(existing, currentUser);

    if (data.title !== undefined && data.title.trim().length === 0) {
      const error: any = new Error("Post title cannot be empty.");
      error.status = 400;
      throw error;
    }

    if (data.category_id) {
      const category = await blogRepository.findCategoryById(data.category_id);
      if (!category) {
        const error: any = new Error(`Assigned category not found: ${data.category_id}`);
        error.status = 400;
        throw error;
      }
    }

    if (data.tag_ids && data.tag_ids.length > 0) {
      for (const tagId of data.tag_ids) {
        const tag = await blogRepository.findTagById(tagId);
        if (!tag) {
          const error: any = new Error(`Assigned tag not found: ${tagId}`);
          error.status = 400;
          throw error;
        }
      }
    }

    const updated = await blogRepository.updatePost(id, data);

    await auditService.record({
      userId: this.extractUserId(currentUser),
      action: "UPDATE",
      module: "BLOG",
      entityType: "BLOG_POST",
      entityId: id,
      oldValues: {
        title: existing.title,
        slug: existing.slug,
        status: existing.status,
      },
      newValues: {
        title: updated?.title,
        slug: updated?.slug,
        status: updated?.status,
      },
    });

    return updated!;
  }

  public async deletePost(id: string, currentUser: any): Promise<void> {
    const existing = await blogRepository.findPostById(id);
    if (!existing) {
      const error: any = new Error(`Blog post not found with id: ${id}`);
      error.status = 404;
      throw error;
    }

    // Enforce ownership or admin
    this.verifyPostOwnership(existing, currentUser);

    // Clean up S3 image if one exists
    if (existing.featured_image_key) {
      try {
        await storageService.deleteFile(existing.featured_image_key);
      } catch (err: any) {
        console.warn(`[BlogService] S3 cleanup warning for post ${id}:`, err.message);
      }
    }

    await blogRepository.deletePost(id);

    await auditService.record({
      userId: this.extractUserId(currentUser),
      action: "DELETE",
      module: "BLOG",
      entityType: "BLOG_POST",
      entityId: id,
      oldValues: {
        title: existing.title,
        slug: existing.slug,
        status: existing.status,
      },
    });
  }

  public async publishPost(id: string, currentUser: any): Promise<BlogPostWithRelations> {
    const existing = await blogRepository.findPostById(id);
    if (!existing) {
      const error: any = new Error(`Blog post not found with id: ${id}`);
      error.status = 404;
      throw error;
    }

    // Enforce ownership or admin
    this.verifyPostOwnership(existing, currentUser);

    const result = await blogRepository.publishPost(id);
    if (result.error) {
      const error: any = new Error(result.error);
      error.status = 400;
      throw error;
    }

    await auditService.record({
      userId: this.extractUserId(currentUser),
      action: "PUBLISH",
      module: "BLOG",
      entityType: "BLOG_POST",
      entityId: id,
      oldValues: {
        status: existing.status,
      },
      newValues: {
        status: "PUBLISHED",
      },
    });

    return result.post!;
  }

  public async archivePost(id: string, currentUser: any): Promise<BlogPostWithRelations> {
    const existing = await blogRepository.findPostById(id);
    if (!existing) {
      const error: any = new Error(`Blog post not found with id: ${id}`);
      error.status = 404;
      throw error;
    }

    // Enforce ownership or admin
    this.verifyPostOwnership(existing, currentUser);

    const updated = await blogRepository.archivePost(id);

    await auditService.record({
      userId: this.extractUserId(currentUser),
      action: "ARCHIVE",
      module: "BLOG",
      entityType: "BLOG_POST",
      entityId: id,
      oldValues: {
        status: existing.status,
      },
      newValues: {
        status: "ARCHIVED",
      },
    });

    return updated!;
  }

  /* =========================================================================
   * 5. FEATURED IMAGE S3 OPERATIONS
   * ========================================================================= */

  public async uploadFeaturedImage(
    postId: string,
    file: Express.Multer.File | undefined,
    currentUser: any
  ): Promise<BlogPostWithRelations & { featured_image_url: string }> {
    const existing = await blogRepository.findPostById(postId);
    if (!existing) {
      const error: any = new Error(`Blog post not found with id: ${postId}`);
      error.status = 404;
      throw error;
    }

    // Enforce ownership or admin
    this.verifyPostOwnership(existing, currentUser);

    // Validate image format & size
    const validation = validateBlogImageFile(file, config.s3.maxBlogImageSizeMb);
    if (!validation.valid) {
      const error: any = new Error(validation.error || "Invalid image file");
      error.status = 400;
      throw error;
    }

    // Upload to private S3
    const uploadResult = await storageService.uploadBlogImage(
      postId,
      file!.buffer,
      file!.originalname,
      validation.detectedMimeType || file!.mimetype
    );

    // Delete old image from S3 if previously set
    if (existing.featured_image_key && existing.featured_image_key !== uploadResult.fileKey) {
      try {
        await storageService.deleteFile(existing.featured_image_key);
      } catch (err: any) {
        console.warn(`[BlogService] Failed to clean up replaced S3 image:`, err.message);
      }
    }

    // Update post record with featured_image_key
    const updated = await blogRepository.setFeaturedImage(postId, uploadResult.fileKey);

    let presignedUrl: string;
    try {
      presignedUrl = await storageService.getPresignedDownloadUrl(uploadResult.fileKey);
    } catch {
      presignedUrl = `/api/blog/posts/${updated!.slug}/image`;
    }

    return {
      ...updated!,
      featured_image_url: presignedUrl,
    };
  }

  public async deleteFeaturedImage(postId: string, currentUser: any): Promise<BlogPostWithRelations> {
    const existing = await blogRepository.findPostById(postId);
    if (!existing) {
      const error: any = new Error(`Blog post not found with id: ${postId}`);
      error.status = 404;
      throw error;
    }

    // Enforce ownership or admin
    this.verifyPostOwnership(existing, currentUser);

    if (existing.featured_image_key) {
      try {
        await storageService.deleteFile(existing.featured_image_key);
      } catch (err: any) {
        console.warn(`[BlogService] Failed to delete S3 image:`, err.message);
      }
    }

    const updated = await blogRepository.setFeaturedImage(postId, null);
    return updated!;
  }
}

export const blogService = new BlogService();
export default blogService;
