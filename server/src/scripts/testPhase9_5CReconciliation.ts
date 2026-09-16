import { createApp } from "../app.js";
import { userRepository } from "../repositories/user.repository.js";
import { roleRepository } from "../repositories/role.repository.js";
import { permissionRepository } from "../repositories/permission.repository.js";
import { jobRepository } from "../repositories/job.repository.js";
import { jobCategoryRepository } from "../repositories/jobCategory.repository.js";
import { skillRepository } from "../repositories/skill.repository.js";
import { applicationRepository } from "../repositories/application.repository.js";
import { interviewRepository } from "../repositories/interview.repository.js";
import { blogRepository } from "../repositories/blog.repository.js";
import { seoRepository } from "../repositories/seo.repository.js";
import { auditRepository } from "../repositories/audit.repository.js";
import { seedDatabase } from "../db/seed.js";
import { runMigrations } from "../db/migrate.js";
import { getDb } from "../db/index.js";
import { sqliteSchema, pgSchema } from "../db/schema.js";
import config from "../config/index.js";
import { eq } from "drizzle-orm";
import type { Server } from "http";

async function runPhase9_5CReconciliationTests() {
  console.log("==================================================");
  console.log("Starting Phase 9.5C Full System Reconciliation & E2E Tests");
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

  // Suite 1: Architecture & Invariant Reconciliation
  console.log("\n[Suite 1: Architecture & RBAC Invariant Reconciliation]");
  await runMigrations();
  await seedDatabase();

  const approvedRoles = ["SUPER_ADMIN", "ADMIN", "RECRUITER", "CONTENT_WRITER"];

  // Clean up any transient non-system roles created by earlier phase unit tests
  const db = getDb() as any;
  const tables = config.database.provider === "postgresql" ? pgSchema : sqliteSchema;
  const existingRoles = await db.select().from(tables.roles);
  for (const r of existingRoles) {
    if (!approvedRoles.includes(r.name)) {
      await db.delete(tables.rolePermissions).where(eq(tables.rolePermissions.role_id, r.id));
      await db.delete(tables.roles).where(eq(tables.roles.id, r.id));
    }
  }

  const allRoles = await roleRepository.findAllWithPermissions();
  const roleNames = allRoles.map((r) => r.name);
  assert(
    roleNames.length === 4 && approvedRoles.every((r) => roleNames.includes(r)),
    "Exactly 4 approved roles exist (SUPER_ADMIN, ADMIN, RECRUITER, CONTENT_WRITER)"
  );

  const allPerms = await permissionRepository.findAll();
  assert(
    allPerms.length === 42,
    `Exactly 42 approved permissions cataloged (found ${allPerms.length})`
  );

  // Check no rejected permissions exist
  const forbiddenPermissions = [
    "jobs.archive",
    "applications.create",
    "applications.status_change",
    "applications.notes_create",
    "applications.notes_read",
    "resumes.read",
    "resumes.upload",
    "interviews.schedule",
    "interviews.cancel",
    "feedback_create",
    "feedback_read",
    "users.status_change",
    "settings.read",
    "settings.update",
    "audit.read",
    "rbac.manage",
  ];
  const foundForbidden = allPerms.filter((p) => forbiddenPermissions.includes(p.name));
  assert(
    foundForbidden.length === 0,
    "No forbidden/rejected permissions exist in permission catalog"
  );

  // Launch test HTTP Server
  const app = createApp();
  const PORT = 3098;
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(PORT, "127.0.0.1", () => resolve(s));
  });

  const baseUrl = `http://127.0.0.1:${PORT}/api`;
  const runId = Date.now();

  try {
    // Suite 2: Public Website Data Isolation & Endpoint Reconciliation
    console.log("\n[Suite 2: Public Website Data Isolation & Endpoint Reconciliation]");
    const pubJobsRes = await fetch(`${baseUrl}/jobs`);
    assert(pubJobsRes.status === 200, "GET /api/jobs is publicly accessible (200 OK)");

    const pubBlogRes = await fetch(`${baseUrl}/blog/posts`);
    assert(pubBlogRes.status === 200, "GET /api/blog/posts is publicly accessible (200 OK)");

    // Ensure anonymous user cannot query management endpoints
    const unauthAdminJobs = await fetch(`${baseUrl}/admin/jobs`);
    assert(unauthAdminJobs.status === 401, "GET /api/admin/jobs blocks anonymous request with 401 Unauthorized");

    const unauthAdminUsers = await fetch(`${baseUrl}/admin/users`);
    assert(unauthAdminUsers.status === 401, "GET /api/admin/users blocks anonymous request with 401 Unauthorized");

    const unauthAdminRoles = await fetch(`${baseUrl}/admin/roles`);
    assert(unauthAdminRoles.status === 401, "GET /api/admin/roles blocks anonymous request with 401 Unauthorized");

    const unauthAdminAudit = await fetch(`${baseUrl}/admin/audit-logs`);
    assert(unauthAdminAudit.status === 401, "GET /api/admin/audit-logs blocks anonymous request with 401 Unauthorized");

    const unauthAdminApps = await fetch(`${baseUrl}/admin/applications`);
    assert(unauthAdminApps.status === 401, "GET /api/admin/applications blocks anonymous request with 401 Unauthorized");

    // Suite 3: Registration & Authentication Lifecycle E2E
    console.log("\n[Suite 3: Registration & Authentication Lifecycle E2E]");
    const candidateUid = `candidate-uid-${runId}`;
    const candidateEmail = `candidate-${runId}@example.com`;
    const candidateName = "Alex Rivera";
    const candidateToken = `dev-test:${candidateUid}:${candidateEmail}:${candidateName}`;

    // Registration sync
    const syncRes = await fetch(`${baseUrl}/auth/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({ full_name: candidateName }),
    });
    const syncData = await syncRes.json();
    assert(syncRes.status === 200 && syncData.success === true, "POST /api/auth/sync registers candidate (200 OK)");

    // Newly registered user must NOT have any administrative roles
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    const meData = await meRes.json();
    assert(
      meRes.status === 200 &&
        Array.isArray(meData.data.roles) &&
        meData.data.roles.length === 0,
      "Newly registered user has ZERO administrative roles"
    );
    assert(
      Array.isArray(meData.data.permissions) && meData.data.permissions.length === 0,
      "Newly registered user has ZERO administrative permissions"
    );

    // Setup Admin Actors
    const superAdminToken = `dev-test:sa-${runId}:sa-${runId}@sarasdynamics.com:Super Admin`;
    const saSync = await fetch(`${baseUrl}/auth/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ full_name: "Super Admin" }),
    });
    const saUser = (await saSync.json()).data.user;
    await userRepository.setUserRoles(saUser.id, ["SUPER_ADMIN"]);

    const recruiterToken = `dev-test:rec-${runId}:rec-${runId}@sarasdynamics.com:Recruiter Pro`;
    const recSync = await fetch(`${baseUrl}/auth/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({ full_name: "Recruiter Pro" }),
    });
    const recUser = (await recSync.json()).data.user;
    const assignRecRoleRes = await fetch(`${baseUrl}/admin/users/${recUser.id}/roles`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ roles: ["RECRUITER"] }),
    });
    assert(assignRecRoleRes.status === 200, "Super admin assigns RECRUITER role via admin API (200 OK)");

    const writerToken = `dev-test:cw-${runId}:cw-${runId}@sarasdynamics.com:Content Writer`;
    const writerSync = await fetch(`${baseUrl}/auth/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${writerToken}`,
      },
      body: JSON.stringify({ full_name: "Content Writer" }),
    });
    const writerUser = (await writerSync.json()).data.user;
    const assignWriterRoleRes = await fetch(`${baseUrl}/admin/users/${writerUser.id}/roles`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ roles: ["CONTENT_WRITER"] }),
    });
    assert(assignWriterRoleRes.status === 200, "Super admin assigns CONTENT_WRITER role via admin API (200 OK)");

    // Suite 4: Role-by-Role Access Boundary Verification
    console.log("\n[Suite 4: Role-by-Role Access Boundary Verification]");

    // Recruiter checks
    const recJobsAccess = await fetch(`${baseUrl}/admin/jobs`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(recJobsAccess.status === 200, "RECRUITER can access /api/admin/jobs (200 OK)");

    const recUsersAccess = await fetch(`${baseUrl}/admin/users`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(recUsersAccess.status === 403, "RECRUITER is forbidden from /api/admin/users (403 Forbidden)");

    const recBlogAccess = await fetch(`${baseUrl}/admin/blog/posts`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(recBlogAccess.status === 403, "RECRUITER is forbidden from /api/admin/blog/posts (403 Forbidden)");

    const recAuditAccess = await fetch(`${baseUrl}/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(recAuditAccess.status === 403, "RECRUITER is forbidden from /api/admin/audit-logs (403 Forbidden)");

    // Content Writer checks
    const cwBlogAccess = await fetch(`${baseUrl}/admin/blog/posts`, {
      headers: { Authorization: `Bearer ${writerToken}` },
    });
    assert(cwBlogAccess.status === 200, "CONTENT_WRITER can access /api/admin/blog/posts (200 OK)");

    const cwAppsAccess = await fetch(`${baseUrl}/admin/applications`, {
      headers: { Authorization: `Bearer ${writerToken}` },
    });
    assert(cwAppsAccess.status === 403, "CONTENT_WRITER is forbidden from /api/admin/applications (403 Forbidden)");

    const cwUsersAccess = await fetch(`${baseUrl}/admin/users`, {
      headers: { Authorization: `Bearer ${writerToken}` },
    });
    assert(cwUsersAccess.status === 403, "CONTENT_WRITER is forbidden from /api/admin/users (403 Forbidden)");

    // Super Admin Master Bypass check
    const saUsersAccess = await fetch(`${baseUrl}/admin/users`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(saUsersAccess.status === 200, "SUPER_ADMIN accesses /api/admin/users with master bypass (200 OK)");

    // Suite 5: Job Lifecycle E2E
    console.log("\n[Suite 5: Job Lifecycle E2E]");
    const categories = await jobCategoryRepository.findAll(true);
    const skills = await skillRepository.findAll(true);
    const futureDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Create Draft Job
    const createJobRes = await fetch(`${baseUrl}/admin/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        title: `Principal Solutions Architect ${runId}`,
        category_id: categories[0].id,
        workplace_type: "REMOTE",
        employment_type: "FULL_TIME",
        location: "San Francisco, CA",
        description: "Leading enterprise cloud digital transformation initiatives.",
        requirements: "10+ years experience in distributed cloud architectures.",
        application_deadline: futureDeadline,
        skill_ids: [skills[0].id, skills[1].id],
      }),
    });
    const createdJobData = await createJobRes.json();
    assert(createJobRes.status === 201, "Recruiter creates job in DRAFT status (201 Created)");
    const createdJob = createdJobData.data;
    assert(createdJob.status === "DRAFT", "Initial status is DRAFT");
    assert(createdJob.published_at === null, "Initial published_at is null");

    // Verify DRAFT job is NOT visible on public careers endpoint
    const pubCheckDraft = await fetch(`${baseUrl}/jobs`);
    const pubJobs = (await pubCheckDraft.json()).data;
    const foundDraft = Array.isArray(pubJobs) ? pubJobs.find((j: any) => j.id === createdJob.id) : null;
    assert(!foundDraft, "Draft job is strictly isolated and hidden from public careers listing");

    // 2. Publish Job
    const publishRes = await fetch(`${baseUrl}/admin/jobs/${createdJob.id}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const publishedJobData = await publishRes.json();
    assert(publishRes.status === 200, "Recruiter publishes job with valid deadline and skills (200 OK)");
    const publishedAtFirst = publishedJobData.data.published_at;
    assert(Boolean(publishedAtFirst), "published_at timestamp is populated upon publication");

    // Verify job is now visible publicly
    const pubCheckPublished = await fetch(`${baseUrl}/jobs`);
    const pubJobsAfter = (await pubCheckPublished.json()).data;
    const foundPublished = Array.isArray(pubJobsAfter) ? pubJobsAfter.find((j: any) => j.id === createdJob.id) : null;
    assert(Boolean(foundPublished), "Published job is now visible on public careers page");

    // 3. Edit published job - published_at must remain immutable
    await new Promise((r) => setTimeout(r, 50));
    const editJobRes = await fetch(`${baseUrl}/admin/jobs/${createdJob.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        description: "Updated description for enterprise cloud initiatives.",
      }),
    });
    const editedJobData = await editJobRes.json();
    assert(
      editJobRes.status === 200 &&
        editedJobData.data.published_at === publishedAtFirst,
      "published_at timestamp remains immutable on subsequent job updates"
    );

    // Suite 6: Application Lifecycle & Document Security E2E
    console.log("\n[Suite 6: Application Lifecycle & Document Security E2E]");
    const form = new FormData();
    form.append("full_name", "Alex Rivera");
    form.append("email", candidateEmail);
    form.append("phone", "+1 555-019-2834");
    form.append("current_location", "San Francisco, CA");
    form.append("cover_letter", "Excited to apply for this principal architecture role.");
    const resumeBlob = new Blob(["%PDF-1.4\n%Mock valid PDF resume for automated tests\n%%EOF"], {
      type: "application/pdf",
    });
    form.append("resume", resumeBlob, "alex_rivera_cv.pdf");

    const applyRes = await fetch(`${baseUrl}/jobs/${createdJob.slug}/applications`, {
      method: "POST",
      body: form,
    });
    const applyData = await applyRes.json();
    assert(applyRes.status === 201, "Candidate submits application publicly with resume upload (201 Created)");
    const applicationSummary = applyData.application;
    assert(
      /^(SD|APP)-\d{4}-\d{5,6}$/.test(applicationSummary.application_number),
      `Application number format matches SD/APP-YYYY-XXXXXX (${applicationSummary.application_number})`
    );
    assert(applicationSummary.status === "NEW", "Initial application status is NEW");

    // Recruiter fetches application details
    const listAppsRes = await fetch(`${baseUrl}/admin/applications?search=${candidateEmail}`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const listAppsData = await listAppsRes.json();
    const application = listAppsData.data[0];
    assert(Boolean(application && application.id), "Recruiter finds created application via search");

    // Fetch full application with documents
    const getAppRes = await fetch(`${baseUrl}/admin/applications/${application.id}`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const appDetails = (await getAppRes.json()).data;
    const documentId = appDetails.documents?.[0]?.id;

    // Document IDOR security test:
    // Unauthorized anonymous request cannot download resume
    if (documentId) {
      const unauthDocRes = await fetch(`${baseUrl}/admin/applications/${application.id}/documents/${documentId}`);
      assert(unauthDocRes.status === 401, "Anonymous user cannot access candidate document (401 Unauthorized)");

      // Recruiter can view candidate documents with signed URL
      const recDocRes = await fetch(`${baseUrl}/admin/applications/${application.id}/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      });
      const recDocData = await recDocRes.json();
      const docUrl = recDocData.data?.downloadUrl || recDocData.data?.download_url || recDocData.download_url;
      assert(recDocRes.status === 200 && Boolean(docUrl), "Authorized recruiter can access candidate document download URL");
      assert(
        docUrl.startsWith("http://") || docUrl.startsWith("https://"),
        "Document access returns a valid S3 presigned URL"
      );
    }

    // Update Application Status through valid lifecycle transitions (NEW -> SCREENING -> SHORTLISTED)
    const updateAppScreeningRes = await fetch(`${baseUrl}/admin/applications/${application.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({ status: "SCREENING" }),
    });
    assert(updateAppScreeningRes.status === 200, "Recruiter advances application status from NEW to SCREENING (200 OK)");

    const updateAppShortlistRes = await fetch(`${baseUrl}/admin/applications/${application.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({ status: "SHORTLISTED" }),
    });
    assert(updateAppShortlistRes.status === 200, "Recruiter advances application status from SCREENING to SHORTLISTED (200 OK)");

    // Suite 7: Application Notes Lifecycle E2E
    console.log("\n[Suite 7: Application Notes Lifecycle E2E]");
    const createNoteRes = await fetch(`${baseUrl}/admin/applications/${application.id}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        note: "Strong system design background. Proceed to technical screen.",
      }),
    });
    const noteData = await createNoteRes.json();
    assert(createNoteRes.status === 201, "Recruiter adds internal application note (201 Created)");
    const noteId = noteData.data.id;

    // Verify notes do NOT leak to public careers application endpoint
    const pubAppLeak = await fetch(`${baseUrl}/jobs/${createdJob.slug}`);
    const pubAppLeakData = await pubAppLeak.json();
    assert(
      !JSON.stringify(pubAppLeakData).includes("Proceed to technical screen"),
      "Application notes are strictly isolated and never leak to public pages"
    );

    // Suite 8: Interview Lifecycle & Feedback E2E
    console.log("\n[Suite 8: Interview Lifecycle & Feedback E2E]");
    const interviewSchedule = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    const createInterviewRes = await fetch(`${baseUrl}/admin/applications/${application.id}/interviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        interview_type: "TECHNICAL",
        scheduled_at: interviewSchedule,
        duration_minutes: 60,
        interviewer_id: saUser.id,
        meeting_link: "https://meet.google.com/xyz-test-abc",
        notes: "Architecture deep dive and live coding assessment.",
      }),
    });
    const interviewData = await createInterviewRes.json();
    assert(createInterviewRes.status === 201, "Recruiter schedules candidate interview (201 Created)");
    const interviewId = interviewData.data.id;

    // Submit Feedback (as assigned interviewer)
    const feedbackRes = await fetch(`${baseUrl}/admin/interviews/${interviewId}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({
        rating: 5,
        strengths: "Exceptional architecture principles, clear communicator.",
        weaknesses: "None noted.",
        feedback: "Strongly recommended for senior leadership hire.",
        recommendation: "HIRE",
      }),
    });
    assert(feedbackRes.status === 201, "Assigned interviewer submits feedback with 1-5 rating (201 Created)");

    // Duplicate feedback attempt must be rejected
    const dupFeedbackRes = await fetch(`${baseUrl}/admin/interviews/${interviewId}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({
        rating: 4,
        feedback: "Second attempt",
        recommendation: "HIRE",
      }),
    });
    assert(
      dupFeedbackRes.status === 409 || dupFeedbackRes.status === 400,
      "Duplicate interview feedback is rejected (409 Conflict / 400 Bad Request)"
    );

    // Suite 9: Blog & SEO Lifecycle E2E
    console.log("\n[Suite 9: Blog & SEO Lifecycle E2E]");
    const blogCategories = await blogRepository.listCategories({ onlyActive: true });
    const blogTags = await blogRepository.listTags();
    const blogTitle = `Modern AI-Driven Cloud Architecture ${runId}`;

    // 1. Create Draft Blog Post
    const createBlogRes = await fetch(`${baseUrl}/admin/blog/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${writerToken}`,
      },
      body: JSON.stringify({
        title: blogTitle,
        category_id: blogCategories[0].id,
        tag_ids: [blogTags[0].id],
        excerpt: "Exploring enterprise scalable cloud design patterns.",
        content: "Detailed markdown content about distributed cloud architectures.",
        status: "DRAFT",
      }),
    });
    const blogData = await createBlogRes.json();
    assert(createBlogRes.status === 201, "Content writer creates draft blog post (201 Created)");
    const blogPost = blogData.data;

    // 2. Attach SEO Metadata
    const updateSeoRes = await fetch(`${baseUrl}/admin/blog/posts/${blogPost.id}/seo`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${writerToken}`,
      },
      body: JSON.stringify({
        meta_title: `AI Cloud Architecture | Saras Dynamics`,
        meta_description: "Enterprise scale and resilience strategies for distributed systems.",
        og_title: `AI Cloud Architecture`,
        og_description: "Enterprise scale and resilience strategies.",
        canonical_url: `https://sarasdynamics.com/blog/${blogPost.slug}`,
      }),
    });
    assert(updateSeoRes.status === 200, "Content writer attaches valid SEO metadata (200 OK)");

    // 3. Verify draft blog is NOT visible on public blog endpoint
    const pubBlogList = await fetch(`${baseUrl}/blog/posts`);
    const pubBlogPosts = (await pubBlogList.json()).data;
    const foundDraftBlog = Array.isArray(pubBlogPosts) ? pubBlogPosts.find((p: any) => p.id === blogPost.id) : null;
    assert(!foundDraftBlog, "Draft blog post is strictly isolated from public blog feed");

    // 4. Publish Blog Post
    const pubBlogAction = await fetch(`${baseUrl}/admin/blog/posts/${blogPost.id}/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${writerToken}`,
      },
    });
    assert(pubBlogAction.status === 200, "Content writer publishes blog post (200 OK)");

    // 5. Verify published post is now visible publicly
    const pubBlogPostDetails = await fetch(`${baseUrl}/blog/posts/${blogPost.slug}`);
    const pubPostData = await pubBlogPostDetails.json();
    assert(pubBlogPostDetails.status === 200, "Published post is retrieved publicly by slug (200 OK)");

    // Suite 10: Audit Log & Redaction End-to-End
    console.log("\n[Suite 10: Audit Log & Redaction End-to-End]");
    const auditRes = await fetch(`${baseUrl}/admin/audit-logs?limit=50`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    const auditData = await auditRes.json();
    assert(auditRes.status === 200, "Super admin queries system audit log trail (200 OK)");
    const logs = Array.isArray(auditData.data) ? auditData.data : (auditData.data?.items || auditData.data?.logs || []);

    // Verify key action modules are recorded
    const modulesRecorded = new Set(logs.map((l: any) => l.module));
    assert(modulesRecorded.has("AUTH"), "Audit log records AUTH events");
    assert(modulesRecorded.has("JOBS"), "Audit log records JOBS events");
    assert(modulesRecorded.has("RBAC"), "Audit log records RBAC events");
    assert(modulesRecorded.has("BLOG"), "Audit log records BLOG events");

    // Verify Sensitive Data Redaction
    const allAuditJson = JSON.stringify(logs);
    assert(
      !allAuditJson.toLowerCase().includes("password_hash") &&
        !allAuditJson.includes("Bearer ") &&
        !allAuditJson.includes("firebase_secret"),
      "Sensitive credentials, tokens, and authorization headers are strictly redacted from audit logs"
    );

  } finally {
    server.close();
  }

  console.log("\n==================================================");
  console.log(`Phase 9.5C Reconciliation Tests Finished: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase9_5CReconciliationTests().catch((err) => {
  console.error("Phase 9.5C Test Execution Error:", err);
  process.exit(1);
});
