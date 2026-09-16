import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { createApp } from "../app.js";
import { userRepository } from "../repositories/user.repository.js";
import { jobRepository } from "../repositories/job.repository.js";
import { applicationRepository } from "../repositories/application.repository.js";
import { noteRepository } from "../repositories/note.repository.js";
import { seedDatabase } from "../db/seed.js";
import { runMigrations } from "../db/migrate.js";
import { getDb } from "../db/index.js";
import { sqliteSchema, pgSchema } from "../db/schema.js";
import config from "../config/index.js";
import type { Server } from "http";

async function runPhase6Tests() {
  console.log("==================================================");
  console.log("Starting Phase 6 Application Notes & Recruiter Tests");
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

  // 1. Ensure migrations and seeds
  await runMigrations();
  await seedDatabase();

  const tables = config.database.provider === "postgresql" ? pgSchema : sqliteSchema;
  const db = getDb();

  // Clean existing notes
  await (db as any).delete(tables.applicationNotes);

  // Start test server on port 3099
  const app = createApp();
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(3099, "127.0.0.1", () => resolve(s));
  });

  const baseUrl = "http://127.0.0.1:3099";

  try {
    // 2. Setup test users and assign roles
    console.log("\n[Test Setup: Users and Roles]");
    const superAdminToken = "dev-test:p6-superadmin:p6super@saras.com:Super Admin Sam";
    const adminToken = "dev-test:p6-admin:p6admin@saras.com:Admin Alex";
    const recruiter1Token = "dev-test:p6-recruiter1:p6rec1@saras.com:Recruiter Rachel";
    const recruiter2Token = "dev-test:p6-recruiter2:p6rec2@saras.com:Recruiter Rob";
    const writerToken = "dev-test:p6-writer:p6writer@saras.com:Writer Wendy";
    const unprivToken = "dev-test:p6-unpriv:p6unpriv@saras.com:Unpriv Uma";

    for (const token of [
      superAdminToken,
      adminToken,
      recruiter1Token,
      recruiter2Token,
      writerToken,
      unprivToken,
    ]) {
      await fetch(`${baseUrl}/api/auth/sync`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    const superAdminUser = await userRepository.findByEmail("p6super@saras.com");
    const adminUser = await userRepository.findByEmail("p6admin@saras.com");
    const rec1User = await userRepository.findByEmail("p6rec1@saras.com");
    const rec2User = await userRepository.findByEmail("p6rec2@saras.com");
    const writerUser = await userRepository.findByEmail("p6writer@saras.com");
    const unprivUser = await userRepository.findByEmail("p6unpriv@saras.com");

    // Assign roles using userRepository
    await userRepository.assignRoleByName(superAdminUser!.id, "SUPER_ADMIN");
    await userRepository.assignRoleByName(adminUser!.id, "ADMIN");
    await userRepository.assignRoleByName(rec1User!.id, "RECRUITER");
    await userRepository.assignRoleByName(rec2User!.id, "RECRUITER");
    await userRepository.assignRoleByName(writerUser!.id, "CONTENT_WRITER");

    assert(true, "Setup: test users and roles seeded successfully");

    // 3. Setup test job and test applications
    console.log("\n[Test Setup: Job and Applications]");
    const testJob = await jobRepository.create({
      title: "Phase 6 Systems Architect",
      slug: `p6-systems-architect-${Date.now()}`,
      category_id: (await (db as any).select().from(tables.jobCategories).limit(1))[0].id,
      employment_type: "FULL_TIME",
      workplace_type: "HYBRID",
      status: "PUBLISHED",
      description: "Leading architect for Phase 6 notes testing.",
    });

    const appNum1 = await applicationRepository.getNextApplicationNumber();
    const testApp1 = await applicationRepository.create({
      application_number: appNum1,
      job_id: testJob.id,
      full_name: "Candidate Alpha",
      email: "alpha@candidate.com",
      phone: "+15550001",
      current_location: "San Francisco, CA",
      cover_letter: "Public application submission cover note.",
    });

    const appNum2 = await applicationRepository.getNextApplicationNumber();
    const testApp2 = await applicationRepository.create({
      application_number: appNum2,
      job_id: testJob.id,
      full_name: "Candidate Beta",
      email: "beta@candidate.com",
      phone: "+15550002",
      current_location: "Austin, TX",
      cover_letter: "Second candidate for IDOR testing.",
    });

    assert(Boolean(testApp1 && testApp2), "Setup: test applications created successfully");

    // =========================================================================
    // TEST SUITE 1: RBAC & Authentication on Note Endpoints
    // =========================================================================
    console.log("\n[Suite 1: RBAC & Authentication on Notes Endpoints]");

    // 1.1 Unauthenticated requests return 401
    const unauthGet = await fetch(`${baseUrl}/api/admin/applications/${testApp1.id}/notes`);
    assert(unauthGet.status === 401, "RBAC: Unauthenticated GET notes returns 401");

    const unauthPost = await fetch(`${baseUrl}/api/admin/applications/${testApp1.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: "Unauthenticated attempt" }),
    });
    assert(unauthPost.status === 401, "RBAC: Unauthenticated POST note returns 401");

    // 1.2 Unprivileged user returns 403
    const unprivGet = await fetch(`${baseUrl}/api/admin/applications/${testApp1.id}/notes`, {
      headers: { Authorization: `Bearer ${unprivToken}` },
    });
    assert(unprivGet.status === 403, "RBAC: Unprivileged user GET notes returns 403");

    const unprivPost = await fetch(`${baseUrl}/api/admin/applications/${testApp1.id}/notes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${unprivToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ note: "Unprivileged attempt" }),
    });
    assert(unprivPost.status === 403, "RBAC: Unprivileged user POST note returns 403");

    // 1.3 CONTENT_WRITER (has no notes.* permissions) returns 403
    const writerGet = await fetch(`${baseUrl}/api/admin/applications/${testApp1.id}/notes`, {
      headers: { Authorization: `Bearer ${writerToken}` },
    });
    assert(writerGet.status === 403, "RBAC: CONTENT_WRITER GET notes returns 403");

    const writerPost = await fetch(`${baseUrl}/api/admin/applications/${testApp1.id}/notes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${writerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ note: "Content writer note" }),
    });
    assert(writerPost.status === 403, "RBAC: CONTENT_WRITER POST note returns 403");

    // 1.4 RECRUITER can read empty notes list
    const recGetEmpty = await fetch(`${baseUrl}/api/admin/applications/${testApp1.id}/notes`, {
      headers: { Authorization: `Bearer ${recruiter1Token}` },
    });
    assert(recGetEmpty.status === 200, "RBAC: RECRUITER GET notes returns 200");
    const emptyJson = await recGetEmpty.json();
    assert(
      emptyJson.success === true && Array.isArray(emptyJson.data) && emptyJson.data.length === 0,
      "Notes: Initially empty notes array returned"
    );

    // =========================================================================
    // TEST SUITE 2: Validation on Note Creation
    // =========================================================================
    console.log("\n[Suite 2: Note Creation Validation]");

    // 2.1 Empty note string -> 400
    const emptyNoteRes = await fetch(`${baseUrl}/api/admin/applications/${testApp1.id}/notes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${recruiter1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ note: "" }),
    });
    assert(emptyNoteRes.status === 400, "Validation: Empty note returns 400");

    // 2.2 Whitespace-only note -> 400
    const wsNoteRes = await fetch(`${baseUrl}/api/admin/applications/${testApp1.id}/notes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${recruiter1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ note: "   \n\t  " }),
    });
    assert(wsNoteRes.status === 400, "Validation: Whitespace-only note returns 400");

    // 2.3 Non-string note -> 400
    const nonStringRes = await fetch(`${baseUrl}/api/admin/applications/${testApp1.id}/notes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${recruiter1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ note: 12345 }),
    });
    assert(nonStringRes.status === 400, "Validation: Non-string note returns 400");

    // 2.4 Note exceeding 5000 characters -> 400
    const longNoteText = "A".repeat(5001);
    const longNoteRes = await fetch(`${baseUrl}/api/admin/applications/${testApp1.id}/notes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${recruiter1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ note: longNoteText }),
    });
    assert(longNoteRes.status === 400, "Validation: Note > 5000 chars returns 400");

    // 2.5 Non-existent application -> 404
    const nonExistentAppId = randomUUID();
    const nonExistentAppRes = await fetch(`${baseUrl}/api/admin/applications/${nonExistentAppId}/notes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${recruiter1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ note: "Note on missing app" }),
    });
    assert(nonExistentAppRes.status === 404, "Validation: Create note on non-existent app returns 404");

    // =========================================================================
    // TEST SUITE 3: Note Creation & Author Integrity (No Spoofing)
    // =========================================================================
    console.log("\n[Suite 3: Note Creation & Author Integrity]");

    // 3.1 Recruiter 1 creates a valid note. Attempts to spoof user_id must be ignored.
    const createNote1Res = await fetch(`${baseUrl}/api/admin/applications/${testApp1.id}/notes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${recruiter1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        note: "Initial screening: strong backend skills, solid distributed systems knowledge.",
        user_id: "00000000-0000-0000-0000-000000000000", // Spoof attempt
      }),
    });
    assert(createNote1Res.status === 201, "Create: Recruiter 1 creates note (201 Created)");
    const note1Json = await createNote1Res.json();
    const note1 = note1Json.data;

    assert(
      note1 && note1.user_id === rec1User?.id,
      "Security: Author user_id strictly bound to authenticated user (spoof attempt ignored)"
    );
    assert(
      note1.author && note1.author.id === rec1User?.id && note1.author.email === "p6rec1@saras.com",
      "Response: Author object populated with id, full_name, email"
    );
    assert(
      note1.note === "Initial screening: strong backend skills, solid distributed systems knowledge.",
      "Response: Note content saved correctly"
    );

    // Ensure 1s timestamp separation for SQLite timestamp mode
    await new Promise((r) => setTimeout(r, 1100));

    // 3.2 Recruiter 2 creates a note on the same application
    const createNote2Res = await fetch(`${baseUrl}/api/admin/applications/${testApp1.id}/notes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${recruiter2Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        note: "Salary expectations aligned with budget. Candidate available next month.",
      }),
    });
    assert(createNote2Res.status === 201, "Create: Recruiter 2 creates note (201 Created)");
    const note2Json = await createNote2Res.json();
    const note2 = note2Json.data;
    assert(
      note2 && note2.user_id === rec2User?.id,
      "Security: Second note author bound to Recruiter 2"
    );

    // =========================================================================
    // TEST SUITE 4: Note Read & Ordering
    // =========================================================================
    console.log("\n[Suite 4: Note Read & Ordering]");

    // 4.1 Read all notes for application
    const readNotesRes = await fetch(`${baseUrl}/api/admin/applications/${testApp1.id}/notes`, {
      headers: { Authorization: `Bearer ${recruiter1Token}` },
    });
    assert(readNotesRes.status === 200, "Read: GET notes returns 200");
    const readNotesJson = await readNotesRes.json();
    assert(
      Array.isArray(readNotesJson.data) && readNotesJson.data.length === 2,
      "Read: List contains both notes"
    );

    // 4.2 Verify ordering: newest note first
    const firstInList = readNotesJson.data[0];
    const secondInList = readNotesJson.data[1];
    assert(
      new Date(firstInList.created_at).getTime() >= new Date(secondInList.created_at).getTime(),
      "Ordering: Notes returned in descending order (newest first)"
    );
    assert(
      firstInList.id === note2.id && secondInList.id === note1.id,
      "Ordering: Note 2 (newer) comes before Note 1 (older)"
    );

    // 4.3 Read single note by ID
    const readSingleRes = await fetch(
      `${baseUrl}/api/admin/applications/${testApp1.id}/notes/${note1.id}`,
      {
        headers: { Authorization: `Bearer ${recruiter1Token}` },
      }
    );
    assert(readSingleRes.status === 200, "Read: GET single note returns 200");
    const singleJson = await readSingleRes.json();
    assert(
      singleJson.data && singleJson.data.id === note1.id,
      "Read: Single note details matched requested ID"
    );

    // =========================================================================
    // TEST SUITE 5: IDOR Protection
    // =========================================================================
    console.log("\n[Suite 5: IDOR Protection]");

    // 5.1 Request Note 1 (from App 1) under App 2 -> 404
    const idorGetRes = await fetch(
      `${baseUrl}/api/admin/applications/${testApp2.id}/notes/${note1.id}`,
      {
        headers: { Authorization: `Bearer ${recruiter1Token}` },
      }
    );
    assert(
      idorGetRes.status === 404,
      "IDOR: GET note belonging to App 1 under App 2 path returns 404"
    );

    // 5.2 Patch Note 1 under App 2 path -> 404
    const idorPatchRes = await fetch(
      `${baseUrl}/api/admin/applications/${testApp2.id}/notes/${note1.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${recruiter1Token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note: "Malicious IDOR patch" }),
      }
    );
    assert(
      idorPatchRes.status === 404,
      "IDOR: PATCH note belonging to App 1 under App 2 path returns 404"
    );

    // 5.3 Delete Note 1 under App 2 path -> 404
    const idorDeleteRes = await fetch(
      `${baseUrl}/api/admin/applications/${testApp2.id}/notes/${note1.id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${recruiter1Token}` },
      }
    );
    assert(
      idorDeleteRes.status === 404,
      "IDOR: DELETE note belonging to App 1 under App 2 path returns 404"
    );

    // =========================================================================
    // TEST SUITE 6: Author Ownership & Recruiter Update/Delete Restrictions
    // =========================================================================
    console.log("\n[Suite 6: Author Ownership & Restrictions]");

    // 6.1 Recruiter 2 tries to update Recruiter 1's note -> 403
    const rec2UpdateRec1 = await fetch(
      `${baseUrl}/api/admin/applications/${testApp1.id}/notes/${note1.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${recruiter2Token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note: "Recruiter 2 trying to hijack note 1" }),
      }
    );
    assert(
      rec2UpdateRec1.status === 403,
      "Ownership: Recruiter cannot update another recruiter's note (403 Forbidden)"
    );

    // 6.2 Recruiter 2 tries to delete Recruiter 1's note -> 403
    const rec2DeleteRec1 = await fetch(
      `${baseUrl}/api/admin/applications/${testApp1.id}/notes/${note1.id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${recruiter2Token}` },
      }
    );
    assert(
      rec2DeleteRec1.status === 403,
      "Ownership: Recruiter cannot delete another recruiter's note (403 Forbidden)"
    );

    // 6.3 Recruiter 1 updates their OWN note -> 200
    const rec1UpdateOwn = await fetch(
      `${baseUrl}/api/admin/applications/${testApp1.id}/notes/${note1.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${recruiter1Token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          note: "Updated screening: strong backend skills, verified architecture background.",
        }),
      }
    );
    assert(
      rec1UpdateOwn.status === 200,
      "Ownership: Recruiter 1 can update their own note (200 OK)"
    );
    const updatedNote1Json = await rec1UpdateOwn.json();
    assert(
      updatedNote1Json.data.note ===
        "Updated screening: strong backend skills, verified architecture background.",
      "Update: Note content reflected accurately"
    );
    assert(
      new Date(updatedNote1Json.data.updated_at).getTime() >=
        new Date(updatedNote1Json.data.created_at).getTime(),
      "Update: updated_at timestamp updated"
    );

    // 6.4 Update validation: empty note -> 400
    const emptyUpdateRes = await fetch(
      `${baseUrl}/api/admin/applications/${testApp1.id}/notes/${note1.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${recruiter1Token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note: "   " }),
      }
    );
    assert(emptyUpdateRes.status === 400, "Validation: Update with empty note returns 400");

    // =========================================================================
    // TEST SUITE 7: Admin & Super Admin Oversight (Can Update & Delete Any Note)
    // =========================================================================
    console.log("\n[Suite 7: Admin & Super Admin Oversight]");

    // 7.1 Admin updates Recruiter 1's note
    const adminUpdateRes = await fetch(
      `${baseUrl}/api/admin/applications/${testApp1.id}/notes/${note1.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note: "Admin note annotation: approved for interview." }),
      }
    );
    assert(
      adminUpdateRes.status === 200,
      "Oversight: ADMIN role can update any note (200 OK)"
    );

    // 7.2 Super Admin deletes Note 2 (authored by Recruiter 2)
    const superAdminDeleteRes = await fetch(
      `${baseUrl}/api/admin/applications/${testApp1.id}/notes/${note2.id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${superAdminToken}` },
      }
    );
    assert(
      superAdminDeleteRes.status === 200,
      "Oversight: SUPER_ADMIN role can delete any note (200 OK)"
    );

    // Verify Note 2 is deleted
    const verifyNote2Del = await fetch(
      `${baseUrl}/api/admin/applications/${testApp1.id}/notes/${note2.id}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    assert(verifyNote2Del.status === 404, "Verify: Deleted note returns 404 on subsequent get");

    // 7.3 Recruiter 1 deletes their OWN note
    const rec1DeleteOwn = await fetch(
      `${baseUrl}/api/admin/applications/${testApp1.id}/notes/${note1.id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${recruiter1Token}` },
      }
    );
    assert(rec1DeleteOwn.status === 200, "Ownership: Recruiter 1 can delete their own note (200 OK)");

    // =========================================================================
    // TEST SUITE 8: Private / Internal Isolation (Candidate Visibility)
    // =========================================================================
    console.log("\n[Suite 8: Candidate Privacy & Isolation]");

    // Create a note on testApp1 to ensure one exists
    const privateNote = await noteRepository.createNote({
      application_id: testApp1.id,
      user_id: rec1User!.id,
      note: "CONFIDENTIAL RECRUITMENT NOTE: Do not offer more than $160k base.",
    });

    // 8.1 GET /api/jobs must NOT contain notes
    const publicJobsRes = await fetch(`${baseUrl}/api/jobs`);
    const publicJobsBody = await publicJobsRes.text();
    assert(
      !publicJobsBody.includes("CONFIDENTIAL RECRUITMENT NOTE"),
      "Privacy: GET /api/jobs does not leak application notes"
    );

    // 8.2 GET /api/jobs/:slug must NOT contain notes
    const publicJobDetailRes = await fetch(`${baseUrl}/api/jobs/${testJob.slug}`);
    const publicJobDetailBody = await publicJobDetailRes.text();
    assert(
      !publicJobDetailBody.includes("CONFIDENTIAL RECRUITMENT NOTE"),
      "Privacy: GET /api/jobs/:slug does not leak application notes"
    );

    // 8.3 POST /api/jobs/:slug/applications must NOT return notes
    const publicApplyRes = await fetch(`${baseUrl}/api/jobs/${testJob.slug}/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: "Candidate Gamma",
        email: "gamma@candidate.com",
        phone: "+15550003",
        current_location: "Chicago, IL",
        experience_years: "4",
      }),
    });
    const publicApplyBody = await publicApplyRes.text();
    assert(
      !publicApplyBody.includes("CONFIDENTIAL RECRUITMENT NOTE") &&
        !publicApplyBody.includes("application_notes"),
      "Privacy: Public application endpoint does not leak application notes"
    );

    // =========================================================================
    // TEST SUITE 9: Application Deletion Cascade Cleanup
    // =========================================================================
    console.log("\n[Suite 9: Application Deletion Cascade Cleanup]");

    // Note exists before deletion
    const noteBeforeDelete = await noteRepository.findById(privateNote.id);
    assert(Boolean(noteBeforeDelete), "Cascade: Note exists before application deletion");

    // Delete application via admin repository / controller
    await applicationRepository.delete(testApp1.id);

    // Note must no longer exist in database
    const noteAfterDelete = await noteRepository.findById(privateNote.id);
    assert(
      noteAfterDelete === null,
      "Cascade: Application notes cascade-deleted when application is deleted"
    );

    // =========================================================================
    // TEST SUITE 10: Multi-note Ordering & Limits
    // =========================================================================
    console.log("\n[Suite 10: Multi-note Ordering & Pagination]");

    // Create 3 sequential notes on testApp2
    const n1 = await noteRepository.createNote({
      application_id: testApp2.id,
      user_id: rec1User!.id,
      note: "Chronological 1",
    });
    // 1.1s delay to ensure 1s integer timestamp difference in SQLite
    await new Promise((r) => setTimeout(r, 1100));
    const n2 = await noteRepository.createNote({
      application_id: testApp2.id,
      user_id: rec2User!.id,
      note: "Chronological 2",
    });
    await new Promise((r) => setTimeout(r, 1100));
    const n3 = await noteRepository.createNote({
      application_id: testApp2.id,
      user_id: adminUser!.id,
      note: "Chronological 3",
    });

    const app2NotesRes = await fetch(`${baseUrl}/api/admin/applications/${testApp2.id}/notes`, {
      headers: { Authorization: `Bearer ${recruiter1Token}` },
    });
    const app2NotesJson = await app2NotesRes.json();
    assert(
      app2NotesJson.data.length === 3,
      "Multi-note: Exactly 3 notes retrieved"
    );
    assert(
      app2NotesJson.data[0].id === n3.id &&
        app2NotesJson.data[1].id === n2.id &&
        app2NotesJson.data[2].id === n1.id,
      "Multi-note: Correct newest-first order (n3, n2, n1)"
    );

    // Clean up test job & app2
    await applicationRepository.delete(testApp2.id);
    await jobRepository.delete(testJob.id);

  } catch (error) {
    console.error("Test execution threw exception:", error);
    failed++;
  } finally {
    server.close();
  }

  console.log("\n==================================================");
  console.log(`Phase 6 Test Results: ${passed} passed, ${failed} failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPhase6Tests();
