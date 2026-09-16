import type { Request, Response } from "express";
import { seoService } from "../services/seo.service.js";

/**
 * GET /api/admin/blog/:blogPostId/seo
 * GET /api/admin/blog/posts/:blogPostId/seo
 * Requires permission: seo.read
 */
export async function getBlogPostSeo(req: Request, res: Response): Promise<void> {
  try {
    const blogPostId = req.params.blogPostId || req.params.id;
    const seo = await seoService.getSeoByBlogPostId(blogPostId, (req as any).user);

    res.json({
      success: true,
      data: seo,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch SEO metadata",
      error: error.message,
    });
  }
}

/**
 * PUT /api/admin/blog/:blogPostId/seo
 * PUT /api/admin/blog/posts/:blogPostId/seo
 * Requires permission: seo.update
 */
export async function upsertBlogPostSeo(req: Request, res: Response): Promise<void> {
  try {
    const blogPostId = req.params.blogPostId || req.params.id;
    const seo = await seoService.upsertSeo(blogPostId, req.body, (req as any).user);

    res.json({
      success: true,
      message: "SEO metadata saved successfully",
      data: seo,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to save SEO metadata",
      error: error.message,
    });
  }
}

/**
 * DELETE /api/admin/blog/:blogPostId/seo
 * DELETE /api/admin/blog/posts/:blogPostId/seo
 * Requires permission: seo.update (as mandated, do not introduce seo.delete)
 */
export async function deleteBlogPostSeo(req: Request, res: Response): Promise<void> {
  try {
    const blogPostId = req.params.blogPostId || req.params.id;
    await seoService.deleteSeo(blogPostId, (req as any).user);

    res.json({
      success: true,
      message: "SEO metadata deleted successfully",
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete SEO metadata",
      error: error.message,
    });
  }
}
