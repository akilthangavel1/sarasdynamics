import { randomUUID } from "node:crypto";
import { eq, desc } from "drizzle-orm";
import { createApp } from "../app.js";
import { userRepository } from "../repositories/user.repository.js";
import { jobRepository } from "../repositories/job.repository.js";
import { applicationRepository } from "../repositories/application.repository.js";
import { noteRepository } from "../repositories/note.repository.js";
import { interviewRepository } from "../repositories/interview.repository.js";
import { blogRepository } from "../repositories/blog.repository.js";
import { seoRepository } from "../repositories/seo.repository.js";
import { auditRepository } from "../repositories/audit.repository.js";
import { auditService, redactSecrets } from "../services/audit.service.js";
import { seedDatabase } from "../db/seed.js";
import { runMigrations } from "../db/migrate.js";
import { getDb } from "../db/index.js";
import { sqliteSchema, pgSchema } from "../db/schema.js";
import config from "../config/index.js";
import type { Server } from "http";

async function runPhase9Tests() {
  console.log("==================================================");
  console.log("Starting Phase 9 Audit Logs & Governance Tests");
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

  // 1. Run migrations and seeds
  await runMigrations();
  await seedDatabase();

  const tables = config.database.provider === "postgresql" ? pgSchema : sqliteSchema;
  const db = getDb();

  // Clear existing audit logs for fresh test runs
  await (db as any).delete(tables.auditLogs);

  // Start test server on dedicated port 3098
  const app = createApp();
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(3098, "127.0.0.1", () => resolve(s));
  });

  const baseUrl = "http://127.0.0.1:3098";

  try {
    // 2. Setup test users and assign roles
    console.log("\n[Test Setup: Users and Roles]");
    const superAdminToken = "dev-test:p9-superadmin:p9super@saras.com:Super Admin Sam";
    const adminToken = "dev-test:p9-admin:p9admin@saras.com:Admin Alex";
    const recruiterToken = "dev-test:p9-recruiter:p9rec@saras.com:Recruiter Rachel";
    const writerToken = "dev-test:p9-writer:p9writer@saras.com:Writer Wendy";
    const unprivToken = "dev-test:p9-unpriv:p9unpriv@saras.com:Unpriv Uma";

    for (const token of [superAdminToken, adminToken, recruiterToken, writerToken, unprivToken]) {
      await fetch(`${baseUrl}/api/auth/sync`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    const superAdminUser = await userRepository.findByEmail("p9super@saras.com");
    const adminUser = await userRepository.findByEmail("p9admin@saras.com");
    const recUser = await userRepository.findByEmail("p9rec@saras.com");
    const writerUser = await userRepository.findByEmail("p9writer@saras.com");
    const unprivUser = await userRepository.findByEmail("p9unpriv@saras.com");

    await userRepository.assignRoleByName(superAdminUser!.id, "SUPER_ADMIN");
    await userRepository.assignRoleByName(adminUser!.id, "ADMIN");
    await userRepository.assignRoleByName(recUser!.id, "RECRUITER");
    await userRepository.assignRoleByName(writerUser!.id, "CONTENT_WRITER");

    assert(true, "Setup: test users and roles initialized successfully");

    /* =========================================================================
     * Suite 1: Schema, Immutability & Append-Only Invariants
     * ========================================================================= */
    console.log("\n[Suite 1: Schema, Immutability & Append-Only Invariants]");

    const testAuditRecord = await auditRepository.create({
      user_id: adminUser!.id,
      action: "CREATE",
      module: "JOB",
      entity_type: "JOB_POSTING",
      entity_id: "test-job-id-001",
      old_values: null,
      new_values: { title: "Founding Engineer", status: "DRAFT" },
      ip_address: "127.0.0.1",
      user_agent: "NodeTestAgent/1.0",
    });

    assert(!!testAuditRecord?.id, "Audit Repository: Successfully created audit log entry");

    const directRecord = (
      await (db as any)
        .select()
        .from(tables.auditLogs)
        .where(eq(tables.auditLogs.id, testAuditRecord.id))
    )[0];

    assert(directRecord.user_id === adminUser!.id, "Schema: user_id foreign key matches creator");
    assert(directRecord.action === "CREATE", "Schema: action is CREATE");
    assert(directRecord.module === "JOB", "Schema: module is JOB");
    assert(directRecord.entity_type === "JOB_POSTING", "Schema: entity_type is JOB_POSTING");
    assert(directRecord.entity_id === "test-job-id-001", "Schema: entity_id is stored correctly");
    assert(!!directRecord.created_at, "Schema: created_at timestamp generated automatically");

    // Client endpoints cannot mutate or delete audit logs
    const mutatePostRes = await fetch(`${baseUrl}/api/admin/audit-logs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${superAdminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "FAKE_ACTION" }),
    });
    assert(
      mutatePostRes.status === 404 || mutatePostRes.status === 405,
      "Append-Only: POST /api/admin/audit-logs is not exposed (404/405)"
    );

    const mutatePutRes = await fetch(`${baseUrl}/api/admin/audit-logs/${testAuditRecord.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${superAdminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "ALTERED" }),
    });
    assert(
      mutatePutRes.status === 404 || mutatePutRes.status === 405,
      "Append-Only: PUT /api/admin/audit-logs/:id is not exposed (404/405)"
    );

    const mutateDeleteRes = await fetch(`${baseUrl}/api/admin/audit-logs/${testAuditRecord.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(
      mutateDeleteRes.status === 404 || mutateDeleteRes.status === 405,
      "Append-Only: DELETE /api/admin/audit-logs/:id is not exposed (404/405)"
    );

    /* =========================================================================
     * Suite 2: RBAC & Permission Enforcement
     * ========================================================================= */
    console.log("\n[Suite 2: RBAC & Permission Enforcement]");

    const unauthRes = await fetch(`${baseUrl}/api/admin/audit-logs`);
    assert(unauthRes.status === 401, "RBAC: Unauthenticated GET /api/admin/audit-logs returns 401");

    const unprivRes = await fetch(`${baseUrl}/api/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${unprivToken}` },
    });
    assert(unprivRes.status === 403, "RBAC: Unprivileged user returns 403 Forbidden");

    const recruiterRes = await fetch(`${baseUrl}/api/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(recruiterRes.status === 403, "RBAC: RECRUITER (lacking audit_logs.read) returns 403 Forbidden");

    const writerRes = await fetch(`${baseUrl}/api/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${writerToken}` },
    });
    assert(writerRes.status === 403, "RBAC: CONTENT_WRITER (lacking audit_logs.read) returns 403 Forbidden");

    const adminRes = await fetch(`${baseUrl}/api/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminRes.status === 200, "RBAC: ADMIN with audit_logs.read returns 200 OK");
    const adminData = await adminRes.json();
    assert(Array.isArray(adminData.data), "RBAC: ADMIN receives audit logs list");

    const superAdminRes = await fetch(`${baseUrl}/api/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(superAdminRes.status === 200, "RBAC: SUPER_ADMIN returns 200 OK");

    /* =========================================================================
     * Suite 3: Redaction of Sensitive Data & Secrets
     * ========================================================================= */
    console.log("\n[Suite 3: Redaction of Sensitive Data & Secrets]");

    const payloadWithSecrets = {
      user: {
        name: "Alice",
        password: "SuperSecretPassword123!",
        token: "jwt.token.here",
        access_token: "ya29.auth-access-token",
        refresh_token: "refresh-secret",
        apiKey: "AIzaSySecretApiKey",
      },
      headers: {
        authorization: "Bearer secret-bearer-token-9999",
        cookie: "session=xyz123; other=456",
      },
      payment: {
        credit_card: "4111-2222-3333-4444",
        ssn: "123-45-6789",
      },
      s3_url:
        "https://s3.amazonaws.com/bucket/file?X-Amz-Signature=abcd1234efgh5678&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE",
      nestedArray: [
        { id: 1, secret: "classified" },
        { id: 2, private_key: "-----BEGIN PRIVATE KEY-----" },
      ],
      safeField: "Public Content Is Preserved",
    };

    const redacted = redactSecrets(payloadWithSecrets);

    assert(redacted.user.password === "[REDACTED]", "Redaction: password key is [REDACTED]");
    assert(redacted.user.token === "[REDACTED]", "Redaction: token key is [REDACTED]");
    assert(redacted.user.access_token === "[REDACTED]", "Redaction: access_token key is [REDACTED]");
    assert(redacted.user.refresh_token === "[REDACTED]", "Redaction: refresh_token key is [REDACTED]");
    assert(redacted.user.apiKey === "[REDACTED]", "Redaction: apiKey key is [REDACTED]");
    assert(redacted.headers.authorization === "[REDACTED]", "Redaction: authorization key is [REDACTED]");
    assert(redacted.payment.credit_card === "[REDACTED]", "Redaction: credit_card key is [REDACTED]");
    assert(redacted.payment.ssn === "[REDACTED]", "Redaction: ssn key is [REDACTED]");
    assert(redacted.nestedArray[0].secret === "[REDACTED]", "Redaction: nested array object secret is [REDACTED]");
    assert(redacted.nestedArray[1].private_key === "[REDACTED]", "Redaction: nested array private_key is [REDACTED]");
    assert(!redacted.s3_url.includes("abcd1234efgh5678"), "Redaction: AWS Signature sanitized in URLs");
    assert(redacted.safeField === "Public Content Is Preserved", "Redaction: safe non-sensitive fields intact");

    /* =========================================================================
     * Suite 4: End-to-End Business Operations Auditing
     * ========================================================================= */
    console.log("\n[Suite 4: End-to-End Business Operations Auditing]");

    // 1. Auth Login audit log
    await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const logsAfterAuth = await auditRepository.findMany({
      module: "AUTH",
      limit: 10,
    });
    assert(logsAfterAuth.logs.length > 0, "Audit: Auth login recorded in audit log");
    const authLog = logsAfterAuth.logs[0];
    assert(authLog.action === "LOGIN", "Audit: Auth action is LOGIN");
    assert(authLog.entity_type === "USER", "Audit: Auth entity_type is USER");

    // 2. Job Lifecycle Auditing
    const cat = (await (db as any).select().from(tables.jobCategories).limit(1))[0];
    const skill = (await (db as any).select().from(tables.skills).limit(1))[0];

    const createJobRes = await fetch(`${baseUrl}/api/admin/jobs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Audit Test Staff Engineer",
        category_id: cat.id,
        employment_type: "FULL_TIME",
        workplace_type: "REMOTE",
        description: "Full audit lifecycle testing.",
        requirements: "5+ years backend systems experience.",
        location: "Remote, Global",
        application_deadline: new Date(Date.now() + 86400000 * 30).toISOString(),
        skill_ids: [skill.id],
      }),
    });
    assert(createJobRes.status === 201, "Setup: Job created successfully");
    const createdJob = await createJobRes.json();
    const jobId = createdJob.data.id;

    const jobCreateLogs = await auditRepository.findMany({
      entity_id: jobId,
      action: "CREATE",
    });
    assert(jobCreateLogs.logs.length === 1, "Audit: Job creation recorded 1 audit log");
    assert(jobCreateLogs.logs[0].module === "JOBS", "Audit: Job module is JOBS");
    assert(jobCreateLogs.logs[0].entity_type === "JOB", "Audit: Entity type is JOB");

    // Publish Job
    await fetch(`${baseUrl}/api/admin/jobs/${jobId}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const jobPublishLogs = await auditRepository.findMany({
      entity_id: jobId,
      action: "PUBLISH",
    });
    assert(jobPublishLogs.logs.length === 1, "Audit: Job publish recorded PUBLISH audit log");
    assert(jobPublishLogs.logs[0].new_values?.status === "PUBLISHED", "Audit: Status transition recorded");

    // Close Job
    await fetch(`${baseUrl}/api/admin/jobs/${jobId}/close`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const jobCloseLogs = await auditRepository.findMany({
      entity_id: jobId,
      action: "CLOSE",
    });
    assert(jobCloseLogs.logs.length === 1, "Audit: Job close recorded CLOSE audit log");

    // 3. Application Lifecycle Auditing
    const uniqueAppSuffix = `${Date.now().toString().slice(-5)}${Math.floor(Math.random() * 1000)}`;
    const appRecord = await applicationRepository.create({
      job_id: jobId,
      full_name: "Audit Candidate",
      email: `audit.candidate.${uniqueAppSuffix}@saras.com`,
      phone: "+15551234567",
      application_number: `SD-2026-${uniqueAppSuffix}`,
      status: "NEW",
    });

    // Update Application Status
    await fetch(`${baseUrl}/api/admin/applications/${appRecord.id}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "SCREENING" }),
    });

    const appStatusLogs = await auditRepository.findMany({
      entity_id: appRecord.id,
      module: "APPLICATIONS",
    });
    assert(appStatusLogs.logs.length >= 1, "Audit: Application status change recorded in audit log");
    assert(appStatusLogs.logs[0].action === "STATUS_CHANGE", "Audit: Action is STATUS_CHANGE");
    assert(appStatusLogs.logs[0].old_values?.status === "NEW", "Audit: Old status is NEW");
    assert(appStatusLogs.logs[0].new_values?.status === "SCREENING", "Audit: New status is SCREENING");

    // 4. Interview & Feedback Auditing
    const createInterviewRes = await fetch(
      `${baseUrl}/api/admin/applications/${appRecord.id}/interviews`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interview_type: "TECHNICAL",
          scheduled_at: new Date(Date.now() + 86400000).toISOString(),
          duration_minutes: 60,
          interviewer_id: adminUser!.id,
          meeting_link: "https://meet.saras.com/p9-interview",
        }),
      }
    );
    assert(createInterviewRes.status === 201, "Setup: Interview scheduled (201)");
    const createdInterview = await createInterviewRes.json();
    const interviewId = createdInterview.data.id;

    const interviewLogs = await auditRepository.findMany({
      entity_id: interviewId,
      module: "INTERVIEWS",
      action: "CREATE",
    });
    assert(interviewLogs.logs.length === 1, "Audit: Interview creation logged successfully");

    // Submit Feedback
    const feedbackRes = await fetch(`${baseUrl}/api/admin/interviews/${interviewId}/feedback`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating: 5,
        recommendation: "HIRE",
        comments: "Exemplary understanding of system architecture.",
      }),
    });
    assert(feedbackRes.status === 201, "Setup: Feedback submitted (201)");
    const feedbackJson = await feedbackRes.json();

    const feedbackLogs = await auditRepository.findMany({
      module: "INTERVIEWS",
      entity_type: "INTERVIEW_FEEDBACK",
      action: "CREATE",
    });
    assert(feedbackLogs.logs.length >= 1, "Audit: Interview feedback logged with INTERVIEW_FEEDBACK");

    // 5. Notes Auditing
    const createNoteRes = await fetch(`${baseUrl}/api/admin/applications/${appRecord.id}/notes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        note: "Candidate has strong governance and audit background.",
      }),
    });
    assert(createNoteRes.status === 201, "Setup: Note created (201)");
    const noteJson = await createNoteRes.json();
    const noteId = noteJson.data.id;

    const noteLogs = await auditRepository.findMany({
      entity_id: noteId,
      module: "NOTES",
      entity_type: "APPLICATION_NOTE",
      action: "CREATE",
    });
    assert(noteLogs.logs.length === 1, "Audit: Note creation logged");

    // Update note
    await fetch(`${baseUrl}/api/admin/applications/${appRecord.id}/notes/${noteId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        note: "Candidate has strong governance and audit background. (Updated)",
      }),
    });
    const noteUpdateLogs = await auditRepository.findMany({
      entity_id: noteId,
      action: "UPDATE",
    });
    assert(noteUpdateLogs.logs.length === 1, "Audit: Note update logged");

    // Delete note
    await fetch(`${baseUrl}/api/admin/applications/${appRecord.id}/notes/${noteId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const noteDeleteLogs = await auditRepository.findMany({
      entity_id: noteId,
      action: "DELETE",
    });
    assert(noteDeleteLogs.logs.length === 1, "Audit: Note deletion logged");

    // 6. Blog Auditing
    const blogCat = (await (db as any).select().from(tables.blogCategories).limit(1))[0];
    const blogTag = (await (db as any).select().from(tables.blogTags).limit(1))[0];
    const createPostRes = await fetch(`${baseUrl}/api/admin/blog/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Auditing Microservices in Production",
        category_id: blogCat.id,
        content: "<p>Best practices for append-only audit trail design.</p>",
        tag_ids: [blogTag.id],
      }),
    });
    assert(createPostRes.status === 201, "Setup: Blog post created (201)");
    const postJson = await createPostRes.json();
    const blogPostId = postJson.data.id;

    const postCreateLogs = await auditRepository.findMany({
      entity_id: blogPostId,
      module: "BLOG",
      entity_type: "BLOG_POST",
      action: "CREATE",
    });
    assert(postCreateLogs.logs.length === 1, "Audit: Blog post create logged");

    // Publish Blog Post
    await fetch(`${baseUrl}/api/admin/blog/posts/${blogPostId}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const postPublishLogs = await auditRepository.findMany({
      entity_id: blogPostId,
      action: "PUBLISH",
    });
    assert(postPublishLogs.logs.length === 1, "Audit: Blog post publish logged");

    // 7. SEO Auditing
    const upsertSeoRes = await fetch(`${baseUrl}/api/admin/blog/posts/${blogPostId}/seo`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meta_title: "Auditing Microservices",
        meta_description: "Learn how to build compliant audit logs.",
      }),
    });
    assert(upsertSeoRes.status === 200, "Setup: SEO metadata upserted (200)");

    const seoLogs = await auditRepository.findMany({
      module: "SEO",
      entity_type: "SEO_METADATA",
    });
    assert(seoLogs.logs.length >= 1, "Audit: SEO upsert logged");

    /* =========================================================================
     * Suite 5: Filtering, Search & Pagination via Admin API
     * ========================================================================= */
    console.log("\n[Suite 5: Filtering, Search & Pagination via Admin API]");

    // Filter by module=JOBS
    const filterJobRes = await fetch(`${baseUrl}/api/admin/audit-logs?module=JOBS`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(filterJobRes.status === 200, "Filter: GET audit logs with module=JOBS returns 200");
    const jobLogsData = await filterJobRes.json();
    assert(jobLogsData.data.every((l: any) => l.module === "JOBS"), "Filter: All items match module=JOBS");

    // Filter by action=PUBLISH
    const filterActionRes = await fetch(`${baseUrl}/api/admin/audit-logs?action=PUBLISH`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(filterActionRes.status === 200, "Filter: GET audit logs with action=PUBLISH returns 200");
    const publishLogsData = await filterActionRes.json();
    assert(publishLogsData.data.every((l: any) => l.action === "PUBLISH"), "Filter: All items match action=PUBLISH");

    // Filter by user_id
    const filterUserRes = await fetch(`${baseUrl}/api/admin/audit-logs?user_id=${adminUser!.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(filterUserRes.status === 200, "Filter: GET audit logs with user_id returns 200");
    const userLogsData = await filterUserRes.json();
    assert(userLogsData.data.every((l: any) => l.user_id === adminUser!.id), "Filter: All items match user_id");

    // Search query
    const searchRes = await fetch(`${baseUrl}/api/admin/audit-logs?search=Audit Test Staff Engineer`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(searchRes.status === 200, "Search: GET audit logs with search query returns 200");
    const searchData = await searchRes.json();
    assert(searchData.data.length > 0, "Search: Search query matched relevant audit entries");

    // Pagination
    const pageRes = await fetch(`${baseUrl}/api/admin/audit-logs?page=1&limit=2`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(pageRes.status === 200, "Pagination: Request with limit=2 returns 200");
    const pageData = await pageRes.json();
    assert(pageData.data.length <= 2, "Pagination: Data length is <= limit (2)");
    assert(pageData.pagination.limit === 2, "Pagination: pagination.limit is 2");
    assert(pageData.pagination.total >= 5, "Pagination: pagination.total reflects total log count");

    /* =========================================================================
     * Suite 6: Public Boundary & Isolation
     * ========================================================================= */
    console.log("\n[Suite 6: Public Boundary & Isolation]");

    const publicJobsRes = await fetch(`${baseUrl}/api/jobs`);
    const publicJobs = await publicJobsRes.json();
    assert(
      !JSON.stringify(publicJobs).includes("audit_logs"),
      "Public Boundary: Public jobs never contain audit logs"
    );

    const publicBlogRes = await fetch(`${baseUrl}/api/blog/posts`);
    const publicBlog = await publicBlogRes.json();
    assert(
      !JSON.stringify(publicBlog).includes("audit_logs"),
      "Public Boundary: Public blog posts never contain audit logs"
    );

  } finally {
    server.close();
  }

  console.log("\n==================================================");
  console.log(`Phase 9 Test Results: ${passed} passed, ${failed} failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase9Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
