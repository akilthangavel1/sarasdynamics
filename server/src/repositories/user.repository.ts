import { randomUUID } from "node:crypto";
import { eq, inArray, like, or, desc, and } from "drizzle-orm";
import { getDb } from "../db/index.js";
import { sqliteSchema, pgSchema, type UserRecord, type UserStatus } from "../db/schema.js";
import config from "../config/index.js";

function getTables() {
  const isPg = config.database.provider === "postgresql";
  return isPg ? pgSchema : sqliteSchema;
}

export class UserRepository {
  /**
   * Find a user by primary key ID
   */
  async findById(id: string): Promise<UserRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const result = await db
      .select()
      .from(tables.users)
      .where(eq(tables.users.id, id))
      .limit(1);

    return result.length > 0 ? (result[0] as UserRecord) : null;
  }

  /**
   * Find a user by their Firebase Authentication UID
   */
  async findByFirebaseUid(firebaseUid: string): Promise<UserRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const result = await db
      .select()
      .from(tables.users)
      .where(eq(tables.users.firebase_uid, firebaseUid))
      .limit(1);

    return result.length > 0 ? (result[0] as UserRecord) : null;
  }

  /**
   * Find a user by email address
   */
  async findByEmail(email: string): Promise<UserRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const result = await db
      .select()
      .from(tables.users)
      .where(eq(tables.users.email, email))
      .limit(1);

    return result.length > 0 ? (result[0] as UserRecord) : null;
  }

  /**
   * Create a new user in the database
   */
  async create(data: {
    firebase_uid: string;
    email: string;
    full_name?: string | null;
    phone?: string | null;
    profile_photo_url?: string | null;
    status?: UserStatus;
  }): Promise<UserRecord> {
    const db = getDb() as any;
    const tables = getTables();

    const now = new Date();
    const id = randomUUID();
    const newUser = {
      id,
      firebase_uid: data.firebase_uid,
      email: data.email,
      full_name: data.full_name || null,
      phone: data.phone || null,
      profile_photo_url: data.profile_photo_url || null,
      status: data.status || "ACTIVE",
      last_login_at: now,
      created_at: now,
      updated_at: now,
    };

    await db.insert(tables.users).values(newUser);
    const created = await this.findById(id);
    if (!created) {
      throw new Error(`Failed to retrieve newly created user with id: ${id}`);
    }
    return created;
  }

  /**
   * Update an existing user record
   */
  async update(
    id: string,
    data: Partial<{
      full_name: string | null;
      phone: string | null;
      profile_photo_url: string | null;
      status: UserStatus;
      last_login_at: Date | null;
    }>
  ): Promise<UserRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const now = new Date();
    const updatePayload: Record<string, any> = {
      ...data,
      updated_at: now,
    };

    await db
      .update(tables.users)
      .set(updatePayload)
      .where(eq(tables.users.id, id));

    return this.findById(id);
  }

  /**
   * Returns all assigned role names for a user (e.g. ['RECRUITER', 'ADMIN'])
   */
  async getUserRoleNames(userId: string): Promise<string[]> {
    const db = getDb() as any;
    const tables = getTables();

    const userRoleRecords = await db
      .select({
        roleId: tables.userRoles.role_id,
      })
      .from(tables.userRoles)
      .where(eq(tables.userRoles.user_id, userId));

    if (userRoleRecords.length === 0) {
      return [];
    }

    const roleIds = userRoleRecords.map((r: { roleId: string }) => r.roleId);

    const rolesList = await db
      .select({
        name: tables.roles.name,
      })
      .from(tables.roles)
      .where(inArray(tables.roles.id, roleIds));

    return rolesList.map((r: { name: string }) => r.name);
  }

  /**
   * Returns the union of distinct permission strings for all of a user's roles
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    const db = getDb() as any;
    const tables = getTables();

    // 1. Get role IDs for user
    const userRoleRecords = await db
      .select({
        roleId: tables.userRoles.role_id,
      })
      .from(tables.userRoles)
      .where(eq(tables.userRoles.user_id, userId));

    if (userRoleRecords.length === 0) {
      return [];
    }

    const roleIds = userRoleRecords.map((r: { roleId: string }) => r.roleId);

    // 2. Get permission IDs for these roles
    const rolePermRecords = await db
      .select({
        permissionId: tables.rolePermissions.permission_id,
      })
      .from(tables.rolePermissions)
      .where(inArray(tables.rolePermissions.role_id, roleIds));

    if (rolePermRecords.length === 0) {
      return [];
    }

    const permissionIds: string[] = Array.from(
      new Set(rolePermRecords.map((rp: { permissionId: string }) => rp.permissionId))
    );

    // 3. Get permission names
    const permissionRecords = (await db
      .select({
        name: tables.permissions.name,
      })
      .from(tables.permissions)
      .where(inArray(tables.permissions.id as any, permissionIds))) as Array<{ name: string }>;

    const permissionNames: string[] = permissionRecords.map((p) => p.name);
    // Return sorted, deduplicated permissions
    return Array.from(new Set(permissionNames)).sort();
  }

  /**
   * Assigns a role to a user by role name
   */
  async assignRoleByName(userId: string, roleName: string): Promise<void> {
    const db = getDb() as any;
    const tables = getTables();

    const roleResult = await db
      .select()
      .from(tables.roles)
      .where(eq(tables.roles.name, roleName))
      .limit(1);

    if (roleResult.length === 0) {
      throw new Error(`Role not found: ${roleName}`);
    }

    const roleId = roleResult[0].id;
    const now = new Date();

    // Check if already assigned
    const existing = await db
      .select()
      .from(tables.userRoles)
      .where(eq(tables.userRoles.user_id, userId));

    const hasRole = existing.some((ur: { role_id: string }) => ur.role_id === roleId);
    if (!hasRole) {
      await db.insert(tables.userRoles).values({
        id: randomUUID(),
        user_id: userId,
        role_id: roleId,
        created_at: now,
        updated_at: now,
      });
    }
  }

  /**
   * Find all active users (for interviewer selection)
   */
  async findActiveUsers(): Promise<Array<{ id: string; email: string; full_name: string | null; status: UserStatus }>> {
    const db = getDb() as any;
    const tables = getTables();
    return db
      .select({
        id: tables.users.id,
        email: tables.users.email,
        full_name: tables.users.full_name,
        status: tables.users.status,
      })
      .from(tables.users)
      .where(eq(tables.users.status, "ACTIVE"));
  }

  /**
   * List users with filtering, search, pagination, and assigned roles
   */
  async findMany(params: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    users: Array<UserRecord & { roles: string[] }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const db = getDb() as any;
    const tables = getTables();
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (params.status && params.status !== "ALL") {
      conditions.push(eq(tables.users.status, params.status as any));
    }
    if (params.search && params.search.trim()) {
      const term = `%${params.search.trim()}%`;
      conditions.push(
        or(
          like(tables.users.email, term),
          like(tables.users.full_name, term),
          like(tables.users.phone, term)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const allMatching = await db
      .select({ id: tables.users.id })
      .from(tables.users)
      .where(whereClause);
    const total = allMatching.length;

    // Get paginated slice
    const users = (await db
      .select()
      .from(tables.users)
      .where(whereClause)
      .orderBy(desc(tables.users.created_at))
      .limit(limit)
      .offset(offset)) as UserRecord[];

    // Hydrate roles for each user
    const usersWithRoles = await Promise.all(
      users.map(async (u) => {
        const roles = await this.getUserRoleNames(u.id);
        return {
          ...u,
          roles,
        };
      })
    );

    return {
      users: usersWithRoles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Set user roles replacing existing roles
   */
  async setUserRoles(userId: string, roleNames: string[]): Promise<string[]> {
    const db = getDb() as any;
    const tables = getTables();
    const now = new Date();

    // 1. Delete current roles for user
    await db.delete(tables.userRoles).where(eq(tables.userRoles.user_id, userId));

    if (roleNames.length === 0) {
      return [];
    }

    // 2. Fetch role IDs for the requested role names
    const rolesList = (await db
      .select()
      .from(tables.roles)
      .where(inArray(tables.roles.name, roleNames))) as Array<{ id: string; name: string }>;

    for (const r of rolesList) {
      await db.insert(tables.userRoles).values({
        id: randomUUID(),
        user_id: userId,
        role_id: r.id,
        created_at: now,
        updated_at: now,
      });
    }

    return this.getUserRoleNames(userId);
  }

  /**
   * Delete user by ID
   */
  async delete(id: string): Promise<boolean> {
    const db = getDb() as any;
    const tables = getTables();

    // Delete user roles
    await db.delete(tables.userRoles).where(eq(tables.userRoles.user_id, id));
    // Delete user
    const res = await db.delete(tables.users).where(eq(tables.users.id, id));
    return true;
  }
}

export const userRepository = new UserRepository();
export default userRepository;
