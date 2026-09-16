import type { Request, Response } from "express";
import multer from "multer";
import { blogService } from "../services/blog.service.js";
import config from "../config/index.js";
import type { BlogPostStatus } from "../db/schema.js";

// Multer memory storage for blog featured images
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    // 1MB cushion so file validation can return a specific error
    fileSize: (config.s3.maxBlogImageSizeMb + 1) * 1024 * 1024,
  },
});

export const blogImageUploadMiddleware = upload.single("image");

/* =========================================================================
 * 1. CATEGORIES
 * ========================================================================= */

export async function getAdminBlogCategories(req: Request, res: Response): Promise<void> {
  try {
    const categories = await blogService.getCategories();
    res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch categories",
    });
  }
}

export async function createAdminBlogCategory(req: Request, res: Response): Promise<void> {
  try {
    const { name, slug, description, is_active, display_order } = req.body;
    const category = await blogService.createCategory({
      name,
      slug,
      description,
      is_active,
      display_order,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create category",
    });
  }
}

export async function updateAdminBlogCategory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, slug, description, is_active, display_order } = req.body;

    const category = await blogService.updateCategory(id, {
      name,
      slug,
      description,
      is_active,
      display_order,
    });

    res.json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update category",
    });
  }
}

export async function deleteAdminBlogCategory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await blogService.deleteCategory(id);

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete category",
    });
  }
}

/* =========================================================================
 * 2. TAGS
 * ========================================================================= */

export async function getAdminBlogTags(req: Request, res: Response): Promise<void> {
  try {
    const tags = await blogService.getTags();
    res.json({
      success: true,
      data: tags,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch tags",
    });
  }
}

export async function createAdminBlogTag(req: Request, res: Response): Promise<void> {
  try {
    const { name, slug } = req.body;
    const tag = await blogService.createTag({ name, slug });

    res.status(201).json({
      success: true,
      message: "Tag created successfully",
      data: tag,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create tag",
    });
  }
}

export async function updateAdminBlogTag(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;

    const tag = await blogService.updateTag(id, { name, slug });

    res.json({
      success: true,
      message: "Tag updated successfully",
      data: tag,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update tag",
    });
  }
}

export async function deleteAdminBlogTag(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await blogService.deleteTag(id);

    res.json({
      success: true,
      message: "Tag deleted successfully",
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete tag",
    });
  }
}

/* =========================================================================
 * 3. POSTS CRUD & WORKFLOW
 * ========================================================================= */

export async function getAdminBlogPosts(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || undefined;
    const status = (req.query.status as BlogPostStatus) || undefined;
    const categoryId = (req.query.categoryId as string) || undefined;
    const tagId = (req.query.tagId as string) || undefined;
    const authorId = (req.query.authorId as string) || undefined;

    const result = await blogService.getAdminPosts(
      {
        page,
        limit,
        search,
        status,
        categoryId,
        tagId,
        authorId,
      },
      (req as any).user
    );

    res.json({
      success: true,
      data: result.posts,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to list admin blog posts",
    });
  }
}

export async function getAdminBlogPostById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const post = await blogService.getAdminPostById(id, (req as any).user);

    res.json({
      success: true,
      data: post,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve blog post",
    });
  }
}

export async function createAdminBlogPost(req: Request, res: Response): Promise<void> {
  try {
    const { title, category_id, slug, excerpt, content, status, tag_ids } = req.body;

    const post = await blogService.createPost(
      {
        title,
        category_id,
        slug,
        excerpt,
        content,
        status,
        tag_ids,
      },
      (req as any).user
    );

    res.status(201).json({
      success: true,
      message: "Blog post created successfully",
      data: post,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create blog post",
    });
  }
}

export async function updateAdminBlogPost(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { title, category_id, slug, excerpt, content, status, tag_ids } = req.body;

    const post = await blogService.updatePost(
      id,
      {
        title,
        category_id,
        slug,
        excerpt,
        content,
        status,
        tag_ids,
      },
      (req as any).user
    );

    res.json({
      success: true,
      message: "Blog post updated successfully",
      data: post,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update blog post",
    });
  }
}

export async function deleteAdminBlogPost(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await blogService.deletePost(id, (req as any).user);

    res.json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete blog post",
    });
  }
}

export async function publishAdminBlogPost(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const post = await blogService.publishPost(id, (req as any).user);

    res.json({
      success: true,
      message: "Blog post published successfully",
      data: post,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to publish blog post",
    });
  }
}

export async function archiveAdminBlogPost(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const post = await blogService.archivePost(id, (req as any).user);

    res.json({
      success: true,
      message: "Blog post archived successfully",
      data: post,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to archive blog post",
    });
  }
}

/* =========================================================================
 * 4. FEATURED IMAGE S3 HANDLERS
 * ========================================================================= */

export async function uploadAdminBlogPostFeaturedImage(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const post = await blogService.uploadFeaturedImage(id, req.file, (req as any).user);

    res.json({
      success: true,
      message: "Featured image uploaded successfully",
      data: post,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to upload featured image",
    });
  }
}

export async function deleteAdminBlogPostFeaturedImage(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const post = await blogService.deleteFeaturedImage(id, (req as any).user);

    res.json({
      success: true,
      message: "Featured image removed successfully",
      data: post,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to remove featured image",
    });
  }
}
