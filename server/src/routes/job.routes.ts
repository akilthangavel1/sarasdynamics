import { Router } from "express";
import { getPublicJobs, getPublicJobBySlug } from "../controllers/job.controller.js";
import {
  resumeUploadMiddleware,
  submitCandidateApplication,
} from "../controllers/application.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/jobs - List published jobs
router.get("/", getPublicJobs);

// GET /api/jobs/:slug - Get published job details
router.get("/:slug", getPublicJobBySlug);

// POST /api/jobs/:slug/applications - Candidate application submission (Authentication required)
router.post(
  "/:slug/applications",
  requireAuth,
  resumeUploadMiddleware,
  submitCandidateApplication
);

export default router;
