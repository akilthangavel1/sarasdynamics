import { noteRepository, type ApplicationNoteWithAuthor } from "../repositories/note.repository.js";
import { applicationRepository } from "../repositories/application.repository.js";
import { auditService } from "./audit.service.js";
import type { ApplicationNoteRecord } from "../db/schema.js";

export const MAX_NOTE_LENGTH = 5000;

export interface CreateNoteInput {
  note: string;
}

export interface UpdateNoteInput {
  note: string;
}

export class NoteService {
  /**
   * Helper to extract user ID from authenticated request user context
   */
  private extractUserId(currentUser: any): string | null {
    return currentUser?.user?.id || currentUser?.id || null;
  }

  /**
   * Helper to check if user has admin/super_admin oversight roles
   */
  private isAdminUser(currentUser: any): boolean {
    const userRoles: string[] = Array.isArray(currentUser?.roles)
      ? currentUser.roles.map((r: any) => (typeof r === "string" ? r : r?.name))
      : [];
    return userRoles.includes("ADMIN") || userRoles.includes("SUPER_ADMIN");
  }

  /**
   * Creates a private internal note on an application
   */
  public async createNote(
    applicationId: string,
    noteText: unknown,
    currentUser: any
  ): Promise<ApplicationNoteWithAuthor> {
    if (!applicationId || typeof applicationId !== "string") {
      const error: any = new Error("applicationId must be a valid non-empty string.");
      error.status = 400;
      throw error;
    }

    // 1. Verify application exists
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      const error: any = new Error(`Application not found with id: ${applicationId}`);
      error.status = 404;
      throw error;
    }

    // 2. Validate note text
    if (typeof noteText !== "string") {
      const error: any = new Error("Note content must be a string.");
      error.status = 400;
      throw error;
    }

    const trimmed = noteText.trim();
    if (trimmed.length === 0) {
      const error: any = new Error("Note cannot be empty.");
      error.status = 400;
      throw error;
    }

    if (trimmed.length > MAX_NOTE_LENGTH) {
      const error: any = new Error(
        `Note exceeds maximum permitted length of ${MAX_NOTE_LENGTH} characters.`
      );
      error.status = 400;
      throw error;
    }

    // 3. User identification (strict: backend assigns author)
    const userId = this.extractUserId(currentUser);
    if (!userId) {
      const error: any = new Error("Authentication required to create application note.");
      error.status = 401;
      throw error;
    }

    // 4. Create note record
    const created = await noteRepository.createNote({
      application_id: applicationId,
      user_id: userId,
      note: trimmed,
    });

    const noteWithAuthor = await noteRepository.findNoteWithAuthor(created.id);

    await auditService.record({
      userId,
      action: "CREATE",
      module: "NOTES",
      entityType: "APPLICATION_NOTE",
      entityId: created.id,
      newValues: {
        application_id: applicationId,
        user_id: userId,
        note_length: trimmed.length,
      },
    });

