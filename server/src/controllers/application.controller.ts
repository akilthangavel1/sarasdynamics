import type { Request, Response } from "express";
import multer from "multer";
import { applicationService } from "../services/application.service.js";
import { config } from "../config/index.js";
import type { ApplicationStatus } from "../db/schema.js";

// Configure multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    // Give a 1MB cushion so file validation can return a specific error rather than abrupt multer reject
    fileSize: (config.s3.maxResumeSizeMb + 1) * 1024 * 1024,
  },
});

export const resumeUploadMiddleware = upload.single("resume");

// Lightweight in-memory rate limiter for public candidate submissions
const ipSubmissionTracker = new Map<string, { count: number; resetTime: number }>();
const MAX_SUBMISSIONS_PER_WINDOW = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  if (process.env.ALLOW_DEV_AUTH === "true" || process.env.NODE_ENV === "test") {
    return true;
  }
  const now = Date.now();
  const record = ipSubmissionTracker.get(ip);

  if (!record || now > record.resetTime) {
    ipSubmissionTracker.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_SUBMISSIONS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}

/**
 * Public: Submit candidate application for a job
 * POST /api/jobs/:slug/applications
 */
export async function submitCandidateApplication(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const clientIp = req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";
    if (!checkRateLimit(clientIp)) {
      res.status(429).json({
        success: false,
        message: "Too many application attempts. Please try again later.",
      });
      return;
    }

    const { slug } = req.params;
    const { full_name, email, phone, current_location, cover_letter } = req.body;
    const resumeFile = req.file;

    if (!resumeFile) {
      res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
      return;
    }

    const result = await applicationService.submitApplication({
      jobSlug: slug,
      fullName: full_name,
      email: email,
      phone: phone,
      currentLocation: current_location,
      coverLetter: cover_letter,
      resumeFile,
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      application: {
        application_number: result.applicationNumber,
        job_title: result.jobTitle,
        full_name: result.fullName,
        email: result.email,
        status: result.status,
        submitted_at: result.submittedAt,
      },
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to submit application. Please try again.",
    });
  }
}

/**
 * Admin: List applications with filters and pagination
 * GET /api/admin/applications
 * Protected: applications.read
 */
export async function getAdminApplications(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const {
      job_id,
      status,
      search,
      page = "1",
      limit = "20",
    } = req.query;

    const parsedPage = parseInt(page as string, 10) || 1;
    const parsedLimit = Math.min(100, parseInt(limit as string, 10) || 20);

    const result = await applicationService.getApplications({
      jobId: typeof job_id === "string" ? job_id : undefined,
      status: typeof status === "string" ? (status as ApplicationStatus) : undefined,
      search: typeof search === "string" ? search : undefined,
      page: parsedPage,
      limit: parsedLimit,
    });

    res.json({
      success: true,
      message: "Applications retrieved successfully",
      data: result.applications,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve applications",
    });
  }
}

/**
 * Admin: Get application detail by ID
 * GET /api/admin/applications/:id
 * Protected: applications.read
 */
export async function getAdminApplicationById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const application = await applicationService.getApplicationDetail(id);

    // Sanitize document metadata: do not expose raw S3 keys directly
    const sanitizedDocuments = application.documents.map((doc) => ({
      id: doc.id,
      application_id: doc.application_id,
      document_type: doc.document_type,
      file_name: doc.file_name,
      file_size: doc.file_size,
      mime_type: doc.mime_type,
      created_at: doc.created_at,
    }));

    res.json({
      success: true,
      message: "Application details retrieved successfully",
      data: {
        id: application.id,
        application_number: application.application_number,
        job_id: application.job_id,
        job: application.job
          ? {
              id: application.job.id,
              title: application.job.title,
              slug: application.job.slug,
              location: application.job.location,
              workplace_type: application.job.workplace_type,
              employment_type: application.job.employment_type,
              status: application.job.status,
            }
          : null,
        full_name: application.full_name,
        email: application.email,
        phone: application.phone,
        current_location: application.current_location,
        cover_letter: application.cover_letter,
        status: application.status,
        created_at: application.created_at,
        updated_at: application.updated_at,
        documents: sanitizedDocuments,
      },
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve application details",
    });
  }
}

/**
 * Admin: Update application status
 * PATCH /api/admin/applications/:id/status
 * Protected: applications.update
 */
export async function updateAdminApplicationStatus(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = (req as any).user?.user?.id || undefined;

    if (!status) {
      res.status(400).json({
        success: false,
        message: "Status field is required",
      });
      return;
    }

    const updated = await applicationService.updateApplicationStatus(id, status, userId);

    res.json({
      success: true,
      message: `Application status updated to ${updated.status}`,
      data: updated,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update application status",
    });
  }
}

/**
 * Admin: Secure resume download URL (with IDOR protection)
 * GET /api/admin/applications/:id/documents/:documentId
 * Protected: applications.read
 */
export async function downloadAdminApplicationDocument(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id, documentId } = req.params;
    const downloadData = await applicationService.getDocumentDownload(id, documentId);

    // If client requested a redirect directly, redirect to presigned URL
    if (req.query.redirect === "true") {
      res.redirect(downloadData.downloadUrl);
      return;
    }

    res.json({
      success: true,
      message: "Document download URL generated successfully",
      data: downloadData,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve document download URL",
    });
  }
}

/**
 * Admin: Delete application
 * DELETE /api/admin/applications/:id
 * Protected: applications.delete
 */
export async function deleteAdminApplication(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.user?.id || undefined;
    await applicationService.deleteApplication(id, userId);

    res.json({
      success: true,
      message: "Application and associated documents deleted successfully",
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete application",
    });
  }
}
