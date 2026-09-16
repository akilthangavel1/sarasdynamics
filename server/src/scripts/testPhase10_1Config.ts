/**
 * Phase 10.1 — Production Configuration & Environment Hardening Test Suite
 * Validates fail-fast configuration loading, production constraints, CORS parsing,
 * security boundaries, and secret sanitization.
 */

import {
  loadConfig,
  validateConfig,
  assertValidConfig,
  getSanitizedConfig,
  type ServerConfig,
} from "../config/index.js";
import { app } from "../app.js";
import { SEED_ROLES, SEED_PERMISSIONS } from "../db/seedData.js";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passedCount++;
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
    failedCount++;
  }
}

async function runTests() {
  console.log("==================================================");
  console.log("Phase 10.1: Production Configuration & Environment Hardening Tests");
  console.log("==================================================\n");

  // Sample valid PEM key for test simulation
  const validMockPemKey = "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----";

  // --------------------------------------------------------------------------
  // Suite 1: Development Environment Configuration Defaults & Permissiveness
  // --------------------------------------------------------------------------
  console.log("[Suite 1: Development Environment Defaults]");
  {
    const devEnv: NodeJS.ProcessEnv = {
      NODE_ENV: "development",
      PORT: "3000",
    };
    const cfg = loadConfig(devEnv);
    const res = validateConfig(cfg, devEnv);

    assert(cfg.env === "development", "Development environment is correctly identified");
    assert(cfg.database.provider === "sqlite", "Development defaults database provider to sqlite");
    assert(cfg.database.url.includes("dev.db"), "Development defaults database url to local dev.db file");
    assert(Array.isArray(cfg.cors.origin) && cfg.cors.origin.includes("http://localhost:3000"), "Development defaults CORS origin to local ports");
    assert(cfg.allowDevAuth === true, "Development permits ALLOW_DEV_AUTH by default");
    assert(res.valid === true, "Development default configuration validates successfully");
  }

  // --------------------------------------------------------------------------
  // Suite 2: Test Environment Configuration Defaults
  // --------------------------------------------------------------------------
  console.log("\n[Suite 2: Test Environment Defaults]");
  {
    const testEnv: NodeJS.ProcessEnv = {
      NODE_ENV: "test",
      PORT: "3000",
    };
    const cfg = loadConfig(testEnv);
    const res = validateConfig(cfg, testEnv);

    assert(cfg.env === "test", "Test environment is correctly identified");
    assert(cfg.database.url.includes("test.db"), "Test defaults database url to test.db");
    assert(res.valid === true, "Test default configuration validates successfully");
  }

  // --------------------------------------------------------------------------
  // Suite 3: Production Fail-Fast — Database Configuration Rules
  // --------------------------------------------------------------------------
  console.log("\n[Suite 3: Production Database Fail-Fast Validations]");
  {
    // Test 3.1: Missing DATABASE_URL in production
    const prodMissingDb: NodeJS.ProcessEnv = {
      NODE_ENV: "production",
      CORS_ORIGIN: "https://sarasdynamics.com",
      FIREBASE_PROJECT_ID: "saras-dynamics-prod",
      FIREBASE_CLIENT_EMAIL: "admin@saras-dynamics-prod.iam.gserviceaccount.com",
      FIREBASE_PRIVATE_KEY: validMockPemKey,
      S3_BUCKET_NAME: "saras-prod-resumes",
      AWS_REGION: "us-east-1",
    };
    const cfg1 = loadConfig(prodMissingDb);
    const res1 = validateConfig(cfg1, prodMissingDb);
    assert(res1.valid === false, "Production rejects startup when DATABASE_URL is missing");
    assert(res1.errors.some((e) => e.includes("MISSING_REQUIRED_ENV: DATABASE_URL")), "Error explicitly cites MISSING_REQUIRED_ENV: DATABASE_URL");

    // Test 3.2: SQLite provider explicitly set in production
    const prodSqlite: NodeJS.ProcessEnv = {
      ...prodMissingDb,
      DATABASE_PROVIDER: "sqlite",
      DATABASE_URL: "file:./server/data/prod.db",
    };
    const cfg2 = loadConfig(prodSqlite);
    const res2 = validateConfig(cfg2, prodSqlite);
    assert(res2.valid === false, "Production strictly forbids SQLite provider");
    assert(res2.errors.some((e) => e.includes("PRODUCTION_INVALID_DATABASE_PROVIDER")), "Error cites PRODUCTION_INVALID_DATABASE_PROVIDER");

    // Test 3.3: Invalid database URL format (non-postgresql URL in prod)
    const prodInvalidUrl: NodeJS.ProcessEnv = {
      ...prodMissingDb,
      DATABASE_URL: "mysql://user:pass@host:3306/db",
    };
    const cfg3 = loadConfig(prodInvalidUrl);
    const res3 = validateConfig(cfg3, prodInvalidUrl);
    assert(res3.valid === false, "Production rejects non-PostgreSQL connection strings");
    assert(res3.errors.some((e) => e.includes("INVALID_DATABASE_URL")), "Error cites INVALID_DATABASE_URL");

    // Test 3.4: Valid PostgreSQL connection string in production
    const prodValidDb: NodeJS.ProcessEnv = {
      ...prodMissingDb,
      DATABASE_URL: "postgresql://saras_user:secret_password@db.example.com:5432/saras_prod",
    };
    const cfg4 = loadConfig(prodValidDb);
    const res4 = validateConfig(cfg4, prodValidDb);
    assert(res4.valid === true, "Production accepts valid postgresql:// connection string");
  }

  // --------------------------------------------------------------------------
  // Suite 4: Production Fail-Fast — CORS Hardening
  // --------------------------------------------------------------------------
  console.log("\n[Suite 4: Production CORS Hardening]");
  {
    const baseProd: NodeJS.ProcessEnv = {
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://saras_user:secret_password@db.example.com:5432/saras_prod",
      FIREBASE_PROJECT_ID: "saras-dynamics-prod",
      FIREBASE_CLIENT_EMAIL: "admin@saras-dynamics-prod.iam.gserviceaccount.com",
      FIREBASE_PRIVATE_KEY: validMockPemKey,
      S3_BUCKET_NAME: "saras-prod-resumes",
      AWS_REGION: "us-east-1",
    };

    // Test 4.1: Missing CORS_ORIGIN in production
    const prodMissingCors = { ...baseProd, CORS_ORIGIN: "" };
    const cfg1 = loadConfig(prodMissingCors);
    const res1 = validateConfig(cfg1, prodMissingCors);
    assert(res1.valid === false, "Production rejects startup when CORS_ORIGIN is missing");
    assert(res1.errors.some((e) => e.includes("MISSING_REQUIRED_ENV: CORS_ORIGIN")), "Error cites MISSING_REQUIRED_ENV: CORS_ORIGIN");

    // Test 4.2: Wildcard CORS (*) in production
    const prodWildcardCors = { ...baseProd, CORS_ORIGIN: "*" };
    const cfg2 = loadConfig(prodWildcardCors);
    const res2 = validateConfig(cfg2, prodWildcardCors);
    assert(res2.valid === false, "Production strictly rejects wildcard CORS origin (*)");
    assert(res2.errors.some((e) => e.includes("INVALID_CORS_ORIGIN")), "Error cites INVALID_CORS_ORIGIN");

    // Test 4.3: Comma-separated multi-domain CORS allowlist in production
    const prodMultiCors = {
      ...baseProd,
      CORS_ORIGIN: "https://sarasdynamics.com, https://admin.sarasdynamics.com",
    };
    const cfg3 = loadConfig(prodMultiCors);
    const res3 = validateConfig(cfg3, prodMultiCors);
    assert(res3.valid === true, "Production accepts comma-separated domain allowlist");
    assert(
      Array.isArray(cfg3.cors.origin) &&
        cfg3.cors.origin.length === 2 &&
        cfg3.cors.origin[0] === "https://sarasdynamics.com" &&
        cfg3.cors.origin[1] === "https://admin.sarasdynamics.com",
      "CORS origin string is correctly parsed and trimmed into an array of allowed origins"
    );
  }

  // --------------------------------------------------------------------------
  // Suite 5: Production Fail-Fast — Development Auth Bypass Rejection
  // --------------------------------------------------------------------------
  console.log("\n[Suite 5: Development Auth Bypass Security Boundary]");
  {
    const prodWithDevAuth: NodeJS.ProcessEnv = {
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://saras_user:secret_password@db.example.com:5432/saras_prod",
      CORS_ORIGIN: "https://sarasdynamics.com",
      FIREBASE_PROJECT_ID: "saras-dynamics-prod",
      FIREBASE_CLIENT_EMAIL: "admin@saras-dynamics-prod.iam.gserviceaccount.com",
      FIREBASE_PRIVATE_KEY: validMockPemKey,
      S3_BUCKET_NAME: "saras-prod-resumes",
      AWS_REGION: "us-east-1",
      ALLOW_DEV_AUTH: "true",
    };
    const cfg = loadConfig(prodWithDevAuth);
    const res = validateConfig(cfg, prodWithDevAuth);
    assert(cfg.allowDevAuth === false, "loadConfig forces allowDevAuth to false in production");
    assert(res.valid === false, "validateConfig fails if ALLOW_DEV_AUTH is set to true in production");
    assert(res.errors.some((e) => e.includes("SECURITY_VIOLATION: ALLOW_DEV_AUTH")), "Error cites SECURITY_VIOLATION: ALLOW_DEV_AUTH cannot be enabled in production");
  }

  // --------------------------------------------------------------------------
  // Suite 6: Production Fail-Fast — Firebase Admin SDK Credentials
  // --------------------------------------------------------------------------
  console.log("\n[Suite 6: Production Firebase Admin SDK Credentials]");
  {
    const baseProd: NodeJS.ProcessEnv = {
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://saras_user:secret_password@db.example.com:5432/saras_prod",
      CORS_ORIGIN: "https://sarasdynamics.com",
      S3_BUCKET_NAME: "saras-prod-resumes",
      AWS_REGION: "us-east-1",
    };

    // Test 6.1: Missing Firebase Project ID
    const noProj = { ...baseProd, FIREBASE_CLIENT_EMAIL: "admin@prod.com", FIREBASE_PRIVATE_KEY: validMockPemKey };
    const res1 = validateConfig(loadConfig(noProj), noProj);
    assert(res1.errors.some((e) => e.includes("MISSING_REQUIRED_ENV: FIREBASE_PROJECT_ID")), "Fails when FIREBASE_PROJECT_ID is missing");

    // Test 6.2: Missing Firebase Client Email
    const noEmail = { ...baseProd, FIREBASE_PROJECT_ID: "saras-prod", FIREBASE_PRIVATE_KEY: validMockPemKey };
    const res2 = validateConfig(loadConfig(noEmail), noEmail);
    assert(res2.errors.some((e) => e.includes("MISSING_REQUIRED_ENV: FIREBASE_CLIENT_EMAIL")), "Fails when FIREBASE_CLIENT_EMAIL is missing");

    // Test 6.3: Missing Firebase Private Key
    const noKey = { ...baseProd, FIREBASE_PROJECT_ID: "saras-prod", FIREBASE_CLIENT_EMAIL: "admin@prod.com" };
    const res3 = validateConfig(loadConfig(noKey), noKey);
    assert(res3.errors.some((e) => e.includes("MISSING_REQUIRED_ENV: FIREBASE_PRIVATE_KEY")), "Fails when FIREBASE_PRIVATE_KEY is missing");

    // Test 6.4: Malformed Private Key
    const badKey = {
      ...baseProd,
      FIREBASE_PROJECT_ID: "saras-prod",
      FIREBASE_CLIENT_EMAIL: "admin@prod.com",
      FIREBASE_PRIVATE_KEY: "not-a-real-pem-key",
    };
    const res4 = validateConfig(loadConfig(badKey), badKey);
    assert(res4.errors.some((e) => e.includes("INVALID_ENV_FORMAT: FIREBASE_PRIVATE_KEY")), "Fails when FIREBASE_PRIVATE_KEY lacks PEM headers");
  }

  // --------------------------------------------------------------------------
  // Suite 7: Production Fail-Fast — AWS S3 Storage Configuration
  // --------------------------------------------------------------------------
  console.log("\n[Suite 7: Production AWS S3 Storage Hardening]");
  {
    const baseProd: NodeJS.ProcessEnv = {
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://saras_user:secret_password@db.example.com:5432/saras_prod",
      CORS_ORIGIN: "https://sarasdynamics.com",
      FIREBASE_PROJECT_ID: "saras-dynamics-prod",
      FIREBASE_CLIENT_EMAIL: "admin@saras-dynamics-prod.iam.gserviceaccount.com",
      FIREBASE_PRIVATE_KEY: validMockPemKey,
      AWS_REGION: "us-east-1",
    };

    // Test 7.1: Missing bucket name
    const noBucket = { ...baseProd, S3_BUCKET_NAME: "", AWS_S3_BUCKET: "" };
    const res1 = validateConfig(loadConfig(noBucket), noBucket);
    assert(res1.errors.some((e) => e.includes("MISSING_REQUIRED_ENV: S3_BUCKET_NAME")), "Fails when S3 bucket name is missing in production");

    // Test 7.2: Partial static credentials (access key without secret key)
    const partialCreds = {
      ...baseProd,
      S3_BUCKET_NAME: "saras-prod-resumes",
      AWS_ACCESS_KEY_ID: "AKIAIOSFODNN7EXAMPLE",
      AWS_SECRET_ACCESS_KEY: "",
    };
    const res2 = validateConfig(loadConfig(partialCreds), partialCreds);
    assert(res2.errors.some((e) => e.includes("INVALID_ENV_CONFIG: Both AWS_ACCESS_KEY_ID")), "Fails when static AWS credentials are only partially provided");

    // Test 7.3: IAM Role configuration (no static keys provided)
    const iamRoleConfig = {
      ...baseProd,
      S3_BUCKET_NAME: "saras-prod-resumes",
    };
    const res3 = validateConfig(loadConfig(iamRoleConfig), iamRoleConfig);
    assert(res3.valid === true, "Valid production config with IAM role authentication passes validation");
  }

  // --------------------------------------------------------------------------
  // Suite 8: Environment & Numeric Boundary Hardening
  // --------------------------------------------------------------------------
  console.log("\n[Suite 8: Environment & Numeric Boundary Checks]");
  {
    // Test 8.1: Invalid NODE_ENV
    const badEnv: NodeJS.ProcessEnv = { NODE_ENV: "staging_custom" };
    const res1 = validateConfig(loadConfig(badEnv), badEnv);
    assert(res1.errors.some((e) => e.includes("INVALID_ENV: NODE_ENV must be one of")), "Rejects invalid NODE_ENV strings");

    // Test 8.2: Out of range port
    const badPort: NodeJS.ProcessEnv = { PORT: "999999" };
    const res2 = validateConfig(loadConfig(badPort), badPort);
    assert(res2.errors.some((e) => e.includes("INVALID_PORT")), "Rejects out-of-range port numbers");

    // Test 8.3: Negative file limits
    const badLimit: NodeJS.ProcessEnv = { MAX_RESUME_SIZE_MB: "-1" };
    const res3 = validateConfig(loadConfig(badLimit), badLimit);
    assert(res3.errors.some((e) => e.includes("INVALID_CONFIG: MAX_RESUME_SIZE_MB")), "Rejects non-positive resume size limit");
  }

  // --------------------------------------------------------------------------
  // Suite 9: Secret Sanitization & Safe Output Inspection
  // --------------------------------------------------------------------------
  console.log("\n[Suite 9: Secret Sanitization & Operational Safety]");
  {
    const prodEnv: NodeJS.ProcessEnv = {
      NODE_ENV: "production",
      PORT: "3000",
      DATABASE_URL: "postgresql://super_user:TopSecretPassword123@db.saras.com:5432/saras_production_db",
      CORS_ORIGIN: "https://sarasdynamics.com",
      FIREBASE_PROJECT_ID: "saras-prod-12345",
      FIREBASE_CLIENT_EMAIL: "firebase-adminsdk@saras-prod.iam.gserviceaccount.com",
      FIREBASE_PRIVATE_KEY: validMockPemKey,
      S3_BUCKET_NAME: "saras-prod-documents",
      AWS_REGION: "us-east-1",
      AWS_ACCESS_KEY_ID: "AKIAIOSFODNN7EXAMPLE",
      AWS_SECRET_ACCESS_KEY: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    };

    const cfg = loadConfig(prodEnv);
    const sanitized = getSanitizedConfig(cfg);

    const stringified = JSON.stringify(sanitized);

    assert(!stringified.includes("TopSecretPassword123"), "Database password is never present in sanitized output");
    assert(!stringified.includes("wJalrXUtnFEMI"), "AWS Secret Access Key is never present in sanitized output");
    assert(!stringified.includes("MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC"), "Firebase Private Key is never present in sanitized output");
    assert(stringified.includes("://***:***@db.saras.com:5432/saras_production_db"), "PostgreSQL URL is properly masked (credentials redacted)");
    assert(sanitized.firebase && (sanitized.firebase as any).privateKeyConfigured === true, "Private key presence is signaled via boolean indicator without leaking bytes");
  }

  // --------------------------------------------------------------------------
  // Suite 10: Complete Valid Production Deployment Configuration
  // --------------------------------------------------------------------------
  console.log("\n[Suite 10: Full Valid Production Config Assertion]");
  {
    const fullProdEnv: NodeJS.ProcessEnv = {
      NODE_ENV: "production",
      PORT: "3000",
      DATABASE_PROVIDER: "postgresql",
      DATABASE_URL: "postgresql://saras_admin:ProductionSecPass@db.internal.saras.com:5432/saras_production",
      CORS_ORIGIN: "https://sarasdynamics.com,https://admin.sarasdynamics.com",
      FIREBASE_PROJECT_ID: "saras-dynamics-production",
      FIREBASE_CLIENT_EMAIL: "backend-service@saras-dynamics-production.iam.gserviceaccount.com",
      FIREBASE_PRIVATE_KEY: validMockPemKey,
      S3_BUCKET_NAME: "saras-production-private-resumes",
      AWS_REGION: "us-east-1",
      ALLOW_DEV_AUTH: "false",
      MAX_RESUME_SIZE_MB: "5",
      MAX_BLOG_IMAGE_SIZE_MB: "5",
      S3_PRESIGNED_EXPIRES_IN: "900",
    };

    const cfg = loadConfig(fullProdEnv);
    let threw = false;
    try {
      assertValidConfig(cfg, fullProdEnv);
    } catch {
      threw = true;
    }

    assert(threw === false, "assertValidConfig completes without error on valid full production configuration");
    assert(cfg.database.provider === "postgresql", "Provider is postgresql");
    assert(Array.isArray(cfg.cors.origin) && cfg.cors.origin.length === 2, "CORS origin contains exactly the 2 authorized domains");
  }

  // --------------------------------------------------------------------------
  // Suite 11: Application RBAC & Schema Invariants Check
  // --------------------------------------------------------------------------
  console.log("\n[Suite 11: Architecture & System Invariants Integrity]");
  {
    assert(app !== undefined, "Express app instance initializes cleanly with hardened config");
    assert(SEED_ROLES.length === 4, "Exactly 4 system roles remain intact");
    assert(SEED_PERMISSIONS.length === 42, "Exactly 42 system permissions remain intact");
  }

  console.log("\n==================================================");
  console.log(`Phase 10.1 Configuration Hardening Tests Finished: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("==================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
