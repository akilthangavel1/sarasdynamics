import { randomUUID } from "node:crypto";
import { eq, and, desc, asc, like, inArray, count, sql, isNull } from "drizzle-orm";
import { getDb } from "../db/index.js";
import {
  sqliteSchema,
  pgSchema,
  type BlogPostRecord,
  type BlogCategoryRecord,
  type BlogTagRecord,
  type BlogPostTagRecord,
  type BlogPostStatus,
} from "../db/schema.js";
import config from "../config/index.js";
import { slugify, sanitizeBlogContent } from "../utils/sanitizeContent.js";

function getTables() {
  const isPg = config.database.provider === "postgresql";
  return isPg ? pgSchema : sqliteSchema;
}

export interface BlogPostWithRelations extends BlogPostRecord {
  category: BlogCategoryRecord | null;
  tags: BlogTagRecord[];
  author: {
    id: string;
    full_name: string | null;
    email: string;
    profile_photo_url: string | null;
  };
}

export interface FindPublicPostsFilter {
  page?: number;
  limit?: number;
  search?: string;
  category?: string; // category slug or id
  tag?: string;      // tag slug or name
}

export interface FindAdminPostsFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: BlogPostStatus;
  categoryId?: string;
  tagId?: string;
  authorId?: string;
}

export class BlogRepository {
  /* =========================================================================
   * 1. SLUG GENERATION (DETERMINISTIC, COLLISION-SAFE)
   * ========================================================================= */

