import { Router } from "express";
import {
  getAdminSkills,
  createAdminSkill,
  updateAdminSkill,
  deleteAdminSkill,
} from "../controllers/skill.controller.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", requirePermission("jobs.read"), getAdminSkills);
router.post("/", requirePermission("jobs.create"), createAdminSkill);
router.put("/:id", requirePermission("jobs.update"), updateAdminSkill);
router.delete("/:id", requirePermission("jobs.delete"), deleteAdminSkill);

export default router;
