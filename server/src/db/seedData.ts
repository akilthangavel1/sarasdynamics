export interface PermissionSeed {
  name: string;
  description: string;
  module: string;
}

export const SEED_PERMISSIONS: PermissionSeed[] = [
  // Jobs
  { name: "jobs.read", description: "View job postings and details", module: "jobs" },
  { name: "jobs.create", description: "Create new job postings", module: "jobs" },
  { name: "jobs.update", description: "Update existing job postings", module: "jobs" },
  { name: "jobs.delete", description: "Delete job postings", module: "jobs" },
  { name: "jobs.publish", description: "Publish job postings to the public site", module: "jobs" },
  { name: "jobs.close", description: "Close or unpublish job postings", module: "jobs" },
  { name: "jobs.update_content", description: "Update editorial copy and formatting on jobs", module: "jobs" },

  // Applications
  { name: "applications.read", description: "Review candidate applications and profiles", module: "applications" },
  { name: "applications.update", description: "Update application stages and status", module: "applications" },
  { name: "applications.delete", description: "Delete candidate applications", module: "applications" },

  // Interviews
  { name: "interviews.read", description: "View scheduled interviews and rounds", module: "interviews" },
  { name: "interviews.create", description: "Schedule new candidate interviews", module: "interviews" },
  { name: "interviews.update", description: "Modify scheduled interviews", module: "interviews" },
  { name: "interviews.delete", description: "Cancel or remove interview sessions", module: "interviews" },

  // Notes
  { name: "notes.read", description: "Read recruiter and team evaluation notes", module: "notes" },
  { name: "notes.create", description: "Create recruiter or interview notes", module: "notes" },
  { name: "notes.update", description: "Update own evaluation notes", module: "notes" },
  { name: "notes.delete", description: "Delete evaluation notes", module: "notes" },

  // Content
  { name: "content.read", description: "View site content blocks and pages", module: "content" },
  { name: "content.create", description: "Create new landing sections and copy", module: "content" },
  { name: "content.update", description: "Update site content and messaging", module: "content" },
  { name: "content.delete", description: "Delete website content blocks", module: "content" },
  { name: "content.publish", description: "Publish site content changes live", module: "content" },

  // Blog
  { name: "blog.read", description: "Read published and draft blog posts", module: "blog" },
  { name: "blog.create", description: "Create draft articles and posts", module: "blog" },
  { name: "blog.update", description: "Edit existing blog articles", module: "blog" },
  { name: "blog.delete", description: "Delete blog articles", module: "blog" },
  { name: "blog.publish", description: "Publish blog articles to live site", module: "blog" },

  // SEO
  { name: "seo.read", description: "View meta titles, descriptions, and tags", module: "seo" },
  { name: "seo.update", description: "Update SEO metadata and open graph tags", module: "seo" },

  // Users
  { name: "users.read", description: "List and view system users", module: "users" },
  { name: "users.create", description: "Invite or provision new system users", module: "users" },
  { name: "users.update", description: "Modify user profile and status", module: "users" },
  { name: "users.disable", description: "Deactivate or suspend user accounts", module: "users" },
  { name: "users.delete", description: "Permanently remove user accounts", module: "users" },

  // Roles & Permissions
  { name: "roles.read", description: "View system roles and assignments", module: "roles" },
  { name: "roles.create", description: "Create custom roles", module: "roles" },
  { name: "roles.update", description: "Edit role details and metadata", module: "roles" },
  { name: "roles.delete", description: "Delete custom roles", module: "roles" },
  { name: "permissions.read", description: "View all system permissions", module: "roles" },
  { name: "permissions.assign", description: "Assign or revoke permissions for roles", module: "roles" },

  // Audit
  { name: "audit_logs.read", description: "View system security and audit logs", module: "audit" },
];

export interface RoleSeed {
  name: string;
  description: string;
  is_system_role: boolean;
  permissions: string[]; // Permission names assigned to this role
}

export const SEED_ROLES: RoleSeed[] = [
  {
    name: "SUPER_ADMIN",
    description: "Ultimate system authority with full unrestricted access across all modules",
    is_system_role: true,
    // Full access to every permission
    permissions: SEED_PERMISSIONS.map((p) => p.name),
  },
  {
    name: "ADMIN",
    description: "Administrative access across operations, recruitment, content, users, and roles",
    is_system_role: true,
    // Administrative access to: jobs, applications, interviews, notes, content, blog, seo, users, roles, permissions, audit logs
    permissions: SEED_PERMISSIONS.map((p) => p.name),
  },
  {
    name: "RECRUITER",
    description: "Recruiter with access to job management, candidate applications, interviews, and notes",
    is_system_role: true,
    permissions: [
      "jobs.read",
      "jobs.create",
      "jobs.update",
      "jobs.publish",
      "jobs.close",
      "applications.read",
      "applications.update",
      "interviews.read",
      "interviews.create",
      "interviews.update",
      "interviews.delete",
      "notes.read",
      "notes.create",
      "notes.update",
      "notes.delete",
    ],
  },
  {
    name: "CONTENT_WRITER",
    description: "Editorial team member with access to blog, SEO, and content management",
    is_system_role: true,
    permissions: [
      "jobs.read",
      "jobs.update_content",
      "content.read",
      "content.create",
      "content.update",
      "content.delete",
      "content.publish",
      "blog.read",
      "blog.create",
      "blog.update",
      "blog.delete",
      "blog.publish",
      "seo.read",
      "seo.update",
    ],
  },
];