  public async generateUniquePostSlug(baseTitle: string, excludePostId?: string): Promise<string> {
    const db = getDb() as any;
    const tables = getTables();
    let baseSlug = slugify(baseTitle) || "post";
    let candidate = baseSlug;
    let counter = 2;

    while (true) {
      const rows = (await db
        .select({ id: tables.blogPosts.id, slug: tables.blogPosts.slug })
        .from(tables.blogPosts)
        .where(eq(tables.blogPosts.slug, candidate))
        .limit(1)) as Array<{ id: string; slug: string }>;

      if (rows.length === 0 || (excludePostId && rows[0].id === excludePostId)) {
        return candidate;
      }
      candidate = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  public async generateUniqueCategorySlug(baseName: string, excludeCategoryId?: string): Promise<string> {
    const db = getDb() as any;
    const tables = getTables();
    let baseSlug = slugify(baseName) || "category";
    let candidate = baseSlug;
    let counter = 2;

    while (true) {
      const rows = (await db
        .select({ id: tables.blogCategories.id, slug: tables.blogCategories.slug })
        .from(tables.blogCategories)
        .where(eq(tables.blogCategories.slug, candidate))
        .limit(1)) as Array<{ id: string; slug: string }>;

      if (rows.length === 0 || (excludeCategoryId && rows[0].id === excludeCategoryId)) {
        return candidate;
      }
      candidate = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  public async generateUniqueTagSlug(baseName: string, excludeTagId?: string): Promise<string> {
    const db = getDb() as any;
    const tables = getTables();
    let baseSlug = slugify(baseName) || "tag";
    let candidate = baseSlug;
    let counter = 2;

    while (true) {
      const rows = (await db
        .select({ id: tables.blogTags.id, slug: tables.blogTags.slug })
        .from(tables.blogTags)
        .where(eq(tables.blogTags.slug, candidate))
        .limit(1)) as Array<{ id: string; slug: string }>;

      if (rows.length === 0 || (excludeTagId && rows[0].id === excludeTagId)) {
        return candidate;
      }
      candidate = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /* =========================================================================
   * 2. CATEGORY OPERATIONS
   * ========================================================================= */

  public async listCategories(options?: { onlyActive?: boolean }): Promise<BlogCategoryRecord[]> {
    const db = getDb() as any;
    const tables = getTables();

    let query = db.select().from(tables.blogCategories);
    if (options?.onlyActive) {
      query = query.where(eq(tables.blogCategories.is_active, true));
    }

    const rows = (await query.orderBy(
      asc(tables.blogCategories.display_order),
      asc(tables.blogCategories.name)
    )) as BlogCategoryRecord[];

    return rows;
  }

  public async findCategoryById(id: string): Promise<BlogCategoryRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const rows = (await db
      .select()
      .from(tables.blogCategories)
      .where(eq(tables.blogCategories.id, id))
      .limit(1)) as BlogCategoryRecord[];

    return rows[0] || null;
  }

  public async findCategoryBySlug(slug: string): Promise<BlogCategoryRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const rows = (await db
      .select()
      .from(tables.blogCategories)
      .where(eq(tables.blogCategories.slug, slug))
      .limit(1)) as BlogCategoryRecord[];

    return rows[0] || null;
  }

  public async createCategory(data: {
    name: string;
    slug?: string;
    description?: string | null;
    is_active?: boolean;
    display_order?: number;
  }): Promise<BlogCategoryRecord> {
    const db = getDb() as any;
    const tables = getTables();
    const id = randomUUID();
    const slug = data.slug ? slugify(data.slug) : await this.generateUniqueCategorySlug(data.name);
    const now = new Date();

    const record: BlogCategoryRecord = {
      id,
      name: data.name.trim(),
      slug,
      description: data.description ? data.description.trim() : null,
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
      display_order: data.display_order ?? 0,
      created_at: now,
      updated_at: now,
    };

    await db.insert(tables.blogCategories).values(record);
    return record;
  }

  public async updateCategory(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      description: string | null;
      is_active: boolean;
      display_order: number;
    }>
  ): Promise<BlogCategoryRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const existing = await this.findCategoryById(id);
    if (!existing) return null;

    const updates: any = { updated_at: new Date() };

    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.slug !== undefined) {
      updates.slug = await this.generateUniqueCategorySlug(data.slug, id);
    }
    if (data.description !== undefined) updates.description = data.description;
    if (data.is_active !== undefined) updates.is_active = Boolean(data.is_active);
    if (data.display_order !== undefined) updates.display_order = data.display_order;

    await db.update(tables.blogCategories).set(updates).where(eq(tables.blogCategories.id, id));
    return this.findCategoryById(id);
  }

  public async deleteCategory(id: string): Promise<{ success: boolean; conflictReason?: string }> {
    const db = getDb() as any;
    const tables = getTables();

    // Check if any blog post references this category
    const referencingPosts = (await db
      .select({ id: tables.blogPosts.id })
      .from(tables.blogPosts)
      .where(eq(tables.blogPosts.category_id, id))
      .limit(1)) as Array<{ id: string }>;

    if (referencingPosts.length > 0) {
      return {
        success: false,
        conflictReason: "Cannot delete category that is assigned to existing blog posts",
      };
    }

    await db.delete(tables.blogCategories).where(eq(tables.blogCategories.id, id));
    return { success: true };
  }

  /* =========================================================================
   * 3. TAG OPERATIONS
   * ========================================================================= */

  public async listTags(): Promise<BlogTagRecord[]> {
    const db = getDb() as any;
    const tables = getTables();

    const rows = (await db
      .select()
      .from(tables.blogTags)
      .orderBy(asc(tables.blogTags.name))) as BlogTagRecord[];

    return rows;
  }

  public async findTagById(id: string): Promise<BlogTagRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const rows = (await db
      .select()
      .from(tables.blogTags)
      .where(eq(tables.blogTags.id, id))
      .limit(1)) as BlogTagRecord[];

    return rows[0] || null;
  }

  public async findTagBySlug(slug: string): Promise<BlogTagRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const rows = (await db
      .select()
      .from(tables.blogTags)
      .where(eq(tables.blogTags.slug, slug))
      .limit(1)) as BlogTagRecord[];

