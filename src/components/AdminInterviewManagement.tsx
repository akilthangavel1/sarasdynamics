import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Video,
  MapPin,
  FileText,
  Star,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Loader2,
} from "lucide-react";
import {
  api,
  type InterviewItem,
  type InterviewFeedback,
  type InterviewStatus,
  type InterviewRecommendation,
  type ActiveInterviewer,
  type ApplicationListItem,
} from "../services/api";
import { useAuth } from "../context/AuthContext";

const STATUS_CONFIG: Record<InterviewStatus, { bg: string; text: string; label: string }> = {
  SCHEDULED: { bg: "bg-blue-900/30 text-blue-400 border-blue-800", text: "text-blue-400", label: "Scheduled" },
  COMPLETED: { bg: "bg-emerald-900/30 text-emerald-400 border-emerald-800", text: "text-emerald-400", label: "Completed" },
  CANCELLED: { bg: "bg-rose-900/30 text-rose-400 border-rose-800", text: "text-rose-400", label: "Cancelled" },
  RESCHEDULED: { bg: "bg-amber-900/30 text-amber-400 border-amber-800", text: "text-amber-400", label: "Rescheduled" },
};

const RECOMMENDATION_CONFIG: Record<InterviewRecommendation, { bg: string; text: string; label: string }> = {
  HIRE: { bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", text: "text-emerald-400", label: "Hire" },
  NO_HIRE: { bg: "bg-rose-500/10 text-rose-400 border-rose-500/20", text: "text-rose-400", label: "No Hire" },
  FURTHER_INTERVIEW: { bg: "bg-amber-500/10 text-amber-400 border-amber-500/20", text: "text-amber-400", label: "Further Interview" },
};

export function AdminInterviewManagement() {
  const { dbUser, roles, hasRole, hasPermission } = useAuth();
  const canRead = hasPermission("interviews.read");
  const canCreate = hasPermission("interviews.create");
  const canUpdate = hasPermission("interviews.update");
  const canDelete = hasPermission("interviews.delete");

  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [interviewers, setInterviewers] = useState<ActiveInterviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalInterviews, setTotalInterviews] = useState(0);
  const [page, setPage] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [interviewerFilter, setInterviewerFilter] = useState("ALL");

  // Scheduling Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [scheduleForm, setScheduleForm] = useState({
    application_id: "",
    interview_type: "Technical Interview",
    scheduled_at: "",
    duration_minutes: 60,
    interviewer_id: "",
    meeting_link: "",
    location: "",
    notes: "",
  });
  const [schedulingSubmitting, setSchedulingSubmitting] = useState(false);

  // Edit Interview Modal
  const [editingInterview, setEditingInterview] = useState<InterviewItem | null>(null);
  const [editForm, setEditForm] = useState({
    interview_type: "",
    scheduled_at: "",
    duration_minutes: 60,
    interviewer_id: "",
    meeting_link: "",
    location: "",
    status: "SCHEDULED" as InterviewStatus,
    notes: "",
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Feedback Modal
  const [feedbackInterview, setFeedbackInterview] = useState<InterviewItem | null>(null);
  const [feedbackList, setFeedbackList] = useState<InterviewFeedback[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState<{
    rating: number;
    strengths: string;
    weaknesses: string;
    feedback: string;
    recommendation: InterviewRecommendation;
    feedbackId?: string;
  }>({
    rating: 4,
    strengths: "",
    weaknesses: "",
    feedback: "",
    recommendation: "HIRE",
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Alerts
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const loadInterviewers = async () => {
    try {
      const res = await api.getActiveInterviewers();
      if (res.success && res.data) {
        setInterviewers(res.data);
      }
    } catch (err) {
      console.error("Failed to load interviewers", err);
    }
  };

  const loadApplications = async () => {
    try {
      const res = await api.getAdminApplications({ limit: 100 });
      if (res.success && res.data) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error("Failed to load applications", err);
    }
  };

  const loadInterviews = async () => {
    if (!canRead) return;
    setLoading(true);
    try {
      const res = await api.getAdminInterviews({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        interviewer_id: interviewerFilter !== "ALL" ? interviewerFilter : undefined,
        page,
        limit: 20,
      });

      if (res.success && res.data) {
        setInterviews(res.data);
        if (res.meta) {
          setTotalInterviews(res.meta.total);
        }
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to load interviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterviewers();
  }, []);

  useEffect(() => {
    loadInterviews();
  }, [statusFilter, interviewerFilter, page]);

  // Open Schedule Modal
  const openScheduleModal = async () => {
    await loadApplications();
    // Default scheduled_at to tomorrow at 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const dateString = tomorrow.toISOString().slice(0, 16);

    setScheduleForm({
      application_id: "",
      interview_type: "Technical Interview",
      scheduled_at: dateString,
      duration_minutes: 60,
      interviewer_id: dbUser?.id || (interviewers[0]?.id ?? ""),
      meeting_link: "",
      location: "",
      notes: "",
    });
    setIsScheduleModalOpen(true);
  };

  // Submit Schedule Interview
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.application_id) {
      showAlert("error", "Please select an application.");
      return;
    }
    if (!scheduleForm.interviewer_id) {
      showAlert("error", "Please select an interviewer.");
      return;
    }

    setSchedulingSubmitting(true);
    try {
      const res = await api.scheduleApplicationInterview(scheduleForm.application_id, {
        interview_type: scheduleForm.interview_type,
        scheduled_at: new Date(scheduleForm.scheduled_at).toISOString(),
        duration_minutes: Number(scheduleForm.duration_minutes),
        interviewer_id: scheduleForm.interviewer_id,
        meeting_link: scheduleForm.meeting_link || null,
        location: scheduleForm.location || null,
        notes: scheduleForm.notes || null,
      });

      if (res.success) {
        showAlert("success", "Interview successfully scheduled.");
        setIsScheduleModalOpen(false);
        loadInterviews();
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to schedule interview.");
    } finally {
      setSchedulingSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (interview: InterviewItem) => {
    setEditingInterview(interview);
    const scheduledIso = new Date(interview.scheduled_at).toISOString().slice(0, 16);
    setEditForm({
      interview_type: interview.interview_type,
      scheduled_at: scheduledIso,
      duration_minutes: interview.duration_minutes,
      interviewer_id: interview.interviewer_id,
      meeting_link: interview.meeting_link || "",
      location: interview.location || "",
      status: interview.status,
      notes: interview.notes || "",
    });
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInterview) return;

    setEditSubmitting(true);
    try {
      const res = await api.updateInterview(editingInterview.id, {
        interview_type: editForm.interview_type,
        scheduled_at: new Date(editForm.scheduled_at).toISOString(),
        duration_minutes: Number(editForm.duration_minutes),
        interviewer_id: editForm.interviewer_id,
        meeting_link: editForm.meeting_link || null,
        location: editForm.location || null,
        status: editForm.status,
        notes: editForm.notes || null,
      });

      if (res.success) {
        showAlert("success", "Interview updated successfully.");
        setEditingInterview(null);
        loadInterviews();
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to update interview.");
    } finally {
      setEditSubmitting(false);
    }
  };

  // Delete Interview
  const handleDeleteInterview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this interview and all associated feedback?")) {
      return;
    }

    try {
      const res = await api.deleteInterview(id);
      if (res.success) {
        showAlert("success", "Interview deleted successfully.");
        loadInterviews();
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to delete interview.");
    }
  };

  // Open Feedback Modal
  const openFeedbackModal = async (interview: InterviewItem) => {
    setFeedbackInterview(interview);
    setLoadingFeedback(true);
    try {
      const res = await api.getInterviewFeedback(interview.id);
      if (res.success && res.data) {
        setFeedbackList(res.data);
        // Check if current user already submitted feedback
        const myFeedback = res.data.find((fb) => fb.interviewer_id === dbUser?.id);
        if (myFeedback) {
          setFeedbackForm({
            rating: myFeedback.rating,
            strengths: myFeedback.strengths || "",
            weaknesses: myFeedback.weaknesses || "",
            feedback: myFeedback.feedback || "",
            recommendation: myFeedback.recommendation,
            feedbackId: myFeedback.id,
          });
        } else {
          setFeedbackForm({
            rating: 4,
            strengths: "",
            weaknesses: "",
            feedback: "",
            recommendation: "HIRE",
            feedbackId: undefined,
          });
        }
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to load feedback.");
    } finally {
      setLoadingFeedback(false);
    }
  };

  // Submit Feedback
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackInterview) return;

    setSubmittingFeedback(true);
    try {
      if (feedbackForm.feedbackId) {
        // Update existing feedback
        const res = await api.updateInterviewFeedback(
          feedbackInterview.id,
          feedbackForm.feedbackId,
          {
            rating: feedbackForm.rating,
            strengths: feedbackForm.strengths || null,
            weaknesses: feedbackForm.weaknesses || null,
            feedback: feedbackForm.feedback || null,
            recommendation: feedbackForm.recommendation,
          }
        );
        if (res.success) {
          showAlert("success", "Feedback updated successfully.");
          openFeedbackModal(feedbackInterview);
          loadInterviews();
        }
      } else {
        // Submit new feedback
        const res = await api.submitInterviewFeedback(feedbackInterview.id, {
          rating: feedbackForm.rating,
          strengths: feedbackForm.strengths || null,
          weaknesses: feedbackForm.weaknesses || null,
          feedback: feedbackForm.feedback || null,
          recommendation: feedbackForm.recommendation,
        });
        if (res.success) {
          showAlert("success", "Feedback submitted successfully.");
          openFeedbackModal(feedbackInterview);
          loadInterviews();
        }
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to submit feedback.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const isAssignedInterviewer = (interview: InterviewItem) => {
    return dbUser?.id === interview.interviewer_id;
  };

  return (
    <div id="admin-interview-management" className="space-y-6">
      {/* Alert message banner */}
      {alert && (
        <div
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
        </div>
      )}

      {/* Header & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              id="interview-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="RESCHEDULED">Rescheduled</option>
            </select>
          </div>

          {/* Interviewer Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Interviewer:</span>
            <select
              id="interview-interviewer-filter"
              value={interviewerFilter}
              onChange={(e) => setInterviewerFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Interviewers</option>
              {interviewers.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.full_name || inv.email}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadInterviews}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {canCreate && (
          <button
            id="schedule-new-interview-btn"
            onClick={openScheduleModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Interview</span>
          </button>
        )}
      </div>

      {/* Interviews Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <p className="text-xs">Loading scheduled interviews...</p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30 text-indigo-400" />
            <p className="text-sm font-medium text-slate-300">No interviews found</p>
            <p className="text-xs text-slate-500 mt-1">
              {statusFilter !== "ALL" || interviewerFilter !== "ALL"
                ? "Try adjusting your filters"
                : "Schedule your first candidate interview using the button above."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Candidate / Application</th>
                  <th className="px-4 py-3">Interview Type</th>
                  <th className="px-4 py-3">Schedule & Duration</th>
                  <th className="px-4 py-3">Interviewer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Feedback</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {interviews.map((interview) => {
                  const statusConf = STATUS_CONFIG[interview.status] || STATUS_CONFIG.SCHEDULED;
                  const dateObj = new Date(interview.scheduled_at);
                  const isAssigned = isAssignedInterviewer(interview);
                  const feedbackCount = interview.feedback?.length || 0;

                  return (
                    <tr key={interview.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Candidate */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white">
                          {interview.application?.full_name || "Unknown Candidate"}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {interview.application?.application_number}
                        </div>
                      </td>

                      {/* Interview Type */}
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-200">{interview.interview_type}</div>
                        {interview.meeting_link && (
                          <a
                            href={interview.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 mt-0.5"
                          >
                            <Video className="w-3 h-3" />
                            <span>Meeting Link</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                        {interview.location && !interview.meeting_link && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{interview.location}</span>
                          </div>
                        )}
                      </td>

                      {/* Schedule */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 font-medium text-slate-200">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          <span>
                            {dateObj.toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>
                            {dateObj.toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            ({interview.duration_minutes} min)
                          </span>
                        </div>
                      </td>

                      {/* Interviewer */}
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-200">
                          {interview.interviewer?.full_name || interview.interviewer?.email || "Unassigned"}
                        </div>
                        {isAssigned && (
                          <span className="inline-block px-1.5 py-0.5 text-[10px] bg-indigo-500/20 text-indigo-300 rounded font-medium mt-0.5">
                            Assigned to you
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusConf.bg}`}
                        >
                          {statusConf.label}
                        </span>
                      </td>

                      {/* Feedback */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => openFeedbackModal(interview)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-slate-300 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                          <span>
                            {feedbackCount > 0 ? `${feedbackCount} Feedback` : "No Feedback"}
                          </span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canUpdate && (
                            <button
                              onClick={() => openEditModal(interview)}
                              className="p-1.5 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
                              title="Edit Interview"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteInterview(interview.id)}
                              className="p-1.5 text-rose-400 hover:text-rose-300 bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800 rounded-lg transition-colors"
                              title="Delete Interview"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: SCHEDULE INTERVIEW */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <span>Schedule Interview</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set up an interview round and assign an active interviewer.
                </p>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              {/* Select Application */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Candidate Application <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={scheduleForm.application_id}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, application_id: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Candidate --</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.full_name} ({app.application_number}) - {app.job_title || "Position"} [{app.status}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Interview Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Interview Type <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.interview_type}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, interview_type: e.target.value })
                    }
                    placeholder="e.g. Technical Round 1"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Duration (Minutes) <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={scheduleForm.duration_minutes}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        duration_minutes: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes (1 hour)</option>
                    <option value={90}>90 minutes (1.5 hours)</option>
                    <option value={120}>120 minutes (2 hours)</option>
                  </select>
                </div>
              </div>

              {/* Scheduled Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Date & Time <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleForm.scheduled_at}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, scheduled_at: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Interviewer */}
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Assigned Interviewer <span className="text-rose-400">*</span>
                  </label>
                  <select
                    required
                    value={scheduleForm.interviewer_id}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, interviewer_id: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Select Interviewer --</option>
                    {interviewers.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.full_name ? `${inv.full_name} (${inv.email})` : inv.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Meeting Link & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Meeting Link (Google Meet / Zoom URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={scheduleForm.meeting_link}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, meeting_link: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Location / Room (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Conference Room B"
                    value={scheduleForm.location}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, location: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Focus areas, preparation notes, or context for the interviewer..."
                  value={scheduleForm.notes}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={schedulingSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {schedulingSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Calendar className="w-4 h-4" />
                  )}
                  <span>Schedule Interview</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT INTERVIEW */}
      {editingInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-indigo-400" />
                  <span>Update Interview</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Candidate: {editingInterview.application?.full_name} ({editingInterview.application?.application_number})
                </p>
              </div>
              <button
                onClick={() => setEditingInterview(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              {/* Status */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Interview Lifecycle Status <span className="text-rose-400">*</span>
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      status: e.target.value as InterviewStatus,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="RESCHEDULED">RESCHEDULED</option>
                </select>
              </div>

              {/* Type & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Interview Type</label>
                  <input
                    type="text"
                    required
                    value={editForm.interview_type}
                    onChange={(e) =>
                      setEditForm({ ...editForm, interview_type: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={1}
                    max={480}
                    required
                    value={editForm.duration_minutes}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        duration_minutes: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Date & Interviewer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Scheduled Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={editForm.scheduled_at}
                    onChange={(e) =>
                      setEditForm({ ...editForm, scheduled_at: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Assigned Interviewer</label>
                  <select
                    value={editForm.interviewer_id}
                    onChange={(e) =>
                      setEditForm({ ...editForm, interviewer_id: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {interviewers.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.full_name ? `${inv.full_name} (${inv.email})` : inv.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Link & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Meeting Link</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={editForm.meeting_link}
                    onChange={(e) =>
                      setEditForm({ ...editForm, meeting_link: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) =>
                      setEditForm({ ...editForm, location: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingInterview(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {editSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: FEEDBACK & RATINGS */}
      {feedbackInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span>Interview Feedback & Recommendation</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {feedbackInterview.interview_type} with{" "}
                  <strong className="text-white">
                    {feedbackInterview.application?.full_name}
                  </strong>{" "}
                  ({feedbackInterview.application?.application_number})
                </p>
              </div>
              <button
                onClick={() => setFeedbackInterview(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List of Existing Feedback */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Submitted Feedback ({feedbackList.length})
              </h4>
              {loadingFeedback ? (
                <div className="p-4 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-indigo-400" />
                  <span className="text-xs">Loading feedback records...</span>
                </div>
              ) : feedbackList.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 bg-slate-950/50 rounded-xl border border-slate-800/60">
                  No feedback has been recorded for this interview yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {feedbackList.map((fb) => {
                    const recConf = RECOMMENDATION_CONFIG[fb.recommendation] || RECOMMENDATION_CONFIG.HIRE;
                    return (
                      <div
                        key={fb.id}
                        className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-xs">
                              {fb.interviewer?.full_name || fb.interviewer?.email || "Reviewer"}
                            </span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= fb.rating
                                      ? "text-amber-400 fill-amber-400"
                                      : "text-slate-700"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${recConf.bg}`}
                          >
                            {recConf.label}
                          </span>
                        </div>

                        {fb.strengths && (
                          <div className="text-xs">
                            <span className="font-semibold text-emerald-400 flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" /> Strengths:
                            </span>
                            <p className="text-slate-300 mt-0.5 pl-4">{fb.strengths}</p>
                          </div>
                        )}

                        {fb.weaknesses && (
                          <div className="text-xs">
                            <span className="font-semibold text-rose-400 flex items-center gap-1">
                              <ThumbsDown className="w-3 h-3" /> Areas for Growth / Weaknesses:
                            </span>
                            <p className="text-slate-300 mt-0.5 pl-4">{fb.weaknesses}</p>
                          </div>
                        )}

                        {fb.feedback && (
                          <div className="text-xs">
                            <span className="font-semibold text-slate-400">Detailed Feedback:</span>
                            <p className="text-slate-300 mt-0.5 whitespace-pre-wrap pl-4">
                              {fb.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submission form for Assigned Interviewer or Admin */}
            {(isAssignedInterviewer(feedbackInterview) ||
              hasRole("ADMIN") ||
              hasRole("SUPER_ADMIN")) && (
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  {feedbackForm.feedbackId ? "Edit Your Feedback" : "Submit Your Feedback"}
                </h4>

                <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
                  {/* Rating (1-5) & Recommendation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-slate-300 mb-1">
                        Rating (1 to 5) <span className="text-rose-400">*</span>
                      </label>
                      <div className="flex items-center gap-2 pt-1">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            type="button"
                            key={val}
                            onClick={() => setFeedbackForm({ ...feedbackForm, rating: val })}
                            className={`p-2 rounded-lg border transition-all flex items-center justify-center ${
                              feedbackForm.rating >= val
                                ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                                : "bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400"
                            }`}
                          >
                            <Star
                              className={`w-5 h-5 ${
                                feedbackForm.rating >= val ? "fill-amber-400" : ""
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-sm font-bold text-amber-400 ml-2">
                          {feedbackForm.rating} / 5
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-300 mb-1">
                        Recommendation <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={feedbackForm.recommendation}
                        onChange={(e) =>
                          setFeedbackForm({
                            ...feedbackForm,
                            recommendation: e.target.value as InterviewRecommendation,
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
                      >
                        <option value="HIRE">HIRE</option>
                        <option value="NO_HIRE">NO_HIRE</option>
                        <option value="FURTHER_INTERVIEW">FURTHER_INTERVIEW</option>
                      </select>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Candidate Strengths</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Strong system architecture knowledge, clear communication..."
                      value={feedbackForm.strengths}
                      onChange={(e) =>
                        setFeedbackForm({ ...feedbackForm, strengths: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Weaknesses */}
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">
                      Candidate Weaknesses / Concerns
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Needs more hands-on experience with distributed caching..."
                      value={feedbackForm.weaknesses}
                      onChange={(e) =>
                        setFeedbackForm({ ...feedbackForm, weaknesses: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* General feedback */}
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">
                      General Interview Feedback & Summary
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Overall impression and reasoning for the recommendation..."
                      value={feedbackForm.feedback}
                      onChange={(e) =>
                        setFeedbackForm({ ...feedbackForm, feedback: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submittingFeedback}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-semibold flex items-center gap-2 disabled:opacity-50"
                    >
                      {submittingFeedback && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>
                        {feedbackForm.feedbackId ? "Update Feedback" : "Submit Feedback"}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminInterviewManagement;
