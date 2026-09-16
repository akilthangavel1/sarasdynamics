import { Router } from "express";
import {
  getAdminAuditLogs,
  getAdminAuditLogById,
} from "../controllers/adminAudit.controller.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();

// All audit routes require authentication and audit_logs.read permission
router.use(requireAuth);

// GET /api/admin/audit-logs - List and filter audit logs
router.get("/", requirePermission("audit_logs.read"), getAdminAuditLogs);

// GET /api/admin/audit-logs/:id - Get single audit log entry
router.get("/:id", requirePermission("audit_logs.read"), getAdminAuditLogById);

export default router;
