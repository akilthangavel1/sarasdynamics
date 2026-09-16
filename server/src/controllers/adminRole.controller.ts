import type { Response } from "express";
import { roleRepository } from "../repositories/role.repository.js";
import { permissionRepository } from "../repositories/permission.repository.js";
import { auditRepository } from "../repositories/audit.repository.js";
import type { AuthenticatedRequest, ApiResponse } from "../types/index.js";

/**
 * Admin: List all roles with their assigned permissions
 * GET /api/admin/roles
 * Requires: roles.read or permissions.read
 */
export async function getAdminRoles(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const roles = await roleRepository.findAllWithPermissions();

    res.json({
      success: true,
      message: "Roles retrieved successfully",
      data: roles,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve roles",
    });
  }
}

/**
 * Admin: List all 42 approved permissions grouped by module
 * GET /api/admin/permissions
 * Requires: permissions.read
 */
export async function getAdminPermissions(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const permissions = await permissionRepository.findAll();

    // Group permissions by module
    const grouped = permissions.reduce((acc: Record<string, typeof permissions>, perm) => {
      const moduleKey = perm.module || "General";
      if (!acc[moduleKey]) {
        acc[moduleKey] = [];
      }
      acc[moduleKey].push(perm);
      return acc;
    }, {});

    res.json({
      success: true,
      message: "Permissions retrieved successfully",
      data: {
        all: permissions,
        grouped,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve permissions",
    });
  }
}

/**
 * Admin: Update assigned permissions for a role
 * PUT /api/admin/roles/:id/permissions
 * Requires: permissions.assign
 */
export async function updateAdminRolePermissions(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const { permissions } = req.body as { permissions: string[] };

    if (!Array.isArray(permissions)) {
      res.status(400).json({
        success: false,
        message: "Permissions must be an array of permission name strings.",
      });
      return;
    }

    const role = await roleRepository.findById(id);
    if (!role) {
      res.status(404).json({
        success: false,
        message: "Role not found",
      });
      return;
    }

    // Protect SUPER_ADMIN from losing core permissions
    if (role.name === "SUPER_ADMIN") {
      const allPerms = await permissionRepository.findAll();
      if (permissions.length < allPerms.length) {
        res.status(400).json({
          success: false,
          message: "SUPER_ADMIN role must retain all system permissions.",
        });
        return;
      }
    }

    const oldPerms = await roleRepository.getRolePermissions(id);
    const newPerms = await roleRepository.setRolePermissions(id, permissions);

    // Audit log
    await auditRepository.create({
      user_id: req.user?.user?.id || null,
      action: "UPDATE",
      module: "RBAC",
      entity_type: "ROLE",
      entity_id: id,
      old_values: { role: role.name, permissions: oldPerms },
      new_values: { role: role.name, permissions: newPerms },
      ip_address: req.ip || null,
      user_agent: req.headers["user-agent"] || null,
    });

    res.json({
      success: true,
      message: `Permissions updated for role ${role.name}`,
      data: {
        ...role,
        permissions: newPerms,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update role permissions",
    });
  }
}
