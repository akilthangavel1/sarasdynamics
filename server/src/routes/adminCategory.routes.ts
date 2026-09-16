import { Router } from "express";
import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from "../controllers/category.controller.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", requirePermission("jobs.read"), getAdminCategories);
router.post("/", requirePermission("jobs.create"), createAdminCategory);
router.put("/:id", requirePermission("jobs.update"), updateAdminCategory);
router.delete("/:id", requirePermission("jobs.delete"), deleteAdminCategory);

export default router;
