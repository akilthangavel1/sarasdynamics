import { createApp } from "../app.js";
import { userRepository } from "../repositories/user.repository.js";
import { roleRepository } from "../repositories/role.repository.js";
import { permissionRepository } from "../repositories/permission.repository.js";
import { seedDatabase } from "../db/seed.js";
import { runMigrations } from "../db/migrate.js";
import type { Server } from "http";

async function runAuthTests() {
  console.log("==================================================");
  console.log("Starting Phase 2 Auth & RBAC Verification Tests");
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
  console.log("\n[Test Suite 1: Database Migrations, Seeds & Idempotency]");
  await runMigrations();
  await seedDatabase();

  const allRoles = await roleRepository.findAll();
  const systemRoles = allRoles.filter((r) => r.is_system_role);
  assert(systemRoles.length === 4, "System roles seeded", `Found ${systemRoles.length} roles (expected 4)`);

  const allPermissions = await permissionRepository.findAll();
  assert(allPermissions.length === 42, "All 42 approved permissions seeded", `Found ${allPermissions.length} permissions`);

  // Verify obsolete permissions are completely absent from database
  const obsoleteNames = [
    "jobs.archive",
    "applications.create",
    "applications.status_change",
    "applications.notes_create",
    "applications.notes_read",
    "resumes.upload",
    "resumes.read",
    "resumes.download",
    "resumes.delete",
    "interviews.schedule",
    "interviews.cancel",
    "interviews.feedback_create",
    "interviews.feedback_read",
    "users.status_change",
    "rbac.roles_read",
    "rbac.roles_manage",
    "rbac.permissions_read",
    "rbac.user_roles_assign",
    "rbac.user_roles_revoke",
    "settings.read",
    "settings.manage",
    "audit.read",
  ];
  const foundObsolete = allPermissions.filter((p) => obsoleteNames.includes(p.name));
  assert(
    foundObsolete.length === 0,
    "No obsolete/unapproved permissions exist in database",
    foundObsolete.map((o) => o.name).join(", ")
  );

  // Test idempotency: re-running seed must not create duplicate permissions or roles
  await seedDatabase();
  const rePermissions = await permissionRepository.findAll();
  const reRoles = (await roleRepository.findAll()).filter((r) => r.is_system_role);
  assert(
    rePermissions.length === 42 && reRoles.length === 4,
    "Seed is idempotent (re-seed produces identical counts with no duplicates)"
  );

  // Start temporary test server
  const app = createApp();
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(3099, "127.0.0.1", () => resolve(s));
  });

  const baseUrl = "http://127.0.0.1:3099";

  try {
    // 2. Authorization Header & Token Validation Tests
    console.log("\n[Test Suite 2: Authentication Header & Token Checks]");

    // Test: No Token -> 401
    const resNoToken = await fetch(`${baseUrl}/api/auth/me`);
    assert(resNoToken.status === 401, "No Token returns 401 Unauthorized", `Got ${resNoToken.status}`);

    // Test: Malformed Header -> 401
    const resMalformed = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: "Basic 12345" },
    });
    assert(resMalformed.status === 401, "Malformed Authorization header returns 401", `Got ${resMalformed.status}`);

    // Test: Invalid/Garbage Token -> 401
    const resInvalid = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: "Bearer garbage-invalid-token" },
    });
    assert(resInvalid.status === 401, "Invalid token returns 401 Unauthorized", `Got ${resInvalid.status}`);

    // 3. User Synchronization Tests
    console.log("\n[Test Suite 3: User Synchronization (POST /api/auth/sync)]");

    // Dev test tokens format: dev-test:<uid>:<email>:<name>
    const recruiterToken = "dev-test:uid-recruiter-001:recruiter@saras.com:Recruiter Alice";
    const contentWriterToken = "dev-test:uid-writer-002:writer@saras.com:Writer Bob";
    const adminToken = "dev-test:uid-admin-003:admin@saras.com:Admin Carol";
    const superAdminToken = "dev-test:uid-super-004:super@saras.com:Super Dave";
    const multiRoleToken = "dev-test:uid-multi-005:multi@saras.com:Multi Role Eve";
    const unprivilegedToken = "dev-test:uid-unpriv-006:unpriv@saras.com:Unprivileged Frank";
    const inactiveToken = "dev-test:uid-inactive-007:inactive@saras.com:Inactive Grace";
    const suspendedToken = "dev-test:uid-suspended-008:suspended@saras.com:Suspended Hank";

    // Test brand new user sync defaults to 0 privileged roles
    const brandNewUid = `uid-brand-new-${Date.now()}`;
    const brandNewToken = `dev-test:${brandNewUid}:brandnew-${Date.now()}@saras.com:Brand New User`;
    const syncBrandNewRes = await fetch(`${baseUrl}/api/auth/sync`, {
      method: "POST",
      headers: { Authorization: `Bearer ${brandNewToken}` },
      body: JSON.stringify({ phone: "+1234567890" }),
    });
    const syncBrandNewJson = await syncBrandNewRes.json();
    assert(syncBrandNewRes.status === 200, "Sync brand new user returns 200", `Got ${syncBrandNewRes.status}`);
    assert(Array.isArray(syncBrandNewJson.data?.roles) && syncBrandNewJson.data.roles.length === 0, "New user defaults to 0 privileged roles");

    // Sync all designated role test users
    await fetch(`${baseUrl}/api/auth/sync`, { method: "POST", headers: { Authorization: `Bearer ${recruiterToken}` } });
    await fetch(`${baseUrl}/api/auth/sync`, { method: "POST", headers: { Authorization: `Bearer ${contentWriterToken}` } });
    await fetch(`${baseUrl}/api/auth/sync`, { method: "POST", headers: { Authorization: `Bearer ${adminToken}` } });
    await fetch(`${baseUrl}/api/auth/sync`, { method: "POST", headers: { Authorization: `Bearer ${superAdminToken}` } });
    await fetch(`${baseUrl}/api/auth/sync`, { method: "POST", headers: { Authorization: `Bearer ${multiRoleToken}` } });
    await fetch(`${baseUrl}/api/auth/sync`, { method: "POST", headers: { Authorization: `Bearer ${unprivilegedToken}` } });
    await fetch(`${baseUrl}/api/auth/sync`, { method: "POST", headers: { Authorization: `Bearer ${inactiveToken}` } });
    await fetch(`${baseUrl}/api/auth/sync`, { method: "POST", headers: { Authorization: `Bearer ${suspendedToken}` } });

    // Assign roles in database
    const recruiterUser = await userRepository.findByFirebaseUid("uid-recruiter-001");
    const writerUser = await userRepository.findByFirebaseUid("uid-writer-002");
    const adminUser = await userRepository.findByFirebaseUid("uid-admin-003");
    const superAdminUser = await userRepository.findByFirebaseUid("uid-super-004");
    const multiUser = await userRepository.findByFirebaseUid("uid-multi-005");
    const inactiveUser = await userRepository.findByFirebaseUid("uid-inactive-007");
    const suspendedUser = await userRepository.findByFirebaseUid("uid-suspended-008");

    if (recruiterUser) await userRepository.assignRoleByName(recruiterUser.id, "RECRUITER");
    if (writerUser) await userRepository.assignRoleByName(writerUser.id, "CONTENT_WRITER");
    if (adminUser) await userRepository.assignRoleByName(adminUser.id, "ADMIN");
    if (superAdminUser) await userRepository.assignRoleByName(superAdminUser.id, "SUPER_ADMIN");
    if (multiUser) {
      await userRepository.assignRoleByName(multiUser.id, "RECRUITER");
      await userRepository.assignRoleByName(multiUser.id, "CONTENT_WRITER");
    }

    // Set inactive and suspended status
    if (inactiveUser) await userRepository.update(inactiveUser.id, { status: "INACTIVE" });
    if (suspendedUser) await userRepository.update(suspendedUser.id, { status: "SUSPENDED" });

    // 4. Inactive & Suspended User Status Tests
    console.log("\n[Test Suite 4: Inactive & Suspended User Status Enforcement]");

    const resInactive = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${inactiveToken}` },
    });
    assert(resInactive.status === 403, "Inactive user returns 403 Forbidden", `Got ${resInactive.status}`);

    const resSuspended = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${suspendedToken}` },
    });
    assert(resSuspended.status === 403, "Suspended user returns 403 Forbidden", `Got ${resSuspended.status}`);

    // 5. Authenticated /api/auth/me Profile Tests
    console.log("\n[Test Suite 5: Profile & Role Retrieval (GET /api/auth/me)]");

    const resMe = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const meJson = await resMe.json();
    assert(resMe.status === 200, "GET /api/auth/me returns 200 for active user", `Got ${resMe.status}`);
    assert(meJson.data?.roles.includes("RECRUITER"), "Recruiter user has RECRUITER role");
    assert(meJson.data?.permissions.includes("jobs.create"), "Recruiter permissions include jobs.create");
    assert(!meJson.data?.permissions.includes("users.read"), "Recruiter permissions correctly DO NOT include users.read");

    // 6. RBAC Permission Enforcement (403 Forbidden vs 200 OK)
    console.log("\n[Test Suite 6: RBAC Middleware (requirePermission) Verification]");

    // Recruiter tests:
    // Has jobs.create -> 200
    const recJobsRes = await fetch(`${baseUrl}/api/auth/test/jobs-create`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(recJobsRes.status === 200, "RECRUITER accessing jobs.create route gets 200 OK");

    // Lacks users.read -> 403
    const recUsersRes = await fetch(`${baseUrl}/api/auth/test/users-read`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(recUsersRes.status === 403, "RECRUITER accessing users.read route gets 403 Forbidden", `Got ${recUsersRes.status}`);

    // Content Writer tests:
    // Has jobs.update_content -> 200
    const writerUpdateContentRes = await fetch(`${baseUrl}/api/auth/test/jobs-update-content`, {
      headers: { Authorization: `Bearer ${contentWriterToken}` },
    });
    assert(writerUpdateContentRes.status === 200, "CONTENT_WRITER accessing jobs.update_content route gets 200 OK");

    // Lacks jobs.create -> 403
    const writerJobsRes = await fetch(`${baseUrl}/api/auth/test/jobs-create`, {
      headers: { Authorization: `Bearer ${contentWriterToken}` },
    });
    assert(writerJobsRes.status === 403, "CONTENT_WRITER accessing jobs.create route gets 403 Forbidden", `Got ${writerJobsRes.status}`);

    // Has content.publish -> 200
    const writerContentRes = await fetch(`${baseUrl}/api/auth/test/content-publish`, {
      headers: { Authorization: `Bearer ${contentWriterToken}` },
    });
    assert(writerContentRes.status === 200, "CONTENT_WRITER accessing content.publish route gets 200 OK");

    // Recruiter lacks jobs.update_content -> 403
    const recUpdateContentRes = await fetch(`${baseUrl}/api/auth/test/jobs-update-content`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(recUpdateContentRes.status === 403, "RECRUITER accessing jobs.update_content route gets 403 Forbidden (content-only privilege)");

    // Admin tests:
    // Has jobs.create, users.read, and content.publish -> all 200
    const adminJobsRes = await fetch(`${baseUrl}/api/auth/test/jobs-create`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const adminUsersRes = await fetch(`${baseUrl}/api/auth/test/users-read`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const adminContentRes = await fetch(`${baseUrl}/api/auth/test/content-publish`, { headers: { Authorization: `Bearer ${adminToken}` } });
    assert(adminJobsRes.status === 200 && adminUsersRes.status === 200 && adminContentRes.status === 200, "ADMIN has jobs.create, users.read, and content.publish");

    // Super Admin tests:
    // SUPER_ADMIN has master bypass for every permission -> all 200
    const superJobsRes = await fetch(`${baseUrl}/api/auth/test/jobs-create`, { headers: { Authorization: `Bearer ${superAdminToken}` } });
    const superUsersRes = await fetch(`${baseUrl}/api/auth/test/users-read`, { headers: { Authorization: `Bearer ${superAdminToken}` } });
    const superContentRes = await fetch(`${baseUrl}/api/auth/test/content-publish`, { headers: { Authorization: `Bearer ${superAdminToken}` } });
    assert(superJobsRes.status === 200 && superUsersRes.status === 200 && superContentRes.status === 200, "SUPER_ADMIN has unrestricted permission access");

    // 7. Multiple Roles Union Test
    console.log("\n[Test Suite 7: Multiple Roles (Union of Permissions)]");
    const multiRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${multiRoleToken}` },
    });
    const multiJson = await multiRes.json();
    const multiPerms = multiJson.data?.permissions || [];
    assert(
      multiJson.data?.roles.includes("RECRUITER") && multiJson.data?.roles.includes("CONTENT_WRITER"),
      "User has both RECRUITER and CONTENT_WRITER roles"
    );
    assert(
      multiPerms.includes("jobs.create") && multiPerms.includes("content.publish"),
      "User with multiple roles receives UNION of permissions (jobs.create + content.publish)"
    );
    assert(
      !multiPerms.includes("users.read"),
      "User with multiple non-admin roles still correctly lacks unassigned permissions (users.read)"
    );

    // 8. Database Constraints Verification
    console.log("\n[Test Suite 8: Database Integrity & Unique Constraints]");
    try {
      // Attempt to insert duplicate firebase_uid
      await userRepository.create({
        firebase_uid: "uid-recruiter-001",
        email: "duplicate@saras.com",
      });
      assert(false, "Duplicate firebase_uid should throw unique constraint violation");
    } catch {
      assert(true, "Unique constraint on users.firebase_uid enforced by database");
    }

  } finally {
    server.close();
  }

  console.log("\n==================================================");
  console.log(`Phase 2 Tests Finished: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
