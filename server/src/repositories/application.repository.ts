import { randomUUID } from "node:crypto";
import { eq, and, desc, like, or, sql, count } from "drizzle-orm";
import { getDb } from "../db/index.js";
import {
  sqliteSchema,
  pgSchema,
  type ApplicationRecord,
  type ApplicationDocumentRecord,
  type ApplicationStatus,
  type DocumentType,
  type JobRecord,
} from "../db/schema.js";
import config from "../config/index.js";

function getTables() {
  const isPg = config.database.provider === "postgresql";
  return isPg ? pgSchema : sqliteSchema;
}

export interface FindApplicationsFilter {
  jobId?: string;
  status?: ApplicationStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ApplicationListItem {
  id: string;
  application_number: string;
  job_id: string;
  job_title?: string;
  job_slug?: string;
  full_name: string;
  email: string;
  phone: string;
  current_location: string | null;
  status: ApplicationStatus;
  created_at: Date;
  updated_at: Date;
}

export interface ApplicationDetailWithRelations extends ApplicationRecord {
  job?: JobRecord | null;
  documents: ApplicationDocumentRecord[];
}

export class ApplicationRepository {
  /**
   * Generates the next sequential human-readable application number: SD-YYYY-XXXXXX
   */
  public async getNextApplicationNumber(): Promise<string> {
    const db = getDb() as any;
    const tables = getTables();
    const year = new Date().getFullYear();
    const prefix = `SD-${year}-`;

    // Find the highest existing application number with this year's prefix
    const records = await db
      .select({ appNumber: tables.applications.application_number })
      .from(tables.applications)
      .where(like(tables.applications.application_number, `${prefix}%`))
      .orderBy(desc(tables.applications.application_number))
      .limit(1);

    let nextSeq = 1;
    if (records.length > 0 && records[0].appNumber) {
      const match = records[0].appNumber.replace(prefix, "");
      const currentSeq = parseInt(match, 10);
      if (!isNaN(currentSeq)) {
        nextSeq = currentSeq + 1;
      }
    }

    const seqFormatted = String(nextSeq).padStart(6, "0");
    return `${prefix}${seqFormatted}`;
  }

  /**
   * Create a new application
   */
  public async create(data: {
    id?: string;
    application_number: string;
    job_id: string;
    full_name: string;
    email: string;
    phone: string;
    current_location?: string | null;
    cover_letter?: string | null;
    status?: ApplicationStatus;
  }): Promise<ApplicationRecord> {
    const db = getDb() as any;
    const tables = getTables();
    const now = new Date();
    const id = data.id || randomUUID();
    const status: ApplicationStatus = data.status || "NEW";

    const record = {
      id,
      application_number: data.application_number,
      job_id: data.job_id,
      full_name: data.full_name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      current_location: data.current_location?.trim() || null,
      cover_letter: data.cover_letter?.trim() || null,
      status,
      created_at: now,
      updated_at: now,
    };

    await db.insert(tables.applications).values(record);
    return record as ApplicationRecord;
  }

  /**
   * Find application by job ID and candidate email (case-normalized)
   */
  public async findByJobAndEmail(
    jobId: string,
    email: string
  ): Promise<ApplicationRecord | null> {
    const db = getDb() as any;
    const tables = getTables();
    const normalizedEmail = email.trim().toLowerCase();

    const results = await db
      .select()
      .from(tables.applications)
      .where(
        and(
          eq(tables.applications.job_id, jobId),
          eq(tables.applications.email, normalizedEmail)
        )
      )
      .limit(1);

    return results[0] || null;
  }

  /**
   * Find application by ID
   */
  public async findById(id: string): Promise<ApplicationRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const results = await db
      .select()
      .from(tables.applications)
      .where(eq(tables.applications.id, id))
      .limit(1);

    return results[0] || null;
  }

  /**
   * Find application by human-readable application number
   */
  public async findByApplicationNumber(
    applicationNumber: string
  ): Promise<ApplicationRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const results = await db
      .select()
      .from(tables.applications)
      .where(eq(tables.applications.application_number, applicationNumber))
      .limit(1);

