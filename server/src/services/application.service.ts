import {
  applicationRepository,
  ApplicationListItem,
  ApplicationDetailWithRelations,
  FindApplicationsFilter,
} from "../repositories/application.repository.js";
import { jobRepository } from "../repositories/job.repository.js";
import { storageService } from "./storage.service.js";
import { validateResumeFile } from "../utils/fileValidation.js";
import {
  ApplicationRecord,
  ApplicationDocumentRecord,
  ApplicationStatus,
} from "../db/schema.js";
import { auditService } from "./audit.service.js";
import config from "../config/index.js";

export const VALID_APPLICATION_STATUSES: ApplicationStatus[] = [
  "NEW",
  "SCREENING",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "REJECTED",
  "WITHDRAWN",
];

const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  NEW: ["SCREENING", "REJECTED", "WITHDRAWN"],
  SCREENING: ["SHORTLISTED", "REJECTED", "WITHDRAWN"],
  SHORTLISTED: ["INTERVIEW", "REJECTED", "WITHDRAWN"],
  INTERVIEW: ["SELECTED", "REJECTED", "WITHDRAWN"],
  SELECTED: ["WITHDRAWN", "REJECTED"],
  REJECTED: ["SCREENING", "WITHDRAWN"],
  WITHDRAWN: [], // terminal
};

export interface SubmitApplicationInput {
  jobSlug: string;
  fullName: string;
  email: string;
  phone: string;
  currentLocation?: string | null;
  coverLetter?: string | null;
  resumeFile: Express.Multer.File;
}

export interface PublicApplicationSubmissionResult {
  applicationNumber: string;
  jobTitle: string;
  fullName: string;
  email: string;
  status: ApplicationStatus;
  submittedAt: Date;
}

export class ApplicationService {
  /**
   * Validate email format
   */
  public isValidEmail(email: string): boolean {
    if (!email || typeof email !== "string") return false;
    const trimmed = email.trim();
    if (trimmed.length > 254) return false;
    // Standard RFC-compliant email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return emailRegex.test(trimmed);
  }

  /**
   * Validate phone format (international flexibility)
   */
  public isValidPhone(phone: string): boolean {
    if (!phone || typeof phone !== "string") return false;
    const trimmed = phone.trim();
    if (trimmed.length < 7 || trimmed.length > 25) return false;
    // Allows optional +, digits, spaces, parentheses, hyphens, and dots
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{5,20}$/;
    return phoneRegex.test(trimmed);
  }

