import { jobRepository, type JobWithRelations, type FindJobsFilter } from "../repositories/job.repository.js";
import { jobCategoryRepository } from "../repositories/jobCategory.repository.js";
import { skillRepository } from "../repositories/skill.repository.js";
import { slugify } from "../utils/slugify.js";
import { auditService } from "./audit.service.js";
import type { WorkplaceType, EmploymentType, JobStatus } from "../db/schema.js";

export class JobService {
  /**
   * Generates a unique slug for a job title
   */
  async generateUniqueSlug(title: string, currentJobId?: string): Promise<string> {
    const baseSlug = slugify(title) || "job-position";
    let candidate = baseSlug;
    let counter = 1;

    while (!(await jobRepository.isSlugUnique(candidate, currentJobId))) {
      counter++;
      candidate = `${baseSlug}-${counter}`;
    }

    return candidate;
  }

  /**
   * Validates if a job is eligible for publication
   * Checks all 9 mandatory publication requirements:
   * 1. title (non-empty)
   * 2. category_id (valid and active)
   * 3. description (non-empty)
   * 4. requirements (non-empty)
   * 5. location (non-empty)
   * 6. workplace_type (REMOTE, HYBRID, ONSITE)
   * 7. employment_type (FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP)
   * 8. application_deadline (valid future date)
   * 9. at least one active skill
   */
  async validateForPublication(data: {
    category_id?: string | null;
    title?: string | null;
    description?: string | null;
    requirements?: string | null;
    location?: string | null;
    workplace_type?: WorkplaceType | null;
    employment_type?: EmploymentType | null;
    application_deadline?: Date | null;
    skills?: Array<{ id: string; name: string; is_active: boolean }> | null;
    skill_ids?: string[] | null;
  }): Promise<{ valid: boolean; error?: string }> {
    // 1. Title
    if (!data.title || !data.title.trim()) {
      return { valid: false, error: "Job title is required for publishing." };
    }

    // 2. Category
    if (!data.category_id || !data.category_id.trim()) {
      return { valid: false, error: "A job must be assigned to a valid category before publishing." };
    }

    const category = await jobCategoryRepository.findById(data.category_id);
    if (!category) {
      return { valid: false, error: "Selected job category does not exist." };
    }

    if (!category.is_active) {
      return { valid: false, error: "Cannot publish a job under an inactive category." };
    }

    // 3. Description
    if (!data.description || !data.description.trim()) {
      return { valid: false, error: "Job description is required for publishing." };
    }

    // 4. Requirements
    if (!data.requirements || !data.requirements.trim()) {
      return { valid: false, error: "Job requirements are required for publishing." };
    }

    // 5. Location
    if (!data.location || !data.location.trim()) {
      return { valid: false, error: "Job location is required for publishing." };
    }

    // 6. Workplace type
    const validWorkplaceTypes: WorkplaceType[] = ["REMOTE", "HYBRID", "ONSITE"];
    if (!data.workplace_type || !validWorkplaceTypes.includes(data.workplace_type)) {
      return { valid: false, error: "A valid workplace type (REMOTE, HYBRID, ONSITE) is required for publishing." };
    }

    // 7. Employment type
    const validEmploymentTypes: EmploymentType[] = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"];
    if (!data.employment_type || !validEmploymentTypes.includes(data.employment_type)) {
      return { valid: false, error: "A valid employment type (FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP) is required for publishing." };
    }

    // 8. Application deadline
    if (!data.application_deadline) {
      return { valid: false, error: "Application deadline is required for publishing." };
    }

    const deadlineDate = new Date(data.application_deadline);
    if (isNaN(deadlineDate.getTime())) {
      return { valid: false, error: "Invalid application deadline date." };
    }
    if (deadlineDate.getTime() < Date.now()) {
      return { valid: false, error: "Application deadline must be a future date." };
    }

    // 9. At least one active skill
    let activeSkillsCount = 0;
    if (data.skills && data.skills.length > 0) {
      activeSkillsCount = data.skills.filter((s) => s.is_active).length;
    } else if (data.skill_ids && data.skill_ids.length > 0) {
      const dbSkills = await skillRepository.findByIds(data.skill_ids);
      activeSkillsCount = dbSkills.filter((s) => s.is_active).length;
    }

    if (activeSkillsCount === 0) {
      return { valid: false, error: "At least one active skill must be associated with the job before publishing." };
    }

    return { valid: true };
  }

