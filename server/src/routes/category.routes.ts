import { Router } from "express";
import { getPublicCategories } from "../controllers/category.controller.js";

const router = Router();

// GET /api/job-categories - List active categories
router.get("/", getPublicCategories);

export default router;
