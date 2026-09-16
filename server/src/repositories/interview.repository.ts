import { randomUUID } from "node:crypto";
import { eq, and, desc, asc, gte, lte, sql, count } from "drizzle-orm";
import { getDb } from "../db/index.js";
import {
  sqliteSchema,
  pgSchema,
  type InterviewRecord,
  type InterviewFeedbackRecord,
  type InterviewStatus,
  type InterviewRecommendation,
} from "../db/schema.js";
import config from "../config/index.js";

function getTables() {
  const isPg = config.database.provider === "postgresql";
  return isPg ? pgSchema : sqliteSchema;
}

export interface FindInterviewsFilter {
  applicationId?: string;
  interviewerId?: string;
  status?: InterviewStatus;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
}

export interface InterviewWithInterviewerAndFeedback extends InterviewRecord {
  interviewer?: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
  application?: {
    id: string;
    application_number: string;
    full_name: string;
    email: string;
    job_id: string;
  } | null;
  feedback?: Array<InterviewFeedbackRecord & {
    interviewer?: {
      id: string;
      full_name: string | null;
      email: string;
    } | null;
  }>;
}

export class InterviewRepository {
  public async createInterview(data: {
    application_id: string;
    interview_type: string;
    scheduled_at: Date;
    duration_minutes: number;
    meeting_link?: string | null;
    location?: string | null;
    interviewer_id: string;
    status?: InterviewStatus;
    notes?: string | null;
  }): Promise<InterviewRecord> {
    const db = getDb() as any;
    const tables = getTables();
    const id = randomUUID();
    const now = new Date();

    const newRecord = {
      id,
      application_id: data.application_id,
      interview_type: data.interview_type,
      scheduled_at: data.scheduled_at,
      duration_minutes: data.duration_minutes,
      meeting_link: data.meeting_link ?? null,
      location: data.location ?? null,
      interviewer_id: data.interviewer_id,
      status: data.status ?? "SCHEDULED",
      notes: data.notes ?? null,
      created_at: now,
      updated_at: now,
    };

    await db.insert(tables.interviews).values(newRecord);
    return newRecord as InterviewRecord;
  }

  public async findById(id: string): Promise<InterviewRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const rows = await db
      .select()
      .from(tables.interviews)
      .where(eq(tables.interviews.id, id))
      .limit(1);

