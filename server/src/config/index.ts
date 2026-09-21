import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env if present
dotenv.config();

export type AppEnvironment = "development" | "production" | "test";

export interface DatabaseConfig {
  provider: "sqlite" | "postgresql";
  url: string;
}

export interface CorsConfig {
  origin: string | string[];
}

export interface FirebaseAdminConfig {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
}

export interface S3Config {
  bucketName: string;
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  maxResumeSizeMb: number;
  maxBlogImageSizeMb: number;
  presignedExpiresInSeconds: number;
}

export interface ServerConfig {
  env: AppEnvironment;
  port: number;
  database: DatabaseConfig;
  cors: CorsConfig;
  firebase: FirebaseAdminConfig;
  allowDevAuth: boolean;
  s3: S3Config;
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Parses and returns configuration from a given environment source dictionary.
 * Allows deterministic, isolated testing across different environments.
 */
export function loadConfig(envSource: NodeJS.ProcessEnv = process.env): ServerConfig {
  const rawEnv = (envSource.NODE_ENV || "development").toLowerCase();
  const env: AppEnvironment = (
    rawEnv === "production" ? "production" : rawEnv === "test" ? "test" : "development"
  ) as AppEnvironment;

  const isProd = env === "production";

  // Database provider: PostgreSQL for all environments
  const databaseProvider = "postgresql" as const;

  // Database URL
  const databaseUrl =
    envSource.DATABASE_URL || "postgresql://localhost:5432/saras_dev";

  // CORS Origin Parsing
  const corsOriginRaw = envSource.CORS_ORIGIN;
  let corsOrigin: string | string[];
  if (corsOriginRaw) {
    if (corsOriginRaw.includes(",")) {
      corsOrigin = corsOriginRaw
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);
    } else {
      corsOrigin = corsOriginRaw.trim();
    }
  } else {
    corsOrigin = isProd
      ? ""
      : ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"];
  }

  // Firebase private key normalization (handling literal \n vs escaped \\n)
  let privateKey = envSource.FIREBASE_PRIVATE_KEY;
  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, "\n").trim();
  }

  // Development auth bypass: disabled unconditionally
  const allowDevAuth = false;

  return {
    env,
    port: parseInt(envSource.PORT || "3000", 10),
    database: {
      provider: databaseProvider,
      url: databaseUrl,
    },
    cors: {
      origin: corsOrigin,
    },
    firebase: {
      projectId: envSource.FIREBASE_PROJECT_ID?.trim(),
      clientEmail: envSource.FIREBASE_CLIENT_EMAIL?.trim(),
      privateKey,
    },
    allowDevAuth,
    s3: {
      bucketName: (envSource.S3_BUCKET_NAME || envSource.AWS_S3_BUCKET || (isProd ? "" : "saras-dynamics-private-resumes")).trim(),
      region: (envSource.AWS_REGION || envSource.AWS_DEFAULT_REGION || "us-east-1").trim(),
      accessKeyId: envSource.AWS_ACCESS_KEY_ID?.trim(),
      secretAccessKey: envSource.AWS_SECRET_ACCESS_KEY?.trim(),
      maxResumeSizeMb: parseInt(envSource.MAX_RESUME_SIZE_MB || "5", 10),
      maxBlogImageSizeMb: parseInt(envSource.MAX_BLOG_IMAGE_SIZE_MB || "5", 10),
      presignedExpiresInSeconds: parseInt(envSource.S3_PRESIGNED_EXPIRES_IN || "900", 10),
    },
  };
}

/**
 * Validates a ServerConfig object against production and security hardening rules.
 * Fails fast and collects explicit, non-sensitive error descriptors.
 */
