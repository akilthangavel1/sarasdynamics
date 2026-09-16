import React, { useState, useEffect } from "react";
import {
  Activity,
  Search,
  Filter,
  Clock,
  User,
  Shield,
  FileCode,
  RefreshCw,
  X,
  Calendar,
  Layers,
  ChevronRight,
  Eye,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api, type AdminAuditLogItem } from "../../services/api";

const MODULES = [
  "ALL",
  "AUTH",
  "RBAC",
  "USERS",
  "JOBS",
  "APPLICATIONS",
  "INTERVIEWS",
  "NOTES",
  "BLOG",
  "SEO",
];

const ACTIONS = [
  "ALL",
  "CREATE",
  "UPDATE",
  "DELETE",
  "STATUS_CHANGE",
  "LOGIN",
  "LOGOUT",
  "SCHEDULE",
  "FEEDBACK_SUBMIT",
  "ROLE_ASSIGN",
  "PUBLISH",
  "ARCHIVE",
];

export function AuditLogsManagement() {
  const [logs, setLogs] = useState<AdminAuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState("ALL");
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Inspector modal
  const [inspectingLog, setInspectingLog] = useState<AdminAuditLogItem | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminAuditLogs({
        search: search || undefined,
        module: selectedModule !== "ALL" ? selectedModule : undefined,
        action: selectedAction !== "ALL" ? selectedAction : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: 20,
      });

      if (res.success && res.data) {
        setLogs(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
          setTotalCount(res.pagination.total);
        }
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, selectedModule, selectedAction]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedModule("ALL");
    setSelectedAction("ALL");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  return (
    <div id="audit-logs-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Enterprise Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Immutable system audit trail tracking administrative actions, authorization changes, and operational records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by keyword, entity ID, or user email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value);
                setPage(1);
              }}
              className="text-xs py-2 px-3 rounded-lg border border-zinc-200 bg-white text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 cursor-pointer"
            >
              {MODULES.map((m) => (
                <option key={m} value={m}>
                  Module: {m}
                </option>
              ))}
            </select>

            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setPage(1);
              }}
              className="text-xs py-2 px-3 rounded-lg border border-zinc-200 bg-white text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 cursor-pointer"
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>
                  Action: {a}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors shadow-2xs cursor-pointer"
            >
              Apply Filter
            </button>

            {(search || selectedModule !== "ALL" || selectedAction !== "ALL" || startDate || endDate) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Module &bull; Action</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    Loading audit trail events...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    No audit records matching the specified filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3 px-4 text-zinc-600 whitespace-nowrap">
                      <div className="font-mono text-[11px]">
                        {new Date(log.created_at).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-zinc-400 text-[10px] font-mono">
                        {new Date(log.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-100 text-zinc-800 border border-zinc-200 font-mono">
                          {log.module}
                        </span>
                        <span className="font-semibold text-zinc-900">{log.action}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-zinc-800">
                        {log.user_email || log.user_name || log.user_id || "System Actor"}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-[11px] text-zinc-700">
                        {log.entity_type}
                        {log.entity_id ? ` #${log.entity_id.slice(0, 8)}...` : ""}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">
                      {log.ip_address || "Internal"}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setInspectingLog(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Eye className="size-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 bg-zinc-50/50 text-xs text-zinc-600">
          <div>
            Showing <span className="font-semibold text-zinc-900">{logs.length}</span> of{" "}
            <span className="font-semibold text-zinc-900">{totalCount}</span> audit entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-2.5 py-1 rounded border border-zinc-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50"
            >
              Previous
            </button>
            <span className="font-medium">
              {page} / {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-2.5 py-1 rounded border border-zinc-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Inspector Modal */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl border border-zinc-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-zinc-100 text-zinc-900">
                  <Activity className="size-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    Audit Event #{inspectingLog.id.slice(0, 12)}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">
                    {inspectingLog.module} &bull; {inspectingLog.action}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingLog(null)}
                className="cursor-pointer text-zinc-400 hover:text-zinc-700"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Actor</span>
                  <span className="font-mono font-semibold text-zinc-900">
                    {inspectingLog.user_email || inspectingLog.user_id || "System"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Recorded At</span>
                  <span className="font-mono text-zinc-900">
                    {new Date(inspectingLog.created_at).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Target Entity</span>
                  <span className="font-mono text-zinc-900">
                    {inspectingLog.entity_type} {inspectingLog.entity_id ? `(${inspectingLog.entity_id})` : ""}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">IP Address</span>
                  <span className="font-mono text-zinc-900">
                    {inspectingLog.ip_address || "Internal / Local"}
                  </span>
                </div>
                {inspectingLog.user_agent && (
                  <div className="col-span-2">
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">User Agent</span>
                    <span className="font-mono text-zinc-700 break-all text-[11px]">
                      {inspectingLog.user_agent}
                    </span>
                  </div>
                )}
              </div>

              {/* Old vs New Values */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Previous Values (Before)
                  </div>
                  <pre className="p-3 rounded-xl bg-zinc-900 text-zinc-200 font-mono text-[11px] overflow-x-auto max-h-48 border border-zinc-800">
                    {inspectingLog.old_values
                      ? JSON.stringify(inspectingLog.old_values, null, 2)
                      : "null"}
                  </pre>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    New Values (After)
                  </div>
                  <pre className="p-3 rounded-xl bg-zinc-900 text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-48 border border-zinc-800">
                    {inspectingLog.new_values
                      ? JSON.stringify(inspectingLog.new_values, null, 2)
                      : "null"}
                  </pre>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-zinc-100 shrink-0">
              <button
                onClick={() => setInspectingLog(null)}
                className="px-4 py-2 text-xs font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
