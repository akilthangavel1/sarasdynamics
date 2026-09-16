import type { Request, Response } from "express";
import { skillRepository } from "../repositories/skill.repository.js";
import { slugify } from "../utils/slugify.js";
import type { AuthenticatedRequest } from "../types/index.js";

/**
 * Public: List active skills
 * GET /api/skills
 */
export async function getPublicSkills(req: Request, res: Response): Promise<void> {
  try {
    const skills = await skillRepository.findAll(true);
    res.json({
      success: true,
      message: "Skills retrieved successfully",
      data: skills,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve skills",
    });
  }
}

/**
 * Admin: List all skills
 * GET /api/admin/skills
 * Requires: skills.read
 */
export async function getAdminSkills(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const skills = await skillRepository.findAll(false);
    res.json({
      success: true,
      message: "Admin skills retrieved successfully",
      data: skills,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve skills",
    });
  }
}

/**
 * Admin: Create skill
 * POST /api/admin/skills
 * Requires: skills.create
 */
export async function createAdminSkill(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { name, slug, is_active } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({
        success: false,
        message: "Skill name is required",
      });
      return;
    }

    const generatedSlug = (slug && slug.trim()) ? slugify(slug) : slugify(name);

    const existingName = await skillRepository.findByName(name.trim());
    if (existingName) {
      res.status(400).json({
        success: false,
        message: `Skill with name '${name}' already exists`,
      });
      return;
    }

    const existingSlug = await skillRepository.findBySlug(generatedSlug);
    if (existingSlug) {
      res.status(400).json({
        success: false,
        message: `Skill with slug '${generatedSlug}' already exists`,
      });
      return;
    }

    const skill = await skillRepository.create({
      name: name.trim(),
      slug: generatedSlug,
      is_active: is_active ?? true,
    });

    res.status(201).json({
      success: true,
      message: "Skill created successfully",
      data: skill,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create skill",
    });
  }
}

/**
 * Admin: Update skill
 * PUT /api/admin/skills/:id
 * Requires: skills.update
 */
export async function updateAdminSkill(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, slug, is_active } = req.body;

    const existing = await skillRepository.findById(id);
    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Skill not found",
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
      const slugMatch = await skillRepository.findBySlug(finalSlug);
      if (slugMatch && slugMatch.id !== id) {
        res.status(400).json({
          success: false,
          message: `Skill with slug '${finalSlug}' already exists`,
        });
        return;
      }
    }

    if (name && name.trim() !== existing.name) {
      const nameMatch = await skillRepository.findByName(name.trim());
      if (nameMatch && nameMatch.id !== id) {
        res.status(400).json({
          success: false,
          message: `Skill with name '${name}' already exists`,
        });
        return;
      }
    }

    const updated = await skillRepository.update(id, {
      name: name?.trim(),
      slug: finalSlug,
      is_active,
    });

    res.json({
      success: true,
      message: "Skill updated successfully",
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update skill",
    });
  }
}

/**
 * Admin: Delete skill
 * DELETE /api/admin/skills/:id
 * Requires: skills.delete
 */
export async function deleteAdminSkill(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await skillRepository.findById(id);
    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Skill not found",
      });
      return;
    }

    const jobsCount = await skillRepository.countJobsWithSkill(id);
    if (jobsCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete skill: ${jobsCount} jobs are currently associated with this skill. Please remove the skill from existing jobs first.`,
      });
      return;
    }

    await skillRepository.delete(id);

    res.json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to delete skill",
    });
  }
}
