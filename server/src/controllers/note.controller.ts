import type { Request, Response } from "express";
import { noteService } from "../services/note.service.js";

/**
 * Recruiter/Admin: Create a private note on an application
 * POST /api/admin/applications/:applicationId/notes
 * Protected: notes.create
 */
export async function createApplicationNote(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { applicationId } = req.params;
    const { note } = req.body;

    const created = await noteService.createNote(
      applicationId,
      note,
      (req as any).user
    );

    res.status(201).json({
      success: true,
      message: "Note created successfully.",
      data: created,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create note",
    });
  }
}

/**
 * Recruiter/Admin: Retrieve notes for an application
 * GET /api/admin/applications/:applicationId/notes
 * Protected: notes.read
 */
export async function getApplicationNotes(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { applicationId } = req.params;
    const notes = await noteService.getNotesForApplication(applicationId);

    res.json({
      success: true,
      data: notes,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve application notes",
    });
  }
}

/**
 * Recruiter/Admin: Retrieve a single note by ID
 * GET /api/admin/applications/:applicationId/notes/:noteId
 * Protected: notes.read
 */
export async function getApplicationNoteById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { applicationId, noteId } = req.params;
    const note = await noteService.getNoteById(applicationId, noteId);

    res.json({
      success: true,
      data: note,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve note",
    });
  }
}

/**
 * Recruiter/Admin: Update note content
 * PATCH /api/admin/applications/:applicationId/notes/:noteId
 * Protected: notes.update
 */
export async function updateApplicationNote(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { applicationId, noteId } = req.params;
    const { note } = req.body;

    const updated = await noteService.updateNote(
      applicationId,
      noteId,
      note,
      (req as any).user
    );

    res.json({
      success: true,
      message: "Note updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update note",
    });
  }
}

/**
 * Recruiter/Admin: Delete note
 * DELETE /api/admin/applications/:applicationId/notes/:noteId
 * Protected: notes.delete
 */
export async function deleteApplicationNote(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { applicationId, noteId } = req.params;

    await noteService.deleteNote(
      applicationId,
      noteId,
      (req as any).user
    );

    res.json({
      success: true,
      message: "Note deleted successfully.",
    });
  } catch (error: any) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete note",
    });
  }
}
