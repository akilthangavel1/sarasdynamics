import { randomUUID } from "node:crypto";
import { eq, desc } from "drizzle-orm";
import { getDb } from "../db/index.js";
import {
  sqliteSchema,
  pgSchema,
  type ApplicationNoteRecord,
} from "../db/schema.js";
import config from "../config/index.js";

function getTables() {
  const isPg = config.database.provider === "postgresql";
  return isPg ? pgSchema : sqliteSchema;
}

export interface ApplicationNoteWithAuthor extends ApplicationNoteRecord {
  author: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export class NoteRepository {
  /**
   * Create a new application note
   */
  public async createNote(data: {
    id?: string;
    application_id: string;
    user_id: string;
    note: string;
  }): Promise<ApplicationNoteRecord> {
    const db = getDb() as any;
    const tables = getTables();
    const id = data.id || randomUUID();
    const now = new Date();

    const record: ApplicationNoteRecord = {
      id,
      application_id: data.application_id,
      user_id: data.user_id,
      note: data.note,
      created_at: now,
      updated_at: now,
    };

    await db.insert(tables.applicationNotes).values(record);
    return record;
  }

  /**
   * Find a note by ID
   */
  public async findById(id: string): Promise<ApplicationNoteRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const rows = await db
      .select()
      .from(tables.applicationNotes)
      .where(eq(tables.applicationNotes.id, id))
      .limit(1);

    if (!rows || rows.length === 0) return null;
    return rows[0] as ApplicationNoteRecord;
  }

  /**
   * Find a note by ID with author details
   */
  public async findNoteWithAuthor(
    id: string
  ): Promise<ApplicationNoteWithAuthor | null> {
    const db = getDb() as any;
    const tables = getTables();

    const rows = await db
      .select({
        note: tables.applicationNotes,
        author: {
          id: tables.users.id,
          full_name: tables.users.full_name,
          email: tables.users.email,
        },
      })
      .from(tables.applicationNotes)
      .leftJoin(tables.users, eq(tables.applicationNotes.user_id, tables.users.id))
      .where(eq(tables.applicationNotes.id, id))
      .limit(1);

    if (!rows || rows.length === 0) return null;

    const r = rows[0];
    return {
      ...r.note,
      author: {
        id: r.author?.id || r.note.user_id,
        full_name: r.author?.full_name ?? null,
        email: r.author?.email || "",
      },
    };
  }

  /**
   * Find all notes for an application, sorted newest first
   */
  public async findByApplicationId(
    applicationId: string
  ): Promise<ApplicationNoteWithAuthor[]> {
    const db = getDb() as any;
    const tables = getTables();

    const rows = await db
      .select({
        note: tables.applicationNotes,
        author: {
          id: tables.users.id,
          full_name: tables.users.full_name,
          email: tables.users.email,
        },
      })
      .from(tables.applicationNotes)
      .leftJoin(tables.users, eq(tables.applicationNotes.user_id, tables.users.id))
      .where(eq(tables.applicationNotes.application_id, applicationId))
      .orderBy(
        desc(tables.applicationNotes.created_at),
        desc(tables.applicationNotes.id)
      );

    return rows.map((r: any) => ({
      ...r.note,
      author: {
        id: r.author?.id || r.note.user_id,
        full_name: r.author?.full_name ?? null,
        email: r.author?.email || "",
      },
    }));
  }

  /**
   * Update note text and updated_at
   */
  public async updateNote(
    id: string,
    noteText: string
  ): Promise<ApplicationNoteRecord | null> {
    const db = getDb() as any;
    const tables = getTables();
    const now = new Date();

    await db
      .update(tables.applicationNotes)
      .set({
        note: noteText,
        updated_at: now,
      })
      .where(eq(tables.applicationNotes.id, id));

    return this.findById(id);
  }

  /**
   * Delete a note by ID
   */
  public async deleteNote(id: string): Promise<boolean> {
    const db = getDb() as any;
    const tables = getTables();

    await db
      .delete(tables.applicationNotes)
      .where(eq(tables.applicationNotes.id, id));

    return true;
  }

  /**
   * Delete all notes for an application
   */
  public async deleteByApplicationId(applicationId: string): Promise<boolean> {
    const db = getDb() as any;
    const tables = getTables();

    await db
      .delete(tables.applicationNotes)
      .where(eq(tables.applicationNotes.application_id, applicationId));

    return true;
  }
}

export const noteRepository = new NoteRepository();
export default noteRepository;
