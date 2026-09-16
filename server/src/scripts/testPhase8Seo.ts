import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { createApp } from "../app.js";
import { userRepository } from "../repositories/user.repository.js";
import { blogRepository } from "../repositories/blog.repository.js";
import { seoRepository } from "../repositories/seo.repository.js";
import { seedDatabase } from "../db/seed.js";
import { runMigrations } from "../db/migrate.js";
import { getDb } from "../db/index.js";
import { sqliteSchema, pgSchema } from "../db/schema.js";
import config from "../config/index.js";
import { computeBlogPostSeo } from "../../../src/utils/seoRenderer.js";
import type { Server } from "http";

async function runPhase8Tests() {
  console.log("==================================================");
  console.log("Starting Phase 8 SEO Metadata Tests");
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

  // Clean test-specific records
  await (db as any).delete(tables.seoMetadata);
  await (db as any).delete(tables.blogPostTags);
  await (db as any).delete(tables.blogPosts);
  await (db as any).delete(tables.blogTags);
  await (db as any).delete(tables.blogCategories);

  // Start test server on port 3097
  const app = createApp();
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(3097, "127.0.0.1", () => resolve(s));
  });

  const baseUrl = "http://127.0.0.1:3097";

  try {
    // 2. Setup test users and assign roles
    console.log("\n[Test Setup: Users and Roles]");
    const superAdminToken = "dev-test:p8-superadmin:p8super@saras.com:Super Admin Steve";
    const adminToken = "dev-test:p8-admin:p8admin@saras.com:Admin Alice";
    const recruiterToken = "dev-test:p8-recruiter:p8rec@saras.com:Recruiter Ron";
    const writer1Token = "dev-test:p8-writer1:p8writer1@saras.com:Writer Wayne";
    const writer2Token = "dev-test:p8-writer2:p8writer2@saras.com:Writer Wanda";
    const candidateToken = "dev-test:p8-candidate:p8cand@saras.com:Candidate Chloe";

    // Sync users
    for (const [token, roleName] of [
      [superAdminToken, "SUPER_ADMIN"],
      [adminToken, "ADMIN"],
      [recruiterToken, "RECRUITER"],
      [writer1Token, "CONTENT_WRITER"],
      [writer2Token, "CONTENT_WRITER"],
      [candidateToken, null],
    ] as const) {
      const res = await fetch(`${baseUrl}/api/auth/sync`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as any;
      const userId = data.data.user.id;

      if (roleName) {
        await userRepository.assignRoleByName(userId, roleName);
      }
    }
    assert(true, "Setup: test users synced and roles assigned");

    const writer1User = await userRepository.findByEmail("p8writer1@saras.com");
    const writer2User = await userRepository.findByEmail("p8writer2@saras.com");

    // 3. Setup Category & Blog Posts
    const category = await blogRepository.createCategory({
      name: "Engineering Scalability",
      slug: "engineering-scalability",
      description: "Architecture and infrastructure articles",
      is_active: true,
      display_order: 1,
    });

    // Create Post 1 owned by Writer 1
    const post1 = await blogRepository.createPost({
      title: "Building Resilient Event-Driven Architectures",
      slug: "building-resilient-event-driven-architectures",
      excerpt: "Deep architectural principles for building zero-data-loss distributed message pipelines.",
      content: "Complete guide on event sourcing, CQRS, idempotency keys, and dead-letter queues.",
      category_id: category.id,
      author_id: writer1User!.id,
      status: "DRAFT",
    });

    // Create Post 2 owned by Writer 2
    const post2 = await blogRepository.createPost({
      title: "Modern TypeScript Monorepo Tooling",
      slug: "modern-typescript-monorepo-tooling",
      excerpt: "Optimizing CI/CD pipelines across large distributed TypeScript microservices.",
      content: "Deep exploration of TurboRepo, Nx, caching strategies, and fast compilation.",
      category_id: category.id,
      author_id: writer2User!.id,
      status: "DRAFT",
    });

    assert(Boolean(post1 && post2), "Setup: Blog posts created for testing");

    /* =========================================================================
     * SUITE 1: Schema & Relational Integrity (1:0..1 and Cascade Delete)
     * ========================================================================= */
    console.log("\n[Suite 1: Schema & Relational Integrity]");

    // Create SEO record directly via repository
    const seoRecord = await seoRepository.create({
      blog_post_id: post1.id,
      meta_title: "Event-Driven Architectures | Saras Dynamics",
      meta_description: "Learn how to build fault-tolerant event-driven distributed systems.",
      canonical_url: "https://sarasdynamics.com/blog/building-resilient-event-driven-architectures",
      og_title: "Social: Event-Driven Architectures",
      og_description: "Social summary for event-driven systems.",
      og_image_url: "https://cdn.sarasdynamics.com/images/eda-cover.png",
    });

    assert(Boolean(seoRecord && seoRecord.id), "Schema: Created SEO record in database");
    assert(seoRecord.blog_post_id === post1.id, "Schema: blog_post_id matches parent post");
    assert(seoRecord.meta_title === "Event-Driven Architectures | Saras Dynamics", "Schema: meta_title saved correctly");

    // Test 1:0..1 unique constraint: Attempting a second insert for the same blog_post_id must fail
    let duplicateFailed = false;
    try {
      await seoRepository.create({
        blog_post_id: post1.id,
        meta_title: "Duplicate SEO record",
        meta_description: "This should fail due to unique constraint.",
      });
    } catch {
      duplicateFailed = true;
    }
    assert(duplicateFailed, "Integrity: 1:0..1 unique constraint prevents multiple SEO records per post");

    // Clean up direct repository record
    await seoRepository.deleteByBlogPostId(post1.id);
    const cleanedSeo = await seoRepository.findByBlogPostId(post1.id);
    assert(cleanedSeo === null, "Integrity: Deleting SEO metadata leaves blog post intact");
    const survivingPost = await blogRepository.findPostById(post1.id);
    assert(survivingPost !== null, "Integrity: Parent blog post still exists after SEO deletion");

    /* =========================================================================
     * SUITE 2: RBAC & Authentication on SEO Endpoints
     * ========================================================================= */
    console.log("\n[Suite 2: RBAC & Authentication]");

    // 2.1 Unauthenticated requests return 401
    const unauthGet = await fetch(`${baseUrl}/api/admin/blog/${post1.id}/seo`);
    assert(unauthGet.status === 401, "RBAC: Unauthenticated GET /api/admin/blog/:id/seo returns 401");

    const unauthPut = await fetch(`${baseUrl}/api/admin/blog/${post1.id}/seo`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meta_title: "T", meta_description: "D" }),
    });
    assert(unauthPut.status === 401, "RBAC: Unauthenticated PUT /api/admin/blog/:id/seo returns 401");

    const unauthDel = await fetch(`${baseUrl}/api/admin/blog/${post1.id}/seo`, {
      method: "DELETE",
    });
    assert(unauthDel.status === 401, "RBAC: Unauthenticated DELETE /api/admin/blog/:id/seo returns 401");

    // 2.2 RECRUITER (has no seo.* permissions) returns 403
    const recruiterGet = await fetch(`${baseUrl}/api/admin/blog/${post1.id}/seo`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(recruiterGet.status === 403, "RBAC: RECRUITER GET /seo returns 403 Forbidden");

    const recruiterPut = await fetch(`${baseUrl}/api/admin/blog/${post1.id}/seo`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ meta_title: "Recruiter SEO", meta_description: "Desc" }),
    });
    assert(recruiterPut.status === 403, "RBAC: RECRUITER PUT /seo returns 403 Forbidden");

    // 2.3 CANDIDATE returns 403
    const candidateGet = await fetch(`${baseUrl}/api/admin/blog/${post1.id}/seo`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    assert(candidateGet.status === 403, "RBAC: CANDIDATE GET /seo returns 403 Forbidden");

    // 2.4 CONTENT_WRITER (has seo.read and seo.update) can manage SEO for own post
    const writerGetEmpty = await fetch(`${baseUrl}/api/admin/blog/${post1.id}/seo`, {
      headers: { Authorization: `Bearer ${writer1Token}` },
    });
    assert(writerGetEmpty.status === 200, "RBAC: CONTENT_WRITER can GET SEO for own post (200 OK)");
    const writerEmptyBody = (await writerGetEmpty.json()) as any;
    assert(writerEmptyBody.data === null, "RBAC: Initial GET SEO returns null when no record exists");

    // 2.5 Alternative route format: /api/admin/blog/posts/:id/seo
    const altRouteGet = await fetch(`${baseUrl}/api/admin/blog/posts/${post1.id}/seo`, {
      headers: { Authorization: `Bearer ${writer1Token}` },
    });
    assert(altRouteGet.status === 200, "Routing: /api/admin/blog/posts/:id/seo route also works");

    /* =========================================================================
     * SUITE 3: Validation Rules & Strict Protocol Security
     * ========================================================================= */
    console.log("\n[Suite 3: Validation Rules & Protocol Security]");

    // 3.1 meta_title required
    const emptyTitleRes = await fetch(`${baseUrl}/api/admin/blog/${post1.id}/seo`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${writer1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meta_title: "   ",
        meta_description: "Valid description for the post.",
      }),
    });
    assert(emptyTitleRes.status === 400, "Validation: Whitespace or empty meta_title rejected with 400");

    // 3.2 meta_title max length 60
    const longTitleRes = await fetch(`${baseUrl}/api/admin/blog/${post1.id}/seo`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${writer1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meta_title: "A".repeat(61),
        meta_description: "Valid description for the post.",
      }),
    });
    assert(longTitleRes.status === 400, "Validation: meta_title > 60 chars rejected with 400");

    // 3.3 meta_description required
    const emptyDescRes = await fetch(`${baseUrl}/api/admin/blog/${post1.id}/seo`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${writer1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meta_title: "Valid Meta Title",
        meta_description: "   ",
      }),
    });
    assert(emptyDescRes.status === 400, "Validation: Whitespace or empty meta_description rejected with 400");

    // 3.4 meta_description max length 160
    const longDescRes = await fetch(`${baseUrl}/api/admin/blog/${post1.id}/seo`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${writer1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meta_title: "Valid Meta Title",
        meta_description: "B".repeat(161),
      }),
    });
    assert(longDescRes.status === 400, "Validation: meta_description > 160 chars rejected with 400");

    // 3.5 og_title max length 60
    const longOgTitleRes = await fetch(`${baseUrl}/api/admin/blog/${post1.id}/seo`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${writer1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meta_title: "Valid Meta Title",
        meta_description: "Valid Meta Description",
        og_title: "C".repeat(61),
      }),
    });
    assert(longOgTitleRes.status === 400, "Validation: og_title > 60 chars rejected with 400");

    // 3.6 og_description max length 160
    const longOgDescRes = await fetch(`${baseUrl}/api/admin/blog/${post1.id}/seo`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${writer1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meta_title: "Valid Meta Title",
        meta_description: "Valid Meta Description",
        og_description: "D".repeat(161),
      }),
    });
    assert(longOgDescRes.status === 400, "Validation: og_description > 160 chars rejected with 400");

    // 3.7 URL Protocol Security: canonical_url
    for (const badUrl of [
      "javascript:alert(document.cookie)",
      "data:text/html,<script>alert(1)</script>",
      "file:///etc/passwd",
      "ftp://ftp.example.com/file",
      "/relative/path/not/absolute",
      "not-even-a-url",
    ]) {
      const badCanonicalRes = await fetch(`${baseUrl}/api/admin/blog/${post1.id}/seo`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${writer1Token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meta_title: "Valid Meta Title",
          meta_description: "Valid Meta Description",
          canonical_url: badUrl,
        }),
      });
      assert(badCanonicalRes.status === 400, `Security: Dangerous canonical_url (${badUrl.slice(0, 20)}) rejected with 400`);
    }

    // 3.8 URL Protocol Security: og_image_url
    for (const badImgUrl of [
      "javascript:malicious()",
      "data:image/svg+xml;utf8,<svg onload=alert(1)/>",
      "file:///root/secret.jpg",
      "/local/image.jpg",
    ]) {
      const badOgImgRes = await fetch(`${baseUrl}/api/admin/blog/${post1.id}/seo`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${writer1Token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meta_title: "Valid Meta Title",
          meta_description: "Valid Meta Description",
          og_image_url: badImgUrl,
        }),
      });
      assert(badOgImgRes.status === 400, `Security: Dangerous og_image_url (${badImgUrl.slice(0, 20)}) rejected with 400`);
    }

    /* =========================================================================
     * SUITE 4: IDOR & Ownership Protection
     * ========================================================================= */
    console.log("\n[Suite 4: IDOR & Ownership Protection]");

    // Writer 2 attempting to modify Writer 1's post SEO must return 403
    const idorPutRes = await fetch(`${baseUrl}/api/admin/blog/${post1.id}/seo`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${writer2Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meta_title: "Hacked by Writer 2",
        meta_description: "Writer 2 trying to hijack Writer 1 SEO",
      }),
    });
    assert(idorPutRes.status === 403, "IDOR: Writer 2 forbidden from updating Writer 1's SEO (403)");

    // Writer 2 attempting to delete Writer 1's post SEO must return 403
    const idorDelRes = await fetch(`${baseUrl}/api/admin/blog/${post1.id}/seo`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${writer2Token}` },
    });
    assert(idorDelRes.status === 403, "IDOR: Writer 2 forbidden from deleting Writer 1's SEO (403)");

    // Non-existent post ID returns 404
    const nonExistentId = randomUUID();
    const notFoundPut = await fetch(`${baseUrl}/api/admin/blog/${nonExistentId}/seo`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meta_title: "Phantom SEO",
        meta_description: "Trying to assign SEO to non-existent post",
      }),
    });
    assert(notFoundPut.status === 404, "Safety: Cannot attach SEO to non-existent blog post (404)");

    /* =========================================================================
     * SUITE 5: Upsert, Idempotency & Admin Oversight
     * ========================================================================= */
    console.log("\n[Suite 5: Upsert, Idempotency & Admin Oversight]");

    // 5.1 Valid creation by post author (Writer 1)
    const validCreateRes = await fetch(`${baseUrl}/api/admin/blog/${post1.id}/seo`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${writer1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meta_title: "  Event-Driven Architecture | Saras Dynamics  ",
        meta_description: "  Mastering event-driven systems with Kafka and event sourcing.  ",
        canonical_url: "https://sarasdynamics.com/blog/building-resilient-event-driven-architectures",
        og_title: "Event-Driven System Guide",
        og_description: "Detailed architecture blueprints for event streaming.",
        og_image_url: "https://cdn.sarasdynamics.com/eda-og.png",
      }),
    });
    assert(validCreateRes.status === 200, "Upsert: Writer 1 successfully saved SEO metadata (200 OK)");
    const createBody = (await validCreateRes.json()) as any;
    assert(createBody.data.meta_title === "Event-Driven Architecture | Saras Dynamics", "Trimming: meta_title trimmed");
    assert(createBody.data.meta_description === "Mastering event-driven systems with Kafka and event sourcing.", "Trimming: meta_description trimmed");
    assert(createBody.data.canonical_url === "https://sarasdynamics.com/blog/building-resilient-event-driven-architectures", "Data: canonical_url stored");

    // 5.2 Idempotent Update on same post
    const updateRes = await fetch(`${baseUrl}/api/admin/blog/${post1.id}/seo`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${writer1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meta_title: "Event-Driven Architecture Guide (Updated)",
        meta_description: "Updated concise description for search engines.",
        canonical_url: "https://sarasdynamics.com/blog/building-resilient-event-driven-architectures",
      }),
    });
    assert(updateRes.status === 200, "Upsert: Subsequent PUT updates existing SEO record in-place");
    const updateBody = (await updateRes.json()) as any;
    assert(updateBody.data.meta_title === "Event-Driven Architecture Guide (Updated)", "Data: Updated meta_title verified");

    // Verify in database that only ONE record exists for this post
    const dbRecords = await (db as any)
      .select()
      .from(tables.seoMetadata)
      .where(eq(tables.seoMetadata.blog_post_id, post1.id));
    assert(dbRecords.length === 1, "Idempotency: Exactly one SEO record exists for blog_post_id");

    // 5.3 Admin Oversight: ADMIN can update any writer's SEO
    const adminPutRes = await fetch(`${baseUrl}/api/admin/blog/${post1.id}/seo`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meta_title: "Curated by Admin: EDA Systems",
        meta_description: "Admin oversight updated this SEO description.",
      }),
    });
    assert(adminPutRes.status === 200, "Oversight: ADMIN can update SEO of Writer's post (200 OK)");

    // 5.4 SUPER_ADMIN can manage SEO
    const superAdminGet = await fetch(`${baseUrl}/api/admin/blog/${post1.id}/seo`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(superAdminGet.status === 200, "RBAC: SUPER_ADMIN can GET SEO (200 OK)");

    /* =========================================================================
     * SUITE 6: Public / Private Boundary & SEO Exposure
     * ========================================================================= */
    console.log("\n[Suite 6: Public / Private Boundary]");

    // Post 1 is currently in DRAFT status
    // Public endpoint by slug must return 404 (no leak of draft posts or draft SEO)
    const draftPublicRes = await fetch(`${baseUrl}/api/blog/posts/${post1.slug}`);
    assert(draftPublicRes.status === 404, "Public Boundary: DRAFT post is not publicly accessible (404)");

    // Publish Post 1
    await blogRepository.updatePost(post1.id, {
      status: "PUBLISHED",
      published_at: new Date(),
    });

    // Now public endpoint must return 200 and include the attached SEO metadata
    const publishedPublicRes = await fetch(`${baseUrl}/api/blog/posts/${post1.slug}`);
    assert(publishedPublicRes.status === 200, "Public Boundary: PUBLISHED post is accessible (200 OK)");
    const publicPostData = (await publishedPublicRes.json()) as any;
    assert(Boolean(publicPostData.data.seo), "Public Boundary: Public response includes attached seo object");
    assert(publicPostData.data.seo.meta_title === "Curated by Admin: EDA Systems", "Public Boundary: Public seo matches database record");

    // Archive Post 1
    await blogRepository.updatePost(post1.id, {
      status: "ARCHIVED",
    });

    // Public endpoint must now return 404 (no leak of archived posts or archived SEO)
    const archivedPublicRes = await fetch(`${baseUrl}/api/blog/posts/${post1.slug}`);
    assert(archivedPublicRes.status === 404, "Public Boundary: ARCHIVED post is not publicly accessible (404)");

    // Re-publish Post 1 for cascade deletion test
    await blogRepository.updatePost(post1.id, {
      status: "PUBLISHED",
    });

    /* =========================================================================
     * SUITE 7: Cascade Deletion on Post Delete
     * ========================================================================= */
    console.log("\n[Suite 7: Cascade Deletion]");

    // Verify SEO record exists prior to post deletion
    const seoBeforeDelete = await seoRepository.findByBlogPostId(post1.id);
    assert(seoBeforeDelete !== null, "Cascade: SEO record exists before post deletion");

    // Delete the blog post via Admin API
    const deletePostRes = await fetch(`${baseUrl}/api/admin/blog/posts/${post1.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(deletePostRes.status === 200, "Cascade: Blog post deleted successfully via Admin API");

    // Verify SEO record was automatically cascade-deleted
    const seoAfterDelete = await seoRepository.findByBlogPostId(post1.id);
    assert(seoAfterDelete === null, "Cascade: SEO metadata was cascade-deleted when blog post was deleted (no orphans)");

    /* =========================================================================
     * SUITE 8: Frontend Fallback Calculations
     * ========================================================================= */
    console.log("\n[Suite 8: Frontend Fallback Calculations]");

    const mockPostWithSeo: any = {
      id: "post-test-1",
      title: "Mastering Distributed Microservices",
      slug: "mastering-distributed-microservices",
      excerpt: "Deep architectural principles for building scalable systems.",
      featured_image_url: "https://cdn.example.com/featured.jpg",
      seo: {
        meta_title: "Custom Meta Title",
        meta_description: "Custom Meta Description",
        canonical_url: "https://sarasdynamics.com/blog/custom-canonical",
        og_title: "Custom OG Title",
        og_description: "Custom OG Description",
        og_image_url: "https://cdn.example.com/custom-og.png",
      },
    };

    const tagsWithSeo = computeBlogPostSeo(mockPostWithSeo);
    assert(tagsWithSeo.title === "Custom Meta Title", "Fallback: Custom meta_title used when present");
    assert(tagsWithSeo.metaDescription === "Custom Meta Description", "Fallback: Custom meta_description used when present");
    assert(tagsWithSeo.canonicalUrl === "https://sarasdynamics.com/blog/custom-canonical", "Fallback: Custom canonical_url used when present");
    assert(tagsWithSeo.ogTitle === "Custom OG Title", "Fallback: Custom og_title used when present");
    assert(tagsWithSeo.ogDescription === "Custom OG Description", "Fallback: Custom og_description used when present");
    assert(tagsWithSeo.ogImageUrl === "https://cdn.example.com/custom-og.png", "Fallback: Custom og_image_url used when present");

    const mockPostWithoutSeo: any = {
      id: "post-test-2",
      title: "Rust for Systems Engineering",
      slug: "rust-for-systems-engineering",
      excerpt: "Why Rust is replacing C++ in modern distributed telemetry infrastructure.",
      featured_image_url: "https://cdn.example.com/rust-cover.jpg",
      seo: null,
    };

    const tagsWithoutSeo = computeBlogPostSeo(mockPostWithoutSeo);
    assert(tagsWithoutSeo.title === "Rust for Systems Engineering", "Fallback: Missing meta_title falls back to post title");
    assert(tagsWithoutSeo.metaDescription === "Why Rust is replacing C++ in modern distributed telemetry infrastructure.", "Fallback: Missing meta_description falls back to post excerpt");
    assert(tagsWithoutSeo.ogTitle === "Rust for Systems Engineering", "Fallback: Missing og_title falls back to post title");
    assert(tagsWithoutSeo.ogDescription === "Why Rust is replacing C++ in modern distributed telemetry infrastructure.", "Fallback: Missing og_description falls back to post excerpt");
    assert(tagsWithoutSeo.ogImageUrl === "https://cdn.example.com/rust-cover.jpg", "Fallback: Missing og_image_url falls back to featured image URL");

  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  console.log("\n==================================================");
  console.log(`Phase 8 Test Results: ${passed} passed, ${failed} failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase8Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
