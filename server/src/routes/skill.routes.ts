import { Router } from "express";
import { getPublicSkills } from "../controllers/skill.controller.js";

const router = Router();

// GET /api/skills - List active skills
router.get("/", getPublicSkills);

export default router;