    return noteWithAuthor!;
  }

  /**
   * Retrieves all notes for an application, sorted newest first
   */
  public async getNotesForApplication(
    applicationId: string
  ): Promise<ApplicationNoteWithAuthor[]> {
    if (!applicationId || typeof applicationId !== "string") {
      const error: any = new Error("applicationId must be a valid non-empty string.");
      error.status = 400;
      throw error;
    }

    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      const error: any = new Error(`Application not found with id: ${applicationId}`);
      error.status = 404;
      throw error;
    }

    return noteRepository.findByApplicationId(applicationId);
  }

  /**
   * Retrieves a single note with IDOR verification
   */
  public async getNoteById(
    applicationId: string,
    noteId: string
  ): Promise<ApplicationNoteWithAuthor> {
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      const error: any = new Error(`Application not found with id: ${applicationId}`);
      error.status = 404;
      throw error;
    }

    const note = await noteRepository.findNoteWithAuthor(noteId);
    if (!note) {
      const error: any = new Error(`Note not found with id: ${noteId}`);
      error.status = 404;
      throw error;
    }

    // IDOR Protection: verify note belongs to the specified application
    if (note.application_id !== applicationId) {
      const error: any = new Error(
        `Note with id ${noteId} does not belong to application ${applicationId}.`
      );
      error.status = 404;
      throw error;
    }

    return note;
  }

  /**
   * Updates note text with IDOR verification and author/admin ownership checks
   */
  public async updateNote(
    applicationId: string,
    noteId: string,
    noteText: unknown,
    currentUser: any
  ): Promise<ApplicationNoteWithAuthor> {
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      const error: any = new Error(`Application not found with id: ${applicationId}`);
      error.status = 404;
      throw error;
    }

    const note = await noteRepository.findById(noteId);
    if (!note) {
      const error: any = new Error(`Note not found with id: ${noteId}`);
      error.status = 404;
      throw error;
    }

    // IDOR Protection
    if (note.application_id !== applicationId) {
      const error: any = new Error(
        `Note with id ${noteId} does not belong to application ${applicationId}.`
      );
      error.status = 404;
      throw error;
    }

    // Author ownership check
    const userId = this.extractUserId(currentUser);
    const isAuthor = userId === note.user_id;
    const isAdmin = this.isAdminUser(currentUser);

    if (!isAuthor && !isAdmin) {
      const error: any = new Error(
        "Only the note author or an administrator can modify this note."
      );
      error.status = 403;
      throw error;
    }

    // Validate update content
    if (typeof noteText !== "string") {
      const error: any = new Error("Note content must be a string.");
      error.status = 400;
      throw error;
    }

    const trimmed = noteText.trim();
    if (trimmed.length === 0) {
      const error: any = new Error("Note cannot be empty.");
      error.status = 400;
      throw error;
    }

    if (trimmed.length > MAX_NOTE_LENGTH) {
      const error: any = new Error(
        `Note exceeds maximum permitted length of ${MAX_NOTE_LENGTH} characters.`
      );
      error.status = 400;
      throw error;
    }

    await noteRepository.updateNote(noteId, trimmed);

    const updated = await noteRepository.findNoteWithAuthor(noteId);

    await auditService.record({
      userId,
      action: "UPDATE",
      module: "NOTES",
      entityType: "APPLICATION_NOTE",
      entityId: noteId,
      oldValues: {
        application_id: applicationId,
        note_length: note.note.length,
      },
      newValues: {
        application_id: applicationId,
        note_length: trimmed.length,
      },
    });

    return updated!;
  }

  /**
   * Deletes note with IDOR verification and author/admin ownership checks
   */
  public async deleteNote(
    applicationId: string,
    noteId: string,
    currentUser: any
  ): Promise<void> {
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      const error: any = new Error(`Application not found with id: ${applicationId}`);
      error.status = 404;
      throw error;
    }

    const note = await noteRepository.findById(noteId);
    if (!note) {
      const error: any = new Error(`Note not found with id: ${noteId}`);
      error.status = 404;
      throw error;
    }

    // IDOR Protection
    if (note.application_id !== applicationId) {
      const error: any = new Error(
        `Note with id ${noteId} does not belong to application ${applicationId}.`
      );
      error.status = 404;
      throw error;
    }

    // Author ownership check
    const userId = this.extractUserId(currentUser);
    const isAuthor = userId === note.user_id;
    const isAdmin = this.isAdminUser(currentUser);

    if (!isAuthor && !isAdmin) {
      const error: any = new Error(
        "Only the note author or an administrator can delete this note."
      );
      error.status = 403;
      throw error;
    }

    await noteRepository.deleteNote(noteId);

    await auditService.record({
      userId,
      action: "DELETE",
      module: "NOTES",
      entityType: "APPLICATION_NOTE",
      entityId: noteId,
      oldValues: {
        application_id: applicationId,
        user_id: note.user_id,
        note_length: note.note.length,
      },
    });
  }
}

export const noteService = new NoteService();
export default noteService;
