import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Send,
  Archive,
  Eye,
  Tag,
  Layers,
  Sparkles,
  ChevronRight,
  Shield,
  Clock,
  MapPin,
  RefreshCw,
  Lock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  api,
  type Job,
  type JobCategory,
  type Skill,
  type JobStatus,
  type WorkplaceType,
  type EmploymentType,
} from "../services/api";
import { AdminApplicationManagement } from "./AdminApplicationManagement";
import { AdminInterviewManagement } from "./AdminInterviewManagement";
import { AdminBlogManagement } from "./AdminBlogManagement";

interface AdminJobManagementProps {
  onClose?: () => void;
}

export function AdminJobManagement({ onClose }: AdminJobManagementProps) {
  const { dbUser, roles, permissions, hasPermission, hasRole } = useAuth();

  const isSuperAdmin = roles.includes("SUPER_ADMIN");
  const isAdmin = isSuperAdmin || roles.includes("ADMIN");
  const isRecruiter = roles.includes("RECRUITER");
  const isContentWriter = roles.includes("CONTENT_WRITER");

  const canCreateJob = hasPermission("jobs.create");
  const canFullUpdateJob = hasPermission("jobs.update");
  const canContentUpdateOnly = !canFullUpdateJob && hasPermission("jobs.update_content");
  const canPublishJob = hasPermission("jobs.publish");
  const canCloseJob = hasPermission("jobs.close");
  const canDeleteJob = hasPermission("jobs.delete");
  const canReadApplications = hasPermission("applications.read");
  const canReadInterviews = hasPermission("interviews.read");
  const canReadBlog = hasPermission("blog.read");
  const canReadSeo = hasPermission("seo.read");

  // Tabs
  const [activeTab, setActiveTab] = useState<
    "jobs" | "categories" | "skills" | "applications" | "interviews" | "blog"
  >("jobs");

  // Jobs state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Taxonomy state
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  // Modal / Form state
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);

  // Notifications / feedback
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Job Form Data
  const [formData, setFormData] = useState<{
    title: string;
    category_id: string;
    description: string;
    requirements: string;
    location: string;
    workplace_type: WorkplaceType;
    employment_type: EmploymentType;
    application_deadline: string;
    status: JobStatus;
    skill_ids: string[];
  }>({
    title: "",
    category_id: "",
    description: "",
    requirements: "",
    location: "",
    workplace_type: "REMOTE",
    employment_type: "FULL_TIME",
    application_deadline: "",
    status: "DRAFT",
    skill_ids: [],
  });

  // Taxonomy Form Data
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newSkillName, setNewSkillName] = useState("");

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const loadTaxonomy = async () => {
    try {
      const [catsRes, skillsRes] = await Promise.all([
        api.getAdminCategories(),
        api.getAdminSkills(),
      ]);
      if (catsRes.success && catsRes.data) setCategories(catsRes.data);
      if (skillsRes.success && skillsRes.data) setSkills(skillsRes.data);
    } catch (err: any) {
      console.error("Failed to load taxonomy", err);
    }
  };

  const loadJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await api.getAdminJobs({
        status: statusFilter !== "ALL" ? (statusFilter as JobStatus) : undefined,
        category_id: categoryFilter !== "ALL" ? categoryFilter : undefined,
        search: searchQuery || undefined,
        limit: 100,
      });

      if (res.success && res.data) {
        setJobs(res.data);
      } else {
        showAlert("error", res.message || "Failed to load jobs");
      }
    } catch (err: any) {
      showAlert("error", err.message || "Network error loading jobs");
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    loadTaxonomy();
  }, []);

  useEffect(() => {
    loadJobs();
  }, [statusFilter, categoryFilter]);

  const openCreateModal = () => {
    setEditingJob(null);
    setFormData({
      title: "",
      category_id: categories.length > 0 ? categories[0].id : "",
      description: "",
      requirements: "",
      location: "Remote",
      workplace_type: "REMOTE",
      employment_type: "FULL_TIME",
      application_deadline: "",
      status: "DRAFT",
      skill_ids: [],
    });
    setIsJobModalOpen(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      category_id: job.category_id || (categories.length > 0 ? categories[0].id : ""),
      description: job.description || "",
      requirements: job.requirements || "",
      location: job.location || "",
      workplace_type: job.workplace_type,
      employment_type: job.employment_type,
      application_deadline: job.application_deadline ? job.application_deadline.slice(0, 10) : "",
      status: job.status,
      skill_ids: job.skills.map((s) => s.id),
    });
    setIsJobModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showAlert("error", "Job title is required");
      return;
    }

    try {
      if (editingJob) {
        // If user is CONTENT_WRITER only, restrict to copy fields
        if (canContentUpdateOnly) {
          const res = await api.updateAdminJob(editingJob.id, {
            title: formData.title,
            description: formData.description,
            requirements: formData.requirements,
          });

          if (res.success) {
            showAlert("success", "Job content updated successfully (Writer Copy Mode)");
            setIsJobModalOpen(false);
            loadJobs();
          } else {
            showAlert("error", res.message);
          }
          return;
        }

        // Full update for Recruiter / Admin
        const res = await api.updateAdminJob(editingJob.id, {
          title: formData.title,
          category_id: formData.category_id || null,
          description: formData.description,
          requirements: formData.requirements,
          location: formData.location,
          workplace_type: formData.workplace_type,
          employment_type: formData.employment_type,
          application_deadline: formData.application_deadline || null,
          status: formData.status,
          skill_ids: formData.skill_ids,
        });

        if (res.success) {
          showAlert("success", "Job updated successfully");
          setIsJobModalOpen(false);
          loadJobs();
        } else {
          showAlert("error", res.message);
        }
      } else {
        // Create Job
        const res = await api.createAdminJob({
          title: formData.title,
          category_id: formData.category_id || null,
          description: formData.description,
          requirements: formData.requirements,
          location: formData.location,
          workplace_type: formData.workplace_type,
          employment_type: formData.employment_type,
          application_deadline: formData.application_deadline || null,
          status: formData.status,
          skill_ids: formData.skill_ids,
        });

        if (res.success) {
          showAlert("success", "Job position created successfully");
          setIsJobModalOpen(false);
          loadJobs();
        } else {
          showAlert("error", res.message);
        }
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to save job");
    }
  };

  const handlePublish = async (job: Job) => {
    try {
      const res = await api.publishAdminJob(job.id);
      if (res.success) {
        showAlert("success", `Job '${job.title}' published live!`);
        loadJobs();
      } else {
        showAlert("error", res.message);
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to publish job");
    }
  };

  const handleClose = async (job: Job) => {
    try {
      const res = await api.closeAdminJob(job.id);
      if (res.success) {
        showAlert("success", `Job '${job.title}' closed.`);
        loadJobs();
      } else {
        showAlert("error", res.message);
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to close job");
    }
  };

  const handleArchive = async (job: Job) => {
    try {
      const res = await api.archiveAdminJob(job.id);
      if (res.success) {
        showAlert("success", `Job '${job.title}' archived.`);
        loadJobs();
      } else {
        showAlert("error", res.message);
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to archive job");
    }
  };

  const handleDelete = async (job: Job) => {
    if (!confirm(`Are you sure you want to permanently delete '${job.title}'?`)) return;
    try {
      const res = await api.deleteAdminJob(job.id);
      if (res.success) {
        showAlert("success", `Job '${job.title}' permanently deleted.`);
        loadJobs();
      } else {
        showAlert("error", res.message);
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to delete job");
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await api.createAdminCategory({
        name: newCatName.trim(),
        description: newCatDesc.trim() || null,
      });
      if (res.success) {
        showAlert("success", "Category created");
        setNewCatName("");
        setNewCatDesc("");
        setIsCategoryModalOpen(false);
        loadTaxonomy();
      } else {
        showAlert("error", res.message);
      }
    } catch (err: any) {
      showAlert("error", err.message);
    }
  };

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      const res = await api.createAdminSkill({
        name: newSkillName.trim(),
      });
      if (res.success) {
        showAlert("success", "Skill created");
        setNewSkillName("");
        setIsSkillModalOpen(false);
        loadTaxonomy();
      } else {
        showAlert("error", res.message);
      }
    } catch (err: any) {
      showAlert("error", err.message);
    }
  };

  const toggleSkillSelection = (skillId: string) => {
    setFormData((prev) => {
      const exists = prev.skill_ids.includes(skillId);
      return {
        ...prev,
        skill_ids: exists
          ? prev.skill_ids.filter((id) => id !== skillId)
          : [...prev.skill_ids, skillId],
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Briefcase className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Careers & Talent Operations
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Phase 3 Live
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Manage open positions, status lifecycles, and taxonomy under approved RBAC permissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* User RBAC Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-300 font-medium">
                {roles.join(", ") || "AUTHENTICATED"}
              </span>
              {canContentUpdateOnly && (
                <span className="text-amber-400 font-mono text-[10px] bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/50">
                  Copywriter Limited
                </span>
              )}
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
              >
                Back to Public Site
              </button>
            )}
          </div>
        </div>

        {/* Alert notification */}
        <AnimatePresence>
          {alert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
                alert.type === "success"
                  ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-950/40 border-rose-500/30 text-rose-300"
              }`}
            >
              {alert.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              )}
              <span>{alert.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "jobs"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Positions ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "categories"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "skills"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Skills ({skills.length})
          </button>
          {canReadApplications && (
            <button
              id="admin-applications-tab-btn"
              onClick={() => setActiveTab("applications")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "applications"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              Applications
            </button>
          )}
          {canReadInterviews && (
            <button
              id="admin-interviews-tab-btn"
              onClick={() => setActiveTab("interviews")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "interviews"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              Interviews
            </button>
          )}
          {(canReadBlog || canReadSeo) && (
            <button
              id="admin-blog-seo-tab-btn"
              onClick={() => setActiveTab("blog")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "blog"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              Blog & SEO
            </button>
          )}
        </div>

        {/* TAB 1: JOBS */}
        {activeTab === "jobs" && (
          <div className="space-y-6">
            {/* Filter & Action Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadJobs()}
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="CLOSED">Closed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={loadJobs}
                  className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons */}
              {canCreateJob && (
                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Position</span>
                </button>
              )}
            </div>

            {/* Jobs Table */}
            {loadingJobs ? (
              <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-3">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                <span>Loading positions...</span>
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
                <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-300">No positions found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No job postings match your active filter criteria. Try adjusting filters or creating a new position.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-900/30">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-medium">
                      <th className="py-3 px-4">Title & Slug</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Type & Workplace</th>
                      <th className="py-3 px-4">Skills</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-200 text-sm">{job.title}</div>
                          <div className="text-[11px] text-slate-500 font-mono truncate max-w-xs">
                            /jobs/{job.slug}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {job.category ? (
                            <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700/50">
                              {job.category.name}
                            </span>
                          ) : (
                            <span className="text-amber-400/80 italic text-[11px]">Unassigned (Draft)</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 space-y-1">
                          <div className="text-slate-300 capitalize">{job.workplace_type.toLowerCase()}</div>
                          <div className="text-[11px] text-slate-500 capitalize">
                            {job.employment_type.replace("_", " ").toLowerCase()}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {job.skills.slice(0, 3).map((s) => (
                              <span
                                key={s.id}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800/80 text-indigo-300 border border-indigo-500/20 font-mono"
                              >
                                {s.name}
                              </span>
                            ))}
                            {job.skills.length > 3 && (
                              <span className="text-[10px] text-slate-500">
                                +{job.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                              job.status === "PUBLISHED"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : job.status === "DRAFT"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : job.status === "CLOSED"
                                ? "bg-slate-500/10 text-slate-400 border-slate-500/30"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                job.status === "PUBLISHED"
                                  ? "bg-emerald-400"
                                  : job.status === "DRAFT"
                                  ? "bg-amber-400"
                                  : job.status === "CLOSED"
                                  ? "bg-slate-400"
                                  : "bg-rose-400"
                              }`}
                            />
                            {job.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Status transitions */}
                            {job.status === "DRAFT" && canPublishJob && (
                              <button
                                onClick={() => handlePublish(job)}
                                className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors"
                                title="Publish Job Live"
                              >
                                Publish
                              </button>
                            )}
                            {job.status === "PUBLISHED" && canCloseJob && (
                              <button
                                onClick={() => handleClose(job)}
                                className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
                                title="Close Position"
                              >
                                Close
                              </button>
                            )}
                            {job.status === "CLOSED" && canPublishJob && (
                              <button
                                onClick={() => handlePublish(job)}
                                className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors"
                                title="Reopen & Publish"
                              >
                                Reopen
                              </button>
                            )}
                            {job.status !== "ARCHIVED" && canFullUpdateJob && (
                              <button
                                onClick={() => handleArchive(job)}
                                className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-amber-950/40 rounded transition-colors"
                                title="Archive"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Edit (Full or Content Copy) */}
                            {(canFullUpdateJob || canContentUpdateOnly) && (
                              <button
                                onClick={() => openEditModal(job)}
                                className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-950/40 rounded transition-colors"
                                title={canContentUpdateOnly ? "Edit Copy (Content Writer)" : "Edit Position"}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete (Admins/Recruiters with jobs.delete) */}
                            {canDeleteJob && (
                              <button
                                onClick={() => handleDelete(job)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                                title="Delete Permanently"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CATEGORIES */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Departmental categories used to index job postings.
              </p>
              {isAdmin && (
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Category</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm">{cat.name}</h4>
                      <p className="text-[11px] font-mono text-slate-500">/{cat.slug}</p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        cat.is_active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {cat.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {cat.description && (
                    <p className="text-xs text-slate-400 line-clamp-2">{cat.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SKILLS */}
        {activeTab === "skills" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Technical competencies, languages, and frameworks associated with positions.
              </p>
              {isAdmin && (
                <button
                  onClick={() => setIsSkillModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Skill</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-800 bg-slate-900/50 text-xs text-slate-300"
                >
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({skill.slug})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: APPLICATIONS */}
        {activeTab === "applications" && canReadApplications && (
          <div className="space-y-6">
            <AdminApplicationManagement />
          </div>
        )}

        {/* TAB 5: INTERVIEWS */}
        {activeTab === "interviews" && canReadInterviews && (
          <div className="space-y-6">
            <AdminInterviewManagement />
          </div>
        )}

        {/* TAB 6: BLOG & SEO */}
        {activeTab === "blog" && (canReadBlog || canReadSeo) && (
          <div className="space-y-6">
            <AdminBlogManagement />
          </div>
        )}

        {/* MODAL: CREATE / EDIT JOB */}
        <AnimatePresence>
          {isJobModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {editingJob ? "Edit Position" : "Create New Position"}
                    </h3>
                    {canContentUpdateOnly && (
                      <p className="text-xs text-amber-400 flex items-center gap-1 mt-1">
                        <Lock className="w-3 h-3" />
                        <span>CONTENT_WRITER mode: You may only modify title, description, and requirements.</span>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setIsJobModalOpen(false)}
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleSaveJob} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Senior Distributed Systems Engineer"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Recruitment & Structural Controls (Disabled for CONTENT_WRITER) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Category {canContentUpdateOnly && "(Locked)"}
                      </label>
                      <select
                        disabled={canContentUpdateOnly}
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                      >
                        <option value="">Select category...</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Workplace Type {canContentUpdateOnly && "(Locked)"}
                      </label>
                      <select
                        disabled={canContentUpdateOnly}
                        value={formData.workplace_type}
                        onChange={(e) =>
                          setFormData({ ...formData, workplace_type: e.target.value as WorkplaceType })
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                      >
                        <option value="REMOTE">Remote</option>
                        <option value="HYBRID">Hybrid</option>
                        <option value="ONSITE">On-site</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Employment Type {canContentUpdateOnly && "(Locked)"}
                      </label>
                      <select
                        disabled={canContentUpdateOnly}
                        value={formData.employment_type}
                        onChange={(e) =>
                          setFormData({ ...formData, employment_type: e.target.value as EmploymentType })
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                      >
                        <option value="FULL_TIME">Full-time</option>
                        <option value="PART_TIME">Part-time</option>
                        <option value="CONTRACT">Contract</option>
                        <option value="INTERNSHIP">Internship</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Location {canContentUpdateOnly && "(Locked)"}
                      </label>
                      <input
                        type="text"
                        disabled={canContentUpdateOnly}
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Remote (Global) or Austin, TX"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Skills Tag Selector (Disabled for CONTENT_WRITER) */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Required Skills {canContentUpdateOnly && "(Locked)"}
                    </label>
                    <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-slate-800 bg-slate-950 max-h-32 overflow-y-auto">
                      {skills.map((s) => {
                        const isSelected = formData.skill_ids.includes(s.id);
                        return (
                          <button
                            type="button"
                            key={s.id}
                            disabled={canContentUpdateOnly}
                            onClick={() => toggleSkillSelection(s.id)}
                            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                              isSelected
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                            } disabled:opacity-50`}
                          >
                            {s.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Role Overview / Description *
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="High-level mission, challenges, and team responsibilities..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>

                  {/* Requirements */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Qualifications & Requirements *
                    </label>
                    <textarea
                      rows={4}
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      placeholder="Years of experience, core technical competencies, educational qualifications..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsJobModalOpen(false)}
                      className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-950 border border-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-colors"
                    >
                      {editingJob ? "Save Changes" : "Create Position"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: NEW CATEGORY */}
        <AnimatePresence>
          {isCategoryModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
              >
                <h3 className="text-base font-bold text-white">Add Job Category</h3>
                <form onSubmit={handleCreateCategory} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Category Name *</label>
                    <input
                      type="text"
                      required
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="e.g. Distributed Infrastructure"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      placeholder="Focus areas for this department..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      Create Category
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: NEW SKILL */}
        <AnimatePresence>
          {isSkillModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
              >
                <h3 className="text-base font-bold text-white">Add Skill Tag</h3>
                <form onSubmit={handleCreateSkill} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Skill Name *</label>
                    <input
                      type="text"
                      required
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="e.g. Distributed Consensus"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSkillModalOpen(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      Create Skill
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AdminJobManagement;