  /**
   * Create a new job
   */
  async createJob(params: {
    title: string;
    category_id?: string | null;
    description?: string | null;
    requirements?: string | null;
    location?: string | null;
    workplace_type: WorkplaceType;
    employment_type: EmploymentType;
    application_deadline?: Date | null;
    status?: JobStatus;
    skill_ids?: string[];
    userId: string;
  }): Promise<JobWithRelations> {
    const title = params.title.trim();
    if (!title) {
      throw new Error("Job title is required.");
    }

    const validWorkplaceTypes: WorkplaceType[] = ["REMOTE", "HYBRID", "ONSITE"];
    if (params.workplace_type && !validWorkplaceTypes.includes(params.workplace_type)) {
      throw new Error(`Invalid workplace_type. Must be one of: ${validWorkplaceTypes.join(", ")}`);
    }

    const validEmploymentTypes: EmploymentType[] = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"];
    if (params.employment_type && !validEmploymentTypes.includes(params.employment_type)) {
      throw new Error(`Invalid employment_type. Must be one of: ${validEmploymentTypes.join(", ")}`);
    }

    const targetStatus: JobStatus = params.status || "DRAFT";

    let publishedAt: Date | null = null;
    if (targetStatus === "PUBLISHED") {
      const validation = await this.validateForPublication({
        category_id: params.category_id,
        title,
        description: params.description,
        requirements: params.requirements,
        location: params.location,
        workplace_type: params.workplace_type,
        employment_type: params.employment_type,
        application_deadline: params.application_deadline,
        skill_ids: params.skill_ids,
      });
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      publishedAt = new Date();
    }

    const slug = await this.generateUniqueSlug(title);

    // Validate skill IDs if provided
    if (params.skill_ids && params.skill_ids.length > 0) {
      const existingSkills = await skillRepository.findByIds(params.skill_ids);
      if (existingSkills.length !== params.skill_ids.length) {
        throw new Error("One or more provided skill IDs do not exist.");
      }
    }

    const createdJob = await jobRepository.create(
      {
        title,
        slug,
        category_id: params.category_id ?? null,
        description: params.description ?? null,
        requirements: params.requirements ?? null,
        location: params.location ?? null,
        workplace_type: params.workplace_type,
        employment_type: params.employment_type,
        application_deadline: params.application_deadline ?? null,
        status: targetStatus,
        published_at: publishedAt,
        created_by: params.userId,
        updated_by: params.userId,
      },
      params.skill_ids
    );

    await auditService.record({
      userId: params.userId,
      action: "CREATE",
      module: "JOBS",
      entityType: "JOB",
      entityId: createdJob.id,
      newValues: {
        title: createdJob.title,
        slug: createdJob.slug,
        status: createdJob.status,
        category_id: createdJob.category_id,
        workplace_type: createdJob.workplace_type,
        employment_type: createdJob.employment_type,
      },
    });

    return createdJob;
  }

