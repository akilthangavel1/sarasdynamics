import type { Request } from "express";
import {
  auditRepository,
  type CreateAuditLogData,
} from "../repositories/audit.repository.js";
import type { AuditLogRecord } from "../db/schema.js";

export const AUDIT_ACTIONS = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  PUBLISH: "PUBLISH",
  CLOSE: "CLOSE",
  ARCHIVE: "ARCHIVE",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  STATUS_CHANGE: "STATUS_CHANGE",
  ASSIGN: "ASSIGN",
  UNASSIGN: "UNASSIGN",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS] | string;

export const AUDIT_MODULES = {
  AUTH: "AUTH",
  USERS: "USERS",
  ROLES: "ROLES",
  PERMISSIONS: "PERMISSIONS",
  JOBS: "JOBS",
  APPLICATIONS: "APPLICATIONS",
  INTERVIEWS: "INTERVIEWS",
  NOTES: "NOTES",
  BLOG: "BLOG",
  SEO: "SEO",
} as const;

export type AuditModule = (typeof AUDIT_MODULES)[keyof typeof AUDIT_MODULES] | string;

export const AUDIT_ENTITY_TYPES = {
  USER: "USER",
  ROLE: "ROLE",
  PERMISSION: "PERMISSION",
  JOB: "JOB",
  JOB_CATEGORY: "JOB_CATEGORY",
  SKILL: "SKILL",
  APPLICATION: "APPLICATION",
  APPLICATION_DOCUMENT: "APPLICATION_DOCUMENT",
  APPLICATION_NOTE: "APPLICATION_NOTE",
  INTERVIEW: "INTERVIEW",
  INTERVIEW_FEEDBACK: "INTERVIEW_FEEDBACK",
  BLOG_POST: "BLOG_POST",
  BLOG_CATEGORY: "BLOG_CATEGORY",
  BLOG_TAG: "BLOG_TAG",
  SEO_METADATA: "SEO_METADATA",
} as const;

export type AuditEntityType =
  | (typeof AUDIT_ENTITY_TYPES)[keyof typeof AUDIT_ENTITY_TYPES]
  | string;

const SENSITIVE_KEY_NAMES = new Set([
  "password",
  "password_hash",
  "passwordhash",
  "token",
  "access_token",
  "accesstoken",
  "refresh_token",
  "refreshtoken",
  "id_token",
  "idtoken",
  "firebase_token",
  "firebasetoken",
  "private_key",
  "privatekey",
  "secret",
  "secret_key",
  "api_key",
  "apikey",
  "authorization",
  "cookie",
  "aws_secret_access_key",
  "awssecretaccesskey",
  "credentials",
  "client_secret",
  "credit_card",
  "creditcard",
  "card_number",
  "cardnumber",
  "cvv",
  "cvc",
  "ssn",
  "social_security_number",
  "socialsecuritynumber",
]);

/**
 * Checks if a key name matches any known sensitive/credential identifier.
 */
function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[-_]/g, "");
  if (SENSITIVE_KEY_NAMES.has(key.toLowerCase()) || SENSITIVE_KEY_NAMES.has(normalized)) {
    return true;
  }
  // Check substrings for tokens, passwords, keys
  if (
    normalized.includes("password") ||
    normalized.includes("secret") ||
    normalized.includes("privatekey") ||
    normalized.includes("bearer") ||
    normalized.includes("apikey") ||
    normalized.includes("creditcard") ||
    normalized.includes("ssn")
  ) {
    return true;
  }
  return false;
}

/**
 * Sanitizes sensitive strings (e.g. S3 presigned URLs with signatures, tokens).
 */
function sanitizeStringValue(str: string): string {
  // Redact AWS presigned URLs containing signatures
  if (
    str.includes("X-Amz-Signature=") ||
    str.includes("X-Amz-Credential=") ||
    str.includes("X-Amz-Security-Token=")
  ) {
    return "[REDACTED_PRESIGNED_URL]";
  }
  // Redact Bearer tokens in headers/strings
  if (str.startsWith("Bearer ")) {
    return "Bearer [REDACTED]";
  }
  return str;
}

