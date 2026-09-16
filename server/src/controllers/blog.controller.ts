import type { Request, Response } from "express";
import { blogService } from "../services/blog.service.js";

/**
 * Public: Get active blog categories
 * GET /api/blog/categories
 */
export async function getPublicBlogCategories(req: Request, res: Response): Promise<void> {
  try {
    const categories = await blogService.getCategories({ onlyActive: true });
    res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch blog categories",
    });
  }
}

/**
 * Public: Get all blog tags
 * GET /api/blog/tags
 */
export async function getPublicBlogTags(req: Request, res: Response): Promise<void> {
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
      message: error.message || "Failed to fetch blog tags",
    });
  }
}

/**
 * Public: List published blog posts
 * GET /api/blog/posts
 */
export async function getPublicBlogPosts(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || undefined;
    const category = (req.query.category as string) || undefined;
    const tag = (req.query.tag as string) || undefined;

    const result = await blogService.getPublicPosts({
      page,
      limit,
      search,
      category,
      tag,
    });

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
      message: error.message || "Failed to fetch blog posts",
    });
  }
}

/**
 * Public: Get published blog post by slug
 * GET /api/blog/posts/:slug
 */
export async function getPublicBlogPostBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const post = await blogService.getPublicPostBySlug(slug);

    res.json({
      success: true,
      data: post,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch blog post",
    });
  }
}

/**
 * Public: Serve published blog post featured image
 * GET /api/blog/posts/:slug/image
 */
export async function getPublicBlogPostImage(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const result = await blogService.getPublicPostImage(slug);

    if (result.redirectUrl) {
      res.redirect(result.redirectUrl);
      return;
    }

    if (result.buffer && result.mimeType) {
      res.setHeader("Content-Type", result.mimeType);
      res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
      res.send(result.buffer);
      return;
    }

    res.status(404).json({
      success: false,
      message: "Image not found",
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve blog image",
    });
  }
}
