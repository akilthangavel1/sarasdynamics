import * as sqliteSchema from "./schema.sqlite.js";
import * as pgSchema from "./schema.pg.js";
import config from "../config/index.js";

export const isPostgres = config.database.provider === "postgresql";

export const schema = isPostgres ? pgSchema : sqliteSchema;

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface UserRecord {
  id: string;
  firebase_uid: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  profile_photo_url: string | null;
  status: UserStatus;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface RoleRecord {
  id: string;
  name: string;
  description: string | null;
  is_system_role: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PermissionRecord {
  id: string;
  name: string;
  description: string | null;
  module: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface RolePermissionRecord {
  id: string;
  role_id: string;
  permission_id: string;
  created_at: Date;
  updated_at: Date;
}

export type WorkplaceType = "REMOTE" | "HYBRID" | "ONSITE";
export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
export type JobStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";

export interface JobCategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface JobRecord {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  requirements: string | null;
  location: string | null;
  workplace_type: WorkplaceType | null;
  employment_type: EmploymentType | null;
  application_deadline: Date | null;
  status: JobStatus;
  published_at: Date | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface SkillRecord {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface JobSkillRecord {
  id: string;
  job_id: string;
  skill_id: string;
  created_at: Date;
}

export type ApplicationStatus =
  | "NEW"
  | "SCREENING"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "SELECTED"
  | "REJECTED"
  | "WITHDRAWN";

export type DocumentType = "RESUME" | "OTHER";

export interface ApplicationRecord {
  id: string;
  application_number: string;
  job_id: string;
  full_name: string;
  email: string;
  phone: string;
  current_location: string | null;
  cover_letter: string | null;
  status: ApplicationStatus;
  created_at: Date;
  updated_at: Date;
}

export interface ApplicationDocumentRecord {
  id: string;
  application_id: string;
  document_type: DocumentType;
  file_name: string;
  file_key: string;
  file_size: number;
  mime_type: string;
  created_at: Date;
  updated_at: Date;
}

export type InterviewStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
export type InterviewRecommendation = "HIRE" | "NO_HIRE" | "FURTHER_INTERVIEW";

export interface InterviewRecord {
  id: string;
  application_id: string;
  interview_type: string;
  scheduled_at: Date;
  duration_minutes: number;
  meeting_link: string | null;
  location: string | null;
  interviewer_id: string;
  status: InterviewStatus;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface InterviewFeedbackRecord {
  id: string;
  interview_id: string;
  interviewer_id: string;
  rating: number;
  strengths: string | null;
  weaknesses: string | null;
  feedback: string | null;
  recommendation: InterviewRecommendation;
  created_at: Date;
  updated_at: Date;
}

export interface ApplicationNoteRecord {
  id: string;
  application_id: string;
  user_id: string;
  note: string;
  created_at: Date;
  updated_at: Date;
}

export type BlogPostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface BlogCategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface BlogTagRecord {
  id: string;
  name: string;
  slug: string;
  created_at: Date;
  updated_at: Date;
}

export interface BlogPostRecord {
  id: string;
  category_id: string | null;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_key: string | null;
  status: BlogPostStatus;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface BlogPostTagRecord {
  id: string;
  blog_post_id: string;
  tag_id: string;
  created_at: Date;
}

export interface SeoMetadataRecord {
  id: string;
  blog_post_id: string;
  meta_title: string;
  meta_description: string;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AuditLogRecord {
  id: string;
  user_id: string | null;
  action: string;
  module: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

export { sqliteSchema, pgSchema };
export default schema;