    return rows[0] || null;
  }

  public async createTag(data: { name: string; slug?: string }): Promise<BlogTagRecord> {
    const db = getDb() as any;
    const tables = getTables();
    const id = randomUUID();
    const slug = data.slug ? slugify(data.slug) : await this.generateUniqueTagSlug(data.name);
    const now = new Date();

    const record: BlogTagRecord = {
      id,
      name: data.name.trim(),
      slug,
      created_at: now,
      updated_at: now,
    };

    await db.insert(tables.blogTags).values(record);
    return record;
  }

  public async updateTag(
    id: string,
    data: Partial<{ name: string; slug: string }>
  ): Promise<BlogTagRecord | null> {
    const db = getDb() as any;
    const tables = getTables();

    const existing = await this.findTagById(id);
    if (!existing) return null;

    const updates: any = { updated_at: new Date() };
    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.slug !== undefined) {
      updates.slug = await this.generateUniqueTagSlug(data.slug, id);
    }

    await db.update(tables.blogTags).set(updates).where(eq(tables.blogTags.id, id));
    return this.findTagById(id);
  }

  public async deleteTag(id: string): Promise<{ success: boolean; conflictReason?: string }> {
    const db = getDb() as any;
    const tables = getTables();

    // Check if any post tag junction references this tag
    const referencingPostTags = (await db
      .select({ id: tables.blogPostTags.id })
      .from(tables.blogPostTags)
      .where(eq(tables.blogPostTags.tag_id, id))
      .limit(1)) as Array<{ id: string }>;

    if (referencingPostTags.length > 0) {
      return {
        success: false,
        conflictReason: "Cannot delete tag that is associated with existing blog posts. Remove it from posts first.",
      };
    }

    await db.delete(tables.blogTags).where(eq(tables.blogTags.id, id));
    return { success: true };
  }

  /* =========================================================================
   * 4. RELATION HYDRATION HELPER
   * ========================================================================= */

  private async attachRelations(postRecords: BlogPostRecord[]): Promise<BlogPostWithRelations[]> {
    if (postRecords.length === 0) return [];
    const db = getDb() as any;
    const tables = getTables();

    // 1. Categories
    const categoryIds = Array.from(
      new Set(postRecords.map((p) => p.category_id).filter((id): id is string => Boolean(id)))
    );
    const categoryMap = new Map<string, BlogCategoryRecord>();
    if (categoryIds.length > 0) {
      const categories = (await db
        .select()
        .from(tables.blogCategories)
        .where(inArray(tables.blogCategories.id, categoryIds))) as BlogCategoryRecord[];
      for (const cat of categories) {
        categoryMap.set(cat.id, cat);
      }
    }

    // 2. Authors
    const authorIds = Array.from(new Set(postRecords.map((p) => p.author_id)));
    const authorMap = new Map<string, { id: string; full_name: string | null; email: string; profile_photo_url: string | null }>();
    if (authorIds.length > 0) {
      const authors = (await db
        .select({
          id: tables.users.id,
          full_name: tables.users.full_name,
          email: tables.users.email,
          profile_photo_url: tables.users.profile_photo_url,
        })
        .from(tables.users)
        .where(inArray(tables.users.id, authorIds))) as Array<{
        id: string;
        full_name: string | null;
        email: string;
        profile_photo_url: string | null;
      }>;
      for (const author of authors) {
        authorMap.set(author.id, author);
      }
    }

    // 3. Tags via junction
    const postIds = postRecords.map((p) => p.id);
    const postTagRows = (await db
      .select({
        postId: tables.blogPostTags.blog_post_id,
        tagId: tables.blogTags.id,
        name: tables.blogTags.name,
        slug: tables.blogTags.slug,
        created_at: tables.blogTags.created_at,
        updated_at: tables.blogTags.updated_at,
      })
      .from(tables.blogPostTags)
      .innerJoin(tables.blogTags, eq(tables.blogPostTags.tag_id, tables.blogTags.id))
      .where(inArray(tables.blogPostTags.blog_post_id, postIds))) as Array<{
      postId: string;
      tagId: string;
      name: string;
      slug: string;
      created_at: Date;
      updated_at: Date;
    }>;

    const tagsByPostId = new Map<string, BlogTagRecord[]>();
    for (const row of postTagRows) {
      const list = tagsByPostId.get(row.postId) || [];
      list.push({
        id: row.tagId,
        name: row.name,
        slug: row.slug,
        created_at: row.created_at,
        updated_at: row.updated_at,
      });
      tagsByPostId.set(row.postId, list);
    }

    return postRecords.map((post) => {
      const author = authorMap.get(post.author_id) || {
        id: post.author_id,
        full_name: "Author",
        email: "",
        profile_photo_url: null,
      };

      return {
        ...post,
        category: post.category_id ? categoryMap.get(post.category_id) || null : null,
        tags: tagsByPostId.get(post.id) || [],
        author,
      };
    });
  }

  /* =========================================================================
   * 5. POST CRUD OPERATIONS
   * ========================================================================= */

  public async findPostById(id: string): Promise<BlogPostWithRelations | null> {
    const db = getDb() as any;
    const tables = getTables();

    const rows = (await db
      .select()
      .from(tables.blogPosts)
      .where(eq(tables.blogPosts.id, id))
      .limit(1)) as BlogPostRecord[];

    if (rows.length === 0) return null;
    const hydrated = await this.attachRelations(rows);
    return hydrated[0] || null;
  }

  public async findPostBySlug(slug: string): Promise<BlogPostWithRelations | null> {
    const db = getDb() as any;
    const tables = getTables();

    const rows = (await db
      .select()
      .from(tables.blogPosts)
      .where(eq(tables.blogPosts.slug, slug))
      .limit(1)) as BlogPostRecord[];

    if (rows.length === 0) return null;
    const hydrated = await this.attachRelations(rows);
    return hydrated[0] || null;
  }

  public async createPost(data: {
    category_id?: string | null;
    author_id: string;
    title: string;
    slug?: string;
    excerpt?: string | null;
    content: string;
    featured_image_key?: string | null;
    status?: BlogPostStatus;
    tag_ids?: string[];
  }): Promise<BlogPostWithRelations> {
    const db = getDb() as any;
    const tables = getTables();
    const id = randomUUID();
    const title = data.title.trim();
    const slug = data.slug ? slugify(data.slug) : await this.generateUniquePostSlug(title);
    const now = new Date();
    const status: BlogPostStatus = data.status || "DRAFT";
    const publishedAt = status === "PUBLISHED" ? now : null;

    // Validate sanitized content
    const sanitizedContent = sanitizeBlogContent(data.content);

    const record: BlogPostRecord = {
      id,
      category_id: data.category_id || null,
      author_id: data.author_id,
      title,
      slug,
      excerpt: data.excerpt ? data.excerpt.trim() : null,
      content: sanitizedContent,
      featured_image_key: data.featured_image_key || null,
      status,
      published_at: publishedAt,
      created_at: now,
      updated_at: now,
    };

    await db.insert(tables.blogPosts).values(record);

    // Associate tags if provided
    if (data.tag_ids && data.tag_ids.length > 0) {
      const uniqueTagIds = Array.from(new Set(data.tag_ids));
      for (const tagId of uniqueTagIds) {
        await db.insert(tables.blogPostTags).values({
          id: randomUUID(),
          blog_post_id: id,
          tag_id: tagId,
          created_at: now,
        });
      }
    }

    const created = await this.findPostById(id);
    return created!;
  }

  public async updatePost(
    id: string,
    data: Partial<{
      category_id: string | null;
      title: string;
      slug: string;
      excerpt: string | null;
      content: string;
      featured_image_key: string | null;
      status: BlogPostStatus;
      published_at: Date | null;
      tag_ids: string[];
    }>
  ): Promise<BlogPostWithRelations | null> {
    const db = getDb() as any;
    const tables = getTables();

    const existing = await this.findPostById(id);
    if (!existing) return null;

    const updates: any = { updated_at: new Date() };

    if (data.title !== undefined) updates.title = data.title.trim();
    if (data.slug !== undefined) {
      updates.slug = await this.generateUniquePostSlug(data.slug, id);
    }
    if (data.category_id !== undefined) updates.category_id = data.category_id;
    if (data.excerpt !== undefined) updates.excerpt = data.excerpt ? data.excerpt.trim() : null;
    if (data.content !== undefined) updates.content = sanitizeBlogContent(data.content);
    if (data.featured_image_key !== undefined) updates.featured_image_key = data.featured_image_key;
    if (data.status !== undefined) updates.status = data.status;
    if (data.published_at !== undefined) updates.published_at = data.published_at;

    await db.update(tables.blogPosts).set(updates).where(eq(tables.blogPosts.id, id));

    // Update tags if explicit array provided
    if (data.tag_ids !== undefined) {
      // Remove current junction entries
      await db.delete(tables.blogPostTags).where(eq(tables.blogPostTags.blog_post_id, id));

      const uniqueTagIds = Array.from(new Set(data.tag_ids));
      const now = new Date();
      for (const tagId of uniqueTagIds) {
        await db.insert(tables.blogPostTags).values({
          id: randomUUID(),
          blog_post_id: id,
          tag_id: tagId,
          created_at: now,
        });
      }
    }

    return this.findPostById(id);
  }

  public async deletePost(id: string): Promise<boolean> {
    const db = getDb() as any;
    const tables = getTables();

    // Junction rows cascade on delete per schema, but we also clean them up safely
    await db.delete(tables.blogPostTags).where(eq(tables.blogPostTags.blog_post_id, id));
    await db.delete(tables.blogPosts).where(eq(tables.blogPosts.id, id));
    return true;
  }

  public async setFeaturedImage(postId: string, imageKey: string | null): Promise<BlogPostWithRelations | null> {
    const db = getDb() as any;
    const tables = getTables();

    await db
      .update(tables.blogPosts)
      .set({
        featured_image_key: imageKey,
        updated_at: new Date(),
      })
      .where(eq(tables.blogPosts.id, postId));

    return this.findPostById(postId);
  }

  public async publishPost(id: string): Promise<{ post: BlogPostWithRelations | null; error?: string }> {
    const post = await this.findPostById(id);
    if (!post) {
      return { post: null, error: "Blog post not found" };
    }

    // Publish validations:
    // 1. Title must not be empty
    if (!post.title || post.title.trim().length === 0) {
      return { post: null, error: "Post title is required before publishing" };
    }

    // 2. Category must exist and be active
    if (!post.category_id) {
      return { post: null, error: "Category is required before publishing" };
    }
    const category = await this.findCategoryById(post.category_id);
    if (!category) {
      return { post: null, error: "Assigned category does not exist" };
    }
    if (!category.is_active) {
      return { post: null, error: "Assigned category is inactive and cannot be published" };
    }

    // 3. Content must not be empty
    if (!post.content || post.content.trim().length === 0) {
      return { post: null, error: "Post content is required before publishing" };
    }

    // 4. Must have at least 1 valid tag
    if (!post.tags || post.tags.length === 0) {
      return { post: null, error: "At least one valid tag is required before publishing" };
    }

    // Update status to PUBLISHED and preserve original publication timestamp
    const now = new Date();
    const publishedAt = post.published_at || now;

    const updated = await this.updatePost(id, {
      status: "PUBLISHED",
      published_at: publishedAt,
    });

    return { post: updated };
  }

  public async archivePost(id: string): Promise<BlogPostWithRelations | null> {
    const post = await this.findPostById(id);
    if (!post) return null;

    // Preserves published_at!
    return this.updatePost(id, {
      status: "ARCHIVED",
    });
  }

  /* =========================================================================
   * 6. LISTING & SEARCH (PUBLIC & ADMIN)
   * ========================================================================= */

  public async listPublicPosts(filter: FindPublicPostsFilter = {}): Promise<{
    posts: BlogPostWithRelations[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const db = getDb() as any;
    const tables = getTables();
    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(50, Math.max(1, filter.limit || 10));
    const offset = (page - 1) * limit;

    const conditions = [eq(tables.blogPosts.status, "PUBLISHED")];

    // Filter by Category (slug or ID)
    if (filter.category) {
      const cat = await this.findCategoryBySlug(filter.category) || await this.findCategoryById(filter.category);
      if (cat) {
        conditions.push(eq(tables.blogPosts.category_id, cat.id));
      } else {
        // Non-existent category filter produces empty result safely
        return { posts: [], total: 0, page, limit, totalPages: 0 };
      }
    }

    // Filter by Tag (slug or name)
    if (filter.tag) {
      const tag = await this.findTagBySlug(filter.tag) || (await this.listTags()).find(t => t.name.toLowerCase() === filter.tag!.toLowerCase());
      if (tag) {
        // Find post IDs with this tag
        const tagPosts = (await db
          .select({ postId: tables.blogPostTags.blog_post_id })
          .from(tables.blogPostTags)
          .where(eq(tables.blogPostTags.tag_id, tag.id))) as Array<{ postId: string }>;
        const postIds = tagPosts.map((tp) => tp.postId);
        if (postIds.length === 0) {
          return { posts: [], total: 0, page, limit, totalPages: 0 };
        }
        conditions.push(inArray(tables.blogPosts.id, postIds));
      } else {
        return { posts: [], total: 0, page, limit, totalPages: 0 };
      }
    }

    // Search in title, excerpt, content
    if (filter.search && filter.search.trim().length > 0) {
      const term = `%${filter.search.trim()}%`;
      conditions.push(
        sql`(${tables.blogPosts.title} LIKE ${term} OR ${tables.blogPosts.excerpt} LIKE ${term} OR ${tables.blogPosts.content} LIKE ${term})` as any
      );
    }

    const whereClause = and(...conditions);

    // Count query
    const countResult = (await db
      .select({ count: count() })
      .from(tables.blogPosts)
      .where(whereClause)) as Array<{ count: number }>;
    const total = Number(countResult[0]?.count || 0);

    // Data query ordered by published_at DESC, created_at DESC
    const rows = (await db
      .select()
      .from(tables.blogPosts)
      .where(whereClause)
      .orderBy(desc(tables.blogPosts.published_at), desc(tables.blogPosts.created_at))
      .limit(limit)
      .offset(offset)) as BlogPostRecord[];

    const posts = await this.attachRelations(rows);
    const totalPages = Math.ceil(total / limit);

    return { posts, total, page, limit, totalPages };
  }

  public async listAdminPosts(filter: FindAdminPostsFilter = {}): Promise<{
    posts: BlogPostWithRelations[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const db = getDb() as any;
    const tables = getTables();
    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(100, Math.max(1, filter.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    if (filter.status) {
      conditions.push(eq(tables.blogPosts.status, filter.status));
    }

    if (filter.categoryId) {
      conditions.push(eq(tables.blogPosts.category_id, filter.categoryId));
    }

    if (filter.authorId) {
      conditions.push(eq(tables.blogPosts.author_id, filter.authorId));
    }

    if (filter.tagId) {
      const tagPosts = (await db
        .select({ postId: tables.blogPostTags.blog_post_id })
        .from(tables.blogPostTags)
        .where(eq(tables.blogPostTags.tag_id, filter.tagId))) as Array<{ postId: string }>;
      const postIds = tagPosts.map((tp) => tp.postId);
      if (postIds.length === 0) {
        return { posts: [], total: 0, page, limit, totalPages: 0 };
      }
      conditions.push(inArray(tables.blogPosts.id, postIds));
    }

    if (filter.search && filter.search.trim().length > 0) {
      const term = `%${filter.search.trim()}%`;
      conditions.push(
        sql`(${tables.blogPosts.title} LIKE ${term} OR ${tables.blogPosts.excerpt} LIKE ${term} OR ${tables.blogPosts.slug} LIKE ${term})` as any
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const countResult = (await db
      .select({ count: count() })
      .from(tables.blogPosts)
      .where(whereClause)) as Array<{ count: number }>;
    const total = Number(countResult[0]?.count || 0);

    const rows = (await db
      .select()
      .from(tables.blogPosts)
      .where(whereClause)
      .orderBy(desc(tables.blogPosts.created_at))
      .limit(limit)
      .offset(offset)) as BlogPostRecord[];

    const posts = await this.attachRelations(rows);
    const totalPages = Math.ceil(total / limit);

    return { posts, total, page, limit, totalPages };
  }
}

export const blogRepository = new BlogRepository();
export default blogRepository;
