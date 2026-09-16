import type { Request, Response } from "express";
import { interviewService } from "../services/interview.service.js";
import { userRepository } from "../repositories/user.repository.js";

/**
 * Admin: Get active users suitable for interviewer assignment
 * GET /api/admin/interviews/interviewers
 * Protected: interviews.read
 */
export async function getActiveInterviewers(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const users = await userRepository.findActiveUsers();
    res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve interviewers",
    });
  }
}

/**
 * Admin: Schedule an interview for an application
 * POST /api/admin/applications/:applicationId/interviews
 * Protected: interviews.create
 */
export async function scheduleApplicationInterview(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { applicationId } = req.params;
    const {
      interview_type,
      scheduled_at,
      duration_minutes,
      interviewer_id,
      meeting_link,
      location,
      notes,
    } = req.body;

    const interview = await interviewService.scheduleInterview(
      applicationId,
      {
        interview_type,
        scheduled_at,
        duration_minutes,
        interviewer_id,
        meeting_link,
        location,
        notes,
      },
      (req as any).user
    );

    res.status(201).json({
      success: true,
      message: "Interview scheduled successfully.",
      data: interview,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to schedule interview",
    });
  }
}

/**
 * Admin: Get all interviews for a specific application
 * GET /api/admin/applications/:applicationId/interviews
 * Protected: interviews.read
 */
export async function getApplicationInterviews(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { applicationId } = req.params;
    const interviews = await interviewService.getInterviewsForApplication(applicationId);

    res.json({
      success: true,
      data: interviews,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve interviews",
    });
  }
}

/**
 * Admin: Global list of interviews with filters and pagination
 * GET /api/admin/interviews
 * Protected: interviews.read
 */
export async function listAllInterviews(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const {
      application_id,
      interviewer_id,
      status,
      from_date,
      to_date,
      page,
      limit,
    } = req.query;

    const fromDate = from_date ? new Date(String(from_date)) : undefined;
    const toDate = to_date ? new Date(String(to_date)) : undefined;

    const result = await interviewService.listInterviews({
      applicationId: application_id ? String(application_id) : undefined,
      interviewerId: interviewer_id ? String(interviewer_id) : undefined,
      status: status ? (String(status) as any) : undefined,
      fromDate: fromDate && !isNaN(fromDate.getTime()) ? fromDate : undefined,
      toDate: toDate && !isNaN(toDate.getTime()) ? toDate : undefined,
      page: page ? parseInt(String(page), 10) : 1,
      limit: limit ? parseInt(String(limit), 10) : 20,
    });

    res.json({
      success: true,
      data: result.interviews,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to list interviews",
    });
  }
}

/**
 * Admin: Get single interview details with feedback
 * GET /api/admin/interviews/:id
 * Protected: interviews.read
 */
export async function getInterviewDetails(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const interview = await interviewService.getInterviewById(id);

    res.json({
      success: true,
      data: interview,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve interview details",
    });
  }
}

/**
 * Admin: Update interview details and lifecycle status
 * PATCH /api/admin/interviews/:id
 * Protected: interviews.update
 */
export async function updateInterview(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const {
      interview_type,
      scheduled_at,
      duration_minutes,
      interviewer_id,
      meeting_link,
      location,
      status,
      notes,
    } = req.body;

    const updated = await interviewService.updateInterview(id, {
      interview_type,
      scheduled_at,
      duration_minutes,
      interviewer_id,
      meeting_link,
      location,
      status,
      notes,
    });

    res.json({
      success: true,
      message: "Interview updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update interview",
    });
  }
}

/**
 * Admin: Delete interview and its feedback
 * DELETE /api/admin/interviews/:id
 * Protected: interviews.delete
 */
export async function deleteInterview(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    await interviewService.deleteInterview(id);

    res.json({
      success: true,
      message: "Interview deleted successfully.",
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete interview",
    });
  }
}

// --------------------------------------------------------------------------
// Feedback Controllers
// --------------------------------------------------------------------------

/**
 * Admin/Interviewer: Submit interview feedback
 * POST /api/admin/interviews/:interviewId/feedback
 * Protected: interviews.update
 */
export async function submitInterviewFeedback(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { interviewId } = req.params;
    const { rating, strengths, weaknesses, feedback, recommendation } = req.body;

    const feedbackRecord = await interviewService.submitFeedback(
      interviewId,
      {
        rating,
        strengths,
        weaknesses,
        feedback,
        recommendation,
      },
      (req as any).user
    );

    res.status(201).json({
      success: true,
      message: "Interview feedback submitted successfully.",
      data: feedbackRecord,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to submit feedback",
    });
  }
}

/**
 * Admin/Interviewer: Get feedback records for an interview
 * GET /api/admin/interviews/:interviewId/feedback
 * Protected: interviews.read
 */
export async function getInterviewFeedback(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { interviewId } = req.params;
    const feedbackList = await interviewService.getFeedbackForInterview(interviewId);

    res.json({
      success: true,
      data: feedbackList,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve feedback",
    });
  }
}

/**
 * Admin/Interviewer: Update existing feedback
 * PATCH /api/admin/interviews/:interviewId/feedback/:feedbackId
 * Protected: interviews.update
 */
export async function updateInterviewFeedback(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { interviewId, feedbackId } = req.params;
    const { rating, strengths, weaknesses, feedback, recommendation } = req.body;

    const updated = await interviewService.updateFeedback(
      interviewId,
      feedbackId,
      {
        rating,
        strengths,
        weaknesses,
        feedback,
        recommendation,
      },
      (req as any).user
    );

    res.json({
      success: true,
      message: "Feedback updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update feedback",
    });
  }
}

/**
 * Admin: Delete feedback record
 * DELETE /api/admin/interviews/:interviewId/feedback/:feedbackId
 * Protected: interviews.delete
 */
export async function deleteInterviewFeedback(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { interviewId, feedbackId } = req.params;

    await interviewService.deleteFeedback(
      interviewId,
      feedbackId,
      (req as any).user
    );

    res.json({
      success: true,
      message: "Feedback deleted successfully.",
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete feedback",
    });
  }
}
