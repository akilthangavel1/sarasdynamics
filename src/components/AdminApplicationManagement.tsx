import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  Download,
  Trash2,
  FileText,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
  X,
  Lock,
  MessageSquare,
  Edit2,
  Check,
} from "lucide-react";
import {
  api,
  type ApplicationListItem,
  type ApplicationDetail,
  type ApplicationStatus,
  type Job,
  type InterviewItem,
  type ActiveInterviewer,
  type ApplicationNoteItem,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Calendar,
  Video,
  Plus,
  Star,
  ExternalLink,
} from "lucide-react";

const STATUS_BADGES: Record<ApplicationStatus, { bg: string; text: string }> = {
  NEW: { bg: "bg-blue-50 text-blue-700 border-blue-200", text: "New" },
  SCREENING: { bg: "bg-purple-50 text-purple-700 border-purple-200", text: "Screening" },
  SHORTLISTED: { bg: "bg-amber-50 text-amber-700 border-amber-200", text: "Shortlisted" },
  INTERVIEW: { bg: "bg-indigo-50 text-indigo-700 border-indigo-200", text: "Interview" },
  SELECTED: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "Selected" },
  REJECTED: { bg: "bg-red-50 text-red-700 border-red-200", text: "Rejected" },
  WITHDRAWN: { bg: "bg-zinc-100 text-zinc-600 border-zinc-200", text: "Withdrawn" },
};

const ALL_STATUSES: ApplicationStatus[] = [
  "NEW",
  "SCREENING",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "REJECTED",
  "WITHDRAWN",
];