    return results[0] || null;
  }

  /**
   * Find applications with filters and pagination for Admin List view
   */
  public async findWithFilters(filters: FindApplicationsFilter): Promise<{
    applications: ApplicationListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const db = getDb() as any;
    const tables = getTables();

    const conditions: any[] = [];

    if (filters.jobId) {
      conditions.push(eq(tables.applications.job_id, filters.jobId));
    }

    if (filters.status) {
      conditions.push(eq(tables.applications.status, filters.status));
    }

    if (filters.search) {
      const term = `%${filters.search.trim().toLowerCase()}%`;
      conditions.push(
        or(
          like(sql`lower(${tables.applications.full_name})`, term),
          like(sql`lower(${tables.applications.email})`, term),
          like(sql`lower(${tables.applications.phone})`, term),
          like(sql`lower(${tables.applications.application_number})`, term)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: count() })
      .from(tables.applications)
      .where(whereClause);
    const total = Number(countResult[0]?.count || 0);

    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const offset = (page - 1) * limit;

    const rows = await db
      .select({
        id: tables.applications.id,
        application_number: tables.applications.application_number,
        job_id: tables.applications.job_id,
        full_name: tables.applications.full_name,
        email: tables.applications.email,
        phone: tables.applications.phone,
        current_location: tables.applications.current_location,
        status: tables.applications.status,
        created_at: tables.applications.created_at,
        updated_at: tables.applications.updated_at,
        job_title: tables.jobs.title,
        job_slug: tables.jobs.slug,
      })
      .from(tables.applications)
      .leftJoin(tables.jobs, eq(tables.applications.job_id, tables.jobs.id))
      .where(whereClause)
      .orderBy(desc(tables.applications.created_at))
      .limit(limit)
      .offset(offset);

    return {
      applications: rows as ApplicationListItem[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Find application with full relations (job and documents)
   */
  public async findDetailWithRelations(
    id: string
  ): Promise<ApplicationDetailWithRelations | null> {
    const db = getDb() as any;
    const tables = getTables();

    const app = await this.findById(id);
    if (!app) return null;

    // Fetch associated job
    const jobResults = await db
      .select()
      .from(tables.jobs)
      .where(eq(tables.jobs.id, app.job_id))
      .limit(1);

    const documents = await this.findDocumentsByApplicationId(id);

    return {
      ...app,
      job: jobResults[0] || null,
      documents,
    };
  }

  /**
   * Update application status
   */
  public async updateStatus(
    id: string,
    status: ApplicationStatus
  ): Promise<ApplicationRecord | null> {
    const db = getDb() as any;
    const tables = getTables();
    const now = new Date();

    await db
      .update(tables.applications)
      .set({
        status,
        updated_at: now,
      })
      .where(eq(tables.applications.id, id));

    return this.findById(id);
  }

  /**
   * Delete application by ID
   */
  public async delete(id: string): Promise<boolean> {
    const db = getDb() as any;
    const tables = getTables();

    // Cascading foreign keys or manual cascade will remove notes and documents
    if (tables.applicationNotes) {
      await db
        .delete(tables.applicationNotes)
        .where(eq(tables.applicationNotes.application_id, id));
    }

    if (tables.interviewFeedback && tables.interviews) {
      const appInterviews = await db
        .select({ id: tables.interviews.id })
        .from(tables.interviews)
        .where(eq(tables.interviews.application_id, id));
      for (const inv of appInterviews) {
        await db
          .delete(tables.interviewFeedback)
          .where(eq(tables.interviewFeedback.interview_id, inv.id));
      }
      await db
        .delete(tables.interviews)
        .where(eq(tables.interviews.application_id, id));
    }

    await db
      .delete(tables.applicationDocuments)
      .where(eq(tables.applicationDocuments.application_id, id));

    await db
      .delete(tables.applications)
      .where(eq(tables.applications.id, id));

    return true;
  }

  // --- Application Documents methods ---

  /**
   * Create document record in database
   */
  public async createDocument(data: {
    id?: string;
    application_id: string;
    document_type?: DocumentType;
    file_name: string;
    file_key: string;
    file_size: number;
    mime_type: string;
  }): Promise<ApplicationDocumentRecord> {
    const db = getDb() as any;
    const tables = getTables();
    const now = new Date();
    const id = data.id || randomUUID();

    const record: ApplicationDocumentRecord = {
      id,
      application_id: data.application_id,
      document_type: data.document_type || "RESUME",
      file_name: data.file_name,
      file_key: data.file_key,
      file_size: data.file_size,
      mime_type: data.mime_type,
      created_at: now,
      updated_at: now,
    };

    await db.insert(tables.applicationDocuments).values(record);
    return record;
  }

  /**
   * Find documents for an application
   */
  public async findDocumentsByApplicationId(
    applicationId: string
  ): Promise<ApplicationDocumentRecord[]> {
    const db = getDb() as any;
    const tables = getTables();

    return db
      .select()
      .from(tables.applicationDocuments)
      .where(eq(tables.applicationDocuments.application_id, applicationId))
      .orderBy(desc(tables.applicationDocuments.created_at));
  }

  /**
   * Find a specific document by its ID
   */
  public async findDocumentById(
    documentId: string
  ): Promise<ApplicationDocumentRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const results = await db
      .select()
      .from(tables.applicationDocuments)
      .where(eq(tables.applicationDocuments.id, documentId))
      .limit(1);

    return results[0] || null;
  }
}

export const applicationRepository = new ApplicationRepository();
export default applicationRepository;