    if (!rows || rows.length === 0) return null;
    return rows[0] as InterviewRecord;
  }

  public async findByApplicationId(applicationId: string): Promise<InterviewRecord[]> {
    const db = getDb() as any;
    const tables = getTables();

    const rows = await db
      .select()
      .from(tables.interviews)
      .where(eq(tables.interviews.application_id, applicationId))
      .orderBy(asc(tables.interviews.scheduled_at));

    return rows as InterviewRecord[];
  }

  public async findInterviews(filter: FindInterviewsFilter = {}): Promise<{
    interviews: InterviewWithInterviewerAndFeedback[];
    total: number;
    page: number;
    limit: number;
  }> {
    const db = getDb() as any;
    const tables = getTables();
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(100, Math.max(1, filter.limit ?? 20));
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (filter.applicationId) {
      conditions.push(eq(tables.interviews.application_id, filter.applicationId));
    }
    if (filter.interviewerId) {
      conditions.push(eq(tables.interviews.interviewer_id, filter.interviewerId));
    }
    if (filter.status) {
      conditions.push(eq(tables.interviews.status, filter.status));
    }
    if (filter.fromDate) {
      conditions.push(gte(tables.interviews.scheduled_at, filter.fromDate));
    }
    if (filter.toDate) {
      conditions.push(lte(tables.interviews.scheduled_at, filter.toDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Total count
    const totalCountRes = await db
      .select({ count: count() })
      .from(tables.interviews)
      .where(whereClause);
    const total = Number(totalCountRes[0]?.count ?? 0);

    // Get paginated interview records
    let query = db
      .select({
        interview: tables.interviews,
        interviewer: {
          id: tables.users.id,
          full_name: tables.users.full_name,
          email: tables.users.email,
        },
        application: {
          id: tables.applications.id,
          application_number: tables.applications.application_number,
          full_name: tables.applications.full_name,
          email: tables.applications.email,
          job_id: tables.applications.job_id,
        },
      })
      .from(tables.interviews)
      .leftJoin(tables.users, eq(tables.interviews.interviewer_id, tables.users.id))
      .leftJoin(tables.applications, eq(tables.interviews.application_id, tables.applications.id));

    if (whereClause) {
      query = query.where(whereClause);
    }

    const rows = await query
      .orderBy(desc(tables.interviews.scheduled_at))
      .limit(limit)
      .offset(offset);

    // For each interview, load feedback
    const interviewIds = rows.map((r: any) => r.interview.id);
    let allFeedback: any[] = [];
    if (interviewIds.length > 0) {
      allFeedback = await db
        .select({
          feedback: tables.interviewFeedback,
          interviewer: {
            id: tables.users.id,
            full_name: tables.users.full_name,
            email: tables.users.email,
          },
        })
        .from(tables.interviewFeedback)
        .leftJoin(tables.users, eq(tables.interviewFeedback.interviewer_id, tables.users.id));
    }

    const feedbackMap = new Map<string, any[]>();
    for (const fb of allFeedback) {
      const iId = fb.feedback.interview_id;
      if (!feedbackMap.has(iId)) {
        feedbackMap.set(iId, []);
      }
      feedbackMap.get(iId)!.push({
        ...fb.feedback,
        interviewer: fb.interviewer,
      });
    }

    const interviews: InterviewWithInterviewerAndFeedback[] = rows.map((r: any) => ({
      ...r.interview,
      interviewer: r.interviewer?.id ? r.interviewer : null,
      application: r.application?.id ? r.application : null,
      feedback: feedbackMap.get(r.interview.id) ?? [],
    }));

    return {
      interviews,
      total,
      page,
      limit,
    };
  }

  public async getInterviewWithDetails(id: string): Promise<InterviewWithInterviewerAndFeedback | null> {
    const db = getDb() as any;
    const tables = getTables();

    const rows = await db
      .select({
        interview: tables.interviews,
        interviewer: {
          id: tables.users.id,
          full_name: tables.users.full_name,
          email: tables.users.email,
        },
        application: {
          id: tables.applications.id,
          application_number: tables.applications.application_number,
          full_name: tables.applications.full_name,
          email: tables.applications.email,
          job_id: tables.applications.job_id,
        },
      })
      .from(tables.interviews)
      .leftJoin(tables.users, eq(tables.interviews.interviewer_id, tables.users.id))
      .leftJoin(tables.applications, eq(tables.interviews.application_id, tables.applications.id))
      .where(eq(tables.interviews.id, id))
      .limit(1);

    if (!rows || rows.length === 0) return null;

    const feedbackRows = await db
      .select({
        feedback: tables.interviewFeedback,
        interviewer: {
          id: tables.users.id,
          full_name: tables.users.full_name,
          email: tables.users.email,
        },
      })
      .from(tables.interviewFeedback)
      .leftJoin(tables.users, eq(tables.interviewFeedback.interviewer_id, tables.users.id))
      .where(eq(tables.interviewFeedback.interview_id, id));

    const feedback = feedbackRows.map((fb: any) => ({
      ...fb.feedback,
      interviewer: fb.interviewer?.id ? fb.interviewer : null,
    }));

    return {
      ...rows[0].interview,
      interviewer: rows[0].interviewer?.id ? rows[0].interviewer : null,
      application: rows[0].application?.id ? rows[0].application : null,
      feedback,
    };
  }

  public async getInterviewsForApplicationWithFeedback(
    applicationId: string
  ): Promise<InterviewWithInterviewerAndFeedback[]> {
    const db = getDb() as any;
    const tables = getTables();

    const rows = await db
      .select({
        interview: tables.interviews,
        interviewer: {
          id: tables.users.id,
          full_name: tables.users.full_name,
          email: tables.users.email,
        },
      })
      .from(tables.interviews)
      .leftJoin(tables.users, eq(tables.interviews.interviewer_id, tables.users.id))
      .where(eq(tables.interviews.application_id, applicationId))
      .orderBy(asc(tables.interviews.scheduled_at));

    if (!rows || rows.length === 0) return [];

    const feedbackRows = await db
      .select({
        feedback: tables.interviewFeedback,
        interviewer: {
          id: tables.users.id,
          full_name: tables.users.full_name,
          email: tables.users.email,
        },
      })
      .from(tables.interviewFeedback)
      .leftJoin(tables.users, eq(tables.interviewFeedback.interviewer_id, tables.users.id));

    const feedbackMap = new Map<string, any[]>();
    for (const fb of feedbackRows) {
      const iId = fb.feedback.interview_id;
      if (!feedbackMap.has(iId)) {
        feedbackMap.set(iId, []);
      }
      feedbackMap.get(iId)!.push({
        ...fb.feedback,
        interviewer: fb.interviewer?.id ? fb.interviewer : null,
      });
    }

    return rows.map((r: any) => ({
      ...r.interview,
      interviewer: r.interviewer?.id ? r.interviewer : null,
      feedback: feedbackMap.get(r.interview.id) ?? [],
    }));
  }

  public async updateInterview(
    id: string,
    updates: Partial<{
      interview_type: string;
      scheduled_at: Date;
      duration_minutes: number;
      meeting_link: string | null;
      location: string | null;
      interviewer_id: string;
      status: InterviewStatus;
      notes: string | null;
    }>
  ): Promise<InterviewRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const existing = await this.findById(id);
    if (!existing) return null;

    const now = new Date();
    const patchData: any = {
      ...updates,
      updated_at: now,
    };

    await db
      .update(tables.interviews)
      .set(patchData)
      .where(eq(tables.interviews.id, id));

    return this.findById(id);
  }

  public async deleteInterview(id: string): Promise<boolean> {
    const db = getDb() as any;
    const tables = getTables();

    const existing = await this.findById(id);
    if (!existing) return false;

    // Delete feedback first if cascade is not enabled at connection level (e.g. SQLite foreign keys default)
    await db
      .delete(tables.interviewFeedback)
      .where(eq(tables.interviewFeedback.interview_id, id));

    await db
      .delete(tables.interviews)
      .where(eq(tables.interviews.id, id));

    return true;
  }

  // --------------------------------------------------------------------------
  // Feedback Data Access
  // --------------------------------------------------------------------------

  public async createFeedback(data: {
    interview_id: string;
    interviewer_id: string;
    rating: number;
    strengths?: string | null;
    weaknesses?: string | null;
    feedback?: string | null;
    recommendation: InterviewRecommendation;
  }): Promise<InterviewFeedbackRecord> {
    const db = getDb() as any;
    const tables = getTables();
    const id = randomUUID();
    const now = new Date();

    const newFeedback = {
      id,
      interview_id: data.interview_id,
      interviewer_id: data.interviewer_id,
      rating: data.rating,
      strengths: data.strengths ?? null,
      weaknesses: data.weaknesses ?? null,
      feedback: data.feedback ?? null,
      recommendation: data.recommendation,
      created_at: now,
      updated_at: now,
    };

    await db.insert(tables.interviewFeedback).values(newFeedback);
    return newFeedback as InterviewFeedbackRecord;
  }

  public async findFeedbackById(id: string): Promise<InterviewFeedbackRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const rows = await db
      .select()
      .from(tables.interviewFeedback)
      .where(eq(tables.interviewFeedback.id, id))
      .limit(1);

    if (!rows || rows.length === 0) return null;
    return rows[0] as InterviewFeedbackRecord;
  }

  public async findFeedbackByInterviewAndInterviewer(
    interviewId: string,
    interviewerId: string
  ): Promise<InterviewFeedbackRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const rows = await db
      .select()
      .from(tables.interviewFeedback)
      .where(
        and(
          eq(tables.interviewFeedback.interview_id, interviewId),
          eq(tables.interviewFeedback.interviewer_id, interviewerId)
        )
      )
      .limit(1);

    if (!rows || rows.length === 0) return null;
    return rows[0] as InterviewFeedbackRecord;
  }

  public async findFeedbackByInterviewId(
    interviewId: string
  ): Promise<Array<InterviewFeedbackRecord & { interviewer?: { id: string; full_name: string | null; email: string } | null }>> {
    const db = getDb() as any;
    const tables = getTables();

    const rows = await db
      .select({
        feedback: tables.interviewFeedback,
        interviewer: {
          id: tables.users.id,
          full_name: tables.users.full_name,
          email: tables.users.email,
        },
      })
      .from(tables.interviewFeedback)
      .leftJoin(tables.users, eq(tables.interviewFeedback.interviewer_id, tables.users.id))
      .where(eq(tables.interviewFeedback.interview_id, interviewId))
      .orderBy(desc(tables.interviewFeedback.created_at));

    return rows.map((r: any) => ({
      ...r.feedback,
      interviewer: r.interviewer?.id ? r.interviewer : null,
    }));
  }

  public async updateFeedback(
    id: string,
    updates: Partial<{
      rating: number;
      strengths: string | null;
      weaknesses: string | null;
      feedback: string | null;
      recommendation: InterviewRecommendation;
    }>
  ): Promise<InterviewFeedbackRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const existing = await this.findFeedbackById(id);
    if (!existing) return null;

    const now = new Date();
    const patchData: any = {
      ...updates,
      updated_at: now,
    };

    await db
      .update(tables.interviewFeedback)
      .set(patchData)
      .where(eq(tables.interviewFeedback.id, id));

    return this.findFeedbackById(id);
  }

  public async deleteFeedback(id: string): Promise<boolean> {
    const db = getDb() as any;
    const tables = getTables();

    const existing = await this.findFeedbackById(id);
    if (!existing) return false;

    await db
      .delete(tables.interviewFeedback)
      .where(eq(tables.interviewFeedback.id, id));

    return true;
  }
}

export const interviewRepository = new InterviewRepository();
export default interviewRepository;