export function AdminApplicationManagement() {
  const { dbUser, hasPermission, hasRole } = useAuth();
  const canRead = hasPermission("applications.read");
  const canUpdate = hasPermission("applications.update");
  const canDelete = hasPermission("applications.delete");

  // Phase 6 Note Permissions
  const canReadNotes = hasPermission("notes.read");
  const canCreateNotes = hasPermission("notes.create");
  const canUpdateNotes = hasPermission("notes.update");
  const canDeleteNotes = hasPermission("notes.delete");

  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalApplications, setTotalApplications] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [jobFilter, setJobFilter] = useState("ALL");

  // Selected Detail Modal
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  // Application Interviews State
  const [appInterviews, setAppInterviews] = useState<InterviewItem[]>([]);
  const [loadingAppInterviews, setLoadingAppInterviews] = useState(false);
  const [isSchedulingForApp, setIsSchedulingForApp] = useState(false);
  const [activeInterviewersList, setActiveInterviewersList] = useState<ActiveInterviewer[]>([]);
  const [submittingSchedule, setSubmittingSchedule] = useState(false);
  const [quickScheduleForm, setQuickScheduleForm] = useState({
    interview_type: "Technical Round",
    scheduled_at: "",
    duration_minutes: 60,
    interviewer_id: "",
    meeting_link: "",
    location: "",
    notes: "",
  });

  // Application Internal Notes State (Phase 6)
  const [appNotes, setAppNotes] = useState<ApplicationNoteItem[]>([]);
  const [loadingAppNotes, setLoadingAppNotes] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [updatingNote, setUpdatingNote] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  // Alerts
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const loadJobsList = async () => {
    try {
      const res = await api.getAdminJobs({ limit: 100 });
      if (res.success && res.data) {
        setJobs(res.data);
      }
    } catch (err) {
      console.error("Failed to load jobs filter list", err);
    }
  };

  const loadApplications = async (targetPage = page) => {
    if (!canRead) return;
    setLoading(true);
    try {
      const res = (await api.getAdminApplications({
        job_id: jobFilter !== "ALL" ? jobFilter : undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
        page: targetPage,
        limit: 15,
      })) as any;

      if (res.success && res.data) {
        setApplications(res.data);
        if (res.pagination) {
          setTotalApplications(res.pagination.total);
          setTotalPages(res.pagination.totalPages);
          setPage(res.pagination.page);
        }
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobsList();
  }, []);

  useEffect(() => {
    loadApplications(1);
  }, [statusFilter, jobFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadApplications(1);
  };

  const loadAppInterviews = async (applicationId: string) => {
    setLoadingAppInterviews(true);
    try {
      const res = await api.getApplicationInterviews(applicationId);
      if (res.success && res.data) {
        setAppInterviews(res.data);
      }
    } catch (err) {
      console.error("Failed to load application interviews", err);
    } finally {
      setLoadingAppInterviews(false);
    }
  };

  const loadInterviewersList = async () => {
    try {
      const res = await api.getActiveInterviewers();
      if (res.success && res.data) {
        setActiveInterviewersList(res.data);
      }
    } catch (err) {
      console.error("Failed to load interviewers", err);
    }
  };

  const handleViewDetail = async (id: string) => {
    setLoadingDetail(true);
    setIsSchedulingForApp(false);
    try {
      const res = await api.getAdminApplicationById(id);
      if (res.success && res.data) {
        setSelectedApplication(res.data);
        loadAppInterviews(id);
        loadInterviewersList();
        if (canReadNotes) {
          loadAppNotes(id);
        }
      } else {
        showAlert("error", res.message || "Failed to load application details");
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to load application details");
    } finally {
      setLoadingDetail(false);
    }
  };

  const loadAppNotes = async (appId: string) => {
    setLoadingAppNotes(true);
    setNoteError(null);
    try {
      const res = await api.getApplicationNotes(appId);
      if (res.success && res.data) {
        setAppNotes(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load application notes", err);
    } finally {
      setLoadingAppNotes(false);
    }
  };

  const canUserEditNote = (note: ApplicationNoteItem) => {
    if (!canUpdateNotes) return false;
    const isAuthor = dbUser?.id === note.user_id;
    const isAdmin = hasRole("ADMIN") || hasRole("SUPER_ADMIN");
    return isAuthor || isAdmin;
  };

  const canUserDeleteNote = (note: ApplicationNoteItem) => {
    if (!canDeleteNotes) return false;
    const isAuthor = dbUser?.id === note.user_id;
    const isAdmin = hasRole("ADMIN") || hasRole("SUPER_ADMIN");
    return isAuthor || isAdmin;
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplication) return;
    const trimmed = newNoteText.trim();
    if (!trimmed) {
      setNoteError("Note text cannot be empty.");
      return;
    }
    if (trimmed.length > 5000) {
      setNoteError("Note text cannot exceed 5000 characters.");
      return;
    }

    setSubmittingNote(true);
    setNoteError(null);
    try {
      const res = await api.createApplicationNote(selectedApplication.id, trimmed);
      if (res.success && res.data) {
        setAppNotes((prev) => [res.data!, ...prev]);
        setNewNoteText("");
        showAlert("success", "Internal note added successfully.");
      } else {
        setNoteError(res.message || "Failed to create note.");
      }
    } catch (err: any) {
      setNoteError(err.message || "Failed to create note.");
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleStartEditNote = (note: ApplicationNoteItem) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.note);
    setNoteError(null);
  };

  const handleCancelEditNote = () => {
    setEditingNoteId(null);
    setEditingNoteText("");
  };

  const handleSaveEditNote = async (noteId: string) => {
    if (!selectedApplication) return;
    const trimmed = editingNoteText.trim();
    if (!trimmed) {
      setNoteError("Note text cannot be empty.");
      return;
    }
    if (trimmed.length > 5000) {
      setNoteError("Note text cannot exceed 5000 characters.");
      return;
    }

    setUpdatingNote(true);
    setNoteError(null);
    try {
      const res = await api.updateApplicationNote(selectedApplication.id, noteId, trimmed);
      if (res.success && res.data) {
        setAppNotes((prev) =>
          prev.map((n) => (n.id === noteId ? res.data! : n))
        );
        setEditingNoteId(null);
        setEditingNoteText("");
        showAlert("success", "Internal note updated successfully.");
      } else {
        setNoteError(res.message || "Failed to update note.");
      }
    } catch (err: any) {
      setNoteError(err.message || "Failed to update note.");
    } finally {
      setUpdatingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!selectedApplication) return;
    if (!window.confirm("Are you sure you want to delete this internal note? This cannot be undone.")) {
      return;
    }

    setDeletingNoteId(noteId);
    try {
      const res = await api.deleteApplicationNote(selectedApplication.id, noteId);
      if (res.success) {
        setAppNotes((prev) => prev.filter((n) => n.id !== noteId));
        showAlert("success", "Internal note deleted.");
      } else {
        showAlert("error", res.message || "Failed to delete note.");
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to delete note.");
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleCloseDetailModal = () => {
    setSelectedApplication(null);
    setAppNotes([]);
    setNewNoteText("");
    setEditingNoteId(null);
    setEditingNoteText("");
    setNoteError(null);
  };

  const handleOpenScheduleForApp = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setQuickScheduleForm({
      interview_type: "Technical Round",
      scheduled_at: tomorrow.toISOString().slice(0, 16),
      duration_minutes: 60,
      interviewer_id: activeInterviewersList[0]?.id || "",
      meeting_link: "",
      location: "",
      notes: "",
    });
    setIsSchedulingForApp(true);
  };

  const handleScheduleForAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplication) return;
    if (!quickScheduleForm.interviewer_id) {
      showAlert("error", "Please select an interviewer.");
      return;
    }

    setSubmittingSchedule(true);
    try {
      const res = await api.scheduleApplicationInterview(selectedApplication.id, {
        interview_type: quickScheduleForm.interview_type,
        scheduled_at: new Date(quickScheduleForm.scheduled_at).toISOString(),
        duration_minutes: Number(quickScheduleForm.duration_minutes),
        interviewer_id: quickScheduleForm.interviewer_id,
        meeting_link: quickScheduleForm.meeting_link || null,
        location: quickScheduleForm.location || null,
        notes: quickScheduleForm.notes || null,
      });

      if (res.success) {
        showAlert("success", "Interview scheduled successfully.");
        setIsSchedulingForApp(false);
        // Refresh application (in case status transitioned to INTERVIEW) and interviews
        const updatedApp = await api.getAdminApplicationById(selectedApplication.id);
        if (updatedApp.success && updatedApp.data) {
          setSelectedApplication(updatedApp.data);
        }
        loadAppInterviews(selectedApplication.id);
        loadApplications(page);
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to schedule interview.");
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!selectedApplication || !canUpdate) return;
    setUpdatingStatus(true);
    try {
      const res = await api.updateAdminApplicationStatus(selectedApplication.id, newStatus);
      if (res.success && res.data) {
        setSelectedApplication(res.data);
        showAlert("success", `Application status updated to ${newStatus}`);
        loadApplications(page);
      } else {
        showAlert("error", res.message || "Failed to update status");
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDownloadResume = async (applicationId: string, documentId: string) => {
    setDownloadingDocId(documentId);
    try {
      const res = await api.getDocumentDownloadUrl(applicationId, documentId);
      if (res.success && res.data?.downloadUrl) {
        window.open(res.data.downloadUrl, "_blank", "noopener,noreferrer");
      } else {
        showAlert("error", res.message || "Failed to generate download URL");
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to download document");
    } finally {
      setDownloadingDocId(null);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!canDelete) return;
    if (!window.confirm("Are you sure you want to permanently delete this application and its documents?")) {
      return;
    }
    try {
      const res = await api.deleteAdminApplication(id);
      if (res.success) {
        showAlert("success", "Application deleted successfully");
        if (selectedApplication?.id === id) {
          setSelectedApplication(null);
        }
        loadApplications(page);
      } else {
        showAlert("error", res.message || "Failed to delete application");
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to delete application");
    }
  };

  if (!canRead) {
    return (
      <div className="p-8 text-center bg-zinc-50 border border-zinc-200 rounded-2xl">
        <AlertCircle className="size-8 text-amber-500 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-zinc-900">Access Restricted</h4>
        <p className="text-xs text-zinc-500 mt-1">
          You do not have the required permission (<code>applications.read</code>) to manage candidate applications.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert banner */}
      {alert && (
        <div
          id="admin-application-alert"
          className={`p-4 rounded-xl flex items-center gap-3 text-xs font-medium border ${
            alert.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="size-4 shrink-0 text-red-600" />
          )}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <input
            id="admin-search-applications-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by candidate name, email, phone, or application #..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </form>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            id="admin-filter-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter applications by status"
            className="px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-700"
          >
            <option value="ALL">All Statuses</option>
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                {STATUS_BADGES[st]?.text || st}
              </option>
            ))}
          </select>

          {/* Job Filter */}
          <select
            id="admin-filter-job-select"
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            aria-label="Filter applications by job"
            className="px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-700 max-w-[180px] truncate"
          >
            <option value="ALL">All Jobs</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>

          <button
            id="admin-refresh-applications-btn"
            onClick={() => loadApplications(page)}
            className="p-2 rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
            title="Refresh applications"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="border border-zinc-200 rounded-2xl bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600">
            <thead className="bg-zinc-50/75 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Application #</th>
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">Job Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Applied Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    <Loader2 className="size-6 animate-spin mx-auto mb-2 text-zinc-500" />
                    Loading candidate applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    No applications found matching your criteria.
                  </td>
                </tr>
              ) : (
                applications.map((app) => {
                  const badge = STATUS_BADGES[app.status] || {
                    bg: "bg-zinc-100 text-zinc-700 border-zinc-200",
                    text: app.status,
                  };

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-zinc-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-zinc-900">
                        {app.application_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-zinc-900">{app.full_name}</div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5">
                          <span>{app.email}</span>
                          <span>&bull;</span>
                          <span>{app.phone}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-900 font-medium">
                        {app.job_title || "Unknown Position"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg}`}
                        >
                          {badge.text}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500">
                        {new Date(app.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`view-application-btn-${app.id}`}
                            onClick={() => handleViewDetail(app.id)}
                            className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                            title="View application details"
                          >
                            <Eye className="size-4" />
                          </button>
                          {canDelete && (
                            <button
                              id={`delete-application-btn-${app.id}`}
                              onClick={() => handleDeleteApplication(app.id)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete application"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500 bg-zinc-50/50">
          <div>
            Showing <span className="font-medium text-zinc-900">{applications.length}</span> of{" "}
            <span className="font-medium text-zinc-900">{totalApplications}</span> applications
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadApplications(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span>
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={() => loadApplications(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div
          id="admin-application-detail-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
        >
          <div className="relative w-full max-w-2xl bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseDetailModal}
              className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="size-5" />
            </button>

            {/* Header */}
            <div className="border-b border-zinc-100 pb-4 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono font-semibold text-zinc-500">
                  {selectedApplication.application_number}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                    STATUS_BADGES[selectedApplication.status]?.bg || "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {STATUS_BADGES[selectedApplication.status]?.text || selectedApplication.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mt-1">
                {selectedApplication.full_name}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Applied for{" "}
                <span className="font-semibold text-zinc-800">
                  {selectedApplication.job?.title || selectedApplication.job_title || "Unknown Position"}
                </span>{" "}
                &bull;{" "}
                {new Date(selectedApplication.created_at).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>

            <div className="space-y-6">
              {/* Candidate Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
                <div className="flex items-center gap-2 text-zinc-700">
                  <Mail className="size-4 text-zinc-400 shrink-0" />
                  <a
                    href={`mailto:${selectedApplication.email}`}
                    className="hover:underline truncate"
                  >
                    {selectedApplication.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-zinc-700">
                  <Phone className="size-4 text-zinc-400 shrink-0" />
                  <a href={`tel:${selectedApplication.phone}`} className="hover:underline">
                    {selectedApplication.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-zinc-700">
                  <MapPin className="size-4 text-zinc-400 shrink-0" />
                  <span>{selectedApplication.current_location || "Location not specified"}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-700">
                  <Briefcase className="size-4 text-zinc-400 shrink-0" />
                  <span>{selectedApplication.job?.location || "Remote"}</span>
                </div>
              </div>

              {/* Status Transition Control (RBAC: applications.update) */}
              {canUpdate && (
                <div className="p-4 bg-zinc-50/75 border border-zinc-200 rounded-xl">
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Update Application Status
                  </label>
                  <div className="flex items-center gap-3">
                    <select
                      id="update-application-status-select"
                      value={selectedApplication.status}
                      disabled={updatingStatus}
                      onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
                      aria-label="Update application status"
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    >
                      {ALL_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {STATUS_BADGES[st]?.text || st}
                        </option>
                      ))}
                    </select>
                    {updatingStatus && <Loader2 className="size-4 animate-spin text-zinc-500" />}
                  </div>
                </div>
              )}

              {/* Cover Letter */}
              {selectedApplication.cover_letter && (
                <div>
                  <h4 className="text-xs uppercase font-semibold text-zinc-400 tracking-wider mb-2">
                    Cover Letter / Notes
                  </h4>
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 leading-relaxed whitespace-pre-wrap">
                    {selectedApplication.cover_letter}
                  </div>
                </div>
              )}

              {/* Scheduled Interviews Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs uppercase font-semibold text-zinc-400 tracking-wider">
                    Interviews ({appInterviews.length})
                  </h4>
                  {hasPermission("interviews.create") && !isSchedulingForApp && (
                    <button
                      id="schedule-interview-for-app-btn"
                      onClick={handleOpenScheduleForApp}
                      className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="size-3.5" />
                      <span>Schedule Interview</span>
                    </button>
                  )}
                </div>

                {/* Scheduling Form for this application */}
                {isSchedulingForApp && (
                  <div className="mb-3 p-4 bg-indigo-50/50 border border-indigo-200/80 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-indigo-600" />
                        <span>Schedule New Round</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsSchedulingForApp(false)}
                        className="text-zinc-400 hover:text-zinc-700 text-xs"
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handleScheduleForAppSubmit} className="space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                            Interview Type *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Technical Round 1"
                            value={quickScheduleForm.interview_type}
                            onChange={(e) =>
                              setQuickScheduleForm({
                                ...quickScheduleForm,
                                interview_type: e.target.value,
                              })
                            }
                            className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                            Duration *
                          </label>
                          <select
                            value={quickScheduleForm.duration_minutes}
                            onChange={(e) =>
                              setQuickScheduleForm({
                                ...quickScheduleForm,
                                duration_minutes: Number(e.target.value),
                              })
                            }
                            className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          >
                            <option value={30}>30 min</option>
                            <option value={45}>45 min</option>
                            <option value={60}>60 min (1 hr)</option>
                            <option value={90}>90 min</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                            Scheduled Date & Time *
                          </label>
                          <input
                            type="datetime-local"
                            required
                            value={quickScheduleForm.scheduled_at}
                            onChange={(e) =>
                              setQuickScheduleForm({
                                ...quickScheduleForm,
                                scheduled_at: e.target.value,
                              })
                            }
                            className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                            Assigned Interviewer *
                          </label>
                          <select
                            required
                            value={quickScheduleForm.interviewer_id}
                            onChange={(e) =>
                              setQuickScheduleForm({
                                ...quickScheduleForm,
                                interviewer_id: e.target.value,
                              })
                            }
                            className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          >
                            <option value="">-- Choose Interviewer --</option>
                            {activeInterviewersList.map((inv) => (
                              <option key={inv.id} value={inv.id}>
                                {inv.full_name || inv.email}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                            Meeting Link
                          </label>
                          <input
                            type="url"
                            placeholder="https://meet.google.com/..."
                            value={quickScheduleForm.meeting_link}
                            onChange={(e) =>
                              setQuickScheduleForm({
                                ...quickScheduleForm,
                                meeting_link: e.target.value,
                              })
                            }
                            className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                            Location
                          </label>
                          <input
                            type="text"
                            placeholder="Optional room / office"
                            value={quickScheduleForm.location}
                            onChange={(e) =>
                              setQuickScheduleForm({
                                ...quickScheduleForm,
                                location: e.target.value,
                              })
                            }
                            className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          disabled={submittingSchedule}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          {submittingSchedule && <Loader2 className="size-3.5 animate-spin" />}
                          <span>Confirm & Schedule</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {loadingAppInterviews ? (
                  <div className="p-4 text-center text-xs text-zinc-400">
                    <Loader2 className="size-4 animate-spin mx-auto mb-1 text-zinc-500" />
                    <span>Loading interviews...</span>
                  </div>
                ) : appInterviews.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                    No interviews scheduled yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {appInterviews.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-zinc-900">
                              {item.interview_type}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                                item.status === "COMPLETED"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : item.status === "CANCELLED"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : item.status === "RESCHEDULED"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3" />
                              {new Date(item.scheduled_at).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span>&bull;</span>
                            <span>{item.duration_minutes} min</span>
                            <span>&bull;</span>
                            <span>
                              Interviewer: {item.interviewer?.full_name || item.interviewer?.email}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {item.meeting_link && (
                            <a
                              href={item.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-white border border-zinc-200 rounded-lg text-[11px] font-medium text-zinc-700 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                            >
                              <Video className="size-3 text-zinc-400" />
                              <span>Join</span>
                              <ExternalLink className="size-2.5" />
                            </a>
                          )}
                          {item.feedback && item.feedback.length > 0 && (
                            <span className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-semibold rounded-lg flex items-center gap-1">
                              <Star className="size-3 fill-amber-500 text-amber-500" />
                              <span>Feedback ({item.feedback.length})</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Internal Notes Section (Phase 6) */}
              {canReadNotes && (
                <div id="application-internal-notes-section" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs uppercase font-semibold text-zinc-400 tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="size-3.5 text-zinc-500" />
                        <span>Internal Notes ({appNotes.length})</span>
                      </h4>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        <Lock className="size-2.5 text-amber-600" />
                        <span>Private &bull; Internal Only</span>
                      </span>
                    </div>
                  </div>

                  {/* Add Note Form */}
                  {canCreateNotes && (
                    <form onSubmit={handleCreateNote} className="space-y-2">
                      <div className="relative">
                        <textarea
                          id="new-internal-note-input"
                          rows={3}
                          value={newNoteText}
                          onChange={(e) => {
                            setNewNoteText(e.target.value);
                            if (noteError) setNoteError(null);
                          }}
                          placeholder="Add private internal note for hiring team (visible only to recruiters/admins)..."
                          className="w-full p-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 placeholder:text-zinc-400 resize-y"
                          maxLength={5000}
                        />
                        <span className="absolute right-3 bottom-2.5 text-[10px] text-zinc-400">
                          {newNoteText.length}/5000
                        </span>
                      </div>

                      {noteError && (
                        <div className="p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
                          <AlertCircle className="size-4 shrink-0 text-rose-600" />
                          <span>{noteError}</span>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          id="add-internal-note-btn"
                          type="submit"
                          disabled={submittingNote || !newNoteText.trim()}
                          className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submittingNote ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Plus className="size-3.5" />
                          )}
                          <span>Add Note</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Notes Listing */}
                  {loadingAppNotes ? (
                    <div className="p-4 text-center text-xs text-zinc-400">
                      <Loader2 className="size-4 animate-spin mx-auto mb-1 text-zinc-500" />
                      <span>Loading notes...</span>
                    </div>
                  ) : appNotes.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                      No internal notes recorded yet. Team notes are private and never visible to candidates.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {appNotes.map((noteItem) => {
                        const isEditingThis = editingNoteId === noteItem.id;
                        const userCanEdit = canUserEditNote(noteItem);
                        const userCanDelete = canUserDeleteNote(noteItem);
                        const isEdited =
                          new Date(noteItem.updated_at).getTime() -
                            new Date(noteItem.created_at).getTime() >
                          2000;

                        return (
                          <div
                            key={noteItem.id}
                            id={`internal-note-item-${noteItem.id}`}
                            className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-zinc-900">
                                  {noteItem.author?.full_name || "Recruiter"}
                                </span>
                                {noteItem.author?.email && (
                                  <span className="text-[11px] text-zinc-500 hidden sm:inline">
                                    &lt;{noteItem.author.email}&gt;
                                  </span>
                                )}
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  &bull;{" "}
                                  {new Date(noteItem.created_at).toLocaleString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {isEdited && (
                                  <span className="text-[10px] text-zinc-400 italic">
                                    (edited)
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                {userCanEdit && !isEditingThis && (
                                  <button
                                    id={`edit-internal-note-btn-${noteItem.id}`}
                                    onClick={() => handleStartEditNote(noteItem)}
                                    className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded transition-colors"
                                    title="Edit note"
                                    aria-label="Edit note"
                                  >
                                    <Edit2 className="size-3.5" />
                                  </button>
                                )}
                                {userCanDelete && !isEditingThis && (
                                  <button
                                    id={`delete-internal-note-btn-${noteItem.id}`}
                                    onClick={() => handleDeleteNote(noteItem.id)}
                                    disabled={deletingNoteId === noteItem.id}
                                    className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors disabled:opacity-50"
                                    title="Delete note"
                                    aria-label="Delete note"
                                  >
                                    {deletingNoteId === noteItem.id ? (
                                      <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="size-3.5" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Note Content / Edit Form */}
                            {isEditingThis ? (
                              <div className="space-y-2 pt-1">
                                <textarea
                                  id={`edit-internal-note-input-${noteItem.id}`}
                                  rows={3}
                                  value={editingNoteText}
                                  onChange={(e) => setEditingNoteText(e.target.value)}
                                  className="w-full p-2.5 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                  maxLength={5000}
                                />
                                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                                  <span>{editingNoteText.length}/5000</span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      id={`cancel-internal-note-btn-${noteItem.id}`}
                                      onClick={handleCancelEditNote}
                                      className="px-2.5 py-1 rounded bg-zinc-200 text-zinc-700 hover:bg-zinc-300 text-xs font-medium transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      id={`save-internal-note-btn-${noteItem.id}`}
                                      disabled={updatingNote || !editingNoteText.trim()}
                                      onClick={() => handleSaveEditNote(noteItem.id)}
                                      className="px-3 py-1 rounded bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                                    >
                                      {updatingNote ? (
                                        <Loader2 className="size-3 animate-spin" />
                                      ) : (
                                        <Check className="size-3" />
                                      )}
                                      <span>Save</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-zinc-800 leading-relaxed whitespace-pre-wrap pt-0.5">
                                {noteItem.note}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Documents & Resume Section */}
              <div>
                <h4 className="text-xs uppercase font-semibold text-zinc-400 tracking-wider mb-2">
                  Application Documents
                </h4>
                {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedApplication.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center shrink-0">
                            <FileText className="size-4" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-semibold text-zinc-900 truncate">
                              {doc.file_name}
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              {(doc.file_size / (1024 * 1024)).toFixed(2)} MB &bull;{" "}
                              {doc.mime_type}
                            </p>
                          </div>
                        </div>

                        <button
                          id={`download-resume-btn-${doc.id}`}
                          onClick={() => handleDownloadResume(selectedApplication.id, doc.id)}
                          disabled={downloadingDocId === doc.id}
                          className="px-3.5 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                        >
                          {downloadingDocId === doc.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Download className="size-3.5" />
                          )}
                          <span>Download</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic">No documents attached.</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                {canDelete ? (
                  <button
                    onClick={() => handleDeleteApplication(selectedApplication.id)}
                    className="px-3.5 py-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="size-4" />
                    <span>Delete Application</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  onClick={handleCloseDetailModal}
                  className="px-5 py-2 bg-zinc-900 text-white rounded-xl text-xs font-semibold hover:bg-zinc-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminApplicationManagement;
