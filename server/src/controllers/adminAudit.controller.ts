import type { Response } from "express";
import { auditRepository } from "../repositories/audit.repository.js";
import type { AuthenticatedRequest, ApiResponse } from "../types/index.js";

/**
 * Admin: List and filter audit logs
 * GET /api/admin/audit-logs
 * Requires: audit_logs.read
 */
export async function getAdminAuditLogs(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const {
      module,
      action,
      entity_type,
      entity_id,
      user_id,
      startDate,
      endDate,
      search,
      page = "1",
      limit = "25",
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page as string, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 25));

    const result = await auditRepository.findMany({
      module: typeof module === "string" ? module : undefined,
      action: typeof action === "string" ? action : undefined,
      entity_type: typeof entity_type === "string" ? entity_type : undefined,
      entity_id: typeof entity_id === "string" ? entity_id : undefined,
      user_id: typeof user_id === "string" ? user_id : undefined,
      startDate: typeof startDate === "string" ? startDate : undefined,
      endDate: typeof endDate === "string" ? endDate : undefined,
      search: typeof search === "string" ? search : undefined,
      page: parsedPage,
      limit: parsedLimit,
    });

    const response: ApiResponse<typeof result.logs> = {
      success: true,
      message: "Audit logs retrieved successfully",
      data: result.logs,
    };

    res.json({
      ...response,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve audit logs",
    });
  }
}

/**
 * Admin: Get single audit log entry by ID
 * GET /api/admin/audit-logs/:id
 * Requires: audit_logs.read
 */
export async function getAdminAuditLogById(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const log = await auditRepository.findById(id);

    if (!log) {
      res.status(404).json({
        success: false,
        message: "Audit log entry not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Audit log details retrieved successfully",
      data: log,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve audit log details",
    });
  }
}