  /**
   * Public application submission flow with complete compensation & orphan cleanup
   */
  public async submitApplication(
    input: SubmitApplicationInput
  ): Promise<PublicApplicationSubmissionResult> {
    // 1. Resolve job by slug
    if (!input.jobSlug || typeof input.jobSlug !== "string") {
      throw { status: 400, message: "Job slug is required" };
    }

    const job = await jobRepository.findBySlug(input.jobSlug);
    if (!job) {
      throw { status: 404, message: "Job not found" };
    }

    // 2. Verify job is currently PUBLISHED
    if (job.status !== "PUBLISHED") {
      throw {
        status: 400,
        message: `Applications are not currently accepted for this position (Job status is ${job.status})`,
      };
    }

    // 3. Verify application deadline has not passed
    if (job.application_deadline) {
      const deadlineTime = new Date(job.application_deadline).getTime();
      if (deadlineTime <= Date.now()) {
        throw {
          status: 400,
          message: "The application deadline for this position has passed",
        };
      }
    }

    // 4. Validate candidate fields
    const fullName = input.fullName ? input.fullName.trim() : "";
    if (!fullName) {
      throw { status: 400, message: "Full Name is required" };
    }
    if (fullName.length < 2 || fullName.length > 100) {
      throw {
        status: 400,
        message: "Full Name must be between 2 and 100 characters",
      };
    }

    const email = input.email ? input.email.trim().toLowerCase() : "";
    if (!email) {
      throw { status: 400, message: "Email is required" };
    }
    if (!this.isValidEmail(email)) {
      throw { status: 400, message: "Please provide a valid email address" };
    }

    const phone = input.phone ? input.phone.trim() : "";
    if (!phone) {
      throw { status: 400, message: "Phone number is required" };
    }
    if (!this.isValidPhone(phone)) {
      throw {
        status: 400,
        message: "Please provide a valid phone number (e.g. +1 555-123-4567)",
      };
    }

    const currentLocation = input.currentLocation?.trim() || null;
    if (currentLocation && currentLocation.length > 255) {
      throw {
        status: 400,
        message: "Current location must not exceed 255 characters",
      };
    }

    const coverLetter = input.coverLetter?.trim() || null;
    if (coverLetter && coverLetter.length > 5000) {
      throw {
        status: 400,
        message: "Cover letter must not exceed 5000 characters",
      };
    }

    // 5. Validate resume file
    const fileValidation = validateResumeFile(
      input.resumeFile,
      config.s3.maxResumeSizeMb
    );
    if (!fileValidation.valid) {
      throw { status: 400, message: fileValidation.error };
    }

    // 6. Check duplicate application for this job + email
    const existing = await applicationRepository.findByJobAndEmail(job.id, email);
    if (existing) {
      throw {
        status: 409,
        message:
          "You have already submitted an application for this position with this email address.",
      };
    }

    // 7. Generate application number
    let applicationNumber = await applicationRepository.getNextApplicationNumber();

    // 8. Create Application record
    let createdApplication: ApplicationRecord | null = null;
    try {
      createdApplication = await applicationRepository.create({
        application_number: applicationNumber,
        job_id: job.id,
        full_name: fullName,
        email,
        phone,
        current_location: currentLocation,
        cover_letter: coverLetter,
        status: "NEW",
      });
    } catch (err: any) {
      // Check for duplicate key constraint from database (concurrency edge case)
      if (
        err.message?.includes("UNIQUE constraint failed") ||
        err.message?.includes("unique_idx") ||
        err.code === "23505"
      ) {
        throw {
          status: 409,
          message:
            "You have already submitted an application for this position with this email address.",
        };
      }
      throw err;
    }

    // 9. Upload Resume to S3 with Compensation
    let uploadedFileKey: string | null = null;
    try {
      const uploadResult = await storageService.uploadResume(
        createdApplication.id,
        input.resumeFile.buffer,
        fileValidation.sanitizedFilename || input.resumeFile.originalname,
        fileValidation.detectedMimeType || input.resumeFile.mimetype
      );
      uploadedFileKey = uploadResult.fileKey;

      // 10. Store Document metadata in database
      await applicationRepository.createDocument({
        application_id: createdApplication.id,
        document_type: "RESUME",
        file_name: uploadResult.fileName,
        file_key: uploadResult.fileKey,
        file_size: uploadResult.fileSize,
        mime_type: uploadResult.mimeType,
      });
    } catch (uploadOrMetadataError: any) {
      console.error(
        "[ApplicationService] Failure during upload or metadata creation. Compensating...",
        uploadOrMetadataError
      );

      // Rollback S3 file if uploaded
      if (uploadedFileKey) {
        try {
          await storageService.deleteFile(uploadedFileKey);
        } catch (delErr) {
          console.error("[ApplicationService] Failed to compensate delete S3 file:", delErr);
        }
      }

      // Rollback database application record
      if (createdApplication) {
        try {
          await applicationRepository.delete(createdApplication.id);
        } catch (delAppErr) {
          console.error(
            "[ApplicationService] Failed to compensate delete application record:",
            delAppErr
          );
        }
      }

      throw {
        status: 500,
        message: "Failed to process resume upload. Please try submitting again.",
      };
    }

    // 11. Return safe public response
    return {
      applicationNumber: createdApplication.application_number,
      jobTitle: job.title,
      fullName: createdApplication.full_name,
      email: createdApplication.email,
      status: createdApplication.status,
      submittedAt: createdApplication.created_at,
    };
  }

  /**
   * Admin: List applications with filters and pagination
   */
  public async getApplications(filters: FindApplicationsFilter) {
    return applicationRepository.findWithFilters(filters);
  }

