import { Router } from "express";
import {
  getAdminBlogCategories,
  createAdminBlogCategory,
  updateAdminBlogCategory,
  deleteAdminBlogCategory,
  getAdminBlogTags,
  createAdminBlogTag,
  updateAdminBlogTag,
  deleteAdminBlogTag,
  getAdminBlogPosts,
  getAdminBlogPostById,
  createAdminBlogPost,
  updateAdminBlogPost,
  deleteAdminBlogPost,
  publishAdminBlogPost,
  archiveAdminBlogPost,
  blogImageUploadMiddleware,
  uploadAdminBlogPostFeaturedImage,
  deleteAdminBlogPostFeaturedImage,
} from "../controllers/adminBlog.controller.js";
import {
  getBlogPostSeo,
  upsertBlogPostSeo,
  deleteBlogPostSeo,
} from "../controllers/adminSeo.controller.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();

// All admin blog routes require authentication
router.use(requireAuth);

/* =========================================================================
 * 1. CATEGORY MANAGEMENT
 * ========================================================================= */

// GET /api/admin/blog/categories - List all categories
router.get("/categories", requirePermission("blog.read"), getAdminBlogCategories);

// POST /api/admin/blog/categories - Create category
router.post("/categories", requirePermission("blog.create"), createAdminBlogCategory);

// PATCH /api/admin/blog/categories/:id - Update category
router.patch("/categories/:id", requirePermission("blog.update"), updateAdminBlogCategory);
router.put("/categories/:id", requirePermission("blog.update"), updateAdminBlogCategory);

// DELETE /api/admin/blog/categories/:id - Delete category
router.delete("/categories/:id", requirePermission("blog.delete"), deleteAdminBlogCategory);

/* =========================================================================
 * 2. TAG MANAGEMENT
 * ========================================================================= */

// GET /api/admin/blog/tags - List all tags
router.get("/tags", requirePermission("blog.read"), getAdminBlogTags);

// POST /api/admin/blog/tags - Create tag
router.post("/tags", requirePermission("blog.create"), createAdminBlogTag);

// PATCH /api/admin/blog/tags/:id - Update tag
router.patch("/tags/:id", requirePermission("blog.update"), updateAdminBlogTag);
router.put("/tags/:id", requirePermission("blog.update"), updateAdminBlogTag);

// DELETE /api/admin/blog/tags/:id - Delete tag
router.delete("/tags/:id", requirePermission("blog.delete"), deleteAdminBlogTag);

/* =========================================================================
 * 3. POST MANAGEMENT & WORKFLOW
 * ========================================================================= */

// GET /api/admin/blog/posts - List posts with filters
router.get("/posts", requirePermission("blog.read"), getAdminBlogPosts);

// POST /api/admin/blog/posts - Create post
router.post("/posts", requirePermission("blog.create"), createAdminBlogPost);

// GET /api/admin/blog/posts/:id - Get post by ID
router.get("/posts/:id", requirePermission("blog.read"), getAdminBlogPostById);

// PATCH / PUT /api/admin/blog/posts/:id - Update post
router.patch("/posts/:id", requirePermission("blog.update"), updateAdminBlogPost);
router.put("/posts/:id", requirePermission("blog.update"), updateAdminBlogPost);

// DELETE /api/admin/blog/posts/:id - Delete post
router.delete("/posts/:id", requirePermission("blog.delete"), deleteAdminBlogPost);

// POST /api/admin/blog/posts/:id/publish - Publish post
router.post("/posts/:id/publish", requirePermission("blog.publish"), publishAdminBlogPost);

// POST /api/admin/blog/posts/:id/archive - Archive post
router.post("/posts/:id/archive", requirePermission("blog.update"), archiveAdminBlogPost);

// POST /api/admin/blog/posts/:id/featured-image - Upload featured image to S3
router.post(
  "/posts/:id/featured-image",
  requirePermission("blog.update"),
  blogImageUploadMiddleware,
  uploadAdminBlogPostFeaturedImage
);

// DELETE /api/admin/blog/posts/:id/featured-image - Delete featured image from S3
router.delete(
  "/posts/:id/featured-image",
  requirePermission("blog.update"),
  deleteAdminBlogPostFeaturedImage
);

/* =========================================================================
 * 4. SEO METADATA MANAGEMENT (PHASE 8)
 * ========================================================================= */

// GET /api/admin/blog/:blogPostId/seo and /api/admin/blog/posts/:blogPostId/seo
router.get("/:blogPostId/seo", requirePermission("seo.read"), getBlogPostSeo);
router.get("/posts/:blogPostId/seo", requirePermission("seo.read"), getBlogPostSeo);

// PUT /api/admin/blog/:blogPostId/seo and /api/admin/blog/posts/:blogPostId/seo
router.put("/:blogPostId/seo", requirePermission("seo.update"), upsertBlogPostSeo);
router.put("/posts/:blogPostId/seo", requirePermission("seo.update"), upsertBlogPostSeo);

// DELETE /api/admin/blog/:blogPostId/seo and /api/admin/blog/posts/:blogPostId/seo
router.delete("/:blogPostId/seo", requirePermission("seo.update"), deleteBlogPostSeo);
router.delete("/posts/:blogPostId/seo", requirePermission("seo.update"), deleteBlogPostSeo);

export default router;
