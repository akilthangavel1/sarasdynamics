import {
  interviewRepository,
  type InterviewWithInterviewerAndFeedback,
  type FindInterviewsFilter,
} from "../repositories/interview.repository.js";
import { applicationRepository } from "../repositories/application.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import {
  type InterviewRecord,
  type InterviewFeedbackRecord,
  type InterviewStatus,
  type InterviewRecommendation,
} from "../db/schema.js";
import { auditService } from "./audit.service.js";

export const VALID_INTERVIEW_STATUSES: InterviewStatus[] = [
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
  "RESCHEDULED",
];

export const VALID_INTERVIEW_RECOMMENDATIONS: InterviewRecommendation[] = [
  "HIRE",
  "NO_HIRE",
  "FURTHER_INTERVIEW",
];

export interface ScheduleInterviewInput {
  interview_type: string;
  scheduled_at: string | Date;
  duration_minutes: number;
  interviewer_id: string;
  meeting_link?: string | null;
  location?: string | null;
  notes?: string | null;
}

export interface UpdateInterviewInput {
  interview_type?: string;
  scheduled_at?: string | Date;
  duration_minutes?: number;
  interviewer_id?: string;
  meeting_link?: string | null;
  location?: string | null;
  status?: InterviewStatus;
  notes?: string | null;
}

export interface SubmitFeedbackInput {
  rating: number;
  strengths?: string | null;
  weaknesses?: string | null;
  feedback?: string | null;
  recommendation: InterviewRecommendation;
}

export interface UpdateFeedbackInput {
  rating?: number;
  strengths?: string | null;
  weaknesses?: string | null;
  feedback?: string | null;
  recommendation?: InterviewRecommendation;
}

export class InterviewService {
  /**
   * Schedules a new interview for an existing application.
   */
  public async scheduleInterview(
    applicationId: string,
    input: ScheduleInterviewInput,
    _currentUser: any
  ): Promise<InterviewRecord> {
    // 1. Verify application exists
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      const error: any = new Error(`Application not found with id: ${applicationId}`);
      error.status = 404;
      throw error;
    }

    // 2. Validate interview_type
    if (!input.interview_type || typeof input.interview_type !== "string" || input.interview_type.trim().length === 0) {
      const error: any = new Error("interview_type is required and cannot be empty.");
      error.status = 400;
      throw error;
    }
    const interviewType = input.interview_type.trim();

    // 3. Validate scheduled_at
    if (!input.scheduled_at) {
      const error: any = new Error("scheduled_at timestamp is required.");
      error.status = 400;
      throw error;
    }
    const scheduledDate = new Date(input.scheduled_at);
    if (isNaN(scheduledDate.getTime())) {
      const error: any = new Error("scheduled_at must be a valid timestamp.");
      error.status = 400;
      throw error;
    }

    // 4. Validate duration_minutes (positive reasonable value between 1 and 480 minutes)
    const duration = Number(input.duration_minutes);
    if (!Number.isInteger(duration) || duration < 1 || duration > 480) {
      const error: any = new Error(
        "duration_minutes must be a positive integer between 1 and 480 minutes."
      );
      error.status = 400;
      throw error;
    }

    // 5. Validate interviewer_id
    if (!input.interviewer_id || typeof input.interviewer_id !== "string") {
      const error: any = new Error("interviewer_id is required.");
      error.status = 400;
      throw error;
    }
    const interviewer = await userRepository.findById(input.interviewer_id);
    if (!interviewer) {
      const error: any = new Error(`Interviewer user not found with id: ${input.interviewer_id}`);
      error.status = 400;
      throw error;
    }
    if (interviewer.status !== "ACTIVE") {
      const error: any = new Error("The specified interviewer user is not active.");
      error.status = 400;
      throw error;
    }

