import type { Request, Response } from "express";
import { jobRepository } from "../repositories/job.repository.js";
import { jobService } from "../services/job.service.js";
import type { AuthenticatedRequest } from "../types/index.js";
import type { WorkplaceType, EmploymentType, JobStatus } from "../db/schema.js";

/**
 * Public: List published jobs
 * GET /api/jobs
 */
export async function getPublicJobs(req: Request, res: Response): Promise<void> {
  try {
    const {
      search,
      category,
      workplace_type,
      employment_type,
      page = "1",
      limit = "10",
    } = req.query;

    const parsedPage = parseInt(page as string, 10) || 1;
    const parsedLimit = Math.min(50, parseInt(limit as string, 10) || 10);

    const result = await jobRepository.findJobs({
      onlyActivePublished: true,
      search: typeof search === "string" ? search : undefined,
      categorySlug: typeof category === "string" ? category : undefined,
      workplaceType: typeof workplace_type === "string" ? (workplace_type as WorkplaceType) : undefined,
      employmentType: typeof employment_type === "string" ? (employment_type as EmploymentType) : undefined,
      page: parsedPage,
      limit: parsedLimit,
    });

    res.json({
      success: true,
      message: "Published jobs retrieved successfully",
      data: result.jobs,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve public jobs",
    });
  }
}

/**
 * Public: Get published job by slug
 * GET /api/jobs/:slug
 */
export async function getPublicJobBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const job = await jobRepository.findBySlug(slug);

    if (!job || job.status !== "PUBLISHED") {
      res.status(404).json({
        success: false,
        message: "Job not found or is not publicly available",
      });
      return;
    }

    res.json({
      success: true,
      message: "Job details retrieved successfully",
      data: job,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve job details",
    });
  }
}

/**
 * Admin: List all jobs
 * GET /api/admin/jobs
 * Requires: jobs.read
 */
export async function getAdminJobs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const {
      status,
      category_id,
      workplace_type,
      employment_type,
      search,
      page = "1",
      limit = "20",
    } = req.query;

    const parsedPage = parseInt(page as string, 10) || 1;
    const parsedLimit = Math.min(100, parseInt(limit as string, 10) || 20);

    const result = await jobRepository.findJobs({
      status: typeof status === "string" ? (status as JobStatus) : undefined,
      categoryId: typeof category_id === "string" ? category_id : undefined,
      workplaceType: typeof workplace_type === "string" ? (workplace_type as WorkplaceType) : undefined,
      employmentType: typeof employment_type === "string" ? (employment_type as EmploymentType) : undefined,
      search: typeof search === "string" ? search : undefined,
      page: parsedPage,
      limit: parsedLimit,
    });

    res.json({
      success: true,
      message: "Admin jobs retrieved successfully",
      data: result.jobs,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve admin jobs",
    });
  }
}

/**
 * Admin: Get job by ID
 * GET /api/admin/jobs/:id
 * Requires: jobs.read
 */
export async function getAdminJobById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const job = await jobRepository.findById(id);

    if (!job) {
      res.status(404).json({
        success: false,
        message: "Job not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Job details retrieved successfully",
      data: job,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve job details",
    });
  }
}

/**
 * Admin: Create a job
 * POST /api/admin/jobs
 * Requires: jobs.create
 */
export async function createAdminJob(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.user.id || "";
    const {
      title,
      category_id,
      description,
      requirements,
      location,
      workplace_type,
      employment_type,
      application_deadline,
      status,
      skill_ids,
    } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({
        success: false,
        message: "Job title is required",
      });
      return;
    }

    if (workplace_type && !["REMOTE", "HYBRID", "ONSITE"].includes(workplace_type)) {
      res.status(400).json({
        success: false,
        message: "Invalid workplace type. Must be REMOTE, HYBRID, or ONSITE",
      });
      return;
    }

    if (
      employment_type &&
      !["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"].includes(employment_type)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid employment type. Must be FULL_TIME, PART_TIME, CONTRACT, or INTERNSHIP",
      });
      return;
    }

    const createdJob = await jobService.createJob({
      title,
      category_id,
      description,
      requirements,
      location,
      workplace_type,
      employment_type,
      application_deadline: application_deadline ? new Date(application_deadline) : null,
      status,
      skill_ids,
      userId,
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: createdJob,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create job",
    });
  }
}

