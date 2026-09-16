import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  pgEnum,
  uniqueIndex,
  index,
  jsonb,
} from "drizzle-orm/pg-core";

export const userStatusEnum = pgEnum("user_status", [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firebase_uid: varchar("firebase_uid", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    full_name: varchar("full_name", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    profile_photo_url: text("profile_photo_url"),
    status: userStatusEnum("status").notNull().default("ACTIVE"),
    last_login_at: timestamp("last_login_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("users_firebase_uid_unique_idx").on(t.firebase_uid),
    index("users_email_idx").on(t.email),
  ]
);

export const roles = pgTable(
  "roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    is_system_role: boolean("is_system_role").notNull().default(false),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("roles_name_unique_idx").on(t.name),
  ]
);

export const permissions = pgTable(
  "permissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    module: varchar("module", { length: 100 }),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("permissions_name_unique_idx").on(t.name),
  ]
);

export const userRoles = pgTable(
  "user_roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role_id: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("user_roles_user_role_unique_idx").on(t.user_id, t.role_id),
    index("user_roles_user_id_idx").on(t.user_id),
    index("user_roles_role_id_idx").on(t.role_id),
  ]
);

export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    role_id: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permission_id: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("role_permissions_role_permission_unique_idx").on(t.role_id, t.permission_id),
    index("role_permissions_role_id_idx").on(t.role_id),
    index("role_permissions_permission_id_idx").on(t.permission_id),
  ]
);

export const workplaceTypeEnum = pgEnum("workplace_type", [
  "REMOTE",
  "HYBRID",
  "ONSITE",
]);

export const employmentTypeEnum = pgEnum("employment_type", [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "DRAFT",
  "PUBLISHED",
  "CLOSED",
  "ARCHIVED",
]);

export const jobCategories = pgTable(
  "job_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    description: text("description"),
    is_active: boolean("is_active").notNull().default(true),
    display_order: integer("display_order").notNull().default(0),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("job_categories_name_unique_idx").on(t.name),
    uniqueIndex("job_categories_slug_unique_idx").on(t.slug),
    index("job_categories_is_active_idx").on(t.is_active),
    index("job_categories_display_order_idx").on(t.display_order),
  ]
);

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    category_id: uuid("category_id").references(() => jobCategories.id, { onDelete: "set null" }),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
    requirements: text("requirements"),
    location: varchar("location", { length: 255 }),
    workplace_type: workplaceTypeEnum("workplace_type"),
    employment_type: employmentTypeEnum("employment_type"),
    application_deadline: timestamp("application_deadline", { withTimezone: true }),
    status: jobStatusEnum("status").notNull().default("DRAFT"),
    published_at: timestamp("published_at", { withTimezone: true }),
    created_by: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    updated_by: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("jobs_slug_unique_idx").on(t.slug),
    index("jobs_category_id_idx").on(t.category_id),
    index("jobs_status_idx").on(t.status),
    index("jobs_application_deadline_idx").on(t.application_deadline),
  ]
);

export const skills = pgTable(
  "skills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("skills_name_unique_idx").on(t.name),
    uniqueIndex("skills_slug_unique_idx").on(t.slug),
    index("skills_is_active_idx").on(t.is_active),
  ]
);

export const applicationStatusEnum = pgEnum("application_status", [
  "NEW",
  "SCREENING",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "REJECTED",
  "WITHDRAWN",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "RESUME",
  "OTHER",
]);

