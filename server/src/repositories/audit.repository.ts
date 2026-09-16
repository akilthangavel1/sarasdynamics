import { randomUUID } from "node:crypto";
import { eq, and, or, gte, lte, desc, like, sql } from "drizzle-orm";
import { getDb } from "../db/index.js";
import {
  sqliteSchema,
  pgSchema,
  type AuditLogRecord,
} from "../db/schema.js";
import config from "../config/index.js";

function getTables() {
  const isPg = config.database.provider === "postgresql";
  return isPg ? pgSchema : sqliteSchema;
}

export interface AuditLogUserSummary {
  id: string;
  full_name: string | null;
  email: string;
}

export interface AuditLogWithUser extends Omit<AuditLogRecord, "old_values" | "new_values"> {
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  user: AuditLogUserSummary | null;
}

export interface CreateAuditLogData {
  id?: string;
  user_id?: string | null;
  action: string;
  module: string;
  entity_type: string;
  entity_id?: string | null;
  old_values?: Record<string, any> | null;
  new_values?: Record<string, any> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at?: Date;
}

export interface FindAuditLogsFilter {
  module?: string;
  action?: string;
  entity_type?: string;
  entity_id?: string;
  user_id?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  search?: string;
  page?: number;
  limit?: number;
}

export class AuditRepository {
  /**
   * Append-only create method for storing audit log entries.
   * Supports optional transactional runner (tx).
   */
  public async create(
    data: CreateAuditLogData,
    tx?: any
  ): Promise<AuditLogRecord> {
    const db = tx || (getDb() as any);
    const tables = getTables();
    const id = data.id || randomUUID();
    const now = data.created_at || new Date();

    const record: AuditLogRecord = {
      id,
      user_id: data.user_id ?? null,
      action: data.action,
      module: data.module,
      entity_type: data.entity_type,
      entity_id: data.entity_id ?? null,
      old_values: data.old_values ?? null,
      new_values: data.new_values ?? null,
      ip_address: data.ip_address ?? null,
      user_agent: data.user_agent ?? null,
      created_at: now,
    };

    await db.insert(tables.auditLogs).values(record);
    return record;
  }

