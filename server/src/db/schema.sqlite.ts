import { sqliteTable, text, integer, uniqueIndex, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    firebase_uid: text("firebase_uid").notNull(),
    email: text("email").notNull(),
    full_name: text("full_name"),
    phone: text("phone"),
    profile_photo_url: text("profile_photo_url"),
    status: text("status", { enum: ["ACTIVE", "INACTIVE", "SUSPENDED"] })
      .notNull()
      .default("ACTIVE"),
    last_login_at: integer("last_login_at", { mode: "timestamp" }),
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updated_at: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("users_firebase_uid_unique_idx").on(t.firebase_uid),
    index("users_email_idx").on(t.email),
  ]
);

export const roles = sqliteTable(
  "roles",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    is_system_role: integer("is_system_role", { mode: "boolean" })
      .notNull()
      .default(false),
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updated_at: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("roles_name_unique_idx").on(t.name),
  ]
);

export const permissions = sqliteTable(
  "permissions",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    module: text("module"),
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updated_at: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("permissions_name_unique_idx").on(t.name),
  ]
);

export const userRoles = sqliteTable(
  "user_roles",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role_id: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updated_at: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("user_roles_user_role_unique_idx").on(t.user_id, t.role_id),
    index("user_roles_user_id_idx").on(t.user_id),
    index("user_roles_role_id_idx").on(t.role_id),
  ]
);

export const rolePermissions = sqliteTable(
  "role_permissions",
  {
    id: text("id").primaryKey(),
    role_id: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permission_id: text("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updated_at: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("role_permissions_role_permission_unique_idx").on(t.role_id, t.permission_id),
    index("role_permissions_role_id_idx").on(t.role_id),
    index("role_permissions_permission_id_idx").on(t.permission_id),
  ]
);

export const jobCategories = sqliteTable(
  "job_categories",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    is_active: integer("is_active", { mode: "boolean" }).notNull().default(true),
    display_order: integer("display_order").notNull().default(0),
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updated_at: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("job_categories_name_unique_idx").on(t.name),
    uniqueIndex("job_categories_slug_unique_idx").on(t.slug),
    index("job_categories_is_active_idx").on(t.is_active),
    index("job_categories_display_order_idx").on(t.display_order),
  ]
);

