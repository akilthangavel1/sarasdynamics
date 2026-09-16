import { Router } from "express";
import {
  getAdminRoles,
  getAdminPermissions,
  updateAdminRolePermissions,
} from "../controllers/adminRole.controller.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();

// All role and permission routes require authenticated session
router.use(requireAuth);

// GET /api/admin/roles - List all roles with assigned permissions (requires roles.read or permissions.read)
router.get(
  "/",
  (req, res, next) => {
    const user = (req as any).user;
    if (user?.permissions?.includes("roles.read") || user?.permissions?.includes("permissions.read")) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: "Forbidden: requires roles.read or permissions.read permission.",
    });
  },
  getAdminRoles
);

// GET /api/admin/roles/permissions (or GET /api/admin/permissions) - List all permissions grouped by module
router.get("/permissions", requirePermission("permissions.read"), getAdminPermissions);

// PUT /api/admin/roles/:id/permissions - Update permissions assigned to a role (requires permissions.assign)
router.put("/:id/permissions", requirePermission("permissions.assign"), updateAdminRolePermissions);

export default router;