    // 6. Validate meeting_link if provided
    let meetingLink: string | null = null;
    if (input.meeting_link !== undefined && input.meeting_link !== null) {
      const trimmedLink = String(input.meeting_link).trim();
      if (trimmedLink.length > 0) {
        try {
          const parsed = new URL(trimmedLink);
          if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            throw new Error();
          }
          meetingLink = trimmedLink;
        } catch {
          const error: any = new Error("meeting_link must be a valid HTTP or HTTPS URL.");
          error.status = 400;
          throw error;
        }
      }
    }

    // 7. Validate location
    const location = input.location ? String(input.location).trim() : null;
    const notes = input.notes ? String(input.notes).trim() : null;

    // 8. Application status integration:
    // If the application is in SHORTLISTED status, transition it to INTERVIEW status.
    // Leave other statuses (such as NEW, SCREENING, INTERVIEW, SELECTED, etc.) untouched.
    if (application.status === "SHORTLISTED") {
      await applicationRepository.updateStatus(applicationId, "INTERVIEW");
    }

    // 9. Insert interview record
    const record = await interviewRepository.createInterview({
      application_id: applicationId,
      interview_type: interviewType,
      scheduled_at: scheduledDate,
      duration_minutes: duration,
      meeting_link: meetingLink,
      location,
      interviewer_id: input.interviewer_id,
      status: "SCHEDULED",
      notes,
    });

    await auditService.record({
      userId: _currentUser?.user?.id || _currentUser?.id || null,
      action: "CREATE",
      module: "INTERVIEWS",
      entityType: "INTERVIEW",
      entityId: record.id,
      newValues: {
        application_id: applicationId,
        interview_type: record.interview_type,
        scheduled_at: record.scheduled_at,
        duration_minutes: record.duration_minutes,
        interviewer_id: record.interviewer_id,
        status: record.status,
      },
    });

    return record;
  }

  /**
   * Retrieves all interviews associated with a specific application.
   */
  public async getInterviewsForApplication(
    applicationId: string
  ): Promise<InterviewWithInterviewerAndFeedback[]> {
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      const error: any = new Error(`Application not found with id: ${applicationId}`);
      error.status = 404;
      throw error;
    }

    return interviewRepository.getInterviewsForApplicationWithFeedback(applicationId);
  }

  /**
   * Retrieves a paginated list of interviews across all applications with filters.
   */
  public async listInterviews(filter: FindInterviewsFilter) {
    return interviewRepository.findInterviews(filter);
  }

  /**
   * Retrieves a single interview by ID with details.
   */
  public async getInterviewById(
    id: string
  ): Promise<InterviewWithInterviewerAndFeedback> {
    const interview = await interviewRepository.getInterviewWithDetails(id);
    if (!interview) {
      const error: any = new Error(`Interview not found with id: ${id}`);
      error.status = 404;
      throw error;
    }
    return interview;
  }

  /**
   * Updates an existing interview record with validation and lifecycle rules.
   */
  public async updateInterview(
    id: string,
    input: UpdateInterviewInput
  ): Promise<InterviewRecord> {
    const existing = await interviewRepository.findById(id);
    if (!existing) {
      const error: any = new Error(`Interview not found with id: ${id}`);
      error.status = 404;
      throw error;
    }

    const updates: Partial<{
      interview_type: string;
      scheduled_at: Date;
      duration_minutes: number;
      meeting_link: string | null;
      location: string | null;
      interviewer_id: string;
      status: InterviewStatus;
      notes: string | null;
    }> = {};

    // 1. Status validation & lifecycle transitions
    if (input.status !== undefined) {
      if (!VALID_INTERVIEW_STATUSES.includes(input.status)) {
        const error: any = new Error(
          `Invalid status: ${input.status}. Allowed values: ${VALID_INTERVIEW_STATUSES.join(", ")}`
        );
        error.status = 400;
        throw error;
      }

      // Lifecycle rules
      if (existing.status === "CANCELLED" && input.status === "COMPLETED") {
        const error: any = new Error(
          "Cannot transition directly from CANCELLED to COMPLETED. An interview must be RESCHEDULED first."
        );
        error.status = 400;
        throw error;
      }

      updates.status = input.status;
    }

    // 2. Interview type
    if (input.interview_type !== undefined) {
      if (typeof input.interview_type !== "string" || input.interview_type.trim().length === 0) {
        const error: any = new Error("interview_type cannot be empty.");
        error.status = 400;
        throw error;
      }
      updates.interview_type = input.interview_type.trim();
    }

    // 3. Scheduled time
    if (input.scheduled_at !== undefined) {
      const scheduledDate = new Date(input.scheduled_at);
      if (isNaN(scheduledDate.getTime())) {
        const error: any = new Error("scheduled_at must be a valid timestamp.");
        error.status = 400;
        throw error;
      }
      updates.scheduled_at = scheduledDate;
    }

    // 4. Duration
    if (input.duration_minutes !== undefined) {
      const duration = Number(input.duration_minutes);
      if (!Number.isInteger(duration) || duration < 1 || duration > 480) {
        const error: any = new Error(
          "duration_minutes must be a positive integer between 1 and 480 minutes."
        );
        error.status = 400;
        throw error;
      }
      updates.duration_minutes = duration;
    }

    // 5. Interviewer
    if (input.interviewer_id !== undefined) {
      if (typeof input.interviewer_id !== "string" || input.interviewer_id.trim().length === 0) {
        const error: any = new Error("interviewer_id cannot be empty.");
        error.status = 400;
        throw error;
      }
      const interviewer = await userRepository.findById(input.interviewer_id);
      if (!interviewer) {
        const error: any = new Error(`Interviewer user not found with id: ${input.interviewer_id}`);
        error.status = 400;
        throw error;
      }
      if (interviewer.status !== "ACTIVE") {
        const error: any = new Error("The specified interviewer user is not active.");
        error.status = 400;
        throw error;
      }
      updates.interviewer_id = input.interviewer_id;
    }

    // 6. Meeting link
    if (input.meeting_link !== undefined) {
      if (input.meeting_link === null || input.meeting_link === "") {
        updates.meeting_link = null;
      } else {
        const trimmedLink = String(input.meeting_link).trim();
        try {
          const parsed = new URL(trimmedLink);
          if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            throw new Error();
          }
          updates.meeting_link = trimmedLink;
        } catch {
          const error: any = new Error("meeting_link must be a valid HTTP or HTTPS URL.");
          error.status = 400;
          throw error;
        }
      }
    }

    // 7. Location & notes
    if (input.location !== undefined) {
      updates.location = input.location ? String(input.location).trim() : null;
    }
    if (input.notes !== undefined) {
      updates.notes = input.notes ? String(input.notes).trim() : null;
    }

    const updated = await interviewRepository.updateInterview(id, updates);

    await auditService.record({
      userId: (updates as any).updated_by || null,
      action: "UPDATE",
      module: "INTERVIEWS",
      entityType: "INTERVIEW",
      entityId: id,
      oldValues: {
        status: existing.status,
        interview_type: existing.interview_type,
        scheduled_at: existing.scheduled_at,
        duration_minutes: existing.duration_minutes,
        interviewer_id: existing.interviewer_id,
      },
      newValues: {
        status: updated?.status,
        interview_type: updated?.interview_type,
        scheduled_at: updated?.scheduled_at,
        duration_minutes: updated?.duration_minutes,
        interviewer_id: updated?.interviewer_id,
      },
    });

    return updated!;
  }

  /**
   * Deletes an interview and its associated feedback.
   */
  public async deleteInterview(id: string, userId?: string): Promise<void> {
    const existing = await interviewRepository.findById(id);
    if (!existing) {
      const error: any = new Error(`Interview not found with id: ${id}`);
      error.status = 404;
      throw error;
    }

    await interviewRepository.deleteInterview(id);

    await auditService.record({
      userId: userId ?? null,
      action: "DELETE",
      module: "INTERVIEWS",
      entityType: "INTERVIEW",
      entityId: id,
      oldValues: {
        application_id: existing.application_id,
        interview_type: existing.interview_type,
        scheduled_at: existing.scheduled_at,
        status: existing.status,
      },
    });
  }

  // --------------------------------------------------------------------------
  // Feedback Operations
  // --------------------------------------------------------------------------

  /**
   * Submits feedback for an interview by the assigned interviewer.
   */
  public async submitFeedback(
    interviewId: string,
    input: SubmitFeedbackInput,
    currentUser: any
  ): Promise<InterviewFeedbackRecord> {
    // 1. Verify interview exists
    const interview = await interviewRepository.findById(interviewId);
    if (!interview) {
      const error: any = new Error(`Interview not found with id: ${interviewId}`);
      error.status = 404;
      throw error;
    }

    // 2. Identity protection & interviewer verification:
    // The authenticated user submitting feedback must be the assigned interviewer for this interview (or Admin/SuperAdmin).
    // Arbitrary recruiters or users cannot submit feedback posing as another interviewer.
    const userId = currentUser?.user?.id || currentUser?.id;
    const userRoles: string[] = Array.isArray(currentUser?.roles)
      ? currentUser.roles.map((r: any) => (typeof r === "string" ? r : r?.name))
      : [];
    const isAdmin = userRoles.includes("ADMIN") || userRoles.includes("SUPER_ADMIN");

    if (!userId) {
      const error: any = new Error("Authentication required.");
      error.status = 401;
      throw error;
    }

    if (userId !== interview.interviewer_id && !isAdmin) {
      const error: any = new Error(
        "Only the assigned interviewer can submit feedback for this interview."
      );
      error.status = 403;
      throw error;
    }

    // 3. Uniqueness check: One feedback record per (interview_id, interviewer_id)
    const existingFeedback = await interviewRepository.findFeedbackByInterviewAndInterviewer(
      interviewId,
      userId
    );
    if (existingFeedback) {
      const error: any = new Error(
        "Feedback has already been submitted for this interview. Please update the existing feedback instead."
      );
      error.status = 409;
      throw error;
    }

    // 4. Validate rating: Integer in range 1-5
    const rating = Number(input.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      const error: any = new Error("rating must be an integer between 1 and 5.");
      error.status = 400;
      throw error;
    }

    // 5. Validate recommendation
    if (!VALID_INTERVIEW_RECOMMENDATIONS.includes(input.recommendation)) {
      const error: any = new Error(
        `Invalid recommendation: ${input.recommendation}. Must be one of: ${VALID_INTERVIEW_RECOMMENDATIONS.join(", ")}`
      );
      error.status = 400;
      throw error;
    }

    // 6. Text fields with safe limits
    const strengths = input.strengths ? String(input.strengths).trim() : null;
    const weaknesses = input.weaknesses ? String(input.weaknesses).trim() : null;
    const feedback = input.feedback ? String(input.feedback).trim() : null;

    const feedbackRecord = await interviewRepository.createFeedback({
      interview_id: interviewId,
      interviewer_id: userId,
      rating,
      strengths,
      weaknesses,
      feedback,
      recommendation: input.recommendation,
    });

    await auditService.record({
      userId,
      action: "CREATE",
      module: "INTERVIEWS",
      entityType: "INTERVIEW_FEEDBACK",
      entityId: feedbackRecord.id,
      newValues: {
        interview_id: interviewId,
        interviewer_id: userId,
        rating,
        recommendation: input.recommendation,
      },
    });

    return feedbackRecord;
  }

  /**
   * Retrieves all feedback records for an interview.
   */
  public async getFeedbackForInterview(interviewId: string) {
    const interview = await interviewRepository.findById(interviewId);
    if (!interview) {
      const error: any = new Error(`Interview not found with id: ${interviewId}`);
      error.status = 404;
      throw error;
    }

    return interviewRepository.findFeedbackByInterviewId(interviewId);
  }

  /**
   * Updates existing feedback. Only the original feedback author or an administrator may update.
   */
  public async updateFeedback(
    interviewId: string,
    feedbackId: string,
    input: UpdateFeedbackInput,
    currentUser: any
  ): Promise<InterviewFeedbackRecord> {
    const interview = await interviewRepository.findById(interviewId);
    if (!interview) {
      const error: any = new Error(`Interview not found with id: ${interviewId}`);
      error.status = 404;
      throw error;
    }

    const feedback = await interviewRepository.findFeedbackById(feedbackId);
    if (!feedback) {
      const error: any = new Error(`Feedback not found with id: ${feedbackId}`);
      error.status = 404;
      throw error;
    }

    // IDOR Protection: verify feedback belongs to the specified interview
    if (feedback.interview_id !== interviewId) {
      const error: any = new Error(
        `Feedback with id ${feedbackId} does not belong to interview ${interviewId}.`
      );
      error.status = 404;
      throw error;
    }

    // Author ownership check
    const userId = currentUser?.user?.id || currentUser?.id;
    const userRoles: string[] = Array.isArray(currentUser?.roles)
      ? currentUser.roles.map((r: any) => (typeof r === "string" ? r : r?.name))
      : [];
    const isAuthor = userId === feedback.interviewer_id;
    const isAdmin = userRoles.includes("ADMIN") || userRoles.includes("SUPER_ADMIN");

    if (!isAuthor && !isAdmin) {
      const error: any = new Error(
        "Only the original feedback author or an administrator can modify this feedback."
      );
      error.status = 403;
      throw error;
    }

    const updates: Partial<{
      rating: number;
      strengths: string | null;
      weaknesses: string | null;
      feedback: string | null;
      recommendation: InterviewRecommendation;
    }> = {};

    if (input.rating !== undefined) {
      const rating = Number(input.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        const error: any = new Error("rating must be an integer between 1 and 5.");
        error.status = 400;
        throw error;
      }
      updates.rating = rating;
    }

    if (input.recommendation !== undefined) {
      if (!VALID_INTERVIEW_RECOMMENDATIONS.includes(input.recommendation)) {
        const error: any = new Error(
          `Invalid recommendation: ${input.recommendation}. Must be one of: ${VALID_INTERVIEW_RECOMMENDATIONS.join(", ")}`
        );
        error.status = 400;
        throw error;
      }
      updates.recommendation = input.recommendation;
    }

    if (input.strengths !== undefined) {
      updates.strengths = input.strengths ? String(input.strengths).trim() : null;
    }
    if (input.weaknesses !== undefined) {
      updates.weaknesses = input.weaknesses ? String(input.weaknesses).trim() : null;
    }
    if (input.feedback !== undefined) {
      updates.feedback = input.feedback ? String(input.feedback).trim() : null;
    }

    const updated = await interviewRepository.updateFeedback(feedbackId, updates);

    await auditService.record({
      userId,
      action: "UPDATE",
      module: "INTERVIEWS",
      entityType: "INTERVIEW_FEEDBACK",
      entityId: feedbackId,
      oldValues: {
        rating: feedback.rating,
        recommendation: feedback.recommendation,
      },
      newValues: {
        rating: updated?.rating,
        recommendation: updated?.recommendation,
      },
    });

    return updated!;
  }

  /**
   * Deletes a feedback record. Requires interviews.delete permission.
   */
  public async deleteFeedback(
    interviewId: string,
    feedbackId: string,
    _currentUser: any
  ): Promise<void> {
    const interview = await interviewRepository.findById(interviewId);
    if (!interview) {
      const error: any = new Error(`Interview not found with id: ${interviewId}`);
      error.status = 404;
      throw error;
    }

    const feedback = await interviewRepository.findFeedbackById(feedbackId);
    if (!feedback) {
      const error: any = new Error(`Feedback not found with id: ${feedbackId}`);
      error.status = 404;
      throw error;
    }

    if (feedback.interview_id !== interviewId) {
      const error: any = new Error(
        `Feedback with id ${feedbackId} does not belong to interview ${interviewId}.`
      );
      error.status = 404;
      throw error;
    }

    await interviewRepository.deleteFeedback(feedbackId);

    const userId = _currentUser?.user?.id || _currentUser?.id || null;
    await auditService.record({
      userId,
      action: "DELETE",
      module: "INTERVIEWS",
      entityType: "INTERVIEW_FEEDBACK",
      entityId: feedbackId,
      oldValues: {
        interview_id: interviewId,
        interviewer_id: feedback.interviewer_id,
        rating: feedback.rating,
        recommendation: feedback.recommendation,
      },
    });
  }
}

export const interviewService = new InterviewService();
export default interviewService;