/**
 * Admin: Update a job
 * PUT /api/admin/jobs/:id
 * Requires: jobs.update OR jobs.update_content
 * Field-level authorization enforced for CONTENT_WRITER
 */
export async function updateAdminJob(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.user.id || "";
    const userPermissions = req.user?.permissions || [];

    const hasFullUpdate = userPermissions.includes("jobs.update");
    const hasContentUpdateOnly = !hasFullUpdate && userPermissions.includes("jobs.update_content");

    if (!hasFullUpdate && !hasContentUpdateOnly) {
      res.status(403).json({
        success: false,
        message: "Forbidden: Missing required permission (jobs.update or jobs.update_content)",
      });
      return;
    }

    const bodyKeys = Object.keys(req.body);

    // If caller only has jobs.update_content, restrict fields
    if (hasContentUpdateOnly) {
      const allowedContentFields = new Set(["title", "description", "requirements"]);
      const restrictedAttempted = bodyKeys.filter((k) => !allowedContentFields.has(k));

      if (restrictedAttempted.length > 0) {
        res.status(403).json({
          success: false,
          message: `Forbidden: 'jobs.update_content' permission only allows modifying title, description, and requirements. Modification of '${restrictedAttempted.join(", ")}' is prohibited.`,
        });
        return;
      }

      const updated = await jobService.updateJobContentOnly(id, {
        title: req.body.title,
        description: req.body.description,
        requirements: req.body.requirements,
        userId,
      });

      res.json({
        success: true,
        message: "Job content updated successfully",
        data: updated,
      });
      return;
    }

    // Full update (jobs.update)
    const updated = await jobService.updateJob(id, {
      title: req.body.title,
      category_id: req.body.category_id,
      description: req.body.description,
      requirements: req.body.requirements,
      location: req.body.location,
      workplace_type: req.body.workplace_type,
      employment_type: req.body.employment_type,
      application_deadline: req.body.application_deadline ? new Date(req.body.application_deadline) : req.body.application_deadline,
      status: req.body.status,
      skill_ids: req.body.skill_ids,
      userId,
    });

    res.json({
      success: true,
      message: "Job updated successfully",
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update job",
    });
  }
}

/**
 * Admin: Publish a job
 * POST /api/admin/jobs/:id/publish
 * Requires: jobs.publish
 */
export async function publishAdminJob(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.user.id || "";

    const published = await jobService.publishJob(id, userId);

    res.json({
      success: true,
      message: "Job published successfully",
      data: published,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to publish job",
    });
  }
}

/**
 * Admin: Close a job
 * POST /api/admin/jobs/:id/close
 * Requires: jobs.close
 */
export async function closeAdminJob(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.user.id || "";

    const closed = await jobService.closeJob(id, userId);

    res.json({
      success: true,
      message: "Job closed successfully",
      data: closed,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to close job",
    });
  }
}

/**
 * Admin: Archive a job
 * POST /api/admin/jobs/:id/archive
 * Requires: jobs.update
 */
export async function archiveAdminJob(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.user.id || "";

    const archived = await jobService.archiveJob(id, userId);

    res.json({
      success: true,
      message: "Job archived successfully",
      data: archived,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to archive job",
    });
  }
}

/**
 * Admin: Delete a job permanently
 * DELETE /api/admin/jobs/:id
 * Requires: jobs.delete
 */
export async function deleteAdminJob(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.user.id || "";
    await jobService.deleteJob(id, userId);

    res.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to delete job",
    });
  }
}
