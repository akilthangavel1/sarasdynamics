import { eq } from "drizzle-orm";
import { getDb } from "../db/index.js";
import { sqliteSchema, pgSchema, type PermissionRecord } from "../db/schema.js";
import config from "../config/index.js";

function getTables() {
  const isPg = config.database.provider === "postgresql";
  return isPg ? pgSchema : sqliteSchema;
}

export class PermissionRepository {
  async findByName(name: string): Promise<PermissionRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const result = await db
      .select()
      .from(tables.permissions)
      .where(eq(tables.permissions.name, name))
      .limit(1);

    return result.length > 0 ? (result[0] as PermissionRecord) : null;
  }

  async findAll(): Promise<PermissionRecord[]> {
    const db = getDb() as any;
    const tables = getTables();

    return (await db.select().from(tables.permissions)) as PermissionRecord[];
  }
}

export const permissionRepository = new PermissionRepository();
export default permissionRepository;