  /**
   * Update an existing job with full permissions (`jobs.update`)
   */
  async updateJob(
    id: string,
    params: {
      title?: string;
      category_id?: string | null;
      description?: string | null;
      requirements?: string | null;
      location?: string | null;
      workplace_type?: WorkplaceType;
      employment_type?: EmploymentType;
      application_deadline?: Date | null;
      status?: JobStatus;
      skill_ids?: string[];
      userId: string;
    }
  ): Promise<JobWithRelations> {
    const existing = await jobRepository.findById(id);
    if (!existing) {
      throw new Error(`Job with ID ${id} not found.`);
    }

    if (existing.status === "ARCHIVED") {
      throw new Error("Archived jobs cannot be modified or reactivated directly. Please duplicate the job.");
    }

    let newSlug = existing.slug;
    if (params.title && params.title.trim() !== existing.title) {
      newSlug = await this.generateUniqueSlug(params.title.trim(), id);
    }

    // Validate status transition rules
    if (params.status !== undefined && params.status !== existing.status) {
      if (existing.status === "DRAFT" && params.status === "CLOSED") {
        throw new Error("Only PUBLISHED jobs can be closed. Current status is DRAFT.");
      }
      if (params.status === "DRAFT" && (existing.status === "PUBLISHED" || existing.status === "CLOSED")) {
        throw new Error(`Cannot revert job status from ${existing.status} back to DRAFT.`);
      }
    }

    // If changing to PUBLISHED, perform publication validation
    if (params.status === "PUBLISHED" && existing.status !== "PUBLISHED") {
      const targetCategory = params.category_id !== undefined ? params.category_id : existing.category_id;
      const targetTitle = params.title !== undefined ? params.title : existing.title;
      const targetDesc = params.description !== undefined ? params.description : existing.description;
      const targetReq = params.requirements !== undefined ? params.requirements : existing.requirements;
      const targetLoc = params.location !== undefined ? params.location : existing.location;
      const targetWorkplace = params.workplace_type !== undefined ? params.workplace_type : existing.workplace_type;
      const targetEmployment = params.employment_type !== undefined ? params.employment_type : existing.employment_type;
      const targetDeadline = params.application_deadline !== undefined ? params.application_deadline : existing.application_deadline;

      const validation = await this.validateForPublication({
        category_id: targetCategory,
        title: targetTitle,
        description: targetDesc,
        requirements: targetReq,
        location: targetLoc,
        workplace_type: targetWorkplace,
        employment_type: targetEmployment,
        application_deadline: targetDeadline,
        skills: params.skill_ids === undefined ? existing.skills : undefined,
        skill_ids: params.skill_ids !== undefined ? params.skill_ids : undefined,
      });
      if (!validation.valid) {
        throw new Error(validation.error);
      }
    }

    // Validate skills if provided
    if (params.skill_ids !== undefined && params.skill_ids.length > 0) {
      const existingSkills = await skillRepository.findByIds(params.skill_ids);
      if (existingSkills.length !== params.skill_ids.length) {
        throw new Error("One or more provided skill IDs do not exist.");
      }
    }

    // Determine published_at: set on first publication, preserve existing on edits
    let publishedAtUpdate: Date | undefined = undefined;
    if (params.status === "PUBLISHED") {
      publishedAtUpdate = existing.published_at || new Date();
    }

    const updated = await jobRepository.update(
      id,
      {
        title: params.title?.trim(),
        slug: newSlug,
        category_id: params.category_id,
        description: params.description,
        requirements: params.requirements,
        location: params.location,
        workplace_type: params.workplace_type,
        employment_type: params.employment_type,
        application_deadline: params.application_deadline,
        status: params.status,
        published_at: publishedAtUpdate,
        updated_by: params.userId,
      },
      params.skill_ids
    );

    if (!updated) {
      throw new Error(`Failed to update job ${id}`);
    }

    await auditService.record({
      userId: params.userId,
      action: "UPDATE",
      module: "JOBS",
      entityType: "JOB",
      entityId: updated.id,
      oldValues: {
        title: existing.title,
        status: existing.status,
        category_id: existing.category_id,
        workplace_type: existing.workplace_type,
        employment_type: existing.employment_type,
        location: existing.location,
      },
      newValues: {
        title: updated.title,
        status: updated.status,
        category_id: updated.category_id,
        workplace_type: updated.workplace_type,
        employment_type: updated.employment_type,
        location: updated.location,
      },
    });

    return updated;
  }

  /**
   * Update content only for CONTENT_WRITER (`jobs.update_content`)
   */
  async updateJobContentOnly(
    id: string,
    params: {
      title?: string;
      description?: string | null;
      requirements?: string | null;
      userId: string;
    }
  ): Promise<JobWithRelations> {
    const existing = await jobRepository.findById(id);
    if (!existing) {
      throw new Error(`Job with ID ${id} not found.`);
    }

    if (existing.status === "ARCHIVED") {
      throw new Error("Archived jobs cannot be modified or reactivated directly. Please duplicate the job.");
    }

    let newSlug = existing.slug;
    if (params.title && params.title.trim() !== existing.title) {
      newSlug = await this.generateUniqueSlug(params.title.trim(), id);
    }

    const updated = await jobRepository.update(
      id,
      {
        title: params.title?.trim(),
        slug: newSlug,
        description: params.description,
        requirements: params.requirements,
        updated_by: params.userId,
      }
    );

    if (!updated) {
      throw new Error(`Failed to update job content ${id}`);
    }

    await auditService.record({
      userId: params.userId,
      action: "UPDATE",
      module: "JOBS",
      entityType: "JOB",
      entityId: updated.id,
      oldValues: {
        title: existing.title,
        slug: existing.slug,
        description: existing.description,
        requirements: existing.requirements,
      },
      newValues: {
        title: updated.title,
        slug: updated.slug,
        description: updated.description,
        requirements: updated.requirements,
      },
    });

    return updated;
  }