  /**
   * Read-only paginated listing of audit logs with joined user summary.
   */
  public async findMany(
    filters: FindAuditLogsFilter = {}
  ): Promise<{
    logs: AuditLogWithUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const db = getDb() as any;
    const tables = getTables();

    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 25));
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    if (filters.module) {
      conditions.push(eq(tables.auditLogs.module, filters.module.toUpperCase()));
    }

    if (filters.action) {
      conditions.push(eq(tables.auditLogs.action, filters.action.toUpperCase()));
    }

    if (filters.entity_type) {
      conditions.push(eq(tables.auditLogs.entity_type, filters.entity_type.toUpperCase()));
    }

    if (filters.entity_id) {
      conditions.push(eq(tables.auditLogs.entity_id, filters.entity_id));
    }

    if (filters.user_id) {
      conditions.push(eq(tables.auditLogs.user_id, filters.user_id));
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      if (!isNaN(start.getTime())) {
        conditions.push(gte(tables.auditLogs.created_at, start));
      }
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      if (!isNaN(end.getTime())) {
        conditions.push(lte(tables.auditLogs.created_at, end));
      }
    }

    if (filters.search && filters.search.trim().length > 0) {
      const s = `%${filters.search.trim()}%`;
      const isPg = config.database.provider === "postgresql";
      if (isPg) {
        conditions.push(
          or(
            sql`${tables.auditLogs.action} ILIKE ${s}`,
            sql`${tables.auditLogs.module} ILIKE ${s}`,
            sql`${tables.auditLogs.entity_type} ILIKE ${s}`,
            sql`${tables.auditLogs.entity_id}::text ILIKE ${s}`,
            sql`${tables.users.email} ILIKE ${s}`,
            sql`${tables.users.full_name} ILIKE ${s}`,
            sql`${tables.auditLogs.new_values}::text ILIKE ${s}`,
            sql`${tables.auditLogs.old_values}::text ILIKE ${s}`
          )
        );
      } else {
        conditions.push(
          or(
            like(tables.auditLogs.action, s),
            like(tables.auditLogs.module, s),
            like(tables.auditLogs.entity_type, s),
            like(tables.auditLogs.entity_id, s),
            like(tables.users.email, s),
            like(tables.users.full_name, s),
            sql`CAST(${tables.auditLogs.new_values} AS TEXT) LIKE ${s}`,
            sql`CAST(${tables.auditLogs.old_values} AS TEXT) LIKE ${s}`
          )
        );
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 1. Total count query
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(tables.auditLogs)
      .leftJoin(tables.users, eq(tables.auditLogs.user_id, tables.users.id));

    if (whereClause) {
      countQuery.where(whereClause);
    }

    const countResult = await countQuery;
    const total = Number(countResult[0]?.count || 0);

    // 2. Paginated rows query
    const query = db
      .select({
        log: tables.auditLogs,
        user: {
          id: tables.users.id,
          full_name: tables.users.full_name,
          email: tables.users.email,
        },
      })
      .from(tables.auditLogs)
      .leftJoin(tables.users, eq(tables.auditLogs.user_id, tables.users.id));

    if (whereClause) {
      query.where(whereClause);
    }

    const rows = await query
      .orderBy(desc(tables.auditLogs.created_at), desc(tables.auditLogs.id))
      .limit(limit)
      .offset(offset);

    const logs: AuditLogWithUser[] = rows.map((r: any) => {
      let oldValues = r.log.old_values;
      let newValues = r.log.new_values;

      if (typeof oldValues === "string") {
        try {
          oldValues = JSON.parse(oldValues);
        } catch {
          // keep as string or null
        }
      }

      if (typeof newValues === "string") {
        try {
          newValues = JSON.parse(newValues);
        } catch {
          // keep as string or null
        }
      }

      const userSummary: AuditLogUserSummary | null = r.user?.id
        ? {
            id: r.user.id,
            full_name: r.user.full_name ?? null,
            email: r.user.email ?? "",
          }
        : null;

      return {
        id: r.log.id,
        user_id: r.log.user_id ?? null,
        user: userSummary,
        action: r.log.action,
        module: r.log.module,
        entity_type: r.log.entity_type,
        entity_id: r.log.entity_id ?? null,
        old_values: oldValues ?? null,
        new_values: newValues ?? null,
        ip_address: r.log.ip_address ?? null,
        user_agent: r.log.user_agent ?? null,
        created_at: r.log.created_at,
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      logs,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Find a single audit log entry by ID (read-only)
   */
  public async findById(id: string): Promise<AuditLogWithUser | null> {
    const db = getDb() as any;
    const tables = getTables();

    const rows = await db
      .select({
        log: tables.auditLogs,
        user: {
          id: tables.users.id,
          full_name: tables.users.full_name,
          email: tables.users.email,
        },
      })
      .from(tables.auditLogs)
      .leftJoin(tables.users, eq(tables.auditLogs.user_id, tables.users.id))
      .where(eq(tables.auditLogs.id, id))
      .limit(1);

    if (!rows || rows.length === 0) return null;

    const r = rows[0];
    let oldValues = r.log.old_values;
    let newValues = r.log.new_values;

    if (typeof oldValues === "string") {
      try {
        oldValues = JSON.parse(oldValues);
      } catch {}
    }

    if (typeof newValues === "string") {
      try {
        newValues = JSON.parse(newValues);
      } catch {}
    }

    const userSummary: AuditLogUserSummary | null = r.user?.id
      ? {
          id: r.user.id,
          full_name: r.user.full_name ?? null,
          email: r.user.email ?? "",
        }
      : null;

    return {
      id: r.log.id,
      user_id: r.log.user_id ?? null,
      user: userSummary,
      action: r.log.action,
      module: r.log.module,
      entity_type: r.log.entity_type,
      entity_id: r.log.entity_id ?? null,
      old_values: oldValues ?? null,
      new_values: newValues ?? null,
      ip_address: r.log.ip_address ?? null,
      user_agent: r.log.user_agent ?? null,
      created_at: r.log.created_at,
    };
  }
}

export const auditRepository = new AuditRepository();
