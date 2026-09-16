import { Router } from "express";
import {
  getAdminUsers,
  getAdminUserById,
  updateAdminUser,
  updateAdminUserStatus,
  updateAdminUserRoles,
  deleteAdminUser,
} from "../controllers/adminUser.controller.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();

// All user management routes require authenticated session
router.use(requireAuth);

// GET /api/admin/users - List and search users (requires users.read)
router.get("/", requirePermission("users.read"), getAdminUsers);

// GET /api/admin/users/:id - Get user details (requires users.read)
router.get("/:id", requirePermission("users.read"), getAdminUserById);

// PATCH /api/admin/users/:id - Update user profile (requires users.update)
router.patch("/:id", requirePermission("users.update"), updateAdminUser);

// PATCH /api/admin/users/:id/status - Update user status (requires users.disable or users.update)
router.patch(
  "/:id/status",
  (req, res, next) => {
    // Check if user has either users.disable or users.update
    const user = (req as any).user;
    if (user?.permissions?.includes("users.disable") || user?.permissions?.includes("users.update")) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: "Forbidden: requires users.disable or users.update permission.",
    });
  },
  updateAdminUserStatus
);

// PUT /api/admin/users/:id/roles - Assign roles to user (requires permissions.assign)
router.put("/:id/roles", requirePermission("permissions.assign"), updateAdminUserRoles);

// DELETE /api/admin/users/:id - Delete user (requires users.delete)
router.delete("/:id", requirePermission("users.delete"), deleteAdminUser);

export default router;
