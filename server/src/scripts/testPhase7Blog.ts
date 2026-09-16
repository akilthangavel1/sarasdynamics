import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { createApp } from "../app.js";
import { userRepository } from "../repositories/user.repository.js";
import { blogRepository } from "../repositories/blog.repository.js";
import { storageService } from "../services/storage.service.js";
import { seedDatabase } from "../db/seed.js";
import { runMigrations } from "../db/migrate.js";
import { getDb } from "../db/index.js";
import { sqliteSchema, pgSchema } from "../db/schema.js";
import config from "../config/index.js";
import type { Server } from "http";

async function runPhase7Tests() {
  console.log("==================================================");
  console.log("Starting Phase 7 Blog & Content Management Tests");
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

  // Clean test-specific blog records
  await (db as any).delete(tables.blogPostTags);
  await (db as any).delete(tables.blogPosts);
  await (db as any).delete(tables.blogTags);
  await (db as any).delete(tables.blogCategories);

  // Start test server on port 3098
  const app = createApp();
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(3098, "127.0.0.1", () => resolve(s));
  });

  const baseUrl = "http://127.0.0.1:3098";

  // Minimal valid 1x1 PNG bytes for testing image upload
  const VALID_PNG_BUFFER = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );
  // Valid JPEG header bytes
  const VALID_JPEG_BUFFER = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
  ]);
  // Fake image (plain text file)
  const FAKE_IMAGE_BUFFER = Buffer.from("THIS IS NOT AN IMAGE FILE AT ALL");

  try {
    // 2. Setup test users and assign roles
    console.log("\n[Test Setup: Users and Roles]");
    const superAdminToken = "dev-test:p7-superadmin:p7super@saras.com:Super Admin Sam";
    const adminToken = "dev-test:p7-admin:p7admin@saras.com:Admin Alex";
    const writer1Token = "dev-test:p7-writer1:p7writer1@saras.com:Writer Will";
    const writer2Token = "dev-test:p7-writer2:p7writer2@saras.com:Writer Wendy";
    const candidateToken = "dev-test:p7-candidate:p7cand@saras.com:Candidate Chris";

    // Sync users
    for (const [token, roleName] of [
      [superAdminToken, "SUPER_ADMIN"],
      [adminToken, "ADMIN"],
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

    // Fetch user IDs
    const writer1User = await userRepository.findByEmail("p7writer1@saras.com");
    const writer2User = await userRepository.findByEmail("p7writer2@saras.com");

    /* =========================================================================
     * SUITE 1: RBAC & Authentication on Blog Endpoints
     * ========================================================================= */
    console.log("\n[Suite 1: RBAC & Authentication on Blog Endpoints]");

    // Unauthenticated access to admin blog
    const unauthRes = await fetch(`${baseUrl}/api/admin/blog/posts`);
    assert(unauthRes.status === 401, "RBAC: Unauthenticated GET /api/admin/blog/posts returns 401");

    // Unprivileged user access (CANDIDATE has no blog.* permissions)
    const unprivRes = await fetch(`${baseUrl}/api/admin/blog/posts`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    assert(unprivRes.status === 403, "RBAC: CANDIDATE GET /api/admin/blog/posts returns 403 Forbidden");

    // CONTENT_WRITER access
    const writerRes = await fetch(`${baseUrl}/api/admin/blog/posts`, {
      headers: { Authorization: `Bearer ${writer1Token}` },
    });
    assert(writerRes.status === 200, "RBAC: CONTENT_WRITER GET /api/admin/blog/posts returns 200 OK");

    /* =========================================================================
     * SUITE 2: Category Management (CRUD & Slug & Relational Safety)
     * ========================================================================= */
    console.log("\n[Suite 2: Category Management]");

    // Create Category via Admin API
    const createCatRes = await fetch(`${baseUrl}/api/admin/blog/categories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${writer1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Artificial Intelligence",
        description: "AI and machine learning insights",
        display_order: 1,
      }),
    });
    const catData = (await createCatRes.json()) as any;
    assert(createCatRes.status === 201, "Categories: CONTENT_WRITER creates category (201 Created)");
    assert(catData.data.slug === "artificial-intelligence", "Categories: Slug auto-generated correctly");
    const categoryAiId = catData.data.id;

    // Create second category with conflicting title to verify unique slug generation
    const createCat2Res = await fetch(`${baseUrl}/api/admin/blog/categories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${writer1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Artificial Intelligence",
        description: "Second category with same name",
        display_order: 2,
      }),
    });
    const cat2Data = (await createCat2Res.json()) as any;
    assert(createCat2Res.status === 201, "Categories: Duplicate category title succeeds with unique slug");
    assert(cat2Data.data.slug === "artificial-intelligence-2", "Categories: Slug collision resolved to '-2'");
    const category2Id = cat2Data.data.id;

    // Update Category
    const updateCatRes = await fetch(`${baseUrl}/api/admin/blog/categories/${category2Id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Cloud Systems & DevOps",
        slug: "cloud-systems",
        is_active: true,
      }),
    });
    const updatedCat = (await updateCatRes.json()) as any;
    assert(updateCatRes.status === 200, "Categories: Update category succeeds (200 OK)");
    assert(updatedCat.data.slug === "cloud-systems", "Categories: Explicit slug updated");

    // Delete unused category
    const deleteCatRes = await fetch(`${baseUrl}/api/admin/blog/categories/${category2Id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(deleteCatRes.status === 200, "Categories: Delete unused category succeeds (200 OK)");

    // Public categories endpoint lists only active
    const publicCatsRes = await fetch(`${baseUrl}/api/blog/categories`);
    const publicCats = (await publicCatsRes.json()) as any;
    assert(publicCatsRes.status === 200, "Categories: Public GET /api/blog/categories returns 200");
    assert(publicCats.data.length === 1, "Categories: Public list contains active category");

    /* =========================================================================
     * SUITE 3: Tag Management (CRUD & Relational Safety)
     * ========================================================================= */
    console.log("\n[Suite 3: Tag Management]");

    // Create Tags
    const createTag1Res = await fetch(`${baseUrl}/api/admin/blog/tags`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${writer1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Generative AI" }),
    });
    const tag1Data = (await createTag1Res.json()) as any;
    assert(createTag1Res.status === 201, "Tags: Create tag succeeds (201 Created)");
    assert(tag1Data.data.slug === "generative-ai", "Tags: Tag slug auto-generated correctly");
    const tag1Id = tag1Data.data.id;

    const createTag2Res = await fetch(`${baseUrl}/api/admin/blog/tags`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${writer1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "TypeScript" }),
    });
    const tag2Data = (await createTag2Res.json()) as any;
    const tag2Id = tag2Data.data.id;
    assert(createTag2Res.status === 201, "Tags: Create second tag succeeds (201 Created)");

    // Public tags endpoint
    const publicTagsRes = await fetch(`${baseUrl}/api/blog/tags`);
    const publicTags = (await publicTagsRes.json()) as any;
    assert(publicTagsRes.status === 200, "Tags: Public GET /api/blog/tags returns 200");
    assert(publicTags.data.length === 2, "Tags: Public tags count matches");

    /* =========================================================================
     * SUITE 4: Post Creation, Author Integrity & XSS Sanitization
     * ========================================================================= */
    console.log("\n[Suite 4: Post Creation & Security]");

    // Writer 1 creates draft post (attempting to spoof author_id should be ignored)
    const dirtyXssContent = `
      <p>Clean introductory paragraph.</p>
      <script>alert('XSS Attack!');</script>
      <iframe src="javascript:alert(1)"></iframe>
      <img src="https://example.com/pic.png" onerror="alert(2)" />
      <a href="javascript:alert('malicious')">Malicious Link</a>
      <a href="https://sarasdynamics.com/docs">Legitimate Link</a>
    `;

    const createPostRes = await fetch(`${baseUrl}/api/admin/blog/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${writer1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Autonomous Agents in Enterprise Systems",
        category_id: categoryAiId,
        excerpt: "Exploring multi-agent orchestration architectures.",
        content: dirtyXssContent,
        tag_ids: [tag1Id, tag2Id],
        author_id: "spoofed-fake-user-id", // should be ignored!
      }),
    });
    const post1Data = (await createPostRes.json()) as any;
    assert(createPostRes.status === 201, "Posts: Create post succeeds (201 Created)");
    assert(post1Data.data.author_id === writer1User!.id, "Security: Author strictly derived from authenticated token (spoof rejected)");
    assert(post1Data.data.status === "DRAFT", "Posts: Default status is DRAFT");
    assert(post1Data.data.published_at === null, "Posts: published_at is initially null");
    assert(post1Data.data.tags.length === 2, "Posts: Multiple tags attached correctly");

    // Verify Stored XSS Sanitization
    const savedContent = post1Data.data.content;
    assert(!savedContent.includes("<script>"), "Security: <script> tags thoroughly stripped from content");
    assert(!savedContent.includes("<iframe>"), "Security: <iframe> tags thoroughly stripped from content");
    assert(!savedContent.includes("onerror="), "Security: Inline event handlers stripped from tags");
    assert(!savedContent.includes("javascript:"), "Security: javascript: pseudo-protocol URIs stripped");
    assert(savedContent.includes("https://sarasdynamics.com/docs"), "Security: Legitimate safe links preserved");
    assert(savedContent.includes("Clean introductory paragraph"), "Security: Legitimate HTML tags preserved");

    const post1Id = post1Data.data.id;
    const post1Slug = post1Data.data.slug;
    assert(post1Slug === "autonomous-agents-in-enterprise-systems", "Posts: Post slug generated from title");

    // Slug collision test: Writer creates second post with same title
    const createPost2Res = await fetch(`${baseUrl}/api/admin/blog/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${writer1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Autonomous Agents in Enterprise Systems",
        category_id: categoryAiId,
        content: "<p>Second post with identical title.</p>",
        tag_ids: [tag1Id],
      }),
    });
    const post2Data = (await createPost2Res.json()) as any;
    assert(createPost2Res.status === 201, "Posts: Duplicate title post created");
    assert(post2Data.data.slug === "autonomous-agents-in-enterprise-systems-2", "Posts: Post slug collision handled safely with suffix");
    const post2Id = post2Data.data.id;

    /* =========================================================================
     * SUITE 5: Author Ownership & Oversight
     * ========================================================================= */
    console.log("\n[Suite 5: Author Ownership & Oversight]");

    // Writer 2 tries to update Writer 1's post -> 403 Forbidden
    const writer2UpdateRes = await fetch(`${baseUrl}/api/admin/blog/posts/${post1Id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${writer2Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "Writer 2 Hacked This" }),
    });
    assert(writer2UpdateRes.status === 403, "Ownership: Writer 2 forbidden from updating Writer 1's post (403)");

    // Writer 2 tries to delete Writer 1's post -> 403 Forbidden
    const writer2DeleteRes = await fetch(`${baseUrl}/api/admin/blog/posts/${post1Id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${writer2Token}` },
    });
    assert(writer2DeleteRes.status === 403, "Ownership: Writer 2 forbidden from deleting Writer 1's post (403)");

    // Writer 1 updates their own post -> 200 OK
    const writer1UpdateRes = await fetch(`${baseUrl}/api/admin/blog/posts/${post1Id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${writer1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "Autonomous Agents in Enterprise Systems (Revised)" }),
    });
    assert(writer1UpdateRes.status === 200, "Ownership: Writer 1 can update their own post (200 OK)");

    // Admin can update Writer 1's post -> 200 OK
    const adminUpdateRes = await fetch(`${baseUrl}/api/admin/blog/posts/${post1Id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ excerpt: "Admin revised excerpt." }),
    });
    assert(adminUpdateRes.status === 200, "Oversight: ADMIN can update any writer's post (200 OK)");

    /* =========================================================================
     * SUITE 6: Publishing Validation & Lifecycle
     * ========================================================================= */
    console.log("\n[Suite 6: Publishing Validation & Lifecycle]");

    // Create incomplete draft (missing category)
    const incompletePostRes = await fetch(`${baseUrl}/api/admin/blog/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${writer1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Draft Without Category",
        content: "<p>Has content</p>",
      }),
    });
    const incompletePost = (await incompletePostRes.json()) as any;

    // Publish attempt on incomplete post -> 400 Bad Request
    const failPublishRes = await fetch(`${baseUrl}/api/admin/blog/posts/${incompletePost.data.id}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${writer1Token}` },
    });
    assert(failPublishRes.status === 400, "Publishing: Missing category rejected with 400");

    // Publish valid post 1 -> 200 OK
    const publishRes = await fetch(`${baseUrl}/api/admin/blog/posts/${post1Id}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${writer1Token}` },
    });
    const publishedPost = (await publishRes.json()) as any;
    assert(publishRes.status === 200, "Publishing: Valid post published successfully (200 OK)");
    assert(publishedPost.data.status === "PUBLISHED", "Publishing: Status changed to PUBLISHED");
    assert(publishedPost.data.published_at !== null, "Publishing: published_at timestamp recorded");
    const originalPublishedAt = new Date(publishedPost.data.published_at).getTime();

    // Subsequent edit to published post preserves published_at timestamp
    const editPublishedRes = await fetch(`${baseUrl}/api/admin/blog/posts/${post1Id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${writer1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ excerpt: "Another excerpt update." }),
    });
    const editedPublished = (await editPublishedRes.json()) as any;
    const postPublishedAtAfterEdit = new Date(editedPublished.data.published_at).getTime();
    assert(
      postPublishedAtAfterEdit === originalPublishedAt,
      "Publishing: published_at timestamp is preserved on subsequent post updates"
    );

    // Archive post
    const archiveRes = await fetch(`${baseUrl}/api/admin/blog/posts/${post1Id}/archive`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const archivedPost = (await archiveRes.json()) as any;
    assert(archiveRes.status === 200, "Lifecycle: Archiving post returns 200 OK");
    assert(archivedPost.data.status === "ARCHIVED", "Lifecycle: Post status changed to ARCHIVED");
    assert(
      new Date(archivedPost.data.published_at).getTime() === originalPublishedAt,
      "Lifecycle: Archiving preserves original published_at timestamp"
    );

    // Re-publish post from ARCHIVED
    const republishRes = await fetch(`${baseUrl}/api/admin/blog/posts/${post1Id}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${writer1Token}` },
    });
    const republishedPost = (await republishRes.json()) as any;
    assert(republishRes.status === 200, "Lifecycle: Re-publishing archived post returns 200 OK");
    assert(republishedPost.data.status === "PUBLISHED", "Lifecycle: Status is back to PUBLISHED");
    assert(
      new Date(republishedPost.data.published_at).getTime() === originalPublishedAt,
      "Lifecycle: Re-publishing retains initial publication timestamp"
    );

    /* =========================================================================
     * SUITE 7: Public / Private Boundary & Data Isolation
     * ========================================================================= */
    console.log("\n[Suite 7: Public / Private Boundary]");

    // post 2 is still DRAFT
    // Public list should only contain post 1
    const publicPostsRes = await fetch(`${baseUrl}/api/blog/posts`);
    const publicPostsData = (await publicPostsRes.json()) as any;
    assert(publicPostsRes.status === 200, "Public Boundary: GET /api/blog/posts returns 200");
    assert(publicPostsData.data.length === 1, "Public Boundary: Only PUBLISHED posts are returned in public list");
    assert(publicPostsData.data[0].id === post1Id, "Public Boundary: Returned post is post 1");

    // Candidate user requesting DRAFT post by slug -> 404
    const draftBySlugRes = await fetch(`${baseUrl}/api/blog/posts/${post2Data.data.slug}`);
    assert(draftBySlugRes.status === 404, "Public Boundary: Accessing DRAFT post by slug returns 404 Not Found");

    // Candidate requesting PUBLISHED post by slug -> 200
    const publishedBySlugRes = await fetch(`${baseUrl}/api/blog/posts/${post1Data.data.slug}`);
    const publishedBySlugData = (await publishedBySlugRes.json()) as any;
    assert(publishedBySlugRes.status === 200, "Public Boundary: Accessing PUBLISHED post by slug returns 200 OK");
    assert(publishedBySlugData.data.content !== undefined, "Public Boundary: Full content included in single post view");

    // Verify privacy: author email and internal UID must NOT be exposed
    assert(publishedBySlugData.data.author.email === undefined, "Privacy: Author email NOT exposed in public API");
    assert(publishedBySlugData.data.author.firebase_uid === undefined, "Privacy: Author firebase_uid NOT exposed");
    assert(publishedBySlugData.data.author.full_name === "Writer Will", "Privacy: Author public full_name is exposed");

    // Test Search & Filters
    const searchRes = await fetch(`${baseUrl}/api/blog/posts?search=Autonomous`);
    const searchData = (await searchRes.json()) as any;
    assert(searchData.data.length === 1, "Search: Keyword query returns matching published post");

    const searchMissRes = await fetch(`${baseUrl}/api/blog/posts?search=QuantumPhysics12345`);
    const searchMissData = (await searchMissRes.json()) as any;
    assert(searchMissData.data.length === 0, "Search: Non-matching keyword query returns empty list");

    const categoryFilterRes = await fetch(`${baseUrl}/api/blog/posts?category=artificial-intelligence`);
    const categoryFilterData = (await categoryFilterRes.json()) as any;
    assert(categoryFilterData.data.length === 1, "Filter: Category slug filter returns matching posts");

    const tagFilterRes = await fetch(`${baseUrl}/api/blog/posts?tag=generative-ai`);
    const tagFilterData = (await tagFilterRes.json()) as any;
    assert(tagFilterData.data.length === 1, "Filter: Tag slug filter returns matching posts");

    /* =========================================================================
     * SUITE 8: S3 Featured Image Upload, Validation & Cleanup
     * ========================================================================= */
    console.log("\n[Suite 8: S3 Featured Image Integration]");

    // Upload invalid/fake image (reject magic bytes)
    const fakeImageFormData = new FormData();
    fakeImageFormData.append(
      "image",
      new Blob([FAKE_IMAGE_BUFFER], { type: "image/jpeg" }),
      "test.jpg"
    );

    const fakeUploadRes = await fetch(`${baseUrl}/api/admin/blog/posts/${post1Id}/featured-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${writer1Token}` },
      body: fakeImageFormData,
    });
    assert(fakeUploadRes.status === 400, "Image Validation: Fake image (bad magic bytes) rejected with 400");

    // Upload oversized image (> 5MB)
    const oversizedBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
    VALID_PNG_BUFFER.copy(oversizedBuffer, 0, 0, VALID_PNG_BUFFER.length);
    const oversizedFormData = new FormData();
    oversizedFormData.append(
      "image",
      new Blob([oversizedBuffer], { type: "image/png" }),
      "huge.png"
    );

    const oversizedUploadRes = await fetch(`${baseUrl}/api/admin/blog/posts/${post1Id}/featured-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${writer1Token}` },
      body: oversizedFormData,
    });
    assert(oversizedUploadRes.status === 400, "Image Validation: Oversized image (>5MB) rejected with 400");

    // Upload valid PNG image
    const validFormData = new FormData();
    validFormData.append(
      "image",
      new Blob([VALID_PNG_BUFFER], { type: "image/png" }),
      "header_photo.png"
    );

    const validUploadRes = await fetch(`${baseUrl}/api/admin/blog/posts/${post1Id}/featured-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${writer1Token}` },
      body: validFormData,
    });
    const uploadedData = (await validUploadRes.json()) as any;
    assert(validUploadRes.status === 200, "Image Upload: Valid PNG upload succeeds (200 OK)");
    assert(uploadedData.data.featured_image_key !== null, "Image Upload: featured_image_key set in database");
    assert(
      uploadedData.data.featured_image_key.startsWith(`blog/${post1Id}/`),
      `Image Storage: Key matches pattern blog/{postId}/{uuid}-{name} (${uploadedData.data.featured_image_key})`
    );
    const firstImageKey = uploadedData.data.featured_image_key;
    assert(storageService.hasFileInMock(firstImageKey), "Image Storage: Image stored in storage service");

    // Public Image serving
    const publicImageRes = await fetch(`${baseUrl}/api/blog/posts/${post1Data.data.slug}/image`, {
      redirect: "manual",
    });
    assert(
      publicImageRes.status === 200 || publicImageRes.status === 302,
      "Public Image: Published post image served or redirected"
    );

    // Replace featured image (upload JPEG)
    const replaceFormData = new FormData();
    replaceFormData.append(
      "image",
      new Blob([VALID_JPEG_BUFFER], { type: "image/jpeg" }),
      "replaced_photo.jpg"
    );

    const replaceRes = await fetch(`${baseUrl}/api/admin/blog/posts/${post1Id}/featured-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${writer1Token}` },
      body: replaceFormData,
    });
    const replacedData = (await replaceRes.json()) as any;
    assert(replaceRes.status === 200, "Image Replacement: New image upload succeeds (200 OK)");
    const secondImageKey = replacedData.data.featured_image_key;
    assert(secondImageKey !== firstImageKey, "Image Replacement: New distinct key generated");
    assert(!storageService.hasFileInMock(firstImageKey), "Image Cleanup: Replaced old image deleted from storage");
    assert(storageService.hasFileInMock(secondImageKey), "Image Storage: New image exists in storage");

    // Delete featured image via DELETE endpoint
    const deleteImageRes = await fetch(`${baseUrl}/api/admin/blog/posts/${post1Id}/featured-image`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${writer1Token}` },
    });
    const deleteImageData = (await deleteImageRes.json()) as any;
    assert(deleteImageRes.status === 200, "Image Delete: DELETE featured-image returns 200 OK");
    assert(deleteImageData.data.featured_image_key === null, "Image Delete: featured_image_key nulled in database");
    assert(!storageService.hasFileInMock(secondImageKey), "Image Cleanup: Deleted image purged from storage");

    /* =========================================================================
     * SUITE 9: Relational Deletion Safety (Category & Tag conflict checks)
     * ========================================================================= */
    console.log("\n[Suite 9: Relational Deletion Safety]");

    // Try deleting categoryAiId while post 1 references it -> 409 Conflict
    const conflictCatDeleteRes = await fetch(`${baseUrl}/api/admin/blog/categories/${categoryAiId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(conflictCatDeleteRes.status === 409, "Relational Safety: Deleting category with assigned posts returns 409 Conflict");

    // Try deleting tag1Id while post 1 references it -> 409 Conflict
    const conflictTagDeleteRes = await fetch(`${baseUrl}/api/admin/blog/tags/${tag1Id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(conflictTagDeleteRes.status === 409, "Relational Safety: Deleting tag with assigned posts returns 409 Conflict");

    // Delete post 1, then category and tag deletions succeed
    // First upload an image to post 2 to verify post deletion cleans up S3 image
    const post2ImageFormData = new FormData();
    post2ImageFormData.append(
      "image",
      new Blob([VALID_PNG_BUFFER], { type: "image/png" }),
      "post2_cover.png"
    );
    const post2UploadRes = await fetch(`${baseUrl}/api/admin/blog/posts/${post2Id}/featured-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${writer1Token}` },
      body: post2ImageFormData,
    });
    const post2UploadData = (await post2UploadRes.json()) as any;
    const post2ImageKey = post2UploadData.data.featured_image_key;
    assert(storageService.hasFileInMock(post2ImageKey), "Cascade: Post 2 image exists in storage before delete");

    // Delete post 2
    const deletePost2Res = await fetch(`${baseUrl}/api/admin/blog/posts/${post2Id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${writer1Token}` },
    });
    assert(deletePost2Res.status === 200, "Cascade: Post 2 deleted successfully");
    assert(!storageService.hasFileInMock(post2ImageKey), "Cascade: Post deletion cleaned up S3 featured image");

    // Delete post 1 and incomplete post
    await fetch(`${baseUrl}/api/admin/blog/posts/${post1Id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    await fetch(`${baseUrl}/api/admin/blog/posts/${incompletePost.data.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    // Now category and tags can be deleted safely
    const finalCatDeleteRes = await fetch(`${baseUrl}/api/admin/blog/categories/${categoryAiId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(finalCatDeleteRes.status === 200, "Relational Safety: Category deleted after unassigning posts");

    const finalTag1DeleteRes = await fetch(`${baseUrl}/api/admin/blog/tags/${tag1Id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(finalTag1DeleteRes.status === 200, "Relational Safety: Tag deleted after unassigning posts");

  } finally {
    server.close();
  }

  console.log("\n==================================================");
  console.log(`Phase 7 Test Results: ${passed} passed, ${failed} failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase7Tests().catch((err) => {
  console.error("Fatal test execution error:", err);
  process.exit(1);
});
