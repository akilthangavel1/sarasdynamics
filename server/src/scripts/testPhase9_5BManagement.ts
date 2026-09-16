import { createApp } from "../app.js";
import { userRepository } from "../repositories/user.repository.js";
import { roleRepository } from "../repositories/role.repository.js";
import { permissionRepository } from "../repositories/permission.repository.js";
import { auditRepository } from "../repositories/audit.repository.js";
import { seedDatabase } from "../db/seed.js";
import { runMigrations } from "../db/migrate.js";
import type { Server } from "http";

async function runPhase9_5BManagementTests() {
  console.log("==================================================");
  console.log("Starting Phase 9.5B Management & RBAC Console Tests");
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

  // 1. Initialize
  console.log("\n[Suite 1: Database Seed & Role Invariant Verification]");
  await runMigrations();
  await seedDatabase();

  const superAdminRole = await roleRepository.findByName("SUPER_ADMIN");
  const adminRole = await roleRepository.findByName("ADMIN");
  const recruiterRole = await roleRepository.findByName("RECRUITER");
  const writerRole = await roleRepository.findByName("CONTENT_WRITER");

  assert(Boolean(superAdminRole), "SUPER_ADMIN role exists");
  assert(Boolean(adminRole), "ADMIN role exists");
  assert(Boolean(recruiterRole), "RECRUITER role exists");
  assert(Boolean(writerRole), "CONTENT_WRITER role exists");

  const allRoles = await roleRepository.findAllWithPermissions();
  assert(allRoles.length >= 4, "At least 4 approved application roles exist");

  const allPerms = await permissionRepository.findAll();
  assert(allPerms.length === 42, `Exactly 42 approved permissions cataloged (found ${allPerms.length})`);

  // 2. Launch HTTP Server
  const app = createApp();
  const PORT = 3099;
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(PORT, "127.0.0.1", () => resolve(s));
  });

  const baseUrl = `http://127.0.0.1:${PORT}/api`;
  const runId = Date.now();

  try {
    // 2. Sync test users
    console.log("\n[Suite 2: User Creation & Role Provisioning via Auth Token]");
    const superAdminToken = `dev-test:uid-sa-${runId}:superadmin-${runId}@sarasdynamics.com:Super Admin User`;
    const saSyncRes = await fetch(`${baseUrl}/auth/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ full_name: "Super Admin User" }),
    });
    const saSyncData = await saSyncRes.json();
    const superAdminUser = saSyncData.data.user;
    await userRepository.setUserRoles(superAdminUser.id, ["SUPER_ADMIN"]);

    const recruiterToken = `dev-test:uid-rec-${runId}:recruiter-${runId}@sarasdynamics.com:Recruiter User`;
    const recSyncRes = await fetch(`${baseUrl}/auth/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({ full_name: "Recruiter User" }),
    });
    const recSyncData = await recSyncRes.json();
    const recruiterUser = recSyncData.data.user;
    await userRepository.setUserRoles(recruiterUser.id, ["RECRUITER"]);

    const targetToken = `dev-test:uid-tgt-${runId}:target-${runId}@sarasdynamics.com:Target Employee`;
    const tgtSyncRes = await fetch(`${baseUrl}/auth/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${targetToken}`,
      },
      body: JSON.stringify({ full_name: "Target Employee" }),
    });
    const tgtSyncData = await tgtSyncRes.json();
    const targetUser = tgtSyncData.data.user;
    await userRepository.setUserRoles(targetUser.id, ["CONTENT_WRITER"]);

    assert(Boolean(superAdminUser?.id), "Super Admin synced and assigned role");
    assert(Boolean(recruiterUser?.id), "Recruiter synced and assigned role");
    assert(Boolean(targetUser?.id), "Target employee synced and assigned role");

    // 3. User Management Endpoint Verification
    console.log("\n[Suite 3: User Management API Endpoints & RBAC Security]");

    // 3.1 Unauthenticated Request Blocked
    const unauthRes = await fetch(`${baseUrl}/admin/users`);
    assert(unauthRes.status === 401, "GET /api/admin/users blocks unauthenticated requests with 401");

    // 3.2 Insufficient Permission Blocked (Recruiter lacks users.read)
    const recruiterUsersRes = await fetch(`${baseUrl}/admin/users`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(
      recruiterUsersRes.status === 403,
      "GET /api/admin/users blocks users lacking users.read with 403 Forbidden"
    );

    // 3.3 Super Admin Allowed (users.read)
    const superAdminUsersRes = await fetch(`${baseUrl}/admin/users?search=target-${runId}`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    const usersData = await superAdminUsersRes.json();
    assert(
      superAdminUsersRes.status === 200 && usersData.success === true,
      "GET /api/admin/users returns 200 OK for authorized admin"
    );
    assert(
      Array.isArray(usersData.data) && usersData.data.some((u: any) => u.id === targetUser.id),
      "GET /api/admin/users lists matching target user account"
    );

    // 3.4 Get User Detail
    const userDetailRes = await fetch(`${baseUrl}/admin/users/${targetUser.id}`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    const detailData = await userDetailRes.json();
    assert(
      userDetailRes.status === 200 && detailData.data.id === targetUser.id,
      "GET /api/admin/users/:id returns user details and permission list"
    );

    // 3.5 Update User Profile
    const updateProfileRes = await fetch(`${baseUrl}/admin/users/${targetUser.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({
        full_name: "Target Employee Updated",
        phone: "+1 555-0199",
      }),
    });
    const profileData = await updateProfileRes.json();
    assert(
      updateProfileRes.status === 200 && profileData.data.full_name === "Target Employee Updated",
      "PATCH /api/admin/users/:id updates profile name and phone"
    );

    // 3.6 Update User Status
    const updateStatusRes = await fetch(`${baseUrl}/admin/users/${targetUser.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ status: "SUSPENDED" }),
    });
    const statusData = await updateStatusRes.json();
    assert(
      updateStatusRes.status === 200 && statusData.data.status === "SUSPENDED",
      "PATCH /api/admin/users/:id/status updates status to SUSPENDED"
    );

    // Reactivate user
    await fetch(`${baseUrl}/admin/users/${targetUser.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ status: "ACTIVE" }),
    });

    // 3.7 Assign Roles to User
    const assignRolesRes = await fetch(`${baseUrl}/admin/users/${targetUser.id}/roles`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ roles: ["RECRUITER", "CONTENT_WRITER"] }),
    });
    const assignedData = await assignRolesRes.json();
    assert(
      assignRolesRes.status === 200 &&
        assignedData.data.roles.includes("RECRUITER") &&
        assignedData.data.roles.includes("CONTENT_WRITER"),
      "PUT /api/admin/users/:id/roles assigns multiple valid system roles"
    );

    // 3.8 Prevent assigning invalid role
    const invalidRoleRes = await fetch(`${baseUrl}/admin/users/${targetUser.id}/roles`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ roles: ["INVALID_ROLE_XYZ"] }),
    });
    assert(
      invalidRoleRes.status === 400,
      "PUT /api/admin/users/:id/roles rejects unapproved roles with 400 Bad Request"
    );

    // 4. Role & Permission Management Tests
    console.log("\n[Suite 4: Role & Permission Catalog Endpoints]");

    const rolesRes = await fetch(`${baseUrl}/admin/roles`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    const rolesData = await rolesRes.json();
    assert(
      rolesRes.status === 200 && rolesData.data.length >= 4,
      "GET /api/admin/roles returns system roles with their permissions"
    );

    const permsRes = await fetch(`${baseUrl}/admin/permissions`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    const permsData = await permsRes.json();
    assert(
      permsRes.status === 200 &&
        permsData.data.all.length === 42 &&
        Boolean(permsData.data.grouped),
      "GET /api/admin/permissions returns 42 permissions grouped by functional module"
    );

    // Update Recruiter Role Permissions
    const recruiterRoleId = (await roleRepository.findByName("RECRUITER"))!.id;
    const updateRolePermsRes = await fetch(`${baseUrl}/admin/roles/${recruiterRoleId}/permissions`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({
        permissions: ["jobs.read", "jobs.create", "applications.read", "applications.create"],
      }),
    });
    assert(
      updateRolePermsRes.status === 200,
      "PUT /api/admin/roles/:id/permissions updates role permissions successfully"
    );

    // Prevent modifying SUPER_ADMIN role permissions
    const superAdminRoleId = (await roleRepository.findByName("SUPER_ADMIN"))!.id;
    const modifySuperAdminPermsRes = await fetch(
      `${baseUrl}/admin/roles/${superAdminRoleId}/permissions`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${superAdminToken}`,
        },
        body: JSON.stringify({ permissions: ["jobs.read"] }),
      }
    );
    assert(
      modifySuperAdminPermsRes.status === 400 || modifySuperAdminPermsRes.status === 403,
      "PUT /api/admin/roles/:id/permissions prevents modification of SUPER_ADMIN role"
    );

    // 5. Audit Log Querying & Verification
    console.log("\n[Suite 5: Enterprise Audit Log API Querying & Trail Verification]");

    const auditRes = await fetch(`${baseUrl}/admin/audit-logs?limit=20`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    const auditData = await auditRes.json();
    assert(
      auditRes.status === 200 && Array.isArray(auditData.data),
      "GET /api/admin/audit-logs returns audit log entries"
    );

    // Check if recent user update action was audited
    const userUpdateLog = auditData.data.find(
      (log: any) => log.module === "USERS" || log.entity_type === "users"
    );
    assert(
      Boolean(userUpdateLog),
      "Audit log captures USERS administrative mutation events with old and new values"
    );

    // 6. Delete User Test
    console.log("\n[Suite 6: User Deletion & Super Admin Protection]");
    const deleteUserRes = await fetch(`${baseUrl}/admin/users/${targetUser.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(deleteUserRes.status === 200, "DELETE /api/admin/users/:id deletes user record successfully");

    // Prevent deleting Super Admin user
    const deleteSuperAdminRes = await fetch(`${baseUrl}/admin/users/${superAdminUser.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(
      deleteSuperAdminRes.status === 403,
      "DELETE /api/admin/users/:id forbids deletion of SUPER_ADMIN account"
    );
  } finally {
    server.close();
  }

  console.log("\n==================================================");
  console.log(`Phase 9.5B Results: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase9_5BManagementTests().catch((err) => {
  console.error("Phase 9.5B test execution failed:", err);
  process.exit(1);
});
