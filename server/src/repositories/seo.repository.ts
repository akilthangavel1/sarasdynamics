import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "../db/index.js";
import {
  sqliteSchema,
  pgSchema,
  type SeoMetadataRecord,
} from "../db/schema.js";
import config from "../config/index.js";

function getTables() {
  const isPg = config.database.provider === "postgresql";
  return isPg ? pgSchema : sqliteSchema;
}

export interface CreateSeoData {
  id?: string;
  blog_post_id: string;
  meta_title: string;
  meta_description: string;
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  canonical_url?: string | null;
}

export interface UpdateSeoData {
  meta_title?: string;
  meta_description?: string;
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  canonical_url?: string | null;
}

export class SeoRepository {
  /**
   * Find SEO metadata by Blog Post ID
   */
  public async findByBlogPostId(blogPostId: string): Promise<SeoMetadataRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const rows = await db
      .select()
      .from(tables.seoMetadata)
      .where(eq(tables.seoMetadata.blog_post_id, blogPostId))
      .limit(1);

    return rows[0] || null;
  }

  /**
   * Find SEO metadata by primary ID
   */
  public async findById(id: string): Promise<SeoMetadataRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const rows = await db
      .select()
      .from(tables.seoMetadata)
      .where(eq(tables.seoMetadata.id, id))
      .limit(1);

    return rows[0] || null;
  }

  /**
   * Create new SEO metadata
   */
  public async create(data: CreateSeoData): Promise<SeoMetadataRecord> {
    const db = getDb() as any;
    const tables = getTables();
    const id = data.id || randomUUID();
    const now = new Date();

    const record: SeoMetadataRecord = {
      id,
      blog_post_id: data.blog_post_id,
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      og_title: data.og_title ?? null,
      og_description: data.og_description ?? null,
      og_image_url: data.og_image_url ?? null,
      canonical_url: data.canonical_url ?? null,
      created_at: now,
      updated_at: now,
    };

    await db.insert(tables.seoMetadata).values(record);
    return record;
  }

  /**
   * Update SEO metadata by blog post ID
   */
  public async updateByBlogPostId(
    blogPostId: string,
    data: UpdateSeoData
  ): Promise<SeoMetadataRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const existing = await this.findByBlogPostId(blogPostId);
    if (!existing) {
      return null;
    }

    const updatePayload: any = {
      ...data,
      updated_at: new Date(),
    };

    await db
      .update(tables.seoMetadata)
      .set(updatePayload)
      .where(eq(tables.seoMetadata.blog_post_id, blogPostId));

    return this.findByBlogPostId(blogPostId);
  }

  /**
   * Safe upsert SEO metadata for a blog post
   */
  public async upsert(
    blogPostId: string,
    data: {
      meta_title: string;
      meta_description: string;
      og_title?: string | null;
      og_description?: string | null;
      og_image_url?: string | null;
      canonical_url?: string | null;
    }
  ): Promise<SeoMetadataRecord> {
    const existing = await this.findByBlogPostId(blogPostId);

    if (existing) {
      const updated = await this.updateByBlogPostId(blogPostId, data);
      return updated!;
    }

    try {
      return await this.create({
        blog_post_id: blogPostId,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        og_title: data.og_title ?? null,
        og_description: data.og_description ?? null,
        og_image_url: data.og_image_url ?? null,
        canonical_url: data.canonical_url ?? null,
      });
    } catch (err: any) {
      // In case of race condition collision on unique index, fall back to update
      const fallback = await this.findByBlogPostId(blogPostId);
      if (fallback) {
        const updated = await this.updateByBlogPostId(blogPostId, data);
        return updated!;
      }
      throw err;
    }
  }

  /**
   * Delete SEO metadata by blog post ID
   */
  public async deleteByBlogPostId(blogPostId: string): Promise<boolean> {
    const db = getDb() as any;
    const tables = getTables();

    const existing = await this.findByBlogPostId(blogPostId);
    if (!existing) {
      return false;
    }

    await db
      .delete(tables.seoMetadata)
      .where(eq(tables.seoMetadata.blog_post_id, blogPostId));

    return true;
  }

  /**
   * Delete SEO metadata by primary ID
   */
  public async deleteById(id: string): Promise<boolean> {
    const db = getDb() as any;
    const tables = getTables();

    const existing = await this.findById(id);
    if (!existing) {
      return false;
    }

    await db
      .delete(tables.seoMetadata)
      .where(eq(tables.seoMetadata.id, id));

    return true;
  }
}

export const seoRepository = new SeoRepository();
export default seoRepository;