export const jobSkills = pgTable(
  "job_skills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    job_id: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    skill_id: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("job_skills_job_skill_unique_idx").on(t.job_id, t.skill_id),
    index("job_skills_job_id_idx").on(t.job_id),
    index("job_skills_skill_id_idx").on(t.skill_id),
  ]
);

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    application_number: varchar("application_number", { length: 50 }).notNull(),
    job_id: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    full_name: varchar("full_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }).notNull(),
    current_location: varchar("current_location", { length: 255 }),
    cover_letter: text("cover_letter"),
    status: applicationStatusEnum("status").notNull().default("NEW"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
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

export const applicationDocuments = pgTable(
  "application_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    application_id: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    document_type: documentTypeEnum("document_type").notNull().default("RESUME"),
    file_name: varchar("file_name", { length: 255 }).notNull(),
    file_key: varchar("file_key", { length: 500 }).notNull(),
    file_size: integer("file_size").notNull(),
    mime_type: varchar("mime_type", { length: 120 }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("application_documents_application_id_idx").on(t.application_id),
  ]
);

export const interviewStatusEnum = pgEnum("interview_status", [
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
  "RESCHEDULED",
]);

export const interviewRecommendationEnum = pgEnum("interview_recommendation", [
  "HIRE",
  "NO_HIRE",
  "FURTHER_INTERVIEW",
]);

export const interviews = pgTable(
  "interviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    application_id: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    interview_type: varchar("interview_type", { length: 100 }).notNull(),
    scheduled_at: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    duration_minutes: integer("duration_minutes").notNull(),
    meeting_link: text("meeting_link"),
    location: text("location"),
    interviewer_id: uuid("interviewer_id")
      .notNull()
      .references(() => users.id),
    status: interviewStatusEnum("status").notNull().default("SCHEDULED"),
    notes: text("notes"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("interviews_application_id_idx").on(t.application_id),
    index("interviews_interviewer_id_idx").on(t.interviewer_id),
    index("interviews_status_idx").on(t.status),
    index("interviews_scheduled_at_idx").on(t.scheduled_at),
  ]
);

export const interviewFeedback = pgTable(
  "interview_feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    interview_id: uuid("interview_id")
      .notNull()
      .references(() => interviews.id, { onDelete: "cascade" }),
    interviewer_id: uuid("interviewer_id")
      .notNull()
      .references(() => users.id),
    rating: integer("rating").notNull(),
    strengths: text("strengths"),
    weaknesses: text("weaknesses"),
    feedback: text("feedback"),
    recommendation: interviewRecommendationEnum("recommendation").notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
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

export const applicationNotes = pgTable(
  "application_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    application_id: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id),
    note: text("note").notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("application_notes_application_id_idx").on(t.application_id),
    index("application_notes_user_id_idx").on(t.user_id),
    index("application_notes_created_at_idx").on(t.created_at),
  ]
);

export const blogPostStatusEnum = pgEnum("blog_post_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

export const blogCategories = pgTable(
  "blog_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    is_active: boolean("is_active").notNull().default(true),
    display_order: integer("display_order").notNull().default(0),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("blog_categories_slug_unique_idx").on(t.slug),
    index("blog_categories_slug_idx").on(t.slug),
    index("blog_categories_is_active_idx").on(t.is_active),
  ]
);

export const blogTags = pgTable(
  "blog_tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("blog_tags_slug_unique_idx").on(t.slug),
    index("blog_tags_slug_idx").on(t.slug),
  ]
);

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    category_id: uuid("category_id").references(() => blogCategories.id, {
      onDelete: "set null",
    }),
    author_id: uuid("author_id")
      .notNull()
      .references(() => users.id),
    title: varchar("title", { length: 500 }).notNull(),
    slug: varchar("slug", { length: 500 }).notNull().unique(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    featured_image_key: varchar("featured_image_key", { length: 500 }),
    status: blogPostStatusEnum("status").notNull().default("DRAFT"),
    published_at: timestamp("published_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
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

export const blogPostTags = pgTable(
  "blog_post_tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    blog_post_id: uuid("blog_post_id")
      .notNull()
      .references(() => blogPosts.id, { onDelete: "cascade" }),
    tag_id: uuid("tag_id")
      .notNull()
      .references(() => blogTags.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
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

export const seoMetadata = pgTable(
  "seo_metadata",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    blog_post_id: uuid("blog_post_id")
      .notNull()
      .unique()
      .references(() => blogPosts.id, { onDelete: "cascade" }),
    meta_title: varchar("meta_title", { length: 255 }).notNull(),
    meta_description: text("meta_description").notNull(),
    og_title: varchar("og_title", { length: 255 }),
    og_description: text("og_description"),
    og_image_url: text("og_image_url"),
    canonical_url: text("canonical_url"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("seo_metadata_blog_post_id_unique_idx").on(t.blog_post_id),
    index("seo_metadata_blog_post_id_idx").on(t.blog_post_id),
  ]
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 50 }).notNull(),
    module: varchar("module", { length: 50 }).notNull(),
    entity_type: varchar("entity_type", { length: 50 }).notNull(),
    entity_id: varchar("entity_id", { length: 255 }),
    old_values: jsonb("old_values"),
    new_values: jsonb("new_values"),
    ip_address: varchar("ip_address", { length: 100 }),
    user_agent: text("user_agent"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
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


