import { createApp } from "../app.js";
import { userRepository } from "../repositories/user.repository.js";
import { roleRepository } from "../repositories/role.repository.js";
import { permissionRepository } from "../repositories/permission.repository.js";
import { auditRepository } from "../repositories/audit.repository.js";
import { seedDatabase } from "../db/seed.js";
import { runMigrations } from "../db/migrate.js";
import type { Server } from "http";

function getFriendlyAuthErrorMessage(error: any): string {
  if (!error) return "An unexpected error occurred. Please try again.";
  const code = typeof error === "string" ? error : error.code || error.message || "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password. Please verify your credentials.";
    case "auth/email-already-in-use":
      return "An account with this email address already exists. Please sign in instead.";
    case "auth/weak-password":
      return "Password is too weak. Please choose a password with at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact Saras Dynamics support.";
    case "auth/too-many-requests":
      return "Access to this account has been temporarily disabled due to many failed attempts. You can try again later.";
    case "auth/network-request-failed":
      return "A network error occurred. Please check your internet connection and retry.";
    case "auth/requires-recent-login":
      return "This action is sensitive and requires recent authentication. Please log in again.";
    default:
      if (typeof error?.message === "string" && error.message.trim().length > 0) {
        return error.message;
      }
      return "Authentication failed. Please try again.";
  }
}

