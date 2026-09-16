import { Router } from "express";
import {
  getPublicBlogCategories,
  getPublicBlogTags,
  getPublicBlogPosts,
  getPublicBlogPostBySlug,
  getPublicBlogPostImage,
} from "../controllers/blog.controller.js";

const router = Router();

// GET /api/blog/categories - List active categories
router.get("/categories", getPublicBlogCategories);

// GET /api/blog/tags - List all tags
router.get("/tags", getPublicBlogTags);

// GET /api/blog/posts - List published posts
router.get("/posts", getPublicBlogPosts);

// GET /api/blog/posts/:slug - Get single published post
router.get("/posts/:slug", getPublicBlogPostBySlug);

// GET /api/blog/posts/:slug/image - Serve post featured image
router.get("/posts/:slug/image", getPublicBlogPostImage);

export default router;