export function validateConfig(
  cfg: ServerConfig,
  rawEnvSource: NodeJS.ProcessEnv = process.env
): ConfigValidationResult {
  const errors: string[] = [];

  // 1. Environment Validation
  const validEnvs: AppEnvironment[] = ["development", "production", "test"];
  const rawNodeEnv = rawEnvSource.NODE_ENV || "development";
  if (!validEnvs.includes(rawNodeEnv as AppEnvironment)) {
    errors.push(
      `INVALID_ENV: NODE_ENV must be one of 'development', 'production', or 'test'. Received: '${rawNodeEnv}'`
    );
  }

  // 2. Port Validation
  if (isNaN(cfg.port) || cfg.port < 1 || cfg.port > 65535) {
    errors.push(`INVALID_PORT: PORT must be a valid integer between 1 and 65535. Received: '${cfg.port}'`);
  }

  // 3. S3 Numeric Limits Validation
  if (isNaN(cfg.s3.maxResumeSizeMb) || cfg.s3.maxResumeSizeMb <= 0) {
    errors.push("INVALID_CONFIG: MAX_RESUME_SIZE_MB must be a positive number.");
  }
  if (isNaN(cfg.s3.maxBlogImageSizeMb) || cfg.s3.maxBlogImageSizeMb <= 0) {
    errors.push("INVALID_CONFIG: MAX_BLOG_IMAGE_SIZE_MB must be a positive number.");
  }
  if (isNaN(cfg.s3.presignedExpiresInSeconds) || cfg.s3.presignedExpiresInSeconds <= 0) {
    errors.push("INVALID_CONFIG: S3_PRESIGNED_EXPIRES_IN must be a positive integer.");
  }

  // 4. Production Specific Hardening Rules
  if (cfg.env === "production") {
    // 4.1 Database Provider in Production MUST be PostgreSQL
    if (cfg.database.provider !== "postgresql") {
      errors.push(
        "PRODUCTION_INVALID_DATABASE_PROVIDER: Production requires PostgreSQL database provider ('postgresql'). SQLite is strictly forbidden in production."
      );
    }

    // 4.2 Database URL is REQUIRED in Production
    if (!cfg.database.url) {
      errors.push("MISSING_REQUIRED_ENV: DATABASE_URL is required in production.");
    } else {
      const isPgUrl =
        cfg.database.url.startsWith("postgresql://") || cfg.database.url.startsWith("postgres://");
      if (!isPgUrl) {
        errors.push(
          "INVALID_DATABASE_URL: Production DATABASE_URL must be a valid PostgreSQL connection string starting with 'postgresql://' or 'postgres://'."
        );
      }
    }

    // 4.3 CORS Configuration in Production
    if (!cfg.cors.origin || (Array.isArray(cfg.cors.origin) && cfg.cors.origin.length === 0)) {
      errors.push(
        "MISSING_REQUIRED_ENV: CORS_ORIGIN is required in production. Must specify explicit domain allowlist."
      );
    } else {
      const origins = Array.isArray(cfg.cors.origin) ? cfg.cors.origin : [cfg.cors.origin];
      if (origins.includes("*")) {
        errors.push(
          "INVALID_CORS_ORIGIN: Wildcard CORS origin ('*') is strictly forbidden in production when credentials are enabled."
        );
      }
    }

    // 4.4 Development Auth Bypass MUST NEVER be enabled in Production
    if (rawEnvSource.ALLOW_DEV_AUTH === "true" || cfg.allowDevAuth) {
      errors.push("SECURITY_VIOLATION: ALLOW_DEV_AUTH cannot be enabled in production.");
    }

    // 4.5 Firebase Admin SDK Credentials in Production
    if (!cfg.firebase.projectId) {
      errors.push("MISSING_REQUIRED_ENV: FIREBASE_PROJECT_ID is required in production.");
    }
    if (!cfg.firebase.clientEmail) {
      errors.push("MISSING_REQUIRED_ENV: FIREBASE_CLIENT_EMAIL is required in production.");
    }
    if (!cfg.firebase.privateKey) {
      errors.push("MISSING_REQUIRED_ENV: FIREBASE_PRIVATE_KEY is required in production.");
    } else {
      const pk = cfg.firebase.privateKey;
      if (!pk.includes("BEGIN PRIVATE KEY") && !pk.includes("BEGIN RSA PRIVATE KEY")) {
        errors.push(
          "INVALID_ENV_FORMAT: FIREBASE_PRIVATE_KEY must contain valid PEM private key headers (e.g. '-----BEGIN PRIVATE KEY-----')."
        );
      }
    }

    // 4.6 AWS S3 Configuration in Production
    if (!cfg.s3.bucketName) {
      errors.push("MISSING_REQUIRED_ENV: S3_BUCKET_NAME (or AWS_S3_BUCKET) is required in production.");
    }
    if (!cfg.s3.region) {
      errors.push("MISSING_REQUIRED_ENV: AWS_REGION is required in production.");
    }

    // If partial static AWS credentials provided, require both
    const hasKeyId = Boolean(cfg.s3.accessKeyId);
    const hasSecretKey = Boolean(cfg.s3.secretAccessKey);
    if ((hasKeyId && !hasSecretKey) || (!hasKeyId && hasSecretKey)) {
      errors.push(
        "INVALID_ENV_CONFIG: Both AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be provided together if using static AWS credentials (otherwise omit to use EC2 IAM role / AWS credential chain)."
      );
    }
  } else {
    // Non-production (development / test) checks
    if (cfg.database.provider === "postgresql" && cfg.database.url) {
      const isPgUrl =
        cfg.database.url.startsWith("postgresql://") || cfg.database.url.startsWith("postgres://");
      if (!isPgUrl) {
        errors.push(
          "INVALID_DATABASE_URL: DATABASE_URL must be a valid PostgreSQL connection string when provider is 'postgresql'."
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Asserts that configuration is valid for startup.
 * Throws a formatted Error with all collected validation errors if invalid.
 */
export function assertValidConfig(
  cfg: ServerConfig = config,
  rawEnvSource: NodeJS.ProcessEnv = process.env
): void {
  const result = validateConfig(cfg, rawEnvSource);
  if (!result.valid) {
    const header = `[Configuration Validation Error] Failed to validate environment for '${cfg.env}':`;
    const bulletList = result.errors.map((e) => `  - ${e}`).join("\n");
    throw new Error(`${header}\n${bulletList}`);
  }
}

/**
 * Generates a sanitized view of configuration suitable for operational startup logs.
 * Masks credentials, passwords, private keys, and secret access keys.
 */
export function getSanitizedConfig(cfg: ServerConfig = config): Record<string, unknown> {
  const sanitizeDbUrl = (url: string): string => {
    if (!url) return "(not configured)";
    if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
      return url.replace(/:\/\/[^@]+@/, "://***:***@");
    }
    return url;
  };

  return {
    environment: cfg.env,
    port: cfg.port,
    database: {
      provider: cfg.database.provider,
      url: sanitizeDbUrl(cfg.database.url),
    },
    cors: {
      origin: cfg.cors.origin,
    },
    firebase: {
      projectId: cfg.firebase.projectId || "(not configured)",
      clientEmail: cfg.firebase.clientEmail || "(not configured)",
      privateKeyConfigured: Boolean(cfg.firebase.privateKey),
    },
    s3: {
      bucketName: cfg.s3.bucketName || "(not configured)",
      region: cfg.s3.region,
      credentialStrategy:
        cfg.s3.accessKeyId && cfg.s3.secretAccessKey
          ? "STATIC_KEYS"
          : "AWS_DEFAULT_PROVIDER_CHAIN (IAM_ROLE)",
      maxResumeSizeMb: cfg.s3.maxResumeSizeMb,
      maxBlogImageSizeMb: cfg.s3.maxBlogImageSizeMb,
      presignedExpiresInSeconds: cfg.s3.presignedExpiresInSeconds,
    },
    allowDevAuth: cfg.allowDevAuth,
  };
}

export const config: ServerConfig = loadConfig();
export default config;

