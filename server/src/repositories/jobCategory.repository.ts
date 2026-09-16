import { randomUUID } from "node:crypto";
import { eq, asc } from "drizzle-orm";
import { getDb } from "../db/index.js";
import { sqliteSchema, pgSchema, type JobCategoryRecord } from "../db/schema.js";
import config from "../config/index.js";

function getTables() {
  const isPg = config.database.provider === "postgresql";
  return isPg ? pgSchema : sqliteSchema;
}

export class JobCategoryRepository {
  async findAll(onlyActive = false): Promise<JobCategoryRecord[]> {
    const db = getDb() as any;
    const tables = getTables();

    let query = db.select().from(tables.jobCategories);
    if (onlyActive) {
      query = query.where(eq(tables.jobCategories.is_active, true));
    }

    const results = await query.orderBy(
      asc(tables.jobCategories.display_order),
      asc(tables.jobCategories.name)
    );

    return results as JobCategoryRecord[];
  }

  async findById(id: string): Promise<JobCategoryRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const results = await db
      .select()
      .from(tables.jobCategories)
      .where(eq(tables.jobCategories.id, id))
      .limit(1);

    return results.length > 0 ? (results[0] as JobCategoryRecord) : null;
  }

  async findBySlug(slug: string): Promise<JobCategoryRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const results = await db
      .select()
      .from(tables.jobCategories)
      .where(eq(tables.jobCategories.slug, slug))
      .limit(1);

    return results.length > 0 ? (results[0] as JobCategoryRecord) : null;
  }

  async findByName(name: string): Promise<JobCategoryRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const results = await db
      .select()
      .from(tables.jobCategories)
      .where(eq(tables.jobCategories.name, name))
      .limit(1);

    return results.length > 0 ? (results[0] as JobCategoryRecord) : null;
  }

  async create(data: {
    name: string;
    slug: string;
    description?: string | null;
    is_active?: boolean;
    display_order?: number;
  }): Promise<JobCategoryRecord> {
    const db = getDb() as any;
    const tables = getTables();

    const id = randomUUID();
    const now = new Date();

    await db.insert(tables.jobCategories).values({
      id,
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      is_active: data.is_active ?? true,
      display_order: data.display_order ?? 0,
      created_at: now,
      updated_at: now,
    });

    const created = await this.findById(id);
    if (!created) {
      throw new Error(`Failed to retrieve newly created category ${id}`);
    }
    return created;
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      description: string | null;
      is_active: boolean;
      display_order: number;
    }>
  ): Promise<JobCategoryRecord | null> {
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
    if (data.description !== undefined) updates.description = data.description;
    if (data.is_active !== undefined) updates.is_active = data.is_active;
    if (data.display_order !== undefined) updates.display_order = data.display_order;

    await db
      .update(tables.jobCategories)
      .set(updates)
      .where(eq(tables.jobCategories.id, id));

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const db = getDb() as any;
    const tables = getTables();

    const result = await db
      .delete(tables.jobCategories)
      .where(eq(tables.jobCategories.id, id));

    return true;
  }

  async countJobsInCategory(categoryId: string): Promise<number> {
    const db = getDb() as any;
    const tables = getTables();

    const results = await db
      .select()
      .from(tables.jobs)
      .where(eq(tables.jobs.category_id, categoryId));

    return results.length;
  }
}

export const jobCategoryRepository = new JobCategoryRepository();
