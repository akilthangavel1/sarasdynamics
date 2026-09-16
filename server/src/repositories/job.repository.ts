import { randomUUID } from "node:crypto";
import { eq, and, or, gte, isNull, desc, like, inArray, sql } from "drizzle-orm";
import { getDb } from "../db/index.js";
import {
  sqliteSchema,
  pgSchema,
  type JobRecord,
  type JobCategoryRecord,
  type SkillRecord,
  type WorkplaceType,
  type EmploymentType,
  type JobStatus,
} from "../db/schema.js";
import config from "../config/index.js";

function getTables() {
  const isPg = config.database.provider === "postgresql";
  return isPg ? pgSchema : sqliteSchema;
}

export interface JobWithRelations extends JobRecord {
  category: JobCategoryRecord | null;
  skills: SkillRecord[];
}

export interface FindJobsFilter {
  status?: JobStatus;
  categoryId?: string;
  categorySlug?: string;
  workplaceType?: WorkplaceType;
  employmentType?: EmploymentType;
  search?: string;
  onlyActivePublished?: boolean;
  page?: number;
  limit?: number;
}

export class JobRepository {
  /**
   * Helper to attach category and skills to job records
   */
  private async attachRelations(jobRecords: JobRecord[]): Promise<JobWithRelations[]> {
    if (jobRecords.length === 0) return [];
    const db = getDb() as any;
    const tables = getTables();

    // 1. Fetch categories
    const categoryIds = Array.from(
      new Set(jobRecords.map((j) => j.category_id).filter((id): id is string => Boolean(id)))
    );

    const categoryMap = new Map<string, JobCategoryRecord>();
    if (categoryIds.length > 0) {
      const categories = (await db
        .select()
        .from(tables.jobCategories)
        .where(inArray(tables.jobCategories.id, categoryIds))) as JobCategoryRecord[];
      for (const cat of categories) {
        categoryMap.set(cat.id, cat);
      }
    }

    // 2. Fetch skills for these jobs
    const jobIds = jobRecords.map((j) => j.id);
    const jobSkillsList = (await db
      .select({
        job_id: tables.jobSkills.job_id,
        skill_id: tables.jobSkills.skill_id,
      })
      .from(tables.jobSkills)
      .where(inArray(tables.jobSkills.job_id, jobIds))) as Array<{
      job_id: string;
      skill_id: string;
    }>;

    const skillIds = Array.from(new Set(jobSkillsList.map((js) => js.skill_id)));
    const skillMap = new Map<string, SkillRecord>();
    if (skillIds.length > 0) {
      const skills = (await db
        .select()
        .from(tables.skills)
        .where(inArray(tables.skills.id, skillIds))) as SkillRecord[];
      for (const sk of skills) {
        skillMap.set(sk.id, sk);
      }
    }

    const jobToSkillsMap = new Map<string, SkillRecord[]>();
    for (const js of jobSkillsList) {
      const skill = skillMap.get(js.skill_id);
      if (skill) {
        const existing = jobToSkillsMap.get(js.job_id) || [];
        existing.push(skill);
        jobToSkillsMap.set(js.job_id, existing);
      }
    }

    return jobRecords.map((job) => ({
      ...job,
      category: job.category_id ? categoryMap.get(job.category_id) || null : null,
      skills: jobToSkillsMap.get(job.id) || [],
    }));
  }

  async findById(id: string): Promise<JobWithRelations | null> {
    const db = getDb() as any;
    const tables = getTables();

    const results = (await db
      .select()
      .from(tables.jobs)
      .where(eq(tables.jobs.id, id))
      .limit(1)) as JobRecord[];

    if (results.length === 0) return null;
    const withRelations = await this.attachRelations(results);
    return withRelations[0] || null;
  }

  async findBySlug(slug: string): Promise<JobWithRelations | null> {
    const db = getDb() as any;
    const tables = getTables();

    const results = (await db
      .select()
      .from(tables.jobs)
      .where(eq(tables.jobs.slug, slug))
      .limit(1)) as JobRecord[];

    if (results.length === 0) return null;
    const withRelations = await this.attachRelations(results);
    return withRelations[0] || null;
  }

  async isSlugUnique(slug: string, excludeJobId?: string): Promise<boolean> {
    const db = getDb() as any;
    const tables = getTables();

    let query = db.select().from(tables.jobs).where(eq(tables.jobs.slug, slug));
    const results = (await query) as JobRecord[];

    if (results.length === 0) return true;
    if (excludeJobId && results.length === 1 && results[0].id === excludeJobId) {
      return true;
    }
    return false;
  }

