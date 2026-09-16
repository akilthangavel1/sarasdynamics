import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import jobRoutes from "./job.routes.js";
import categoryRoutes from "./category.routes.js";
import skillRoutes from "./skill.routes.js";
import adminJobRoutes from "./adminJob.routes.js";
import adminCategoryRoutes from "./adminCategory.routes.js";
import adminSkillRoutes from "./adminSkill.routes.js";
import adminApplicationRoutes from "./adminApplication.routes.js";
import adminInterviewRoutes from "./adminInterview.routes.js";
import blogRoutes from "./blog.routes.js";
import adminBlogRoutes from "./adminBlog.routes.js";
import adminAuditRoutes from "./adminAudit.routes.js";
import adminUserRoutes from "./adminUser.routes.js";
import adminRoleRoutes from "./adminRole.routes.js";
import adminPermissionRoutes from "./adminPermission.routes.js";

const apiRouter = Router();

// /api/health
apiRouter.use("/health", healthRoutes);

// /api/auth
apiRouter.use("/auth", authRoutes);

// Public Careers & Taxonomy routes
apiRouter.use("/jobs", jobRoutes);
apiRouter.use("/job-categories", categoryRoutes);
apiRouter.use("/skills", skillRoutes);

// Public Blog routes
apiRouter.use("/blog", blogRoutes);

// Protected Admin routes
apiRouter.use("/admin/jobs", adminJobRoutes);
apiRouter.use("/admin/job-categories", adminCategoryRoutes);
apiRouter.use("/admin/skills", adminSkillRoutes);
apiRouter.use("/admin/applications", adminApplicationRoutes);
apiRouter.use("/admin/interviews", adminInterviewRoutes);
apiRouter.use("/admin/blog", adminBlogRoutes);
apiRouter.use("/admin/audit-logs", adminAuditRoutes);
apiRouter.use("/admin/users", adminUserRoutes);
apiRouter.use("/admin/roles", adminRoleRoutes);
apiRouter.use("/admin/permissions", adminPermissionRoutes);

// Direct /api endpoint status probe
apiRouter.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Saras Dynamics API Gateway",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: {
        sync: "POST /api/auth/sync",
        me: "GET /api/auth/me",
      },
      public: {
        jobs: "GET /api/jobs",
        jobDetail: "GET /api/jobs/:slug",
        applyJob: "POST /api/jobs/:slug/applications",
        categories: "GET /api/job-categories",
        skills: "GET /api/skills",
        blogCategories: "GET /api/blog/categories",
        blogTags: "GET /api/blog/tags",
        blogPosts: "GET /api/blog/posts",
        blogPostDetail: "GET /api/blog/posts/:slug",
        blogPostImage: "GET /api/blog/posts/:slug/image",
      },
      admin: {
        jobs: "/api/admin/jobs",
        categories: "/api/admin/job-categories",
        skills: "/api/admin/skills",
        applications: "/api/admin/applications",
        interviews: "/api/admin/interviews",
        applicationNotes: "/api/admin/applications/:id/notes",
        blogCategories: "/api/admin/blog/categories",
        blogTags: "/api/admin/blog/tags",
        blogPosts: "/api/admin/blog/posts",
        blogSeo: "/api/admin/blog/:blogPostId/seo",
        auditLogs: "/api/admin/audit-logs",
        users: "/api/admin/users",
        roles: "/api/admin/roles",
        permissions: "/api/admin/permissions",
      },
    },
  });
});

export default apiRouter;
