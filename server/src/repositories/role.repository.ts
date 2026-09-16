import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "../db/index.js";
import { sqliteSchema, pgSchema, type RoleRecord, type PermissionRecord } from "../db/schema.js";
import config from "../config/index.js";

function getTables() {
  const isPg = config.database.provider === "postgresql";
  return isPg ? pgSchema : sqliteSchema;
}

export class RoleRepository {
  async findById(id: string): Promise<RoleRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const result = await db
      .select()
      .from(tables.roles)
      .where(eq(tables.roles.id, id))
      .limit(1);

    return result.length > 0 ? (result[0] as RoleRecord) : null;
  }

  async findByName(name: string): Promise<RoleRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const result = await db
      .select()
      .from(tables.roles)
      .where(eq(tables.roles.name, name))
      .limit(1);

    return result.length > 0 ? (result[0] as RoleRecord) : null;
  }

  async findAll(): Promise<RoleRecord[]> {
    const db = getDb() as any;
    const tables = getTables();

    return (await db.select().from(tables.roles)) as RoleRecord[];
  }

  async getRolePermissions(roleId: string): Promise<string[]> {
    const db = getDb() as any;
    const tables = getTables();

    const rolePermRecords = await db
      .select({
        permissionId: tables.rolePermissions.permission_id,
      })
      .from(tables.rolePermissions)
      .where(eq(tables.rolePermissions.role_id, roleId));

    if (rolePermRecords.length === 0) {
      return [];
    }

    const permissionIds = rolePermRecords.map((rp: { permissionId: string }) => rp.permissionId);

    const permissionRecords = (await db
      .select({
        name: tables.permissions.name,
      })
      .from(tables.permissions)
      .where(inArray(tables.permissions.id as any, permissionIds))) as Array<{ name: string }>;

    return permissionRecords.map((p) => p.name).sort();
  }

  async findAllWithPermissions(): Promise<Array<RoleRecord & { permissions: string[] }>> {
    const roles = await this.findAll();
    const result = await Promise.all(
      roles.map(async (role) => {
        const permissions = await this.getRolePermissions(role.id);
        return {
          ...role,
          permissions,
        };
      })
    );
    return result;
  }

  async setRolePermissions(roleId: string, permissionNames: string[]): Promise<string[]> {
    const db = getDb() as any;
    const tables = getTables();
    const now = new Date();

    // 1. Delete existing role permissions
    await db.delete(tables.rolePermissions).where(eq(tables.rolePermissions.role_id, roleId));

    if (permissionNames.length === 0) {
      return [];
    }

    // 2. Fetch permission IDs for requested names
    const permissions = (await db
      .select()
      .from(tables.permissions)
      .where(inArray(tables.permissions.name, permissionNames))) as PermissionRecord[];

    for (const p of permissions) {
      await db.insert(tables.rolePermissions).values({
        id: randomUUID(),
        role_id: roleId,
        permission_id: p.id,
        created_at: now,
        updated_at: now,
      });
    }

    return this.getRolePermissions(roleId);
  }
}

export const roleRepository = new RoleRepository();
export default roleRepository;
