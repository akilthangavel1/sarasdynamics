import { randomUUID } from "node:crypto";
import { eq, asc, inArray, sql } from "drizzle-orm";
import { getDb } from "../db/index.js";
import { sqliteSchema, pgSchema, type SkillRecord } from "../db/schema.js";
import config from "../config/index.js";

function getTables() {
  const isPg = config.database.provider === "postgresql";
  return isPg ? pgSchema : sqliteSchema;
}

export class SkillRepository {
  async findAll(onlyActive = false): Promise<SkillRecord[]> {
    const db = getDb() as any;
    const tables = getTables();

    let query = db.select().from(tables.skills);
    if (onlyActive) {
      query = query.where(eq(tables.skills.is_active, true));
    }

    const results = await query.orderBy(asc(tables.skills.name));
    return results as SkillRecord[];
  }

  async findById(id: string): Promise<SkillRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const results = await db
      .select()
      .from(tables.skills)
      .where(eq(tables.skills.id, id))
      .limit(1);

    return results.length > 0 ? (results[0] as SkillRecord) : null;
  }

  async findByIds(ids: string[]): Promise<SkillRecord[]> {
    if (!ids || ids.length === 0) return [];
    const db = getDb() as any;
    const tables = getTables();

    const results = await db
      .select()
      .from(tables.skills)
      .where(inArray(tables.skills.id, ids));

    return results as SkillRecord[];
  }

  async findBySlug(slug: string): Promise<SkillRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const results = await db
      .select()
      .from(tables.skills)
      .where(eq(tables.skills.slug, slug))
      .limit(1);

    return results.length > 0 ? (results[0] as SkillRecord) : null;
  }

  async findByName(name: string): Promise<SkillRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const results = await db
      .select()
      .from(tables.skills)
      .where(eq(tables.skills.name, name))
      .limit(1);

    return results.length > 0 ? (results[0] as SkillRecord) : null;
  }

  async create(data: {
    name: string;
    slug: string;
    is_active?: boolean;
  }): Promise<SkillRecord> {
    const db = getDb() as any;
    const tables = getTables();

    const id = randomUUID();
    const now = new Date();

    await db.insert(tables.skills).values({
      id,
      name: data.name,
      slug: data.slug,
      is_active: data.is_active ?? true,
      created_at: now,
      updated_at: now,
    });

    const created = await this.findById(id);
    if (!created) {
      throw new Error(`Failed to retrieve newly created skill ${id}`);
    }
    return created;
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      is_active: boolean;
    }>
  ): Promise<SkillRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const updates: Record<string, any> = {
      updated_at: new Date(),
    };

    if (data.name !== undefined) updates.name = data.name;
    if (data.slug !== undefined) updates.slug = data.slug;
    if (data.is_active !== undefined) updates.is_active = data.is_active;

    await db
      .update(tables.skills)
      .set(updates)
      .where(eq(tables.skills.id, id));

    return this.findById(id);
  }

  async countJobsWithSkill(skillId: string): Promise<number> {
    const db = getDb() as any;
    const tables = getTables();

    const results = await db
      .select({ count: sql<number>`count(*)` })
      .from(tables.jobSkills)
      .where(eq(tables.jobSkills.skill_id, skillId));

    const rawCount = results[0]?.count ?? 0;
    return typeof rawCount === "number" ? rawCount : parseInt(rawCount, 10) || 0;
  }

  async delete(id: string): Promise<boolean> {
    const db = getDb() as any;
    const tables = getTables();

    await db.delete(tables.skills).where(eq(tables.skills.id, id));
    return true;
  }
}

export const skillRepository = new SkillRepository();
