import { createApp } from "../app.js";
import { userRepository } from "../repositories/user.repository.js";
import { roleRepository } from "../repositories/role.repository.js";
import { jobCategoryRepository } from "../repositories/jobCategory.repository.js";
import { skillRepository } from "../repositories/skill.repository.js";
import { seedDatabase } from "../db/seed.js";
import { runMigrations } from "../db/migrate.js";
import type { Server } from "http";

async function runPhase3Tests() {
  console.log("==================================================");
  console.log("Starting Phase 3 Careers, Jobs & Skills Tests");
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

  // Start test server
  const app = createApp();
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(3098, "127.0.0.1", () => resolve(s));
  });

  const baseUrl = "http://127.0.0.1:3098";

  try {
    // 2. Setup test users and assign roles
    console.log("\n[Test Setup: Users and Roles]");
    const recruiterToken = "dev-test:p3-recruiter-01:p3recruiter@saras.com:Recruiter Pat";
    const writerToken = "dev-test:p3-writer-02:p3writer@saras.com:Writer Wendy";
    const adminToken = "dev-test:p3-admin-03:p3admin@saras.com:Admin Adam";
    const unprivilegedToken = "dev-test:p3-unpriv-04:p3unpriv@saras.com:Unpriv Uma";

    // Sync all test users
    for (const token of [recruiterToken, writerToken, adminToken, unprivilegedToken]) {
      await fetch(`${baseUrl}/api/auth/sync`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    const recruiterUser = await userRepository.findByEmail("p3recruiter@saras.com");
    const writerUser = await userRepository.findByEmail("p3writer@saras.com");
    const adminUser = await userRepository.findByEmail("p3admin@saras.com");
    const unprivilegedUser = await userRepository.findByEmail("p3unpriv@saras.com");

    if (recruiterUser) {
      await userRepository.assignRoleByName(recruiterUser.id, "RECRUITER");
    }
    if (writerUser) {
      await userRepository.assignRoleByName(writerUser.id, "CONTENT_WRITER");
    }
    if (adminUser) {
      await userRepository.assignRoleByName(adminUser.id, "ADMIN");
    }

    assert(Boolean(recruiterUser && writerUser && adminUser && unprivilegedUser), "Test users synced and configured");

    // 3. Public Taxonomy Endpoints
    console.log("\n[Test Suite 1: Public Taxonomy Endpoints]");
    const categoriesRes = await fetch(`${baseUrl}/api/job-categories`);
    const categoriesJson = await categoriesRes.json();
    assert(categoriesRes.status === 200, "GET /api/job-categories returns 200");
    assert(Array.isArray(categoriesJson.data) && categoriesJson.data.length >= 11, "Job categories list seeded categories");

    const skillsRes = await fetch(`${baseUrl}/api/skills`);
    const skillsJson = await skillsRes.json();
    assert(skillsRes.status === 200, "GET /api/skills returns 200");
    assert(Array.isArray(skillsJson.data) && skillsJson.data.length >= 15, "Skills list seeded skills");

    // 4. Public Jobs Endpoints
    console.log("\n[Test Suite 2: Public Jobs Endpoints]");
    const publicJobsRes = await fetch(`${baseUrl}/api/jobs`);
    const publicJobsJson = await publicJobsRes.json();
    assert(publicJobsRes.status === 200, "GET /api/jobs returns 200");
    assert(Array.isArray(publicJobsJson.data) && publicJobsJson.data.length > 0, "Public jobs returned list of published jobs");
    assert(
      publicJobsJson.data.every((j: any) => j.status === "PUBLISHED"),
      "All public jobs are strictly in PUBLISHED status"
    );

    const firstJob = publicJobsJson.data[0];
    assert(Boolean(firstJob.category && firstJob.category.name), "Public job includes attached Category relation");
    assert(Array.isArray(firstJob.skills), "Public job includes attached Skills array");

    // Single job by slug
    const jobBySlugRes = await fetch(`${baseUrl}/api/jobs/${firstJob.slug}`);
    const jobBySlugJson = await jobBySlugRes.json();
    assert(jobBySlugRes.status === 200, `GET /api/jobs/:slug returns 200 for '${firstJob.slug}'`);
    assert(jobBySlugJson.data.id === firstJob.id, "Correct job retrieved by slug");

    // Search and filters
    const searchRes = await fetch(`${baseUrl}/api/jobs?search=Engineer`);
    const searchJson = await searchRes.json();
    assert(searchRes.status === 200, "Search jobs returns 200");
    assert(
      searchJson.data.length > 0 && searchJson.data.every((j: any) => j.title.toLowerCase().includes("engineer")),
      "Search filter correctly matches title"
    );

    // 5. Admin Authentication & RBAC Enforcement
    console.log("\n[Test Suite 3: Admin Authentication & RBAC Protection]");
    const unauthRes = await fetch(`${baseUrl}/api/admin/jobs`);
    assert(unauthRes.status === 401, "Unauthenticated GET /api/admin/jobs returns 401");

    const unprivRes = await fetch(`${baseUrl}/api/admin/jobs`, {
      headers: { Authorization: `Bearer ${unprivilegedToken}` },
    });
    assert(unprivRes.status === 403, "Unprivileged user GET /api/admin/jobs returns 403");

    const recruiterJobsRes = await fetch(`${baseUrl}/api/admin/jobs`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(recruiterJobsRes.status === 200, "Recruiter possessing jobs.read can access GET /api/admin/jobs");

    // 6. Job Creation & Validations
    console.log("\n[Test Suite 4: Job Creation, Slug Generation & Skill Association]");
    const devCategory = categoriesJson.data.find((c: any) => c.slug === "software-development");
    const testSkill1 = skillsJson.data.find((s: any) => s.slug === "typescript");
    const testSkill2 = skillsJson.data.find((s: any) => s.slug === "react");

    // Attempt to create PUBLISHED job without category -> should fail
    const invalidPublishRes = await fetch(`${baseUrl}/api/admin/jobs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Staff Systems Architect",
        workplace_type: "REMOTE",
        employment_type: "FULL_TIME",
        status: "PUBLISHED",
        description: "Leading cloud architecture",
        requirements: "10+ years experience",
      }),
    });
    assert(invalidPublishRes.status === 400, "Creating PUBLISHED job without category fails with 400");

    // Create DRAFT job without category -> should succeed
    const draftRes = await fetch(`${baseUrl}/api/admin/jobs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Draft Position Without Category",
        workplace_type: "HYBRID",
        employment_type: "FULL_TIME",
        status: "DRAFT",
      }),
    });
    const draftJson = await draftRes.json();
    assert(draftRes.status === 201, "Creating DRAFT job without category succeeds with 201");
    assert(draftJson.data.status === "DRAFT", "New job is in DRAFT status");
    assert(draftJson.data.category === null, "Category is null as allowed for drafts");

    // Verify DRAFT job is NOT visible on public endpoint
    const checkPublicDraft = await fetch(`${baseUrl}/api/jobs/${draftJson.data.slug}`);
    assert(checkPublicDraft.status === 404, "DRAFT job is not accessible via public API");

    // Create full job with skills and category
    const fullJobRes = await fetch(`${baseUrl}/api/admin/jobs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Distributed Systems Core Engineer",
        category_id: devCategory.id,
        workplace_type: "REMOTE",
        employment_type: "FULL_TIME",
        description: "Design consensus engines and state machines",
        requirements: "Deep understanding of Raft, Paxos, and distributed storage",
        location: "New York / Remote",
        application_deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
        skill_ids: [testSkill1.id, testSkill2.id],
      }),
    });
    const fullJobJson = await fullJobRes.json();
    assert(fullJobRes.status === 201, "Create full job with category and skills returns 201");
    assert(fullJobJson.data.skills.length === 2, "Job created with 2 associated skills");
    const testJobId = fullJobJson.data.id;

    // Test unique slug collision handling
    const duplicateTitleRes = await fetch(`${baseUrl}/api/admin/jobs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Distributed Systems Core Engineer", // same title
        category_id: devCategory.id,
        workplace_type: "REMOTE",
        employment_type: "FULL_TIME",
      }),
    });
    const duplicateTitleJson = await duplicateTitleRes.json();
    assert(duplicateTitleRes.status === 201, "Creating job with duplicate title succeeds");
    assert(
      /^distributed-systems-core-engineer-\d+$/.test(duplicateTitleJson.data.slug),
      `Unique slug generated with suffix: '${duplicateTitleJson.data.slug}'`
    );

    // 7. Field-Level Security for CONTENT_WRITER (jobs.update_content)
    console.log("\n[Test Suite 5: Field-Level Authorization for CONTENT_WRITER]");

    // Writer updating allowed content fields (title, description, requirements) -> 200 OK
    const writerAllowedRes = await fetch(`${baseUrl}/api/admin/jobs/${testJobId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${writerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Distributed Systems Core Engineer (Updated Copy)",
        description: "Updated technical overview by content team",
        requirements: "Updated requirements specification",
      }),
    });
    const writerAllowedJson = await writerAllowedRes.json();
    assert(writerAllowedRes.status === 200, "CONTENT_WRITER updating content fields returns 200 OK");
    assert(
      writerAllowedJson.data.description === "Updated technical overview by content team",
      "Description successfully updated by CONTENT_WRITER"
    );

    // Writer attempting to modify restricted field (status) -> 403 Forbidden
    const writerStatusRes = await fetch(`${baseUrl}/api/admin/jobs/${testJobId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${writerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "PUBLISHED",
      }),
    });
    assert(writerStatusRes.status === 403, "CONTENT_WRITER attempting to modify 'status' receives 403 Forbidden");

    // Writer attempting to modify restricted field (category_id or skill_ids) -> 403 Forbidden
    const writerCategoryRes = await fetch(`${baseUrl}/api/admin/jobs/${testJobId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${writerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category_id: devCategory.id,
      }),
    });
    assert(writerCategoryRes.status === 403, "CONTENT_WRITER attempting to modify 'category_id' receives 403 Forbidden");

    // 8. Status Workflow & Transitions
    console.log("\n[Test Suite 6: Job Status Workflow (DRAFT -> PUBLISHED -> CLOSED -> ARCHIVED)]");

    // Publish test job
    const publishRes = await fetch(`${baseUrl}/api/admin/jobs/${testJobId}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const publishJson = await publishRes.json();
    assert(publishRes.status === 200, "Publishing eligible job returns 200");
    assert(publishJson.data.status === "PUBLISHED", "Status transitioned to PUBLISHED");
    assert(Boolean(publishJson.data.published_at), "published_at timestamp is set");

    // Job should now be accessible publicly
    const publicPublishedRes = await fetch(`${baseUrl}/api/jobs/${publishJson.data.slug}`);
    assert(publicPublishedRes.status === 200, "Newly published job is now accessible via public API");

    // Close job
    const closeRes = await fetch(`${baseUrl}/api/admin/jobs/${testJobId}/close`, {
      method: "POST",
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const closeJson = await closeRes.json();
    assert(closeRes.status === 200, "Closing published job returns 200");
    assert(closeJson.data.status === "CLOSED", "Status transitioned to CLOSED");

    // Closed job is no longer accessible via public API
    const publicClosedRes = await fetch(`${baseUrl}/api/jobs/${publishJson.data.slug}`);
    assert(publicClosedRes.status === 404, "Closed job is no longer returned on public API");

    // Closing a DRAFT job should fail
    const closeDraftRes = await fetch(`${baseUrl}/api/admin/jobs/${draftJson.data.id}/close`, {
      method: "POST",
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(closeDraftRes.status === 400, "Attempting to close a DRAFT job fails with 400");

    // Re-publish closed job -> 200 OK
    const republishRes = await fetch(`${baseUrl}/api/admin/jobs/${testJobId}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(republishRes.status === 200, "Re-publishing a CLOSED job succeeds with 200");

    // Archive job
    const archiveRes = await fetch(`${baseUrl}/api/admin/jobs/${testJobId}/archive`, {
      method: "POST",
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const archiveJson = await archiveRes.json();
    assert(archiveRes.status === 200, "Archiving job returns 200");
    assert(archiveJson.data.status === "ARCHIVED", "Status transitioned to ARCHIVED");

    // Attempting to publish an ARCHIVED job directly should fail
    const publishArchivedRes = await fetch(`${baseUrl}/api/admin/jobs/${testJobId}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(publishArchivedRes.status === 400, "Publishing an ARCHIVED job fails with 400");

    // 9. Taxonomy Admin CRUD
    console.log("\n[Test Suite 7: Category & Skill Admin CRUD]");

    const uniqueCatName = `Security & Cryptography ${Date.now()}`;
    // Create Category
    const createCatRes = await fetch(`${baseUrl}/api/admin/job-categories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: uniqueCatName,
        description: "Zero-knowledge proofs and cloud security",
        display_order: 15,
      }),
    });
    const createCatJson = await createCatRes.json();
    assert(createCatRes.status === 201, "Admin creating category returns 201");
    assert(createCatJson.data.slug.startsWith("security-cryptography"), "Category slug automatically generated");

    // Prevent duplicate category name
    const dupCatRes = await fetch(`${baseUrl}/api/admin/job-categories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: uniqueCatName,
      }),
    });
    assert(dupCatRes.status === 400, "Duplicate category name is rejected with 400");

    const uniqueSkillName = `Kubernetes ${Date.now()}`;
    // Create Skill
    const createSkillRes = await fetch(`${baseUrl}/api/admin/skills`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: uniqueSkillName,
      }),
    });
    const createSkillJson = await createSkillRes.json();
    assert(createSkillRes.status === 201, "Admin creating skill returns 201");
    assert(createSkillJson.data.slug.startsWith("kubernetes"), "Skill slug automatically generated");

    // Delete category with dependent jobs should fail
    const deleteUsedCatRes = await fetch(`${baseUrl}/api/admin/job-categories/${devCategory.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(deleteUsedCatRes.status === 400, "Deleting category referenced by jobs is blocked with 400");

    // Delete unused category should succeed
    const deleteUnusedCatRes = await fetch(`${baseUrl}/api/admin/job-categories/${createCatJson.data.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(deleteUnusedCatRes.status === 200, "Deleting unreferenced category returns 200");

    // 10. Job Deletion & Cascade
    console.log("\n[Test Suite 8: Job Deletion & Cascade]");
    const deleteJobRes = await fetch(`${baseUrl}/api/admin/jobs/${testJobId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(deleteJobRes.status === 200, "Deleting job returns 200");

    const verifyDeleted = await fetch(`${baseUrl}/api/admin/jobs/${testJobId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(verifyDeleted.status === 404, "Deleted job is no longer found (404)");

    // =========================================================================
    // AUDIT SUITE 9: Complete Publication Validation (All 9 Requirements Tested Individually)
    // =========================================================================
    console.log("\n[Test Suite 9: Mandatory Publication Validation (All 9 Requirements)]");

    // Helper to create fresh draft jobs for validation testing
    async function createDraftWithOverrides(overrides: Record<string, any>) {
      const base = {
        title: "Staff Reliability Engineer",
        category_id: devCategory.id,
        description: "Maintain core Kubernetes infrastructure and pipelines",
        requirements: "3+ years Terraform, Docker, and CI/CD",
        location: "Austin, TX / Remote",
        workplace_type: "HYBRID",
        employment_type: "FULL_TIME",
        application_deadline: new Date(Date.now() + 60 * 86400000).toISOString(),
        skill_ids: [testSkill1.id],
      };
      const res = await fetch(`${baseUrl}/api/admin/jobs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${recruiterToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...base, ...overrides }),
      });
      return res.json();
    }

    // Helper to verify publish failure keeps DRAFT status and null published_at
    async function assertPublishFailure(jobId: string, testName: string, expectedErrorKeyword: string) {
      const pubRes = await fetch(`${baseUrl}/api/admin/jobs/${jobId}/publish`, {
        method: "POST",
        headers: { Authorization: `Bearer ${recruiterToken}` },
      });
      const pubJson = await pubRes.json();
      assert(pubRes.status === 400, `${testName} returns 400`);
      assert(
        pubJson.message.toLowerCase().includes(expectedErrorKeyword.toLowerCase()),
        `${testName} error message references '${expectedErrorKeyword}'`
      );

      // Verify job status remains DRAFT and published_at is null
      const checkRes = await fetch(`${baseUrl}/api/admin/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      });
      const checkJson = await checkRes.json();
      assert(checkJson.data.status === "DRAFT", `${testName}: job status remains DRAFT`);
      assert(checkJson.data.published_at === null, `${testName}: published_at remains null`);
    }

    // 1. Missing title
    const jobNoTitle = await createDraftWithOverrides({ title: "Temporary Title" });
    await fetch(`${baseUrl}/api/admin/jobs/${jobNoTitle.data.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${recruiterToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ title: "   " }),
    });
    await assertPublishFailure(jobNoTitle.data.id, "Publish without title", "title");

    // 2. Missing category_id
    const jobNoCategory = await createDraftWithOverrides({ category_id: null });
    await assertPublishFailure(jobNoCategory.data.id, "Publish without category_id", "category");

    // 3. Inactive category_id
    const inactiveCatRes = await fetch(`${baseUrl}/api/admin/job-categories`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: `Inactive Category ${Date.now()}`, is_active: false }),
    });
    const inactiveCatJson = await inactiveCatRes.json();
    const jobInactiveCat = await createDraftWithOverrides({ category_id: inactiveCatJson.data.id });
    await assertPublishFailure(jobInactiveCat.data.id, "Publish with inactive category", "inactive");

    // 4. Missing description
    const jobNoDesc = await createDraftWithOverrides({ description: null });
    await assertPublishFailure(jobNoDesc.data.id, "Publish without description", "description");

    // 5. Missing requirements
    const jobNoReqs = await createDraftWithOverrides({ requirements: null });
    await assertPublishFailure(jobNoReqs.data.id, "Publish without requirements", "requirements");

    // 6. Missing location
    const jobNoLoc = await createDraftWithOverrides({ location: null });
    await assertPublishFailure(jobNoLoc.data.id, "Publish without location", "location");

    // 7. Missing/invalid workplace_type
    const jobNoWorkplace = await createDraftWithOverrides({ workplace_type: null });
    await assertPublishFailure(jobNoWorkplace.data.id, "Publish without workplace_type", "workplace");

    // 8. Missing/invalid employment_type
    const jobNoEmployment = await createDraftWithOverrides({ employment_type: null });
    await assertPublishFailure(jobNoEmployment.data.id, "Publish without employment_type", "employment");

    // 9. Missing application_deadline
    const jobNoDeadline = await createDraftWithOverrides({ application_deadline: null });
    await assertPublishFailure(jobNoDeadline.data.id, "Publish without application_deadline", "deadline");

    // 10. Past application_deadline
    const jobPastDeadline = await createDraftWithOverrides({
      application_deadline: new Date(Date.now() - 7 * 86400000).toISOString(),
    });
    await assertPublishFailure(jobPastDeadline.data.id, "Publish with past application_deadline", "future");

    // 11. Zero skills attached
    const jobZeroSkills = await createDraftWithOverrides({ skill_ids: [] });
    await assertPublishFailure(jobZeroSkills.data.id, "Publish with zero skills attached", "skill");

    // 12. Only inactive skills attached
    const inactiveSkillRes = await fetch(`${baseUrl}/api/admin/skills`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: `Legacy Inactive Tech ${Date.now()}`, is_active: false }),
    });
    const inactiveSkillJson = await inactiveSkillRes.json();
    const jobInactiveSkill = await createDraftWithOverrides({ skill_ids: [inactiveSkillJson.data.id] });
    await assertPublishFailure(jobInactiveSkill.data.id, "Publish with only inactive skills", "active skill");

    // =========================================================================
    // AUDIT SUITE 10: First-Time Publication & Timestamp Immutability
    // =========================================================================
    console.log("\n[Test Suite 10: First Publication & published_at Immutability]");
    const auditPubJob = await createDraftWithOverrides({ title: "Principal Cryptographic Engineer" });
    const auditPubId = auditPubJob.data.id;

    // Publish valid job
    const auditPubRes = await fetch(`${baseUrl}/api/admin/jobs/${auditPubId}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const auditPubJson = await auditPubRes.json();
    assert(auditPubRes.status === 200, "Publishing valid job succeeds with 200");
    assert(auditPubJson.data.status === "PUBLISHED", "Job status is PUBLISHED");
    assert(Boolean(auditPubJson.data.published_at), "published_at timestamp is set on publication");
    const firstPublishedAt = auditPubJson.data.published_at;

    // Small delay to ensure timestamp comparison is meaningful
    await new Promise((r) => setTimeout(r, 50));

    // Update job content via PUT
    const editPubRes = await fetch(`${baseUrl}/api/admin/jobs/${auditPubId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${recruiterToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Principal Cryptographic Engineer (Senior)",
        description: "Updated technical mission for cryptographic engineer",
      }),
    });
    const editPubJson = await editPubRes.json();
    assert(editPubRes.status === 200, "Updating published job returns 200");
    assert(
      new Date(editPubJson.data.published_at).getTime() === new Date(firstPublishedAt).getTime(),
      "published_at is NOT overwritten on subsequent edits"
    );

    // Close job
    const closePubRes = await fetch(`${baseUrl}/api/admin/jobs/${auditPubId}/close`, {
      method: "POST",
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(closePubRes.status === 200, "Closing job returns 200");

    // Re-publish job
    const repubPubRes = await fetch(`${baseUrl}/api/admin/jobs/${auditPubId}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const repubPubJson = await repubPubRes.json();
    assert(repubPubRes.status === 200, "Re-publishing CLOSED job returns 200");
    assert(
      new Date(repubPubJson.data.published_at).getTime() === new Date(firstPublishedAt).getTime(),
      "published_at remains original publication timestamp upon re-publication"
    );

    // =========================================================================
    // AUDIT SUITE 11: Status Transition Authorization & Enforcement
    // =========================================================================
    console.log("\n[Test Suite 11: Status Transition Rules & Archiving Authorization]");

    // 1. CONTENT_WRITER attempting POST /api/admin/jobs/:id/archive -> 403 Forbidden
    const writerArchiveRes = await fetch(`${baseUrl}/api/admin/jobs/${auditPubId}/archive`, {
      method: "POST",
      headers: { Authorization: `Bearer ${writerToken}` },
    });
    assert(writerArchiveRes.status === 403, "CONTENT_WRITER calling POST /:id/archive returns 403 Forbidden");

    // 2. Unprivileged user attempting POST /api/admin/jobs/:id/archive -> 403 Forbidden
    const unprivArchiveRes = await fetch(`${baseUrl}/api/admin/jobs/${auditPubId}/archive`, {
      method: "POST",
      headers: { Authorization: `Bearer ${unprivilegedToken}` },
    });
    assert(unprivArchiveRes.status === 403, "Unprivileged user calling POST /:id/archive returns 403 Forbidden");

    // 3. CONTENT_WRITER attempting archive via generic PUT /:id with status: ARCHIVED -> 403 Forbidden
    const writerPutArchiveRes = await fetch(`${baseUrl}/api/admin/jobs/${auditPubId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${writerToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ARCHIVED" }),
    });
    assert(writerPutArchiveRes.status === 403, "CONTENT_WRITER sending status: ARCHIVED via PUT returns 403 Forbidden");

    // 4. User with jobs.update (Recruiter) archives job -> 200 OK
    const recruiterArchiveRes = await fetch(`${baseUrl}/api/admin/jobs/${auditPubId}/archive`, {
      method: "POST",
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const recruiterArchiveJson = await recruiterArchiveRes.json();
    assert(recruiterArchiveRes.status === 200, "User with jobs.update can archive job (returns 200)");
    assert(recruiterArchiveJson.data.status === "ARCHIVED", "Job status transitioned to ARCHIVED");

    // 5. Archiving already-archived job -> 400 Bad Request
    const doubleArchiveRes = await fetch(`${baseUrl}/api/admin/jobs/${auditPubId}/archive`, {
      method: "POST",
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(doubleArchiveRes.status === 400, "Archiving already-archived job returns 400 Bad Request");

    // 6. Publishing an ARCHIVED job directly -> 400 Bad Request
    const pubArchivedRes = await fetch(`${baseUrl}/api/admin/jobs/${auditPubId}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(pubArchivedRes.status === 400, "Publishing an ARCHIVED job returns 400 Bad Request");

    // 7. Modifying an ARCHIVED job via PUT -> 400 Bad Request
    const putArchivedRes = await fetch(`${baseUrl}/api/admin/jobs/${auditPubId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${recruiterToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Cannot Edit Archived Job" }),
    });
    assert(putArchivedRes.status === 400, "Updating an ARCHIVED job returns 400 Bad Request");

    // 8. Reverting PUBLISHED job back to DRAFT via PUT -> 400 Bad Request
    const freshJobToPublish = await createDraftWithOverrides({ title: "Temporary Publish Revert Test" });
    await fetch(`${baseUrl}/api/admin/jobs/${freshJobToPublish.data.id}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const revertToDraftRes = await fetch(`${baseUrl}/api/admin/jobs/${freshJobToPublish.data.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${recruiterToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DRAFT" }),
    });
    assert(revertToDraftRes.status === 400, "Reverting PUBLISHED job to DRAFT is rejected with 400 Bad Request");

    // =========================================================================
    // AUDIT SUITE 12: Category & Skill Relational Deletion Safety
    // =========================================================================
    console.log("\n[Test Suite 12: Category & Skill Relational Deletion Safety]");

    // 1. Attempt to delete category referenced by job -> 400 Bad Request
    const delCatWithJobsRes = await fetch(`${baseUrl}/api/admin/job-categories/${devCategory.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const delCatWithJobsJson = await delCatWithJobsRes.json();
    assert(delCatWithJobsRes.status === 400, "Deleting category referenced by jobs returns 400 Bad Request");
    assert(
      delCatWithJobsJson.message.toLowerCase().includes("job") || delCatWithJobsJson.message.toLowerCase().includes("associated"),
      "Error message explains deletion blocked due to existing job associations"
    );

    // 2. Attempt to delete skill referenced by job -> 400 Bad Request
    const delSkillWithJobsRes = await fetch(`${baseUrl}/api/admin/skills/${testSkill1.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const delSkillWithJobsJson = await delSkillWithJobsRes.json();
    assert(delSkillWithJobsRes.status === 400, "Deleting skill referenced by jobs returns 400 Bad Request");
    assert(
      delSkillWithJobsJson.message.toLowerCase().includes("job") || delSkillWithJobsJson.message.toLowerCase().includes("associated"),
      "Error message explains deletion blocked due to existing job associations"
    );

    // 3. Create and delete unreferenced category -> 200 OK
    const unrefCatRes = await fetch(`${baseUrl}/api/admin/job-categories`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: `Unreferenced Category ${Date.now()}` }),
    });
    const unrefCatJson = await unrefCatRes.json();
    const delUnrefCatRes = await fetch(`${baseUrl}/api/admin/job-categories/${unrefCatJson.data.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(delUnrefCatRes.status === 200, "Deleting unreferenced category returns 200 OK");

    // 4. Create and delete unreferenced skill -> 200 OK
    const unrefSkillRes = await fetch(`${baseUrl}/api/admin/skills`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: `Unreferenced Skill ${Date.now()}` }),
    });
    const unrefSkillJson = await unrefSkillRes.json();
    const delUnrefSkillRes = await fetch(`${baseUrl}/api/admin/skills/${unrefSkillJson.data.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(delUnrefSkillRes.status === 200, "Deleting unreferenced skill returns 200 OK");

    // =========================================================================
    // AUDIT SUITE 13: Exhaustive CONTENT_WRITER Malicious Request Checks
    // =========================================================================
    console.log("\n[Test Suite 13: Exhaustive CONTENT_WRITER Security Verification]");

    const cwTargetJob = await createDraftWithOverrides({ title: "Target For Content Writer Security" });
    const cwTargetId = cwTargetJob.data.id;

    // Test malicious field manipulation requests where CONTENT_WRITER directly submits forbidden fields:
    const forbiddenFieldTests: Array<{ field: string; payload: Record<string, any> }> = [
      { field: "category_id", payload: { category_id: devCategory.id } },
      { field: "status", payload: { status: "PUBLISHED" } },
      { field: "published_at", payload: { published_at: new Date().toISOString() } },
      { field: "location", payload: { location: "Malicious Location Entry" } },
      { field: "workplace_type", payload: { workplace_type: "ONSITE" } },
      { field: "employment_type", payload: { employment_type: "PART_TIME" } },
      { field: "application_deadline", payload: { application_deadline: new Date().toISOString() } },
      { field: "skill_ids", payload: { skill_ids: [testSkill1.id] } },
      { field: "created_by", payload: { created_by: "hacker-user-id" } },
      { field: "updated_by", payload: { updated_by: "hacker-user-id" } },
    ];

    for (const testCase of forbiddenFieldTests) {
      const res = await fetch(`${baseUrl}/api/admin/jobs/${cwTargetId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${writerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testCase.payload),
      });
      assert(
        res.status === 403,
        `CONTENT_WRITER forbidden from modifying '${testCase.field}' directly (returns 403 Forbidden)`
      );
    }

    // Verify CONTENT_WRITER is forbidden from calling privileged lifecycle endpoints:
    const cwCreateRes = await fetch(`${baseUrl}/api/admin/jobs`, {
      method: "POST",
      headers: { Authorization: `Bearer ${writerToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Unauthorized Create" }),
    });
    assert(cwCreateRes.status === 403, "CONTENT_WRITER calling POST /api/admin/jobs returns 403 Forbidden");

    const cwPubRes = await fetch(`${baseUrl}/api/admin/jobs/${cwTargetId}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${writerToken}` },
    });
    assert(cwPubRes.status === 403, "CONTENT_WRITER calling POST /:id/publish returns 403 Forbidden");

    const cwCloseRes = await fetch(`${baseUrl}/api/admin/jobs/${cwTargetId}/close`, {
      method: "POST",
      headers: { Authorization: `Bearer ${writerToken}` },
    });
    assert(cwCloseRes.status === 403, "CONTENT_WRITER calling POST /:id/close returns 403 Forbidden");

    const cwArchiveEndpointRes = await fetch(`${baseUrl}/api/admin/jobs/${cwTargetId}/archive`, {
      method: "POST",
      headers: { Authorization: `Bearer ${writerToken}` },
    });
    assert(cwArchiveEndpointRes.status === 403, "CONTENT_WRITER calling POST /:id/archive returns 403 Forbidden");

    const cwDeleteRes = await fetch(`${baseUrl}/api/admin/jobs/${cwTargetId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${writerToken}` },
    });
    assert(cwDeleteRes.status === 403, "CONTENT_WRITER calling DELETE /api/admin/jobs/:id returns 403 Forbidden");

    // Verify CONTENT_WRITER can legitimately update permitted fields:
    const cwValidRes = await fetch(`${baseUrl}/api/admin/jobs/${cwTargetId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${writerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Legitimately Edited Title by Writer",
        description: "Legitimately edited comprehensive description",
        requirements: "Legitimately edited requirements list",
      }),
    });
    assert(cwValidRes.status === 200, "CONTENT_WRITER editing ONLY permitted fields succeeds with 200 OK");

  } finally {
    server.close();
  }

  console.log("==================================================");
  console.log(`Phase 3 Tests Finished: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase3Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
