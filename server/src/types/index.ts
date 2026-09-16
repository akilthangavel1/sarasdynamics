import type { Request } from "express";
import type { UserRecord } from "../db/schema.js";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface DatabaseStatus {
  status: "connected" | "disconnected" | "error";
  provider: "sqlite" | "postgresql";
  latencyMs?: number;
  error?: string;
}

export interface HealthData {
  status: "healthy" | "degraded";
  environment: string;
  uptime: number;
  timestamp: string;
  database: DatabaseStatus;
}

export interface AuthUserContext {
  user: UserRecord;
  roles: string[];
  permissions: string[];
  firebaseUid: string;
  email: string;
}

export interface AuthMeResponseData {
  user: {
    id: string;
    firebase_uid: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    profile_photo_url: string | null;
    status: string;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
  };
  roles: string[];
  permissions: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserContext;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserContext;
    }
  }
}

