import type { Request, Response, NextFunction } from "express";
import { verifyFirebaseToken } from "../services/firebaseAdmin.js";
import { userRepository } from "../repositories/user.repository.js";
import type { ApiResponse, AuthUserContext } from "../types/index.js";

/**
 * Authentication Middleware:
 * 1. Reads Authorization header: `Bearer <FIREBASE_ID_TOKEN>`
 * 2. Verifies the Firebase ID token using Firebase Admin SDK
 * 3. Resolves the user record from the database by `firebase_uid`
 * 4. Verifies the user's status (`ACTIVE` vs `INACTIVE` / `SUSPENDED`)
 * 5. Loads the user's roles and permissions from the database
 * 6. Attaches `AuthUserContext` to `req.user`
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const response: ApiResponse = {
      success: false,
      message: "Authorization token required. Expected format: Bearer <token>",
    };
    res.status(401).json(response);
    return;
  }

  const token = authHeader.split("Bearer ")[1]?.trim();
  if (!token) {
    const response: ApiResponse = {
      success: false,
      message: "Empty Bearer token provided",
    };
    res.status(401).json(response);
    return;
  }

  try {
    // Verify Firebase ID Token
    const decodedToken = await verifyFirebaseToken(token);
    const firebaseUid = decodedToken.uid;

    if (!firebaseUid) {
      const response: ApiResponse = {
        success: false,
        message: "Invalid token payload: missing UID",
      };
      res.status(401).json(response);
      return;
    }

    // Resolve user from database
    const user = await userRepository.findByFirebaseUid(firebaseUid);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "User account not found in database. Please synchronize profile via /api/auth/sync.",
      };
      res.status(401).json(response);
      return;
    }

    // Check account status
    if (user.status === "SUSPENDED") {
      const response: ApiResponse = {
        success: false,
        message: "User account is suspended. Access denied.",
      };
      res.status(403).json(response);
      return;
    }

    if (user.status === "INACTIVE") {
      const response: ApiResponse = {
        success: false,
        message: "User account is inactive. Please contact an administrator.",
      };
      res.status(403).json(response);
      return;
    }

    // Fetch database roles and permissions for user
    const roles = await userRepository.getUserRoleNames(user.id);
    const permissions = await userRepository.getUserPermissions(user.id);

    const context: AuthUserContext = {
      user,
      roles,
      permissions,
      firebaseUid,
      email: user.email,
    };

    req.user = context;
    next();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Authentication failed";
    console.warn(`[Auth Middleware] Authentication rejected: ${errorMessage}`);

    const response: ApiResponse = {
      success: false,
      message: "Authentication failed. Invalid, expired, or unverified token.",
      error: errorMessage,
    };
    res.status(401).json(response);
  }
}

/**
 * RBAC Permission Middleware:
 * Requires authentication and checks that the user's roles grant the requested permission.
 * Returns 403 Forbidden if the user lacks the permission.
 */
export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Ensure authentication middleware ran first
    if (!req.user) {
      await requireAuth(req, res, () => {
        checkPermission(req, res, next, permission);
      });
      return;
    }

    checkPermission(req, res, next, permission);
  };
}

function checkPermission(
  req: Request,
  res: Response,
  next: NextFunction,
  permission: string
): void {
  const user = req.user;
  if (!user) {
    res.status(401).json({
      success: false,
      message: "User is not authenticated",
    });
    return;
  }

  // Check if SUPER_ADMIN or user's permissions array includes requested permission
  const hasPermission =
    user.roles.includes("SUPER_ADMIN") || user.permissions.includes(permission);

  if (!hasPermission) {
    const response: ApiResponse = {
      success: false,
      message: `Forbidden: You do not possess the required permission '${permission}'`,
    };
    res.status(403).json(response);
    return;
  }

  next();
}

/**
 * RBAC Permission Middleware (Any):
 * Requires authentication and checks that the user possesses AT LEAST ONE of the specified permissions.
 */
export function requireAnyPermission(permissions: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      await requireAuth(req, res, () => {
        checkAnyPermission(req, res, next, permissions);
      });
      return;
    }

    checkAnyPermission(req, res, next, permissions);
  };
}

function checkAnyPermission(
  req: Request,
  res: Response,
  next: NextFunction,
  permissions: string[]
): void {
  const user = req.user;
  if (!user) {
    res.status(401).json({
      success: false,
      message: "User is not authenticated",
    });
    return;
  }

  const hasPermission =
    user.roles.includes("SUPER_ADMIN") ||
    permissions.some((p) => user.permissions.includes(p));

  if (!hasPermission) {
    const response: ApiResponse = {
      success: false,
      message: `Forbidden: Requires one of [${permissions.join(", ")}]`,
    };
    res.status(403).json(response);
    return;
  }

  next();
}

/**
 * Require any of the specified roles (e.g. ['ADMIN', 'SUPER_ADMIN'])
 */
export function requireRole(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      await requireAuth(req, res, () => {
        checkRole(req, res, next, allowedRoles);
      });
      return;
    }

    checkRole(req, res, next, allowedRoles);
  };
}

function checkRole(
  req: Request,
  res: Response,
  next: NextFunction,
  allowedRoles: string[]
): void {
  const user = req.user;
  if (!user) {
    res.status(401).json({
      success: false,
      message: "User is not authenticated",
    });
    return;
  }

  const hasRole = user.roles.some((r) => allowedRoles.includes(r));
  if (!hasRole) {
    res.status(403).json({
      success: false,
      message: `Forbidden: Requires one of [${allowedRoles.join(", ")}]`,
    });
    return;
  }

  next();
}

export default {
  requireAuth,
  requirePermission,
  requireRole,
};
