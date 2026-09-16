import type { Request, Response } from "express";
import { verifyFirebaseToken } from "../services/firebaseAdmin.js";
import { userRepository } from "../repositories/user.repository.js";
import { auditService } from "../services/audit.service.js";
import type { ApiResponse, AuthMeResponseData } from "../types/index.js";

/**
 * Synchronizes an authenticated Firebase user with the database.
 * Endpoint: POST /api/auth/sync
 * Header: Authorization: Bearer <FIREBASE_ID_TOKEN>
 * Body (optional): { full_name, phone, profile_photo_url }
 */
export async function syncUser(req: Request, res: Response): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authorization Bearer token required for sync",
    });
    return;
  }

  const token = authHeader.split("Bearer ")[1]?.trim();
  if (!token) {
    res.status(401).json({
      success: false,
      message: "Empty Bearer token provided",
    });
    return;
  }

  try {
    const decoded = await verifyFirebaseToken(token);
    const firebaseUid = decoded.uid;
    const email = (decoded.email || "").toLowerCase();

    if (!firebaseUid || !email) {
      res.status(400).json({
        success: false,
        message: "Firebase token is missing uid or email",
      });
      return;
    }

    // Optional profile overrides from body or token
    const fullName = (req.body?.full_name || decoded.name || null) as string | null;
    const phone = (req.body?.phone || decoded.phone_number || null) as string | null;
    const photoUrl = (req.body?.profile_photo_url || decoded.picture || null) as string | null;

    let user = await userRepository.findByFirebaseUid(firebaseUid);

    if (!user) {
      // Also check if user exists by email (to link previous invites or seeds)
      const existingByEmail = await userRepository.findByEmail(email);
      if (existingByEmail) {
        // Link firebase_uid to existing account
        user = await userRepository.update(existingByEmail.id, {
          full_name: fullName || existingByEmail.full_name,
          phone: phone || existingByEmail.phone,
          profile_photo_url: photoUrl || existingByEmail.profile_photo_url,
          last_login_at: new Date(),
        });
      } else {
        // Controlled provisioning: new user is created with ACTIVE status and NO privileged roles
        user = await userRepository.create({
          firebase_uid: firebaseUid,
          email,
          full_name: fullName,
          phone,
          profile_photo_url: photoUrl,
          status: "ACTIVE",
        });
      }
    } else {
      // User exists: update last login and profile info if provided
      user = await userRepository.update(user.id, {
        full_name: fullName || user.full_name,
        phone: phone || user.phone,
        profile_photo_url: photoUrl || user.profile_photo_url,
        last_login_at: new Date(),
      });
    }

    if (!user) {
      res.status(500).json({
        success: false,
        message: "Failed to persist or retrieve synchronized user",
      });
      return;
    }

    // Check account status
    if (user.status === "SUSPENDED" || user.status === "INACTIVE") {
      res.status(403).json({
        success: false,
        message: `Account is ${user.status.toLowerCase()}. Access denied.`,
      });
      return;
    }

    // Fetch user's assigned roles and distinct permissions
    const roles = await userRepository.getUserRoleNames(user.id);
    const permissions = await userRepository.getUserPermissions(user.id);

    // Record audit log for authentication / login event
    await auditService.record({
      userId: user.id,
      action: "LOGIN",
      module: "AUTH",
      entityType: "USER",
      entityId: user.id,
      newValues: {
        email: user.email,
        full_name: user.full_name,
        roles,
      },
      req,
    });

    const responseData: AuthMeResponseData = {
      user: {
        id: user.id,
        firebase_uid: user.firebase_uid,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        profile_photo_url: user.profile_photo_url,
        status: user.status,
        last_login_at: user.last_login_at ? user.last_login_at.toISOString() : null,
        created_at: user.created_at ? user.created_at.toISOString() : new Date().toISOString(),
        updated_at: user.updated_at ? user.updated_at.toISOString() : new Date().toISOString(),
      },
      roles,
      permissions,
    };

    res.status(200).json({
      success: true,
      message: "User synchronized successfully",
      data: responseData,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Sync failed";
    console.error("[Auth Controller] User sync error:", err);
    res.status(401).json({
      success: false,
      message: "Failed to verify token for user sync",
      error: errorMsg,
    });
  }
}

/**
 * Returns the authenticated user's profile, roles, and permissions.
 * Endpoint: GET /api/auth/me
 * Requires: requireAuth middleware
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  const authContext = req.user;

  if (!authContext) {
    res.status(401).json({
      success: false,
      message: "Unauthenticated request",
    });
    return;
  }

  const { user, roles, permissions } = authContext;

  const responseData: AuthMeResponseData = {
    user: {
      id: user.id,
      firebase_uid: user.firebase_uid,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      profile_photo_url: user.profile_photo_url,
      status: user.status,
      last_login_at: user.last_login_at ? user.last_login_at.toISOString() : null,
      created_at: user.created_at ? user.created_at.toISOString() : new Date().toISOString(),
      updated_at: user.updated_at ? user.updated_at.toISOString() : new Date().toISOString(),
    },
    roles,
    permissions,
  };

  const response: ApiResponse<AuthMeResponseData> = {
    success: true,
    message: "Authenticated profile retrieved",
    data: responseData,
  };

  res.status(200).json(response);
}

/**
 * Test endpoint for general authenticated access
 * Endpoint: GET /api/auth/test
 */
export function getTestAuth(req: Request, res: Response): void {
  res.json({
    success: true,
    message: "Authenticated request passed successfully",
    data: {
      user: req.user?.email,
      roles: req.user?.roles,
      permissionsCount: req.user?.permissions.length,
    },
  });
}

/**
 * Test endpoint for permission-based access (e.g. jobs.create)
 * Endpoint: GET /api/auth/test/permission
 */
export function getTestPermission(req: Request, res: Response): void {
  res.json({
    success: true,
    message: "Permission authorization verified successfully",
    data: {
      user: req.user?.email,
      roles: req.user?.roles,
    },
  });
}