export interface CategorySeed {
  name: string;
  slug: string;
  description: string;
  display_order: number;
}

export const SEED_CATEGORIES: CategorySeed[] = [
  { name: "AI & Machine Learning", slug: "ai-machine-learning", description: "Applied AI, deep learning, LLMs, neural networks, and inference engineering", display_order: 1 },
  { name: "Software Development", slug: "software-development", description: "Frontend, backend, full-stack, and systems engineering", display_order: 2 },
  { name: "Blockchain & Web3", slug: "blockchain-web3", description: "Decentralized applications, smart contracts, and cryptographic protocols", display_order: 3 },
  { name: "Quantitative Finance", slug: "quantitative-finance", description: "Algorithmic trading, statistical arbitrage, and financial modeling", display_order: 4 },
  { name: "Cloud & DevOps", slug: "cloud-devops", description: "Infrastructure as code, Kubernetes, CI/CD, and site reliability engineering", display_order: 5 },
  { name: "Data Science", slug: "data-science", description: "Big data analytics, data engineering, statistical analysis, and ML pipelines", display_order: 6 },
  { name: "Content Writing", slug: "content-writing", description: "Technical writing, research communications, and documentation", display_order: 7 },
  { name: "Marketing", slug: "marketing", description: "Growth marketing, brand strategy, and developer relations", display_order: 8 },
  { name: "Sales", slug: "sales", description: "Enterprise solutions, partnerships, and technical business development", display_order: 9 },
  { name: "Human Resources", slug: "human-resources", description: "Talent acquisition, organizational development, and people operations", display_order: 10 },
  { name: "Internship", slug: "internship", description: "Undergraduate and graduate fellowship programs across engineering and research", display_order: 11 },
];

export interface SkillSeed {
  name: string;
  slug: string;
}

export const SEED_SKILLS: SkillSeed[] = [
  { name: "Python", slug: "python" },
  { name: "React", slug: "react" },
  { name: "Node.js", slug: "nodejs" },
  { name: "TypeScript", slug: "typescript" },
  { name: "PostgreSQL", slug: "postgresql" },
  { name: "AWS", slug: "aws" },
  { name: "Docker", slug: "docker" },
  { name: "PyTorch", slug: "pytorch" },
  { name: "FastAPI", slug: "fastapi" },
  { name: "Django", slug: "django" },
  { name: "TensorFlow", slug: "tensorflow" },
  { name: "Machine Learning", slug: "machine-learning" },
  { name: "Generative AI", slug: "generative-ai" },
  { name: "Blockchain", slug: "blockchain" },
  { name: "Solidity", slug: "solidity" },
];

export interface BlogCategorySeed {
  name: string;
  slug: string;
  description: string;
  display_order: number;
}

export const SEED_BLOG_CATEGORIES: BlogCategorySeed[] = [
  {
    name: "Artificial Intelligence",
    slug: "artificial-intelligence",
    description: "Insights on large language models, agent architectures, and production ML pipelines",
    display_order: 1,
  },
  {
    name: "Engineering & Architecture",
    slug: "engineering-architecture",
    description: "Deep dives into distributed systems, cloud scaling, and modern software craft",
    display_order: 2,
  },
  {
    name: "Product & Design",
    slug: "product-design",
    description: "UI/UX patterns, design thinking, design systems, and product strategy",
    display_order: 3,
  },
  {
    name: "Company & Culture",
    slug: "company-culture",
    description: "Life at Saras Dynamics, team insights, open positions, and company milestones",
    display_order: 4,
  },
];

export interface BlogTagSeed {
  name: string;
  slug: string;
}

export const SEED_BLOG_TAGS: BlogTagSeed[] = [
  { name: "AI", slug: "ai" },
  { name: "TypeScript", slug: "typescript" },
  { name: "React", slug: "react" },
  { name: "Cloud Architecture", slug: "cloud-architecture" },
  { name: "DevOps", slug: "devops" },
  { name: "Product Design", slug: "product-design" },
  { name: "Machine Learning", slug: "machine-learning" },
  { name: "Security", slug: "security" },
];


