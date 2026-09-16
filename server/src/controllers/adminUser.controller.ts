import type { Response } from "express";
import { userRepository } from "../repositories/user.repository.js";
import { auditRepository } from "../repositories/audit.repository.js";
import type { AuthenticatedRequest, ApiResponse } from "../types/index.js";
import type { UserStatus } from "../db/schema.js";

/**
 * Admin: List and filter users
 * GET /api/admin/users
 * Requires: users.read
 */
export async function getAdminUsers(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { search, status, page = "1", limit = "20" } = req.query;

    const parsedPage = Math.max(1, parseInt(page as string, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));

    const result = await userRepository.findMany({
      search: typeof search === "string" ? search : undefined,
      status: typeof status === "string" ? status : undefined,
      page: parsedPage,
      limit: parsedLimit,
    });

    const response: ApiResponse<typeof result.users> = {
      success: true,
      message: "Users retrieved successfully",
      data: result.users,
    };

    res.json({
      ...response,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve users",
    });
  }
}

/**
 * Admin: Get single user by ID
 * GET /api/admin/users/:id
 * Requires: users.read
 */
export async function getAdminUserById(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const user = await userRepository.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const roles = await userRepository.getUserRoleNames(id);
    const permissions = await userRepository.getUserPermissions(id);

    res.json({
      success: true,
      message: "User details retrieved successfully",
      data: {
        ...user,
        roles,
        permissions,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve user details",
    });
  }
}

/**
 * Admin: Update user profile
 * PATCH /api/admin/users/:id
 * Requires: users.update
 */
export async function updateAdminUser(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const { full_name, phone, profile_photo_url } = req.body;

    const existing = await userRepository.findById(id);
    if (!existing) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const updated = await userRepository.update(id, {
      full_name,
      phone,
      profile_photo_url,
    });

    // Audit log
    await auditRepository.create({
      user_id: req.user?.user?.id || null,
      action: "UPDATE",
      module: "USERS",
      entity_type: "USER",
      entity_id: id,
      old_values: {
        full_name: existing.full_name,
        phone: existing.phone,
        profile_photo_url: existing.profile_photo_url,
      },
      new_values: {
        full_name: updated?.full_name,
        phone: updated?.phone,
        profile_photo_url: updated?.profile_photo_url,
      },
      ip_address: req.ip || null,
      user_agent: req.headers["user-agent"] || null,
    });

    const roles = await userRepository.getUserRoleNames(id);

    res.json({
      success: true,
      message: "User profile updated successfully",
      data: {
        ...updated,
        roles,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update user profile",
    });
  }
}

/**
 * Admin: Update user status (ACTIVE, INACTIVE, SUSPENDED)
 * PATCH /api/admin/users/:id/status
 * Requires: users.disable or users.update
 */
export async function updateAdminUserStatus(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: UserStatus };

    if (!["ACTIVE", "INACTIVE", "SUSPENDED"].includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid status value. Must be ACTIVE, INACTIVE, or SUSPENDED.",
      });
      return;
    }

    const existing = await userRepository.findById(id);
    if (!existing) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Protect last SUPER_ADMIN from suspension/deactivation
    if (status !== "ACTIVE") {
      const userRoles = await userRepository.getUserRoleNames(id);
      if (userRoles.includes("SUPER_ADMIN")) {
        // Check if other active SUPER_ADMIN exists
        const allUsers = await userRepository.findMany({ status: "ACTIVE", limit: 100 });
        const activeSuperAdmins = allUsers.users.filter(
          (u) => u.id !== id && u.roles.includes("SUPER_ADMIN")
        );
        if (activeSuperAdmins.length === 0) {
          res.status(400).json({
            success: false,
            message: "Cannot deactivate or suspend the only active SUPER_ADMIN in the system.",
          });
          return;
        }
      }
    }

    const updated = await userRepository.update(id, { status });

    // Audit log
    await auditRepository.create({
      user_id: req.user?.user?.id || null,
      action: "STATUS_CHANGE",
      module: "USERS",
      entity_type: "USER",
      entity_id: id,
      old_values: { status: existing.status },
      new_values: { status },
      ip_address: req.ip || null,
      user_agent: req.headers["user-agent"] || null,
    });

    const roles = await userRepository.getUserRoleNames(id);

    res.json({
      success: true,
      message: `User status changed to ${status}`,
      data: {
        ...updated,
        roles,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update user status",
    });
  }
}

/**
 * Admin: Assign/Update user roles
 * PUT /api/admin/users/:id/roles
 * Requires: permissions.assign
 */
export async function updateAdminUserRoles(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const { roles } = req.body as { roles: string[] };

    if (!Array.isArray(roles)) {
      res.status(400).json({
        success: false,
        message: "Roles payload must be an array of role names.",
      });
      return;
    }

    const existing = await userRepository.findById(id);
    if (!existing) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const oldRoles = await userRepository.getUserRoleNames(id);

    // Validate role names against approved 4 roles
    const approvedRoles = ["SUPER_ADMIN", "ADMIN", "RECRUITER", "CONTENT_WRITER"];
    const invalidRoles = roles.filter((r) => !approvedRoles.includes(r));
    if (invalidRoles.length > 0) {
      res.status(400).json({
        success: false,
        message: `Invalid roles: ${invalidRoles.join(", ")}. Allowed roles are: ${approvedRoles.join(", ")}`,
      });
      return;
    }

    // Prevent removing SUPER_ADMIN from self or last SUPER_ADMIN
    if (oldRoles.includes("SUPER_ADMIN") && !roles.includes("SUPER_ADMIN")) {
      const allUsers = await userRepository.findMany({ limit: 100 });
      const otherSuperAdmins = allUsers.users.filter(
        (u) => u.id !== id && u.roles.includes("SUPER_ADMIN")
      );
      if (otherSuperAdmins.length === 0) {
        res.status(400).json({
          success: false,
          message: "Cannot revoke SUPER_ADMIN from the sole system SUPER_ADMIN.",
        });
        return;
      }
    }

    const newRoles = await userRepository.setUserRoles(id, roles);

    // Audit log
    await auditRepository.create({
      user_id: req.user?.user?.id || null,
      action: "ROLE_ASSIGN",
      module: "RBAC",
      entity_type: "USER",
      entity_id: id,
      old_values: { roles: oldRoles },
      new_values: { roles: newRoles },
      ip_address: req.ip || null,
      user_agent: req.headers["user-agent"] || null,
    });

    res.json({
      success: true,
      message: "User roles updated successfully",
      data: {
        ...existing,
        roles: newRoles,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update user roles",
    });
  }
}

/**
 * Admin: Delete user
 * DELETE /api/admin/users/:id
 * Requires: users.delete
 */
export async function deleteAdminUser(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    const existing = await userRepository.findById(id);
    if (!existing) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const userRoles = await userRepository.getUserRoleNames(id);
    if (userRoles.includes("SUPER_ADMIN")) {
      res.status(403).json({
        success: false,
        message: "SUPER_ADMIN accounts cannot be deleted directly.",
      });
      return;
    }

    await userRepository.delete(id);

    // Audit log
    await auditRepository.create({
      user_id: req.user?.user?.id || null,
      action: "DELETE",
      module: "USERS",
      entity_type: "USER",
      entity_id: id,
      old_values: { email: existing.email, full_name: existing.full_name, roles: userRoles },
      ip_address: req.ip || null,
      user_agent: req.headers["user-agent"] || null,
    });

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete user",
    });
  }
}