  /**
   * Publish a job (`jobs.publish`)
   */
  async publishJob(id: string, userId: string): Promise<JobWithRelations> {
    const existing = await jobRepository.findById(id);
    if (!existing) {
      throw new Error(`Job with ID ${id} not found.`);
    }

    if (existing.status === "ARCHIVED") {
      throw new Error("Archived jobs cannot be published directly. Please reactivate or duplicate.");
    }

    const validation = await this.validateForPublication({
      category_id: existing.category_id,
      title: existing.title,
      description: existing.description,
      requirements: existing.requirements,
      location: existing.location,
      workplace_type: existing.workplace_type,
      employment_type: existing.employment_type,
      application_deadline: existing.application_deadline,
      skills: existing.skills,
    });

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const updated = await jobRepository.update(id, {
      status: "PUBLISHED",
      published_at: existing.published_at || new Date(),
      updated_by: userId,
    });

    if (!updated) {
      throw new Error(`Failed to publish job ${id}`);
    }

    await auditService.record({
      userId,
      action: "PUBLISH",
      module: "JOBS",
      entityType: "JOB",
      entityId: updated.id,
      oldValues: {
        status: existing.status,
      },
      newValues: {
        status: "PUBLISHED",
        published_at: updated.published_at,
      },
    });

    return updated;
  }

  /**
   * Close a job (`jobs.close`)
   */
  async closeJob(id: string, userId: string): Promise<JobWithRelations> {
    const existing = await jobRepository.findById(id);
    if (!existing) {
      throw new Error(`Job with ID ${id} not found.`);
    }

    if (existing.status !== "PUBLISHED") {
      throw new Error(`Only PUBLISHED jobs can be closed. Current status is ${existing.status}.`);
    }

    const updated = await jobRepository.update(id, {
      status: "CLOSED",
      updated_by: userId,
    });

    if (!updated) {
      throw new Error(`Failed to close job ${id}`);
    }

    await auditService.record({
      userId,
      action: "CLOSE",
      module: "JOBS",
      entityType: "JOB",
      entityId: updated.id,
      oldValues: {
        status: existing.status,
      },
      newValues: {
        status: "CLOSED",
      },
    });

    return updated;
  }

  /**
   * Archive a job (`jobs.update`)
   */
  async archiveJob(id: string, userId: string): Promise<JobWithRelations> {
    const existing = await jobRepository.findById(id);
    if (!existing) {
      throw new Error(`Job with ID ${id} not found.`);
    }

    if (existing.status === "ARCHIVED") {
      throw new Error("Job is already archived.");
    }

    const updated = await jobRepository.update(id, {
      status: "ARCHIVED",
      updated_by: userId,
    });

    if (!updated) {
      throw new Error(`Failed to archive job ${id}`);
    }

    await auditService.record({
      userId,
      action: "ARCHIVE",
      module: "JOBS",
      entityType: "JOB",
      entityId: updated.id,
      oldValues: {
        status: existing.status,
      },
      newValues: {
        status: "ARCHIVED",
      },
    });

    return updated;
  }

  /**
   * Delete a job permanently (`jobs.delete`)
   */
  async deleteJob(id: string, userId?: string): Promise<boolean> {
    const existing = await jobRepository.findById(id);
    if (!existing) {
      throw new Error(`Job with ID ${id} not found.`);
    }

    const deleted = await jobRepository.delete(id);
    if (deleted) {
      await auditService.record({
        userId: userId ?? null,
        action: "DELETE",
        module: "JOBS",
        entityType: "JOB",
        entityId: id,
        oldValues: {
          title: existing.title,
          slug: existing.slug,
          status: existing.status,
        },
      });
    }

    return deleted;
  }
}

export const jobService = new JobService();