export const jobs = sqliteTable(
  "jobs",
  {
    id: text("id").primaryKey(),
    category_id: text("category_id").references(() => jobCategories.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    requirements: text("requirements"),
    location: text("location"),
    workplace_type: text("workplace_type", { enum: ["REMOTE", "HYBRID", "ONSITE"] }),
    employment_type: text("employment_type", { enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"] }),
    application_deadline: integer("application_deadline", { mode: "timestamp" }),
    status: text("status", { enum: ["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"] })
      .notNull()
      .default("DRAFT"),
    published_at: integer("published_at", { mode: "timestamp" }),
    created_by: text("created_by").references(() => users.id, { onDelete: "set null" }),
    updated_by: text("updated_by").references(() => users.id, { onDelete: "set null" }),
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updated_at: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("jobs_slug_unique_idx").on(t.slug),
    index("jobs_category_id_idx").on(t.category_id),
    index("jobs_status_idx").on(t.status),
    index("jobs_application_deadline_idx").on(t.application_deadline),
  ]
);

export const skills = sqliteTable(
  "skills",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    is_active: integer("is_active", { mode: "boolean" }).notNull().default(true),
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updated_at: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("skills_name_unique_idx").on(t.name),
    uniqueIndex("skills_slug_unique_idx").on(t.slug),
    index("skills_is_active_idx").on(t.is_active),
  ]
);

export const jobSkills = sqliteTable(
  "job_skills",
  {
    id: text("id").primaryKey(),
    job_id: text("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    skill_id: text("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("job_skills_job_skill_unique_idx").on(t.job_id, t.skill_id),
    index("job_skills_job_id_idx").on(t.job_id),
    index("job_skills_skill_id_idx").on(t.skill_id),
  ]
);

export const applications = sqliteTable(
  "applications",
  {
    id: text("id").primaryKey(),
    application_number: text("application_number").notNull(),
    job_id: text("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    full_name: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    current_location: text("current_location"),
    cover_letter: text("cover_letter"),
    status: text("status", {
      enum: [
        "NEW",
        "SCREENING",
        "SHORTLISTED",
        "INTERVIEW",
        "SELECTED",
        "REJECTED",
        "WITHDRAWN",
      ],
    })
      .notNull()
      .default("NEW"),
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updated_at: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("applications_application_number_unique_idx").on(t.application_number),
    uniqueIndex("applications_job_id_email_unique_idx").on(t.job_id, t.email),
    index("applications_job_id_idx").on(t.job_id),
    index("applications_email_idx").on(t.email),
    index("applications_status_idx").on(t.status),
    index("applications_created_at_idx").on(t.created_at),
  ]
);

export const applicationDocuments = sqliteTable(
  "application_documents",
  {
    id: text("id").primaryKey(),
    application_id: text("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    document_type: text("document_type", { enum: ["RESUME", "OTHER"] })
      .notNull()
      .default("RESUME"),
    file_name: text("file_name").notNull(),
    file_key: text("file_key").notNull(),
    file_size: integer("file_size").notNull(),
    mime_type: text("mime_type").notNull(),
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updated_at: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("application_documents_application_id_idx").on(t.application_id),
  ]
);

export const interviews = sqliteTable(
  "interviews",
  {
    id: text("id").primaryKey(),
    application_id: text("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    interview_type: text("interview_type").notNull(),
    scheduled_at: integer("scheduled_at", { mode: "timestamp" }).notNull(),
    duration_minutes: integer("duration_minutes").notNull(),
    meeting_link: text("meeting_link"),
    location: text("location"),
    interviewer_id: text("interviewer_id")
      .notNull()
      .references(() => users.id),
    status: text("status", {
      enum: ["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"],
    })
      .notNull()
      .default("SCHEDULED"),
    notes: text("notes"),
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updated_at: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("interviews_application_id_idx").on(t.application_id),
    index("interviews_interviewer_id_idx").on(t.interviewer_id),
    index("interviews_status_idx").on(t.status),
    index("interviews_scheduled_at_idx").on(t.scheduled_at),
  ]
);

export const interviewFeedback = sqliteTable(
  "interview_feedback",
  {
    id: text("id").primaryKey(),
    interview_id: text("interview_id")
      .notNull()
      .references(() => interviews.id, { onDelete: "cascade" }),
    interviewer_id: text("interviewer_id")
      .notNull()
      .references(() => users.id),
    rating: integer("rating").notNull(),
    strengths: text("strengths"),
    weaknesses: text("weaknesses"),
    feedback: text("feedback"),
    recommendation: text("recommendation", {
      enum: ["HIRE", "NO_HIRE", "FURTHER_INTERVIEW"],
    }).notNull(),
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updated_at: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("interview_feedback_interview_interviewer_unique_idx").on(
      t.interview_id,
      t.interviewer_id
    ),
    index("interview_feedback_interview_id_idx").on(t.interview_id),
    index("interview_feedback_interviewer_id_idx").on(t.interviewer_id),
  ]
);

export const applicationNotes = sqliteTable(
  "application_notes",
  {
    id: text("id").primaryKey(),
    application_id: text("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id),
    note: text("note").notNull(),
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updated_at: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("application_notes_application_id_idx").on(t.application_id),
    index("application_notes_user_id_idx").on(t.user_id),
    index("application_notes_created_at_idx").on(t.created_at),
  ]
);

export const blogCategories = sqliteTable(
  "blog_categories",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    is_active: integer("is_active", { mode: "boolean" }).notNull().default(true),
    display_order: integer("display_order").notNull().default(0),
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updated_at: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("blog_categories_slug_unique_idx").on(t.slug),
    index("blog_categories_slug_idx").on(t.slug),
    index("blog_categories_is_active_idx").on(t.is_active),
  ]
);

export const blogTags = sqliteTable(
  "blog_tags",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updated_at: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("blog_tags_slug_unique_idx").on(t.slug),
    index("blog_tags_slug_idx").on(t.slug),
  ]
);

export const blogPosts = sqliteTable(
  "blog_posts",
  {
    id: text("id").primaryKey(),
    category_id: text("category_id").references(() => blogCategories.id, {
      onDelete: "set null",
    }),
    author_id: text("author_id")
      .notNull()
      .references(() => users.id),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    featured_image_key: text("featured_image_key"),
    status: text("status", {
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
    })
      .notNull()
      .default("DRAFT"),
    published_at: integer("published_at", { mode: "timestamp" }),
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updated_at: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("blog_posts_slug_unique_idx").on(t.slug),
    index("blog_posts_category_id_idx").on(t.category_id),
    index("blog_posts_author_id_idx").on(t.author_id),
    index("blog_posts_status_idx").on(t.status),
    index("blog_posts_slug_idx").on(t.slug),
    index("blog_posts_published_at_idx").on(t.published_at),
  ]
);

export const blogPostTags = sqliteTable(
  "blog_post_tags",
  {
    id: text("id").primaryKey(),
    blog_post_id: text("blog_post_id")
      .notNull()
      .references(() => blogPosts.id, { onDelete: "cascade" }),
    tag_id: text("tag_id")
      .notNull()
      .references(() => blogTags.id, { onDelete: "cascade" }),
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("blog_post_tags_post_tag_unique_idx").on(
      t.blog_post_id,
      t.tag_id
    ),
    index("blog_post_tags_post_id_idx").on(t.blog_post_id),
    index("blog_post_tags_tag_id_idx").on(t.tag_id),
  ]
);

export const seoMetadata = sqliteTable(
  "seo_metadata",
  {
    id: text("id").primaryKey(),
    blog_post_id: text("blog_post_id")
      .notNull()
      .unique()
      .references(() => blogPosts.id, { onDelete: "cascade" }),
    meta_title: text("meta_title").notNull(),
    meta_description: text("meta_description").notNull(),
    og_title: text("og_title"),
    og_description: text("og_description"),
    og_image_url: text("og_image_url"),
    canonical_url: text("canonical_url"),
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updated_at: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("seo_metadata_blog_post_id_unique_idx").on(t.blog_post_id),
    index("seo_metadata_blog_post_id_idx").on(t.blog_post_id),
  ]
);

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    module: text("module").notNull(),
    entity_type: text("entity_type").notNull(),
    entity_id: text("entity_id"),
    old_values: text("old_values", { mode: "json" }),
    new_values: text("new_values", { mode: "json" }),
    ip_address: text("ip_address"),
    user_agent: text("user_agent"),
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("audit_logs_created_at_idx").on(t.created_at),
    index("audit_logs_user_id_idx").on(t.user_id),
    index("audit_logs_module_idx").on(t.module),
    index("audit_logs_action_idx").on(t.action),
    index("audit_logs_entity_type_idx").on(t.entity_type),
    index("audit_logs_entity_id_idx").on(t.entity_id),
  ]
);


