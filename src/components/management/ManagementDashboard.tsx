import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Users,
  Calendar,
  FileText,
  ShieldCheck,
  Activity,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api, type AdminAuditLogItem } from "../../services/api";

interface ManagementDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export function ManagementDashboard({ onNavigateTab }: ManagementDashboardProps) {
  const { dbUser, roles, hasPermission } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    jobsCount: 0,
    applicationsCount: 0,
    interviewsCount: 0,
    blogPostsCount: 0,
    usersCount: 0,
    auditLogsCount: 0,
  });
  const [recentLogs, setRecentLogs] = useState<AdminAuditLogItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadOverviewData = async () => {
      setLoading(true);
      try {
        const promises: Promise<any>[] = [];

        // Conditional fetches based on permissions
        if (hasPermission("jobs.read")) {
          promises.push(api.getAdminJobs({ limit: 1 }).then((r) => ({ type: "jobs", data: r })));
        }
        if (hasPermission("applications.read")) {
          promises.push(api.getAdminApplications({ limit: 1 }).then((r) => ({ type: "apps", data: r })));
        }
        if (hasPermission("interviews.read")) {
          promises.push(api.getAdminInterviews({ limit: 1 }).then((r) => ({ type: "interviews", data: r })));
        }
        if (hasPermission("blog.read")) {
          promises.push(api.getAdminBlogPosts({ limit: 1 }).then((r) => ({ type: "blogs", data: r })));
        }
        if (hasPermission("users.read")) {
          promises.push(api.getAdminUsers({ limit: 1 }).then((r) => ({ type: "users", data: r })));
        }
        if (hasPermission("audit_logs.read")) {
          promises.push(api.getAdminAuditLogs({ limit: 6 }).then((r) => ({ type: "audit", data: r })));
        }

        const results = await Promise.allSettled(promises);
        if (!isMounted) return;

        const newStats = { ...stats };
        results.forEach((res) => {
          if (res.status === "fulfilled" && res.value) {
            const { type, data } = res.value;
            if (type === "jobs" && data?.pagination?.total !== undefined) {
              newStats.jobsCount = data.pagination.total;
            } else if (type === "jobs" && Array.isArray(data?.data)) {
              newStats.jobsCount = data.data.length;
            }
            if (type === "apps" && data?.pagination?.total !== undefined) {
              newStats.applicationsCount = data.pagination.total;
            } else if (type === "apps" && Array.isArray(data?.data)) {
              newStats.applicationsCount = data.data.length;
            }
            if (type === "interviews" && data?.meta?.total !== undefined) {
              newStats.interviewsCount = data.meta.total;
            } else if (type === "interviews" && Array.isArray(data?.data)) {
              newStats.interviewsCount = data.data.length;
            }
            if (type === "blogs" && data?.pagination?.total !== undefined) {
              newStats.blogPostsCount = data.pagination.total;
            } else if (type === "blogs" && Array.isArray(data?.data)) {
              newStats.blogPostsCount = data.data.length;
            }
            if (type === "users" && data?.pagination?.total !== undefined) {
              newStats.usersCount = data.pagination.total;
            } else if (type === "users" && Array.isArray(data?.data)) {
              newStats.usersCount = data.data.length;
            }
            if (type === "audit") {
              if (data?.pagination?.total !== undefined) {
                newStats.auditLogsCount = data.pagination.total;
              }
              if (Array.isArray(data?.data)) {
                setRecentLogs(data.data);
              }
            }
          }
        });

        setStats(newStats);
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadOverviewData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div id="management-dashboard-view" className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900 text-white p-6 sm:p-8 border border-zinc-800 shadow-sm">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300">
              <Sparkles className="size-3.5 text-red-500" />
              <span>Saras Dynamics Management Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, {dbUser?.full_name || dbUser?.email || "Team Member"}
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl">
              Centralized command center for talent pipeline, editorial publications, role-based access control, and enterprise audit tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {roles.map((r) => (
              <span
                key={r}
                className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-red-950/80 text-red-300 border border-red-800/80"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {hasPermission("jobs.read") && (
          <div
            onClick={() => onNavigateTab("jobs")}
            className="group p-5 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Job Openings
              </span>
              <div className="p-2 rounded-lg bg-zinc-100 text-zinc-800 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <Briefcase className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-bold text-zinc-900">
                {loading ? "..." : stats.jobsCount}
              </div>
              <span className="text-xs text-zinc-500 font-medium inline-flex items-center gap-1 group-hover:text-zinc-900 transition-colors">
                Manage <ArrowRight className="size-3" />
              </span>
            </div>
          </div>
        )}

        {hasPermission("applications.read") && (
          <div
            onClick={() => onNavigateTab("applications")}
            className="group p-5 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Candidate Pipeline
              </span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Users className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-bold text-zinc-900">
                {loading ? "..." : stats.applicationsCount}
              </div>
              <span className="text-xs text-zinc-500 font-medium inline-flex items-center gap-1 group-hover:text-zinc-900 transition-colors">
                Review <ArrowRight className="size-3" />
              </span>
            </div>
          </div>
        )}

        {hasPermission("interviews.read") && (
          <div
            onClick={() => onNavigateTab("interviews")}
            className="group p-5 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Interviews &amp; Feedback
              </span>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Calendar className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-bold text-zinc-900">
                {loading ? "..." : stats.interviewsCount}
              </div>
              <span className="text-xs text-zinc-500 font-medium inline-flex items-center gap-1 group-hover:text-zinc-900 transition-colors">
                Schedule <ArrowRight className="size-3" />
              </span>
            </div>
          </div>
        )}

        {hasPermission("blog.read") && (
          <div
            onClick={() => onNavigateTab("blog")}
            className="group p-5 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Editorial &amp; Blog
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FileText className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-bold text-zinc-900">
                {loading ? "..." : stats.blogPostsCount}
              </div>
              <span className="text-xs text-zinc-500 font-medium inline-flex items-center gap-1 group-hover:text-zinc-900 transition-colors">
                Write &bull; Edit <ArrowRight className="size-3" />
              </span>
            </div>
          </div>
        )}

        {hasPermission("users.read") && (
          <div
            onClick={() => onNavigateTab("users")}
            className="group p-5 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                User Accounts
              </span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <ShieldCheck className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-bold text-zinc-900">
                {loading ? "..." : stats.usersCount}
              </div>
              <span className="text-xs text-zinc-500 font-medium inline-flex items-center gap-1 group-hover:text-zinc-900 transition-colors">
                Manage Roles <ArrowRight className="size-3" />
              </span>
            </div>
          </div>
        )}

        {hasPermission("audit_logs.read") && (
          <div
            onClick={() => onNavigateTab("audit-logs")}
            className="group p-5 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Audit Trail Events
              </span>
              <div className="p-2 rounded-lg bg-zinc-100 text-zinc-700 group-hover:bg-zinc-800 group-hover:text-white transition-colors">
                <Activity className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-bold text-zinc-900">
                {loading ? "..." : stats.auditLogsCount}
              </div>
              <span className="text-xs text-zinc-500 font-medium inline-flex items-center gap-1 group-hover:text-zinc-900 transition-colors">
                View Trail <ArrowRight className="size-3" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Two-Column Section: Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Action Shortcuts */}
        <div className="lg:col-span-1 rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-2xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
            Quick Actions
          </h2>
          <div className="space-y-2">
            {hasPermission("jobs.create") && (
              <button
                onClick={() => onNavigateTab("jobs")}
                className="w-full text-left flex items-center justify-between p-3 rounded-lg border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 text-xs font-medium text-zinc-800 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-zinc-100 text-zinc-900">
                    <Briefcase className="size-3.5" />
                  </div>
                  <span>Create New Job Opening</span>
                </div>
                <ArrowRight className="size-3.5 text-zinc-400" />
              </button>
            )}

            {hasPermission("applications.read") && (
              <button
                onClick={() => onNavigateTab("applications")}
                className="w-full text-left flex items-center justify-between p-3 rounded-lg border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 text-xs font-medium text-zinc-800 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-blue-50 text-blue-700">
                    <Users className="size-3.5" />
                  </div>
                  <span>Review Candidate Submissions</span>
                </div>
                <ArrowRight className="size-3.5 text-zinc-400" />
              </button>
            )}

            {hasPermission("blog.create") && (
              <button
                onClick={() => onNavigateTab("blog")}
                className="w-full text-left flex items-center justify-between p-3 rounded-lg border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 text-xs font-medium text-zinc-800 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700">
                    <FileText className="size-3.5" />
                  </div>
                  <span>Draft New Blog Article</span>
                </div>
                <ArrowRight className="size-3.5 text-zinc-400" />
              </button>
            )}

            {hasPermission("permissions.assign") && (
              <button
                onClick={() => onNavigateTab("roles")}
                className="w-full text-left flex items-center justify-between p-3 rounded-lg border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 text-xs font-medium text-zinc-800 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-amber-50 text-amber-700">
                    <ShieldCheck className="size-3.5" />
                  </div>
                  <span>Assign Roles &amp; Permissions</span>
                </div>
                <ArrowRight className="size-3.5 text-zinc-400" />
              </button>
            )}

            {hasPermission("audit_logs.read") && (
              <button
                onClick={() => onNavigateTab("audit-logs")}
                className="w-full text-left flex items-center justify-between p-3 rounded-lg border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 text-xs font-medium text-zinc-800 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-zinc-100 text-zinc-700">
                    <Activity className="size-3.5" />
                  </div>
                  <span>Audit Trail &amp; Compliance</span>
                </div>
                <ArrowRight className="size-3.5 text-zinc-400" />
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-100">
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>RBAC Security: Strict Server Authorization Active</span>
            </div>
          </div>
        </div>

        {/* Live Audit Stream */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
              Recent System Activity
            </h2>
            {hasPermission("audit_logs.read") && (
              <button
                onClick={() => onNavigateTab("audit-logs")}
                className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                View Full Log <ArrowRight className="size-3" />
              </button>
            )}
          </div>

          {recentLogs.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              {loading ? "Loading activity..." : "No recent activity recorded."}
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {recentLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900">
                        {log.module} &bull; {log.action}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-[10px] font-mono text-zinc-600">
                        {log.entity_type}
                      </span>
                    </div>
                    <div className="text-zinc-500 font-mono text-[11px]">
                      {log.user_email || log.user_id || "System"}
                    </div>
                  </div>
                  <div className="text-zinc-400 text-[11px] whitespace-nowrap flex items-center gap-1">
                    <Clock className="size-3" />
                    {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
