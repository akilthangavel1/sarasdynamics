import type { Request, Response } from "express";
import { jobCategoryRepository } from "../repositories/jobCategory.repository.js";
import { slugify } from "../utils/slugify.js";
import type { AuthenticatedRequest } from "../types/index.js";

/**
 * Public: List active categories
 * GET /api/job-categories
 */
export async function getPublicCategories(req: Request, res: Response): Promise<void> {
  try {
    const categories = await jobCategoryRepository.findAll(true);
    res.json({
      success: true,
      message: "Job categories retrieved successfully",
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve job categories",
    });
  }
}

/**
 * Admin: List all categories (active and inactive)
 * GET /api/admin/job-categories
 * Requires: categories.read
 */
export async function getAdminCategories(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const categories = await jobCategoryRepository.findAll(false);
    res.json({
      success: true,
      message: "Admin job categories retrieved successfully",
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve job categories",
    });
  }
}

/**
 * Admin: Create category
 * POST /api/admin/job-categories
 * Requires: categories.create
 */
export async function createAdminCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { name, slug, description, is_active, display_order } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({
        success: false,
        message: "Category name is required",
      });
      return;
    }

    const generatedSlug = (slug && slug.trim()) ? slugify(slug) : slugify(name);

    // Check unique name and slug
    const existingName = await jobCategoryRepository.findByName(name.trim());
    if (existingName) {
      res.status(400).json({
        success: false,
        message: `Category with name '${name}' already exists`,
      });
      return;
    }

    const existingSlug = await jobCategoryRepository.findBySlug(generatedSlug);
    if (existingSlug) {
      res.status(400).json({
        success: false,
        message: `Category with slug '${generatedSlug}' already exists`,
      });
      return;
    }

    const category = await jobCategoryRepository.create({
      name: name.trim(),
      slug: generatedSlug,
      description: description?.trim() || null,
      is_active: is_active ?? true,
      display_order: typeof display_order === "number" ? display_order : 0,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create category",
    });
  }
}

/**
 * Admin: Update category
 * PUT /api/admin/job-categories/:id
 * Requires: categories.update
 */
export async function updateAdminCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, slug, description, is_active, display_order } = req.body;

    const existing = await jobCategoryRepository.findById(id);
    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    let finalSlug: string | undefined = undefined;
    if (slug !== undefined) {
      finalSlug = slugify(slug);
    } else if (name !== undefined && name.trim() !== existing.name) {
      finalSlug = slugify(name);
    }

    if (finalSlug && finalSlug !== existing.slug) {
      const slugMatch = await jobCategoryRepository.findBySlug(finalSlug);
      if (slugMatch && slugMatch.id !== id) {
        res.status(400).json({
          success: false,
          message: `Category with slug '${finalSlug}' already exists`,
        });
        return;
      }
    }

    if (name && name.trim() !== existing.name) {
      const nameMatch = await jobCategoryRepository.findByName(name.trim());
      if (nameMatch && nameMatch.id !== id) {
        res.status(400).json({
          success: false,
          message: `Category with name '${name}' already exists`,
        });
        return;
      }
    }

    const updated = await jobCategoryRepository.update(id, {
      name: name?.trim(),
      slug: finalSlug,
      description,
      is_active,
      display_order,
    });

    res.json({
      success: true,
      message: "Category updated successfully",
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update category",
    });
  }
}

/**
 * Admin: Delete category
 * DELETE /api/admin/job-categories/:id
 * Requires: categories.delete
 */
export async function deleteAdminCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await jobCategoryRepository.findById(id);
    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    const jobsCount = await jobCategoryRepository.countJobsInCategory(id);
    if (jobsCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete category: ${jobsCount} jobs are currently assigned to this category. Please reassign or delete the jobs first.`,
      });
      return;
    }

    await jobCategoryRepository.delete(id);

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to delete category",
    });
  }
}