async function runPhase9_5AuthTests() {
  console.log("==================================================");
  console.log("Starting Phase 9.5A Auth & RBAC Flow Verification Tests");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  // 1. Run migrations & seeds
  console.log("\n[Suite 1: Database Initialization & RBAC Invariants]");
  await runMigrations();
  await seedDatabase();

  const allRoles = await roleRepository.findAll();
  const systemRoles = allRoles.filter((r) => r.is_system_role);
  assert(systemRoles.length === 4, "System roles invariant", `Found ${systemRoles.length} roles (expected 4)`);

  const allPermissions = await permissionRepository.findAll();
  assert(allPermissions.length === 42, "All 42 approved permissions invariant", `Found ${allPermissions.length} permissions`);

  // Start test server
  const app = createApp();
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(3097, "127.0.0.1", () => resolve(s));
  });

  const baseUrl = "http://127.0.0.1:3097";
  const runId = Date.now();

  try {
    // 2. User Sync & Profile Hydration
    console.log("\n[Suite 2: Registration, Firebase Sync & Backend Hydration]");
    
    // Test: User sync creates user in DB
    const candidateUid = `uid-p95-${runId}`;
    const candidateEmail = `cand-${runId}@sarasdynamics.com`;
    const candidateToken = `dev-test:${candidateUid}:${candidateEmail}:Test Candidate User`;
    const syncPayload = {
      full_name: "Test Candidate User",
      profile_photo_url: "https://example.com/photo.jpg",
    };

    const syncRes = await fetch(`${baseUrl}/api/auth/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify(syncPayload),
    });

    assert(syncRes.status === 200, "POST /api/auth/sync returns 200 OK", `Got ${syncRes.status}`);
    const syncJson: any = await syncRes.json();
    assert(syncJson.success === true, "Sync response success is true");
    assert(syncJson.data.user.email === candidateEmail, "User email matched");
    assert(syncJson.data.user.full_name === "Test Candidate User", "User full name matched");
    assert(syncJson.data.user.status === "ACTIVE", "Initial user status is ACTIVE");
    const candidateUserId = syncJson.data.user.id;

    // Test: GET /api/auth/me returns hydrated profile
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${candidateToken}`,
      },
    });

    assert(meRes.status === 200, "GET /api/auth/me returns 200 OK", `Got ${meRes.status}`);
    const meJson: any = await meRes.json();
    assert(meJson.data.user.id === candidateUserId, "Profile ID matches synced user");
    assert(Array.isArray(meJson.data.roles), "Roles is an array");
    assert(Array.isArray(meJson.data.permissions), "Permissions is an array");

    // Test: Idempotency of user sync (update name without duplicate creation)
    const updateSyncRes = await fetch(`${baseUrl}/api/auth/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({ full_name: "Updated Candidate Name" }),
    });
    const updateSyncJson: any = await updateSyncRes.json();
    assert(updateSyncJson.data.user.id === candidateUserId, "User ID unchanged on re-sync");
    assert(updateSyncJson.data.user.full_name === "Updated Candidate Name", "User name updated on re-sync");

    // 3. Account Status Invariants
    console.log("\n[Suite 3: Account Status Invariants & Enforcement]");

    // Suspend user
    await userRepository.update(candidateUserId, { status: "SUSPENDED" });
    const suspendedRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${candidateToken}`,
      },
    });
    assert(suspendedRes.status === 403, "Suspended account returns 403 Forbidden", `Got ${suspendedRes.status}`);

    // Inactive user
    await userRepository.update(candidateUserId, { status: "INACTIVE" });
    const inactiveRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${candidateToken}`,
      },
    });
    assert(inactiveRes.status === 403, "Inactive account returns 403 Forbidden", `Got ${inactiveRes.status}`);

    // Reactivate user
    await userRepository.update(candidateUserId, { status: "ACTIVE" });
    const activeRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${candidateToken}`,
      },
    });
    assert(activeRes.status === 200, "Reactivated account returns 200 OK", `Got ${activeRes.status}`);

    // 4. Role Assignment & Granular RBAC Permissions
    console.log("\n[Suite 4: Role Assignment & Access Control Boundaries]");

    // Test: Candidate without roles cannot access admin jobs
    const unprivilegedJobRes = await fetch(`${baseUrl}/api/admin/jobs`, {
      headers: {
        Authorization: `Bearer ${candidateToken}`,
      },
    });
    assert(unprivilegedJobRes.status === 403, "Unprivileged user cannot access /api/admin/jobs (403)", `Got ${unprivilegedJobRes.status}`);

    // Assign RECRUITER role to candidate using assignRoleByName
    await userRepository.assignRoleByName(candidateUserId, "RECRUITER");

    // Now candidate has RECRUITER permissions
    const recruiterMeRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${candidateToken}`,
      },
    });
    const recruiterMeJson: any = await recruiterMeRes.json();
    assert(recruiterMeJson.data.roles.includes("RECRUITER"), "User now has RECRUITER role in profile");
    assert(recruiterMeJson.data.permissions.includes("jobs.read"), "User has jobs.read permission");

    const recruiterJobRes = await fetch(`${baseUrl}/api/admin/jobs`, {
      headers: {
        Authorization: `Bearer ${candidateToken}`,
      },
    });
    assert(recruiterJobRes.status === 200, "RECRUITER can access /api/admin/jobs (200 OK)", `Got ${recruiterJobRes.status}`);

    // RECRUITER cannot access blog posts admin
    const recruiterBlogRes = await fetch(`${baseUrl}/api/admin/blog/posts`, {
      headers: {
        Authorization: `Bearer ${candidateToken}`,
      },
    });
    assert(recruiterBlogRes.status === 403, "RECRUITER cannot access /api/admin/blog/posts (403 Forbidden)", `Got ${recruiterBlogRes.status}`);

    // 5. SUPER_ADMIN Master Bypass
    console.log("\n[Suite 5: SUPER_ADMIN Master Bypass Verification]");
    
    // Sync superadmin user
    const superAdminUid = `uid-super-${runId}`;
    const superAdminEmail = `super-${runId}@sarasdynamics.com`;
    const superAdminToken = `dev-test:${superAdminUid}:${superAdminEmail}:Super Admin Officer`;
    const saSyncRes = await fetch(`${baseUrl}/api/auth/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ full_name: "Super Admin Officer" }),
    });
    const saSyncJson: any = await saSyncRes.json();
    const saUserId = saSyncJson.data.user.id;
    await userRepository.assignRoleByName(saUserId, "SUPER_ADMIN");

    const saJobsRes = await fetch(`${baseUrl}/api/admin/jobs`, {
      headers: {
        Authorization: `Bearer ${superAdminToken}`,
      },
    });
    assert(saJobsRes.status === 200, "SUPER_ADMIN accesses /api/admin/jobs (200 OK)", `Got ${saJobsRes.status}`);

    const saBlogRes = await fetch(`${baseUrl}/api/admin/blog/posts`, {
      headers: {
        Authorization: `Bearer ${superAdminToken}`,
      },
    });
    assert(saBlogRes.status === 200, "SUPER_ADMIN accesses /api/admin/blog/posts (200 OK)", `Got ${saBlogRes.status}`);

    const saAuditRes = await fetch(`${baseUrl}/api/admin/audit-logs`, {
      headers: {
        Authorization: `Bearer ${superAdminToken}`,
      },
    });
    assert(saAuditRes.status === 200, "SUPER_ADMIN accesses /api/admin/audit-logs (200 OK)", `Got ${saAuditRes.status}`);

    // 6. Friendly Error Mapping
    console.log("\n[Suite 6: Frontend Auth Error Messages]");
    assert(
      getFriendlyAuthErrorMessage({ code: "auth/invalid-credential" }).includes("Invalid email or password"),
      "Maps auth/invalid-credential"
    );
    assert(
      getFriendlyAuthErrorMessage({ code: "auth/email-already-in-use" }).includes("already exists"),
      "Maps auth/email-already-in-use"
    );
    assert(
      getFriendlyAuthErrorMessage({ code: "auth/weak-password" }).includes("at least 6 characters"),
      "Maps auth/weak-password"
    );
    assert(
      getFriendlyAuthErrorMessage({ code: "auth/invalid-email" }).includes("valid email"),
      "Maps auth/invalid-email"
    );
    assert(
      getFriendlyAuthErrorMessage({ code: "auth/too-many-requests" }).includes("temporarily disabled"),
      "Maps auth/too-many-requests"
    );
    assert(
      getFriendlyAuthErrorMessage({ code: "auth/network-request-failed" }).includes("network error"),
      "Maps auth/network-request-failed"
    );
    assert(
      getFriendlyAuthErrorMessage({ code: "auth/user-disabled" }).includes("disabled"),
      "Maps auth/user-disabled"
    );

    // 7. Audit Logging for Auth Operations
    console.log("\n[Suite 7: Authentication Audit Trail]");
    const auditRes = await auditRepository.findMany({ module: "AUTH", limit: 10 });
    assert(auditRes.logs.length > 0, "Auth operations recorded in audit log", `Found ${auditRes.logs.length} auth audit logs`);
    const loginAudit = auditRes.logs.find((l) => l.action === "LOGIN");
    assert(Boolean(loginAudit), "Audit log contains LOGIN action for authenticated user session");

  } finally {
    server.close();
  }

  console.log("\n==================================================");
  console.log(`Phase 9.5A Test Results: ${passed} passed, ${failed} failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase9_5AuthTests().catch((err) => {
  console.error("Phase 9.5A Test Runner Error:", err);
  process.exit(1);
});
