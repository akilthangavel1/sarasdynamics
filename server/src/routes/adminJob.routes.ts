import { Router } from "express";
import {
  getAdminJobs,
  getAdminJobById,
  createAdminJob,
  updateAdminJob,
  deleteAdminJob,
  publishAdminJob,
  closeAdminJob,
  archiveAdminJob,
} from "../controllers/job.controller.js";
import { requireAuth, requirePermission, requireAnyPermission } from "../middleware/auth.js";

const router = Router();

// All admin routes require authentication
router.use(requireAuth);

// GET /api/admin/jobs - List all jobs with admin filters
router.get("/", requirePermission("jobs.read"), getAdminJobs);

// POST /api/admin/jobs - Create a new job
router.post("/", requirePermission("jobs.create"), createAdminJob);

// GET /api/admin/jobs/:id - Get job by ID
router.get("/:id", requirePermission("jobs.read"), getAdminJobById);

// PUT /api/admin/jobs/:id - Update job (full update or content-only for CONTENT_WRITER)
router.put(
  "/:id",
  requireAnyPermission(["jobs.update", "jobs.update_content"]),
  updateAdminJob
);

// DELETE /api/admin/jobs/:id - Permanently delete job
router.delete("/:id", requirePermission("jobs.delete"), deleteAdminJob);

// POST /api/admin/jobs/:id/publish - Publish job
router.post("/:id/publish", requirePermission("jobs.publish"), publishAdminJob);

// POST /api/admin/jobs/:id/close - Close published job
router.post("/:id/close", requirePermission("jobs.close"), closeAdminJob);

// POST /api/admin/jobs/:id/archive - Archive job (strictly requires jobs.update)
router.post("/:id/archive", requirePermission("jobs.update"), archiveAdminJob);

export default router;
