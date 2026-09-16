import { Router } from "express";
import {
  syncUser,
  getMe,
  getTestAuth,
  getTestPermission,
} from "../controllers/auth.controller.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import config from "../config/index.js";

const router = Router();

// Synchronize authenticated user with database
// POST /api/auth/sync
router.post("/sync", syncUser);

// Get current authenticated user profile, roles, and permissions
// GET /api/auth/me
router.get("/me", requireAuth, getMe);

// Non-production test routes for RBAC verification (isolated from production builds)
if (config.env !== "production") {
  router.get("/test", requireAuth, getTestAuth);
  router.get("/test/jobs-create", requireAuth, requirePermission("jobs.create"), getTestPermission);
  router.get("/test/jobs-update-content", requireAuth, requirePermission("jobs.update_content"), getTestPermission);
  router.get("/test/users-read", requireAuth, requirePermission("users.read"), getTestPermission);
  router.get("/test/content-publish", requireAuth, requirePermission("content.publish"), getTestPermission);
}

export default router;
