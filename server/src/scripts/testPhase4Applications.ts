import { createApp } from "../app.js";
import { userRepository } from "../repositories/user.repository.js";
import { jobRepository } from "../repositories/job.repository.js";
import { applicationRepository } from "../repositories/application.repository.js";
import { applicationService } from "../services/application.service.js";
import { seedDatabase } from "../db/seed.js";
import { runMigrations } from "../db/migrate.js";
import { getDb } from "../db/index.js";
import { sqliteSchema, pgSchema } from "../db/schema.js";
import config from "../config/index.js";
import type { Server } from "http";

async function runPhase4Tests() {
  console.log("==================================================");
  console.log("Starting Phase 4 Applications & Submissions Tests");
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

  // Clean existing applications to guarantee deterministic tests
  const tables = config.database.provider === "postgresql" ? pgSchema : sqliteSchema;
  const db = getDb();
  await (db as any).delete(tables.applicationDocuments);
  await (db as any).delete(tables.applications);

  // Start test server on port 3099
  const app = createApp();
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(3099, "127.0.0.1", () => resolve(s));
  });

  const baseUrl = "http://127.0.0.1:3099";

  try {
    // 2. Setup test users and assign roles
    console.log("\n[Test Setup: Users and Roles]");
    const recruiterToken = "dev-test:p4-recruiter:p4recruiter@saras.com:Recruiter Riley";
    const adminToken = "dev-test:p4-admin:p4admin@saras.com:Admin Alex";
    const writerToken = "dev-test:p4-writer:p4writer@saras.com:Writer Will";
    const unprivToken = "dev-test:p4-unpriv:p4unpriv@saras.com:Unpriv Uma";
    const candidateToken = "dev-test:p4-candidate:candidate.clara@saras.com:Candidate Clara";

    for (const token of [recruiterToken, adminToken, writerToken, unprivToken, candidateToken]) {
      await fetch(`${baseUrl}/api/auth/sync`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    const candidateHeaders = { Authorization: `Bearer ${candidateToken}` };

    const recruiterUser = await userRepository.findByEmail("p4recruiter@saras.com");
    const adminUser = await userRepository.findByEmail("p4admin@saras.com");
    const writerUser = await userRepository.findByEmail("p4writer@saras.com");
    const unprivUser = await userRepository.findByEmail("p4unpriv@saras.com");
    const candidateUser = await userRepository.findByEmail("candidate.clara@saras.com");

    if (recruiterUser) await userRepository.assignRoleByName(recruiterUser.id, "RECRUITER");
    if (adminUser) await userRepository.assignRoleByName(adminUser.id, "ADMIN");
    if (writerUser) await userRepository.assignRoleByName(writerUser.id, "CONTENT_WRITER");

    assert(
      Boolean(recruiterUser && adminUser && writerUser && unprivUser && candidateUser),
      "Test users synced and configured with RECRUITER, ADMIN, CONTENT_WRITER, and CANDIDATE users"
    );

    // Get a published job
    const publishedJobs = await jobRepository.findJobs({ onlyActivePublished: true, limit: 1 });
    const targetJob = publishedJobs.jobs[0];
    assert(Boolean(targetJob && targetJob.slug), `Found published test job: ${targetJob?.slug}`);

    // Create non-published jobs for state validation: DRAFT, CLOSED, ARCHIVED, EXPIRED
    console.log("\n[Test Setup: Creating jobs in various statuses]");
    const draftJob = await jobRepository.create({
      title: "Draft Test Role",
      slug: "draft-test-role-" + Date.now(),
      status: "DRAFT",
      workplace_type: "REMOTE",
      employment_type: "FULL_TIME",
    });

    const closedJob = await jobRepository.create({
      title: "Closed Test Role",
      slug: "closed-test-role-" + Date.now(),
      status: "CLOSED",
      workplace_type: "REMOTE",
      employment_type: "FULL_TIME",
    });

    const archivedJob = await jobRepository.create({
      title: "Archived Test Role",
      slug: "archived-test-role-" + Date.now(),
      status: "ARCHIVED",
      workplace_type: "REMOTE",
      employment_type: "FULL_TIME",
    });

    const expiredJob = await jobRepository.create({
      title: "Expired Test Role",
      slug: "expired-test-role-" + Date.now(),
      status: "PUBLISHED",
      workplace_type: "REMOTE",
      employment_type: "FULL_TIME",
      application_deadline: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
    });

    // Helper to create multipart form data
    function createCandidateForm(overrides: {
      fullName?: any;
      email?: any;
      phone?: any;
      currentLocation?: any;
      coverLetter?: any;
      fileBuffer?: Buffer;
      fileName?: string;
      mimeType?: string;
      omitFile?: boolean;
    } = {}) {
      const form = new FormData();
      if (overrides.fullName !== undefined) {
        if (overrides.fullName !== null) form.append("full_name", overrides.fullName);
      } else {
        form.append("full_name", "Jane Candidate");
      }

      if (overrides.email !== undefined) {
        if (overrides.email !== null) form.append("email", overrides.email);
      } else {
        form.append("email", "jane.candidate@example.com");
      }

      if (overrides.phone !== undefined) {
        if (overrides.phone !== null) form.append("phone", overrides.phone);
      } else {
        form.append("phone", "+1 555-019-2834");
      }

      if (overrides.currentLocation) {
        form.append("current_location", overrides.currentLocation);
      }

      if (overrides.coverLetter) {
        form.append("cover_letter", overrides.coverLetter);
      }

      if (!overrides.omitFile) {
        const fileContent =
          overrides.fileBuffer ||
          Buffer.from("%PDF-1.4\n%Mock valid PDF resume for automated tests\n%%EOF");
        const fileName = overrides.fileName || "Jane_Candidate_Resume.pdf";
        const mimeType = overrides.mimeType || "application/pdf";
        const fileBlob = new Blob([fileContent], { type: mimeType });
        form.append("resume", fileBlob, fileName);
      }

      return form;
    }

    // ----------------------------------------------------
    // Test Suite 0: Application Submission Authentication Guard
    // ----------------------------------------------------
    console.log("\n[Test Suite 0: Application Submission Authentication Guard]");
    const unauthApplyRes = await fetch(`${baseUrl}/api/jobs/${targetJob.slug}/applications`, {
      method: "POST",
      body: createCandidateForm(),
    });
    assert(unauthApplyRes.status === 401, "Anonymous application submission rejected with 401 Unauthorized");

    // ----------------------------------------------------
    // Test Suite 1: Job Status & Eligibility Validation
    // ----------------------------------------------------
    console.log("\n[Test Suite 1: Job Status & Eligibility Validation]");

    // 1. Application to DRAFT job rejected
    const draftRes = await fetch(`${baseUrl}/api/jobs/${draftJob.slug}/applications`, {
      method: "POST",
      headers: candidateHeaders,
      body: createCandidateForm(),
    });
    const draftJson = await draftRes.json();
    assert(draftRes.status === 400, "Application to DRAFT job rejected with 400");
    assert(
      draftJson.message?.includes("DRAFT") || draftJson.message?.includes("not currently accepted"),
      "DRAFT rejection returns explanatory message"
    );

    // 2. Application to CLOSED job rejected
    const closedRes = await fetch(`${baseUrl}/api/jobs/${closedJob.slug}/applications`, {
      method: "POST",
      headers: candidateHeaders,
      body: createCandidateForm(),
    });
    assert(closedRes.status === 400, "Application to CLOSED job rejected with 400");

    // 3. Application to ARCHIVED job rejected
    const archivedRes = await fetch(`${baseUrl}/api/jobs/${archivedJob.slug}/applications`, {
      method: "POST",
      headers: candidateHeaders,
      body: createCandidateForm(),
    });
    assert(archivedRes.status === 400, "Application to ARCHIVED job rejected with 400");

    // 4. Application past deadline rejected
    const expiredRes = await fetch(`${baseUrl}/api/jobs/${expiredJob.slug}/applications`, {
      method: "POST",
      headers: candidateHeaders,
      body: createCandidateForm(),
    });
    const expiredJson = await expiredRes.json();
    assert(expiredRes.status === 400, "Application past deadline rejected with 400");
    assert(expiredJson.message?.includes("deadline"), "Expired deadline error mentions deadline");

    // 5. Non-existent job slug returns 404
    const notFoundRes = await fetch(`${baseUrl}/api/jobs/non-existent-job-slug-9999/applications`, {
      method: "POST",
      headers: candidateHeaders,
      body: createCandidateForm(),
    });
    assert(notFoundRes.status === 404, "Application to non-existent job returns 404");

    // ----------------------------------------------------
    // Test Suite 2: Field Validations
    // ----------------------------------------------------
    console.log("\n[Test Suite 2: Candidate Fields Validation]");

    // 6. Missing full_name rejected
    const noNameRes = await fetch(`${baseUrl}/api/jobs/${targetJob.slug}/applications`, {
      method: "POST",
      headers: candidateHeaders,
      body: createCandidateForm({ fullName: "" }),
    });
    assert(noNameRes.status === 400, "Missing full_name rejected with 400");

    // 7. Whitespace-only full_name rejected
    const wsNameRes = await fetch(`${baseUrl}/api/jobs/${targetJob.slug}/applications`, {
      method: "POST",
      headers: candidateHeaders,
      body: createCandidateForm({ fullName: "   " }),
    });
    assert(wsNameRes.status === 400, "Whitespace-only full_name rejected with 400");

    // 8. Too short full_name (<2 chars) rejected
    const shortNameRes = await fetch(`${baseUrl}/api/jobs/${targetJob.slug}/applications`, {
      method: "POST",
      headers: candidateHeaders,
      body: createCandidateForm({ fullName: "J" }),
    });
    assert(shortNameRes.status === 400, "Too short full_name (<2 chars) rejected with 400");

    // 9. Missing email rejected
    const noEmailRes = await fetch(`${baseUrl}/api/jobs/${targetJob.slug}/applications`, {
      method: "POST",
      headers: candidateHeaders,
      body: createCandidateForm({ email: "" }),
    });
    assert(noEmailRes.status === 400, "Missing email rejected with 400");

    // 10. Invalid email format rejected
    const badEmailRes = await fetch(`${baseUrl}/api/jobs/${targetJob.slug}/applications`, {
      method: "POST",
      headers: candidateHeaders,
      body: createCandidateForm({ email: "notanemail" }),
    });
    assert(badEmailRes.status === 400, "Invalid email format rejected with 400");

    // 11. Missing phone rejected
    const noPhoneRes = await fetch(`${baseUrl}/api/jobs/${targetJob.slug}/applications`, {
      method: "POST",
      headers: candidateHeaders,
      body: createCandidateForm({ phone: "" }),
    });
    assert(noPhoneRes.status === 400, "Missing phone rejected with 400");

    // 12. Invalid phone format rejected
    const badPhoneRes = await fetch(`${baseUrl}/api/jobs/${targetJob.slug}/applications`, {
      method: "POST",
      headers: candidateHeaders,
      body: createCandidateForm({ phone: "123" }),
    });
    assert(badPhoneRes.status === 400, "Invalid phone (<7 chars) rejected with 400");

    // 13. Missing resume file rejected
    const noFileRes = await fetch(`${baseUrl}/api/jobs/${targetJob.slug}/applications`, {
      method: "POST",
      headers: candidateHeaders,
      body: createCandidateForm({ omitFile: true }),
    });
    assert(noFileRes.status === 400, "Missing resume file rejected with 400");

    // ----------------------------------------------------
    // Test Suite 3: Resume Security & Magic Bytes Validation
    // ----------------------------------------------------
    console.log("\n[Test Suite 3: Resume Security & File Validation]");

    // 14. Invalid file extension (.exe) rejected
    const exeForm = createCandidateForm({
      fileBuffer: Buffer.from("MZ\x90\x00\x03\x00\x00\x00This is an executable"),
      fileName: "malware.exe",
      mimeType: "application/x-msdownload",
    });
    const exeRes = await fetch(`${baseUrl}/api/jobs/${targetJob.slug}/applications`, {
      method: "POST",
      headers: candidateHeaders,
      body: exeForm,
    });
    assert(exeRes.status === 400, "File with .exe extension rejected with 400");

    // 15. Executable disguised as .pdf (magic bytes mismatch) rejected
    const fakePdfForm = createCandidateForm({
      fileBuffer: Buffer.from("MZ\x90\x00\x03\x00\x00\x00Disguised executable"),
      fileName: "fake_resume.pdf",
      mimeType: "application/pdf",
    });
    const fakePdfRes = await fetch(`${baseUrl}/api/jobs/${targetJob.slug}/applications`, {
      method: "POST",
      headers: candidateHeaders,
      body: fakePdfForm,
    });
    const fakePdfJson = await fakePdfRes.json();
    assert(fakePdfRes.status === 400, "Executable disguised as PDF rejected with 400");
    assert(
      fakePdfJson.message?.includes("corrupted") || fakePdfJson.message?.includes("signature"),
      "Magic bytes failure returns clear signature/content error"
    );

    // 16. Oversized resume (>5MB) rejected
    const bigBuffer = Buffer.alloc(6 * 1024 * 1024, "%PDF-1.4\nBig data");
    const bigFileForm = createCandidateForm({
      fileBuffer: bigBuffer,
      fileName: "huge_resume.pdf",
      mimeType: "application/pdf",
    });
    const bigFileRes = await fetch(`${baseUrl}/api/jobs/${targetJob.slug}/applications`, {
      method: "POST",
      headers: candidateHeaders,
      body: bigFileForm,
    });
    assert(bigFileRes.status === 400, "Oversized file (>5MB) rejected with 400");

    // 17. Valid DOCX accepted
    // PK\x03\x04 zip header
    const docxHeader = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00]);
    const docxBuffer = Buffer.concat([docxHeader, Buffer.from("Mock DOCX file contents")]);
    const docxForm = createCandidateForm({
      email: "docx.candidate@example.com",
      fileBuffer: docxBuffer,
      fileName: "Candidate_Resume.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const docxRes = await fetch(`${baseUrl}/api/jobs/${targetJob.slug}/applications`, {
      method: "POST",
      headers: candidateHeaders,
      body: docxForm,
    });
    assert(docxRes.status === 201, "Valid DOCX resume accepted with 201 Created");

    // ----------------------------------------------------
    // Test Suite 4: Authenticated Submission & Number Generation
    // ----------------------------------------------------
    console.log("\n[Test Suite 4: Authenticated Submission & Application Number]");

    // 18. Authenticated submission succeeds
    const candidateEmail = "jane.success@example.com";
    const validForm = createCandidateForm({
      fullName: "Jane Success",
      email: candidateEmail,
      phone: "+1 555-123-4567",
      currentLocation: "Seattle, WA",
      coverLetter: "I love robotics and distributed systems.",
    });

    const submitRes = await fetch(`${baseUrl}/api/jobs/${targetJob.slug}/applications`, {
      method: "POST",
      headers: candidateHeaders,
      body: validForm,
    });
    const submitJson = await submitRes.json();
    assert(submitRes.status === 201, "Authenticated candidate application succeeds with 201 Created");
    assert(submitJson.success === true, "Response returns success: true");
    assert(
      submitJson.message === "Application submitted successfully.",
      "Response message matches requirement: 'Application submitted successfully.'"
    );

    // 19. Application number format verification: SD-YYYY-XXXXXX
    const appNum = submitJson.application?.application_number;
    const year = new Date().getFullYear();
    const appNumRegex = new RegExp(`^SD-${year}-\\d{6}$`);
    assert(Boolean(appNum && appNumRegex.test(appNum)), `Application number matches format SD-${year}-XXXXXX: ${appNum}`);

    // 20. Public response does NOT expose database UUID IDs or private S3 keys
    assert(submitJson.application?.id === undefined, "Public response does not expose database id");
    assert(submitJson.application?.file_key === undefined, "Public response does not expose S3 file_key");

    // ----------------------------------------------------
    // Test Suite 5: Duplicate Application & Email Normalization
    // ----------------------------------------------------
    console.log("\n[Test Suite 5: Duplicate Application & Email Normalization]");

    // 21. Duplicate application rejected with 409 Conflict
    const dupRes = await fetch(`${baseUrl}/api/jobs/${targetJob.slug}/applications`, {
      method: "POST",
      headers: candidateHeaders,
      body: createCandidateForm({ email: candidateEmail }),
    });
    const dupJson = await dupRes.json();
    assert(dupRes.status === 409, "Duplicate application with exact email rejected with 409 Conflict");
    assert(
      dupJson.message?.includes("already submitted") || dupJson.message?.includes("already applied"),
      "Duplicate response explains conflict"
    );

    // 22. Duplicate application with DIFFERENT CASE and LEADING/TRAILING SPACES rejected with 409
    const upperCasedEmail = `  JANE.SUCCESS@example.COM  `;
    const caseDupRes = await fetch(`${baseUrl}/api/jobs/${targetJob.slug}/applications`, {
      method: "POST",
      headers: candidateHeaders,
      body: createCandidateForm({ email: upperCasedEmail }),
    });
    assert(
      caseDupRes.status === 409,
      "Duplicate application with uppercase/whitespace email rejected with 409 Conflict (Email Normalization)"
    );

    // 23. Same candidate CAN apply to a DIFFERENT job
    const otherJobs = await jobRepository.findJobs({ onlyActivePublished: true, limit: 10 });
    const secondJob = otherJobs.jobs.find((j) => j.id !== targetJob.id);
    if (secondJob) {
      const secondJobRes = await fetch(`${baseUrl}/api/jobs/${secondJob.slug}/applications`, {
        method: "POST",
        headers: candidateHeaders,
        body: createCandidateForm({ email: candidateEmail }),
      });
      assert(
        secondJobRes.status === 201,
        "Same candidate email CAN apply to a different published position"
      );
    }

    // ----------------------------------------------------
    // Test Suite 6: Admin Application Management & RBAC
    // ----------------------------------------------------
    console.log("\n[Test Suite 6: Admin Management & RBAC]");

    // 24. Unauthenticated request to GET /api/admin/applications rejected with 401
    const noAuthRes = await fetch(`${baseUrl}/api/admin/applications`);
    assert(noAuthRes.status === 401, "Unauthenticated GET /api/admin/applications returns 401");

    // 25. Unauthorized role (Unprivileged) rejected with 403
    const unprivRes = await fetch(`${baseUrl}/api/admin/applications`, {
      headers: { Authorization: `Bearer ${unprivToken}` },
    });
    assert(unprivRes.status === 403, "Unprivileged user GET /api/admin/applications returns 403");

    // 26. CONTENT_WRITER cannot list applications (403)
    const writerRes = await fetch(`${baseUrl}/api/admin/applications`, {
      headers: { Authorization: `Bearer ${writerToken}` },
    });
    assert(writerRes.status === 403, "CONTENT_WRITER GET /api/admin/applications returns 403 (Lacks applications.read)");

    // 27. RECRUITER can list applications (200)
    const recruiterListRes = await fetch(`${baseUrl}/api/admin/applications`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const recruiterListJson = await recruiterListRes.json();
    assert(recruiterListRes.status === 200, "RECRUITER GET /api/admin/applications returns 200");
    assert(
      Array.isArray(recruiterListJson.data) && recruiterListJson.data.length > 0,
      "RECRUITER receives list of submitted applications"
    );

    // Verify list item contents & privacy (no private S3 keys exposed in list)
    const firstListItem = recruiterListJson.data[0];
    assert(Boolean(firstListItem.application_number), "List item contains application_number");
    assert(firstListItem.file_key === undefined, "List item does not expose raw S3 file_key");

    // 28. RECRUITER can view application detail by ID (200)
    const targetAppId = firstListItem.id;
    const detailRes = await fetch(`${baseUrl}/api/admin/applications/${targetAppId}`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const detailJson = await detailRes.json();
    assert(detailRes.status === 200, "RECRUITER GET /api/admin/applications/:id returns 200");
    assert(detailJson.data.id === targetAppId, "Detail returns correct application record");
    assert(Array.isArray(detailJson.data.documents), "Detail includes attached documents metadata");

    const resumeDoc = detailJson.data.documents[0];
    assert(Boolean(resumeDoc && resumeDoc.id), "Document metadata has document ID");
    assert(resumeDoc.file_key === undefined, "Document metadata does not expose raw S3 key");

    // 29. CONTENT_WRITER cannot update application status (403)
    const writerPatchRes = await fetch(`${baseUrl}/api/admin/applications/${targetAppId}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${writerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "SCREENING" }),
    });
    assert(
      writerPatchRes.status === 403,
      "CONTENT_WRITER PATCH /api/admin/applications/:id/status returns 403 (Lacks applications.update)"
    );

    // 30. RECRUITER can update application status (200)
    const recruiterPatchRes = await fetch(`${baseUrl}/api/admin/applications/${targetAppId}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "SCREENING" }),
    });
    const recruiterPatchJson = await recruiterPatchRes.json();
    assert(recruiterPatchRes.status === 200, "RECRUITER PATCH /api/admin/applications/:id/status returns 200");
    assert(
      recruiterPatchJson.data.status === "SCREENING",
      "Application status successfully transitioned to SCREENING"
    );

    // 31. Invalid status value rejected (400)
    const badStatusRes = await fetch(`${baseUrl}/api/admin/applications/${targetAppId}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "RANDOM_INVALID_STATUS" }),
    });
    assert(badStatusRes.status === 400, "Invalid arbitrary status rejected with 400");

    // 32. Terminal status lifecycle: cannot transition from WITHDRAWN
    // Transition to WITHDRAWN first
    await fetch(`${baseUrl}/api/admin/applications/${targetAppId}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "WITHDRAWN" }),
    });

    // Try transitioning out of WITHDRAWN
    const afterWithdrawnRes = await fetch(`${baseUrl}/api/admin/applications/${targetAppId}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "INTERVIEW" }),
    });
    assert(
      afterWithdrawnRes.status === 400,
      "Cannot transition out of terminal status WITHDRAWN (returns 400)"
    );

    // ----------------------------------------------------
    // Test Suite 7: Secure Document Access & IDOR Protection
    // ----------------------------------------------------
    console.log("\n[Test Suite 7: Secure Document Access & IDOR Protection]");

    // 33. RECRUITER can generate presigned download URL
    const docId = resumeDoc.id;
    const downloadRes = await fetch(
      `${baseUrl}/api/admin/applications/${targetAppId}/documents/${docId}`,
      {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      }
    );
    const downloadJson = await downloadRes.json();
    assert(downloadRes.status === 200, "RECRUITER GET document download URL returns 200");
    assert(
      Boolean(downloadJson.data?.downloadUrl),
      "Download response includes secure presigned download URL"
    );
    assert(
      downloadJson.data?.downloadUrl.includes("X-Amz-Signature") ||
        downloadJson.data?.downloadUrl.includes("mock-s3.sarasdynamics.internal"),
      "Presigned URL includes signature/auth parameters"
    );

    // 34. Unauthorized user cannot access document download (403)
    const unprivDocRes = await fetch(
      `${baseUrl}/api/admin/applications/${targetAppId}/documents/${docId}`,
      {
        headers: { Authorization: `Bearer ${unprivToken}` },
      }
    );
    assert(unprivDocRes.status === 403, "Unprivileged user cannot access document download (403)");

    // 35. IDOR Protection: cannot access document belonging to another application
    // Create a second application
    const app2 = await applicationRepository.create({
      application_number: "SD-2026-999998",
      job_id: targetJob.id,
      full_name: "Second Candidate",
      email: "second.candidate@example.com",
      phone: "+1 555-999-8888",
    });

    const idorRes = await fetch(
      `${baseUrl}/api/admin/applications/${app2.id}/documents/${docId}`,
      {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      }
    );
    assert(
      idorRes.status === 404 || idorRes.status === 403,
      "IDOR Attempt: Requesting docId with mismatched applicationId rejected (404/403)"
    );

    // ----------------------------------------------------
    // Test Suite 8: Privacy - Public Job API Candidate Isolation
    // ----------------------------------------------------
    console.log("\n[Test Suite 8: Privacy & Isolation]");

    // 36. Public job API does NOT expose candidate data or applications
    const pubJobRes = await fetch(`${baseUrl}/api/jobs/${targetJob.slug}`);
    const pubJobJson = await pubJobRes.json();
    assert(pubJobRes.status === 200, "GET /api/jobs/:slug returns 200");
    assert(pubJobJson.data?.applications === undefined, "Public job response does NOT contain applications array");
    assert(pubJobJson.data?.candidates === undefined, "Public job response does NOT contain candidates data");

    const pubListJobsRes = await fetch(`${baseUrl}/api/jobs`);
    const pubListJobsJson = await pubListJobsRes.json();
    assert(
      pubListJobsJson.data.every((j: any) => j.applications === undefined),
      "Public jobs list does NOT contain applications on any job item"
    );

    // ----------------------------------------------------
    // Test Suite 9: Admin Application Deletion & S3 Cleanup
    // ----------------------------------------------------
    console.log("\n[Test Suite 9: Application Deletion & S3 Cleanup]");

    // 37. Recruiter cannot delete application (Lacks applications.delete)
    const recruiterDelRes = await fetch(`${baseUrl}/api/admin/applications/${app2.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(
      recruiterDelRes.status === 403,
      "RECRUITER DELETE /api/admin/applications/:id rejected with 403 (Lacks applications.delete)"
    );

    // 38. ADMIN can delete application (200)
    const adminDelRes = await fetch(`${baseUrl}/api/admin/applications/${app2.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminDelRes.status === 200, "ADMIN DELETE /api/admin/applications/:id returns 200");

    // 39. Confirm application is removed from database
    const deletedCheck = await applicationRepository.findById(app2.id);
    assert(deletedCheck === null, "Deleted application verified removed from database");

    // ----------------------------------------------------
    // Test Suite 10: Filtering & Pagination
    // ----------------------------------------------------
    console.log("\n[Test Suite 10: Filtering & Pagination]");

    // 40. Filter by job_id
    const jobFilterRes = await fetch(
      `${baseUrl}/api/admin/applications?job_id=${targetJob.id}`,
      {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      }
    );
    const jobFilterJson = await jobFilterRes.json();
    assert(jobFilterRes.status === 200, "Filter applications by job_id returns 200");
    assert(
      jobFilterJson.data.every((a: any) => a.job_id === targetJob.id),
      "All returned items match requested job_id"
    );

    // 41. Filter by status
    const statusFilterRes = await fetch(
      `${baseUrl}/api/admin/applications?status=SCREENING`,
      {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      }
    );
    const statusFilterJson = await statusFilterRes.json();
    assert(statusFilterRes.status === 200, "Filter applications by status returns 200");

    // 42. Pagination limit
    const pageRes = await fetch(
      `${baseUrl}/api/admin/applications?page=1&limit=2`,
      {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      }
    );
    const pageJson = await pageRes.json();
    assert(pageRes.status === 200, "Pagination request returns 200");
    assert(pageJson.pagination?.limit === 2, "Pagination returns limit: 2");
    assert(pageJson.data.length <= 2, "Returned data length <= 2");

  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log("\n==================================================");
  console.log(`Phase 4 Tests Finished: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase4Tests().catch((err) => {
  console.error("Phase 4 test execution crashed:", err);
  process.exit(1);
});