  /**
   * Admin: Get application detail
   */
  public async getApplicationDetail(id: string): Promise<ApplicationDetailWithRelations> {
    const detail = await applicationRepository.findDetailWithRelations(id);
    if (!detail) {
      throw { status: 404, message: "Application not found" };
    }
    return detail;
  }

  /**
   * Admin: Update application status
   */
  public async updateApplicationStatus(
    id: string,
    newStatus: string,
    userId?: string
  ): Promise<ApplicationRecord> {
    if (!newStatus || !VALID_APPLICATION_STATUSES.includes(newStatus as ApplicationStatus)) {
      throw {
        status: 400,
        message: `Invalid status '${newStatus}'. Allowed statuses: ${VALID_APPLICATION_STATUSES.join(", ")}`,
      };
    }

    const application = await applicationRepository.findById(id);
    if (!application) {
      throw { status: 404, message: "Application not found" };
    }

    const currentStatus = application.status;
    const targetStatus = newStatus as ApplicationStatus;

    if (currentStatus === targetStatus) {
      return application;
    }

    // Check valid lifecycle transitions
    const allowedNextStatuses = VALID_TRANSITIONS[currentStatus];
    if (!allowedNextStatuses || !allowedNextStatuses.includes(targetStatus)) {
      throw {
        status: 400,
        message: `Cannot transition application status from ${currentStatus} to ${targetStatus}`,
      };
    }

    const updated = await applicationRepository.updateStatus(id, targetStatus);
    if (!updated) {
      throw { status: 404, message: "Application not found" };
    }

    await auditService.record({
      userId: userId ?? null,
      action: "STATUS_CHANGE",
      module: "APPLICATIONS",
      entityType: "APPLICATION",
      entityId: id,
      oldValues: {
        status: currentStatus,
      },
      newValues: {
        status: targetStatus,
      },
    });

    return updated;
  }

  /**
   * Admin: Secure resume download with IDOR protection
   */
  public async getDocumentDownload(applicationId: string, documentId: string) {
    // 1. Verify application exists
    const app = await applicationRepository.findById(applicationId);
    if (!app) {
      throw { status: 404, message: "Application not found" };
    }

    // 2. Verify document exists
    const doc = await applicationRepository.findDocumentById(documentId);
    if (!doc) {
      throw { status: 404, message: "Document not found" };
    }

    // 3. IDOR Protection: document must belong to this specific application
    if (doc.application_id !== applicationId) {
      throw {
        status: 404,
        message: "Document does not belong to the specified application",
      };
    }

    // 4. Generate short-lived presigned URL
    const presignedUrl = await storageService.getPresignedDownloadUrl(doc.file_key);

    return {
      documentId: doc.id,
      fileName: doc.file_name,
      fileSize: doc.file_size,
      mimeType: doc.mime_type,
      downloadUrl: presignedUrl,
      expiresIn: config.s3.presignedExpiresInSeconds,
    };
  }

  /**
   * Admin: Delete application with S3 document cleanup
   */
  public async deleteApplication(id: string, userId?: string): Promise<boolean> {
    const app = await applicationRepository.findById(id);
    if (!app) {
      throw { status: 404, message: "Application not found" };
    }

    // 1. Fetch documents to delete from S3
    const docs = await applicationRepository.findDocumentsByApplicationId(id);
    for (const doc of docs) {
      try {
        await storageService.deleteFile(doc.file_key);
      } catch (err) {
        console.warn(`[ApplicationService] Error deleting S3 file ${doc.file_key}:`, err);
      }
    }

    // 2. Delete database records
    const deleted = await applicationRepository.delete(id);

    if (deleted) {
      await auditService.record({
        userId: userId ?? null,
        action: "DELETE",
        module: "APPLICATIONS",
        entityType: "APPLICATION",
        entityId: id,
        oldValues: {
          application_number: app.application_number,
          full_name: app.full_name,
          email: app.email,
          status: app.status,
        },
      });
    }

    return deleted;
  }
}

export const applicationService = new ApplicationService();
export default applicationService;
