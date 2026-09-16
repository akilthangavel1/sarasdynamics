import { Router } from "express";
import {
  listAllInterviews,
  getInterviewDetails,
  getActiveInterviewers,
  updateInterview,
  deleteInterview,
  submitInterviewFeedback,
  getInterviewFeedback,
  updateInterviewFeedback,
  deleteInterviewFeedback,
} from "../controllers/interview.controller.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();

// All interview endpoints require authentication
router.use(requireAuth);

// GET /api/admin/interviews/interviewers - List active users for assignment
router.get(
  "/interviewers",
  requirePermission("interviews.read"),
  getActiveInterviewers
);

// GET /api/admin/interviews - Global list of interviews with filters and pagination
router.get("/", requirePermission("interviews.read"), listAllInterviews);

// GET /api/admin/interviews/:id - Single interview details
router.get("/:id", requirePermission("interviews.read"), getInterviewDetails);

// PATCH & PUT /api/admin/interviews/:id - Update interview
router.patch("/:id", requirePermission("interviews.update"), updateInterview);
router.put("/:id", requirePermission("interviews.update"), updateInterview);

// DELETE /api/admin/interviews/:id - Delete interview and associated feedback
router.delete("/:id", requirePermission("interviews.delete"), deleteInterview);

// --------------------------------------------------------------------------
// Feedback Sub-routes
// --------------------------------------------------------------------------

// POST /api/admin/interviews/:interviewId/feedback - Submit feedback
router.post(
  "/:interviewId/feedback",
  requirePermission("interviews.update"),
  submitInterviewFeedback
);

// GET /api/admin/interviews/:interviewId/feedback - Read feedback
router.get(
  "/:interviewId/feedback",
  requirePermission("interviews.read"),
  getInterviewFeedback
);

// PATCH /api/admin/interviews/:interviewId/feedback/:feedbackId - Update own feedback
router.patch(
  "/:interviewId/feedback/:feedbackId",
  requirePermission("interviews.update"),
  updateInterviewFeedback
);

// DELETE /api/admin/interviews/:interviewId/feedback/:feedbackId - Delete feedback
router.delete(
  "/:interviewId/feedback/:feedbackId",
  requirePermission("interviews.delete"),
  deleteInterviewFeedback
);

export default router;