/**
 * Recursively deep-sanitizes and redacts secrets from any payload before persisting.
 */
export function redactSecrets(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle primitives
  if (typeof data === "string") {
    return sanitizeStringValue(data);
  }

  if (typeof data !== "object") {
    return data;
  }

  // Handle Date instances
  if (data instanceof Date) {
    return data.toISOString();
  }

  // Handle Buffers / binary objects
  if (Buffer.isBuffer(data) || data instanceof Uint8Array) {
    return "[BINARY_DATA_REDACTED]";
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    return data.map((item) => redactSecrets(item));
  }

  // Handle Objects
  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (isSensitiveKey(key)) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = redactSecrets(val);
    }
  }

  return sanitized;
}

/**
 * Extracts client IP safely from Express Request
 */
export function extractIpAddress(req?: Request): string | null {
  if (!req) return null;
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (typeof xForwardedFor === "string") {
    const firstIp = xForwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp.slice(0, 100);
  }
  if (Array.isArray(xForwardedFor) && xForwardedFor.length > 0) {
    return xForwardedFor[0].trim().slice(0, 100);
  }
  const ip = req.ip || req.socket?.remoteAddress || null;
  return ip ? String(ip).slice(0, 100) : null;
}

/**
 * Extracts User Agent safely from Express Request
 */
export function extractUserAgent(req?: Request): string | null {
  if (!req) return null;
  const ua = req.headers["user-agent"];
  if (!ua) return null;
  return String(ua).slice(0, 1000);
}

export interface RecordAuditParams {
  userId?: string | null;
  action: AuditAction;
  module: AuditModule;
  entityType: AuditEntityType;
  entityId?: string | null;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  req?: Request;
  tx?: any;
}

export class AuditService {
  /**
   * Internal authoritative audit recording method.
   * - Normalizes action, module, entity type
   * - Strips and redacts all secrets recursively
   * - Extracts IP and User-Agent if request is provided
   * - Never exposes secrets or client-forged payloads
   */
  public async record(params: RecordAuditParams): Promise<AuditLogRecord | null> {
    try {
      // 1. Resolve Actor ID
      let actorUserId: string | null = params.userId ?? null;
      if (!actorUserId && params.req?.user?.user?.id) {
        actorUserId = params.req.user.user.id;
      }

      // 2. Extract network context if request provided
      const ipAddress =
        params.ipAddress !== undefined
          ? params.ipAddress
          : extractIpAddress(params.req);
      const userAgent =
        params.userAgent !== undefined
          ? params.userAgent
          : extractUserAgent(params.req);

      // 3. Redact secrets in snapshots
      const sanitizedOldValues = params.oldValues
        ? redactSecrets(params.oldValues)
        : null;
      const sanitizedNewValues = params.newValues
        ? redactSecrets(params.newValues)
        : null;

      // 4. Construct record data
      const data: CreateAuditLogData = {
        user_id: actorUserId,
        action: String(params.action).toUpperCase().trim(),
        module: String(params.module).toUpperCase().trim(),
        entity_type: String(params.entityType).toUpperCase().trim(),
        entity_id: params.entityId ? String(params.entityId).trim() : null,
        old_values: sanitizedOldValues,
        new_values: sanitizedNewValues,
        ip_address: ipAddress,
        user_agent: userAgent,
      };

      // 5. Persist via repository
      const created = await auditRepository.create(data, params.tx);
      return created;
    } catch (error) {
      // If inside a transaction, re-throw so the transaction aborts cleanly
      if (params.tx) {
        throw error;
      }
      console.error("[AuditService] Failed to record audit log:", error);
      return null;
    }
  }

  /**
   * Re-export redaction utility for tests or external validation
   */
  public redactSecrets(data: any): any {
    return redactSecrets(data);
  }
}

export const auditService = new AuditService();
export default auditService;
