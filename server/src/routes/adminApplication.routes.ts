import { Router } from "express";
import {
  getAdminApplications,
  getAdminApplicationById,
  updateAdminApplicationStatus,
  deleteAdminApplication,
  downloadAdminApplicationDocument,
} from "../controllers/application.controller.js";
import {
  scheduleApplicationInterview,
  getApplicationInterviews,
} from "../controllers/interview.controller.js";
import {
  createApplicationNote,
  getApplicationNotes,
  getApplicationNoteById,
  updateApplicationNote,
  deleteApplicationNote,
} from "../controllers/note.controller.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();

// All admin application routes require authentication
router.use(requireAuth);

// GET /api/admin/applications - List applications
router.get("/", requirePermission("applications.read"), getAdminApplications);

// GET /api/admin/applications/:id - Application details with documents
router.get("/:id", requirePermission("applications.read"), getAdminApplicationById);

// POST /api/admin/applications/:applicationId/interviews - Schedule interview
router.post(
  "/:applicationId/interviews",
  requirePermission("interviews.create"),
  scheduleApplicationInterview
);

// GET /api/admin/applications/:applicationId/interviews - List interviews for application
router.get(
  "/:applicationId/interviews",
  requirePermission("interviews.read"),
  getApplicationInterviews
);

// --------------------------------------------------------------------------
// Application Internal Notes Routes (Phase 6)
// --------------------------------------------------------------------------

// POST /api/admin/applications/:applicationId/notes - Create internal note
router.post(
  "/:applicationId/notes",
  requirePermission("notes.create"),
  createApplicationNote
);

// GET /api/admin/applications/:applicationId/notes - List internal notes
router.get(
  "/:applicationId/notes",
  requirePermission("notes.read"),
  getApplicationNotes
);

// GET /api/admin/applications/:applicationId/notes/:noteId - Read single internal note
router.get(
  "/:applicationId/notes/:noteId",
  requirePermission("notes.read"),
  getApplicationNoteById
);

// PATCH /api/admin/applications/:applicationId/notes/:noteId - Update internal note
router.patch(
  "/:applicationId/notes/:noteId",
  requirePermission("notes.update"),
  updateApplicationNote
);
router.put(
  "/:applicationId/notes/:noteId",
  requirePermission("notes.update"),
  updateApplicationNote
);

// DELETE /api/admin/applications/:applicationId/notes/:noteId - Delete internal note
router.delete(
  "/:applicationId/notes/:noteId",
  requirePermission("notes.delete"),
  deleteApplicationNote
);

// PATCH /api/admin/applications/:id/status - Update application status
router.patch(
  "/:id/status",
  requirePermission("applications.update"),
  updateAdminApplicationStatus
);

// GET /api/admin/applications/:id/documents/:documentId - Download document presigned URL
router.get(
  "/:id/documents/:documentId",
  requirePermission("applications.read"),
  downloadAdminApplicationDocument
);

// DELETE /api/admin/applications/:id - Delete application and S3 files
router.delete(
  "/:id",
  requirePermission("applications.delete"),
  deleteAdminApplication
);

export default router;