  async findJobs(filter: FindJobsFilter): Promise<{ jobs: JobWithRelations[]; total: number; page: number; limit: number }> {
    const db = getDb() as any;
    const tables = getTables();

    const conditions: any[] = [];

    // If active published jobs requested (public Careers)
    if (filter.onlyActivePublished) {
      conditions.push(eq(tables.jobs.status, "PUBLISHED"));
      const now = new Date();
      // application_deadline is either NULL or >= now
      conditions.push(
        or(isNull(tables.jobs.application_deadline), gte(tables.jobs.application_deadline, now))
      );
    } else if (filter.status) {
      conditions.push(eq(tables.jobs.status, filter.status));
    }

    // Category filter by ID or by Slug
    if (filter.categoryId) {
      conditions.push(eq(tables.jobs.category_id, filter.categoryId));
    } else if (filter.categorySlug) {
      // Find category by slug first
      const catResults = (await db
        .select()
        .from(tables.jobCategories)
        .where(eq(tables.jobCategories.slug, filter.categorySlug))
        .limit(1)) as JobCategoryRecord[];
      if (catResults.length > 0) {
        conditions.push(eq(tables.jobs.category_id, catResults[0].id));
      } else {
        // Category slug doesn't match any category
        return { jobs: [], total: 0, page: filter.page || 1, limit: filter.limit || 10 };
      }
    }

    if (filter.workplaceType) {
      conditions.push(eq(tables.jobs.workplace_type, filter.workplaceType));
    }

    if (filter.employmentType) {
      conditions.push(eq(tables.jobs.employment_type, filter.employmentType));
    }

    if (filter.search && filter.search.trim()) {
      const term = `%${filter.search.trim()}%`;
      conditions.push(
        or(
          like(tables.jobs.title, term),
          like(tables.jobs.description, term),
          like(tables.jobs.location, term)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    let allMatching = (await db
      .select({ id: tables.jobs.id })
      .from(tables.jobs)
      .where(whereClause)) as Array<{ id: string }>;
    const total = allMatching.length;

    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(50, Math.max(1, filter.limit || 10));
    const offset = (page - 1) * limit;

    let query = db
      .select()
      .from(tables.jobs)
      .where(whereClause)
      .orderBy(desc(tables.jobs.created_at))
      .limit(limit)
      .offset(offset);

    const jobRecords = (await query) as JobRecord[];
    const jobsWithRelations = await this.attachRelations(jobRecords);

    return {
      jobs: jobsWithRelations,
      total,
      page,
      limit,
    };
  }

  async create(
    jobData: {
      category_id?: string | null;
      title: string;
      slug: string;
      description?: string | null;
      requirements?: string | null;
      location?: string | null;
      workplace_type?: WorkplaceType | null;
      employment_type?: EmploymentType | null;
      application_deadline?: Date | null;
      status?: JobStatus;
      published_at?: Date | null;
      created_by?: string | null;
      updated_by?: string | null;
    },
    skillIds?: string[]
  ): Promise<JobWithRelations> {
    const db = getDb() as any;
    const tables = getTables();

    const id = randomUUID();
    const now = new Date();

    await db.insert(tables.jobs).values({
      id,
      category_id: jobData.category_id ?? null,
      title: jobData.title,
      slug: jobData.slug,
      description: jobData.description ?? null,
      requirements: jobData.requirements ?? null,
      location: jobData.location ?? null,
      workplace_type: jobData.workplace_type ?? null,
      employment_type: jobData.employment_type ?? null,
      application_deadline: jobData.application_deadline ?? null,
      status: jobData.status ?? "DRAFT",
      published_at: jobData.published_at ?? null,
      created_by: jobData.created_by ?? null,
      updated_by: jobData.updated_by ?? null,
      created_at: now,
      updated_at: now,
    });

    if (skillIds && skillIds.length > 0) {
      await this.setSkills(id, skillIds);
    }

    const created = await this.findById(id);
    if (!created) {
      throw new Error(`Failed to retrieve newly created job ${id}`);
    }
    return created;
  }

  async update(
    id: string,
    jobData: Partial<{
      category_id: string | null;
      title: string;
      slug: string;
      description: string | null;
      requirements: string | null;
      location: string | null;
      workplace_type: WorkplaceType;
      employment_type: EmploymentType;
      application_deadline: Date | null;
      status: JobStatus;
      published_at: Date | null;
      updated_by: string | null;
    }>,
    skillIds?: string[]
  ): Promise<JobWithRelations | null> {
    const db = getDb() as any;
    const tables = getTables();

    const existing = await this.findById(id);
    if (!existing) return null;

    const updates: Record<string, any> = {
      updated_at: new Date(),
    };

    if (jobData.category_id !== undefined) updates.category_id = jobData.category_id;
    if (jobData.title !== undefined) updates.title = jobData.title;
    if (jobData.slug !== undefined) updates.slug = jobData.slug;
    if (jobData.description !== undefined) updates.description = jobData.description;
    if (jobData.requirements !== undefined) updates.requirements = jobData.requirements;
    if (jobData.location !== undefined) updates.location = jobData.location;
    if (jobData.workplace_type !== undefined) updates.workplace_type = jobData.workplace_type;
    if (jobData.employment_type !== undefined) updates.employment_type = jobData.employment_type;
    if (jobData.application_deadline !== undefined) updates.application_deadline = jobData.application_deadline;
    if (jobData.status !== undefined) updates.status = jobData.status;
    if (jobData.published_at !== undefined) updates.published_at = jobData.published_at;
    if (jobData.updated_by !== undefined) updates.updated_by = jobData.updated_by;

    await db.update(tables.jobs).set(updates).where(eq(tables.jobs.id, id));

    if (skillIds !== undefined) {
      await this.setSkills(id, skillIds);
    }

    return this.findById(id);
  }

  async setSkills(jobId: string, skillIds: string[]): Promise<void> {
    const db = getDb() as any;
    const tables = getTables();

    // 1. Remove existing skill associations
    await db.delete(tables.jobSkills).where(eq(tables.jobSkills.job_id, jobId));

    // 2. Insert new associations (deduplicated)
    const uniqueSkillIds = Array.from(new Set(skillIds));
    const now = new Date();

    for (const skillId of uniqueSkillIds) {
      await db.insert(tables.jobSkills).values({
        id: randomUUID(),
        job_id: jobId,
        skill_id: skillId,
        created_at: now,
      });
    }
  }

  async delete(id: string): Promise<boolean> {
    const db = getDb() as any;
    const tables = getTables();

    // Cascade delete job_skills first (even though DB has ON DELETE CASCADE, explicit ensures across drivers)
    await db.delete(tables.jobSkills).where(eq(tables.jobSkills.job_id, id));
    await db.delete(tables.jobs).where(eq(tables.jobs.id, id));
    return true;
  }
}

export const jobRepository = new JobRepository();
