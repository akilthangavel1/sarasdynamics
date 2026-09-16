import { Router } from "express";
import { getAdminPermissions } from "../controllers/adminRole.controller.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();

// All permission routes require authenticated session
router.use(requireAuth);

// GET /api/admin/permissions - List all 42 permissions grouped by module
router.get("/", requirePermission("permissions.read"), getAdminPermissions);

export default router;
