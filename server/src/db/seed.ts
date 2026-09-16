import { randomUUID } from "node:crypto";
import { eq, and } from "drizzle-orm";
import { getDb } from "./index.js";
import { sqliteSchema, pgSchema } from "./schema.js";
import config from "../config/index.js";
import { SEED_PERMISSIONS, SEED_ROLES, SEED_CATEGORIES, SEED_SKILLS, SEED_BLOG_CATEGORIES, SEED_BLOG_TAGS } from "./seedData.js";

/**
 * Idempotent database seeder for Roles, Permissions, and Role-Permission mappings.
 * Can be run multiple times safely without duplicating records.
 */
export async function seedDatabase(options: { bootstrapSuperAdminEmail?: string } = {}): Promise<void> {
  const db = getDb() as any;
  const isPg = config.database.provider === "postgresql";
  const tables = isPg ? pgSchema : sqliteSchema;

  console.log(`[Seed] Starting seed process for provider: ${config.database.provider}...`);

  // 1. Cleanup Obsolete or Unapproved Permissions from previous revisions
  const approvedPermNames = new Set(SEED_PERMISSIONS.map((p) => p.name));
  const existingPermissions = (await db.select().from(tables.permissions)) as Array<{ id: string; name: string }>;
  const obsoletePermissions = existingPermissions.filter((p) => !approvedPermNames.has(p.name));

  if (obsoletePermissions.length > 0) {
    console.log(`[Seed Cleanup] Found ${obsoletePermissions.length} obsolete permissions. Cleaning up...`);
    for (const obs of obsoletePermissions) {
      // Remove any role_permissions mappings
      await db
        .delete(tables.rolePermissions)
        .where(eq(tables.rolePermissions.permission_id, obs.id));
      // Remove permission record
      await db
        .delete(tables.permissions)
        .where(eq(tables.permissions.id, obs.id));
      console.log(`  - Removed obsolete permission: ${obs.name}`);
    }
  }

  // 2. Seed Approved Permissions
  console.log(`[Seed] Seeding ${SEED_PERMISSIONS.length} approved permissions...`);
  const permissionMap = new Map<string, string>(); // name -> id

  for (const perm of SEED_PERMISSIONS) {
    const existing = await db
      .select()
      .from(tables.permissions)
      .where(eq(tables.permissions.name, perm.name))
      .limit(1);

    if (existing.length > 0) {
      permissionMap.set(perm.name, existing[0].id);
    } else {
      const id = randomUUID();
      const now = new Date();
      await db.insert(tables.permissions).values({
        id,
        name: perm.name,
        description: perm.description,
        module: perm.module,
        created_at: now,
        updated_at: now,
      });
      permissionMap.set(perm.name, id);
    }
  }
  console.log(`[Seed] Permissions verified. Total: ${permissionMap.size}`);

  // 2. Seed Roles
  console.log(`[Seed] Seeding ${SEED_ROLES.length} system roles...`);
  const roleMap = new Map<string, string>(); // name -> id

  for (const roleDef of SEED_ROLES) {
    const existing = await db
      .select()
      .from(tables.roles)
      .where(eq(tables.roles.name, roleDef.name))
      .limit(1);

    let roleId: string;
    if (existing.length > 0) {
      roleId = existing[0].id;
    } else {
      roleId = randomUUID();
      const now = new Date();
      await db.insert(tables.roles).values({
        id: roleId,
        name: roleDef.name,
        description: roleDef.description,
        is_system_role: roleDef.is_system_role,
        created_at: now,
        updated_at: now,
      });
    }
    roleMap.set(roleDef.name, roleId);

    // 3. Reconcile Role Permissions
    const expectedPermissionIds = new Set(
      roleDef.permissions
        .map((pName) => permissionMap.get(pName))
        .filter((id): id is string => Boolean(id))
    );

    // Remove any stale permissions previously attached to this role
    const currentMappings = (await db
      .select()
      .from(tables.rolePermissions)
      .where(eq(tables.rolePermissions.role_id, roleId))) as Array<{ id: string; permission_id: string }>;

    for (const mapping of currentMappings) {
      if (!expectedPermissionIds.has(mapping.permission_id)) {
        await db
          .delete(tables.rolePermissions)
          .where(eq(tables.rolePermissions.id, mapping.id));
      }
    }

    // Insert missing permissions
    for (const permName of roleDef.permissions) {
      const permissionId = permissionMap.get(permName);
      if (!permissionId) {
        console.warn(`[Seed] Unknown permission '${permName}' referenced in role '${roleDef.name}'`);
        continue;
      }

      const hasMapping = currentMappings.some((m) => m.permission_id === permissionId);
      if (!hasMapping) {
        const now = new Date();
        await db.insert(tables.rolePermissions).values({
          id: randomUUID(),
          role_id: roleId,
          permission_id: permissionId,
          created_at: now,
          updated_at: now,
        });
      }
    }
  }
  console.log(`[Seed] Roles and Role-Permission mappings verified.`);

  // 4. Optional Controlled Super Admin Bootstrap
  const bootstrapEmail = options.bootstrapSuperAdminEmail || process.env.BOOTSTRAP_SUPER_ADMIN_EMAIL;
  if (bootstrapEmail) {
    console.log(`[Seed] Checking bootstrap SUPER_ADMIN for email: ${bootstrapEmail}...`);
    const superAdminRoleId = roleMap.get("SUPER_ADMIN");

    if (superAdminRoleId) {
      const userResult = await db
        .select()
        .from(tables.users)
        .where(eq(tables.users.email, bootstrapEmail))
        .limit(1);

      if (userResult.length > 0) {
        const user = userResult[0];
        const existingUserRole = await db
          .select()
          .from(tables.userRoles)
          .where(
            and(
              eq(tables.userRoles.user_id, user.id),
              eq(tables.userRoles.role_id, superAdminRoleId)
            )
          )
          .limit(1);

        if (existingUserRole.length === 0) {
          const now = new Date();
          await db.insert(tables.userRoles).values({
            id: randomUUID(),
            user_id: user.id,
            role_id: superAdminRoleId,
            created_at: now,
            updated_at: now,
          });
          console.log(`[Seed] Granted SUPER_ADMIN role to existing user: ${bootstrapEmail}`);
        } else {
          console.log(`[Seed] User ${bootstrapEmail} already has SUPER_ADMIN role.`);
        }
      } else {
        console.log(`[Seed] User with email ${bootstrapEmail} not yet in database. Role will be ready upon first sync.`);
      }
    }
  }

  // 5. Seed Job Categories (Idempotent)
  console.log(`[Seed] Seeding ${SEED_CATEGORIES.length} job categories...`);
  const existingCategories = (await db.select().from(tables.jobCategories)) as Array<{ id: string; name: string; slug: string }>;
  const categoryMapBySlug = new Map<string, string>();
  for (const cat of existingCategories) {
    categoryMapBySlug.set(cat.slug, cat.id);
  }

  for (const catSeed of SEED_CATEGORIES) {
    if (!categoryMapBySlug.has(catSeed.slug)) {
      const id = randomUUID();
      const now = new Date();
      await db.insert(tables.jobCategories).values({
        id,
        name: catSeed.name,
        slug: catSeed.slug,
        description: catSeed.description,
        is_active: true,
        display_order: catSeed.display_order,
        created_at: now,
        updated_at: now,
      });
      categoryMapBySlug.set(catSeed.slug, id);
    }
  }
  console.log(`[Seed] Job categories verified.`);

  // 6. Seed Skills (Idempotent)
  console.log(`[Seed] Seeding ${SEED_SKILLS.length} skills...`);
  const existingSkills = (await db.select().from(tables.skills)) as Array<{ id: string; name: string; slug: string }>;
  const skillMapBySlug = new Map<string, string>();
  for (const skill of existingSkills) {
    skillMapBySlug.set(skill.slug, skill.id);
  }

  for (const skillSeed of SEED_SKILLS) {
    if (!skillMapBySlug.has(skillSeed.slug)) {
      const id = randomUUID();
      const now = new Date();
      await db.insert(tables.skills).values({
        id,
        name: skillSeed.name,
        slug: skillSeed.slug,
        is_active: true,
        created_at: now,
        updated_at: now,
      });
      skillMapBySlug.set(skillSeed.slug, id);
    }
  }
  console.log(`[Seed] Skills verified.`);

  // 7. Seed Initial Published Jobs if table is empty (Idempotent)
  const existingJobs = (await db.select().from(tables.jobs).limit(1)) as Array<{ id: string }>;
  if (existingJobs.length === 0) {
    console.log(`[Seed] Seeding initial published jobs...`);
    const now = new Date();
    const futureDeadline = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days in future

    const initialJobs = [
      {
        id: randomUUID(),
        categorySlug: "software-development",
        title: "Senior Full-Stack Engineer",
        slug: "senior-full-stack-engineer",
        description: "We are seeking a senior full-stack engineer to lead core architecture, service design, and high-performance frontend interfaces for the Saras Dynamics platform.",
        requirements: "5+ years of production experience with TypeScript, React, Node.js, relational databases, and microservices.",
        location: "Remote (Global)",
        workplace_type: "REMOTE" as const,
        employment_type: "FULL_TIME" as const,
        status: "PUBLISHED" as const,
        published_at: now,
        application_deadline: futureDeadline,
        skills: ["typescript", "react", "nodejs", "postgresql", "docker"],
      },
      {
        id: randomUUID(),
        categorySlug: "ai-machine-learning",
        title: "Staff Machine Learning Engineer",
        slug: "staff-machine-learning-engineer",
        description: "Architect and deploy production-grade LLM pipelines, fine-tuning infrastructure, and real-time inference models across high-throughput data streams.",
        requirements: "Expertise in PyTorch, Python, generative AI architectures, vector search, and distributed training systems.",
        location: "San Francisco, CA / Remote",
        workplace_type: "HYBRID" as const,
        employment_type: "FULL_TIME" as const,
        status: "PUBLISHED" as const,
        published_at: now,
        application_deadline: futureDeadline,
        skills: ["python", "pytorch", "machine-learning", "generative-ai", "fastapi"],
      },
      {
        id: randomUUID(),
        categorySlug: "cloud-devops",
        title: "Lead Cloud Infrastructure & DevOps Architect",
        slug: "lead-cloud-infrastructure-devops-architect",
        description: "Design resilient cloud infrastructure, multi-region failover, Kubernetes orchestration, and automated CI/CD deployment pipelines.",
        requirements: "Deep proficiency in AWS, Docker, Kubernetes, Terraform, and zero-trust cloud network security.",
        location: "Remote (Global)",
        workplace_type: "REMOTE" as const,
        employment_type: "FULL_TIME" as const,
        status: "PUBLISHED" as const,
        published_at: now,
        application_deadline: futureDeadline,
        skills: ["aws", "docker", "postgresql"],
      },
    ];

    for (const job of initialJobs) {
      const categoryId = categoryMapBySlug.get(job.categorySlug) || null;
      await db.insert(tables.jobs).values({
        id: job.id,
        category_id: categoryId,
        title: job.title,
        slug: job.slug,
        description: job.description,
        requirements: job.requirements,
        location: job.location,
        workplace_type: job.workplace_type,
        employment_type: job.employment_type,
        application_deadline: job.application_deadline,
        status: job.status,
        published_at: job.published_at,
        created_at: now,
        updated_at: now,
      });

      for (const skillSlug of job.skills) {
        const skillId = skillMapBySlug.get(skillSlug);
        if (skillId) {
          await db.insert(tables.jobSkills).values({
            id: randomUUID(),
            job_id: job.id,
            skill_id: skillId,
            created_at: now,
          });
        }
      }
    }
    console.log(`[Seed] Seeded ${initialJobs.length} initial published jobs with skills.`);
  }

  // 8. Seed Blog Categories (Idempotent)
  console.log(`[Seed] Seeding ${SEED_BLOG_CATEGORIES.length} blog categories...`);
  const blogCategoryMapBySlug = new Map<string, string>();
  for (const catSeed of SEED_BLOG_CATEGORIES) {
    const existing = (await db
      .select()
      .from(tables.blogCategories)
      .where(eq(tables.blogCategories.slug, catSeed.slug))
      .limit(1)) as Array<{ id: string }>;

    if (existing.length > 0) {
      blogCategoryMapBySlug.set(catSeed.slug, existing[0].id);
    } else {
      const id = randomUUID();
      const now = new Date();
      await db.insert(tables.blogCategories).values({
        id,
        name: catSeed.name,
        slug: catSeed.slug,
        description: catSeed.description,
        is_active: true,
        display_order: catSeed.display_order,
        created_at: now,
        updated_at: now,
      });
      blogCategoryMapBySlug.set(catSeed.slug, id);
    }
  }
  console.log(`[Seed] Blog categories verified.`);

  // 9. Seed Blog Tags (Idempotent)
  console.log(`[Seed] Seeding ${SEED_BLOG_TAGS.length} blog tags...`);
  const blogTagMapBySlug = new Map<string, string>();
  for (const tagSeed of SEED_BLOG_TAGS) {
    const existing = (await db
      .select()
      .from(tables.blogTags)
      .where(eq(tables.blogTags.slug, tagSeed.slug))
      .limit(1)) as Array<{ id: string }>;

    if (existing.length > 0) {
      blogTagMapBySlug.set(tagSeed.slug, existing[0].id);
    } else {
      const id = randomUUID();
      const now = new Date();
      await db.insert(tables.blogTags).values({
        id,
        name: tagSeed.name,
        slug: tagSeed.slug,
        created_at: now,
        updated_at: now,
      });
      blogTagMapBySlug.set(tagSeed.slug, id);
    }
  }
  console.log(`[Seed] Blog tags verified.`);

  // 10. Seed Initial Published Blog Posts if table is empty (Idempotent)
  const existingPosts = (await db.select().from(tables.blogPosts).limit(1)) as Array<{ id: string }>;
  if (existingPosts.length === 0) {
    // Look up an admin or first user as author
    const systemUsers = (await db.select().from(tables.users).limit(1)) as Array<{ id: string }>;
    if (systemUsers.length > 0) {
      const authorId = systemUsers[0].id;
      const now = new Date();
      const initialPosts = [
        {
          id: randomUUID(),
          categorySlug: "artificial-intelligence",
          title: "Architecting Resilient Multi-Agent AI Systems in Production",
          slug: "architecting-resilient-multi-agent-ai-systems",
          excerpt: "How Saras Dynamics designs fault-tolerant agent coordination, memory hierarchies, and deterministic verification protocols.",
          content: "<p>Modern generative AI workflows demand more than singular prompts. In this deep dive, we explore orchestrating autonomous agents with verifiable execution boundaries, stateful tool calling, and deterministic rollback patterns.</p><p>By enforcing strict boundary contracts between perception, reasoning, and execution layers, mission-critical systems maintain mathematical precision even when handling stochastic model outputs.</p>",
          tags: ["ai", "machine-learning", "cloud-architecture"],
        },
        {
          id: randomUUID(),
          categorySlug: "engineering-architecture",
          title: "Zero-Trust Microservices: Hardening Enterprise APIs at Scale",
          slug: "zero-trust-microservices-hardening-enterprise-apis",
          excerpt: "Practical security patterns for distributed systems: mutual TLS, fine-grained RBAC tokens, and automated IDOR mitigation.",
          content: "<p>Enterprise data security cannot rely on perimeter firewalls alone. We explore zero-trust architecture where every RPC and HTTP interaction undergoes continuous server-side authorization and contextual policy evaluation.</p><p>We detail our multi-tenant role-based access control engine, cryptographically signed session verification, and database query tenancy guards.</p>",
          tags: ["security", "cloud-architecture", "devops", "typescript"],
        },
        {
          id: randomUUID(),
          categorySlug: "product-design",
          title: "Mathematical Typography and Layout Precision in Enterprise UIs",
          slug: "mathematical-typography-layout-precision",
          excerpt: "Eliminating visual noise through geometric scaling, typographic baselines, and deliberate design ergonomics.",
          content: "<p>Design craft in enterprise software is measured in clarity, density, and cognitive ergonomics. We break down the mathematical scaling rules behind Saras Dynamics' high-contrast user interfaces.</p><p>Learn how consistent spatial rhythms and nested radius calculations create effortless digital workspaces.</p>",
          tags: ["product-design", "react"],
        },
      ];

      for (const post of initialPosts) {
        const categoryId = blogCategoryMapBySlug.get(post.categorySlug) || null;
        await db.insert(tables.blogPosts).values({
          id: post.id,
          category_id: categoryId,
          author_id: authorId,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          featured_image_key: null,
          status: "PUBLISHED",
          published_at: now,
          created_at: now,
          updated_at: now,
        });

        for (const tagSlug of post.tags) {
          const tagId = blogTagMapBySlug.get(tagSlug);
          if (tagId) {
            await db.insert(tables.blogPostTags).values({
              id: randomUUID(),
              blog_post_id: post.id,
              tag_id: tagId,
              created_at: now,
            });
          }
        }
      }
      console.log(`[Seed] Seeded ${initialPosts.length} initial published blog posts.`);
    }
  }

  console.log("[Seed] Seed process completed successfully.");
}

// Allow direct CLI execution: `tsx server/src/db/seed.ts`
if (process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js")) {
  seedDatabase()
    .then(() => {
      console.log("[Seed] Finished successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[Seed] Seed error:", err);
      process.exit(1);
    });
}

export default seedDatabase;
