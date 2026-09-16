import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Shield,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  ShieldAlert,
  X,
  Plus,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  api,
  type AdminUserItem,
  type AdminUserDetail,
} from "../../services/api";

const APPROVED_ROLES = ["SUPER_ADMIN", "ADMIN", "RECRUITER", "CONTENT_WRITER"];

export function UserManagement() {
  const { dbUser, hasPermission } = useAuth();

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const [managingRolesUser, setManagingRolesUser] = useState<AdminUserItem | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const [statusChangingUser, setStatusChangingUser] = useState<AdminUserItem | null>(null);
  const [newStatus, setNewStatus] = useState<"ACTIVE" | "INACTIVE" | "SUSPENDED">("ACTIVE");

  const [deletingUser, setDeletingUser] = useState<AdminUserItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const res = await api.getAdminUsers({
        search: search || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        page,
        limit: 15,
      });

      if (res.success && res.data) {
        setUsers(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
          setTotalCount(res.pagination.total);
        }
      }
    } catch (err: any) {
      console.error("Failed to load users:", err);
      setActionError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleOpenEdit = (u: AdminUserItem) => {
    setEditingUser(u);
    setEditName(u.full_name || "");
    setEditPhone(u.phone || "");
    setActionError(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await api.updateAdminUserProfile(editingUser.id, {
        full_name: editName,
        phone: editPhone,
      });
      if (res.success) {
        setActionSuccess(`Profile updated for ${editingUser.email}`);
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to update user profile");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRoles = (u: AdminUserItem) => {
    setManagingRolesUser(u);
    setSelectedRoles([...u.roles]);
    setActionError(null);
  };

  const handleToggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSaveRoles = async () => {
    if (!managingRolesUser) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await api.updateAdminUserRoles(managingRolesUser.id, selectedRoles);
      if (res.success) {
        setActionSuccess(`Roles updated for ${managingRolesUser.email}`);
        setManagingRolesUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to update roles");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenStatus = (u: AdminUserItem) => {
    setStatusChangingUser(u);
    setNewStatus(u.status);
    setActionError(null);
  };

  const handleSaveStatus = async () => {
    if (!statusChangingUser) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await api.updateAdminUserStatus(statusChangingUser.id, newStatus);
      if (res.success) {
        setActionSuccess(`Status updated to ${newStatus} for ${statusChangingUser.email}`);
        setStatusChangingUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to change user status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await api.deleteAdminUser(deletingUser.id);
      if (res.success) {
        setActionSuccess(`User ${deletingUser.email} deleted successfully`);
        setDeletingUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case "INACTIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
            <span className="size-1.5 rounded-full bg-zinc-400" />
            Inactive
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <span className="size-1.5 rounded-full bg-red-500" />
            Suspended
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div id="user-management-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            User Accounts &amp; Access Control
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Manage system identities, profile records, account statuses, and RBAC role assignments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="cursor-pointer">
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="cursor-pointer">
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-zinc-200 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
          />
        </form>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Filter className="size-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs py-2 px-3 rounded-lg border border-zinc-200 bg-white text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Roles</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    Loading users list...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-900">
                        {u.full_name || "Unnamed User"}
                      </div>
                      <div className="text-zinc-500 font-mono text-[11px]">{u.email}</div>
                      {u.phone && (
                        <div className="text-zinc-400 text-[10px]">{u.phone}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.length === 0 ? (
                          <span className="text-zinc-400 text-[11px] italic">No Roles</span>
                        ) : (
                          u.roles.map((r) => (
                            <span
                              key={r}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                r === "SUPER_ADMIN"
                                  ? "bg-red-100 text-red-800"
                                  : r === "ADMIN"
                                  ? "bg-purple-100 text-purple-800"
                                  : r === "RECRUITER"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {r}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">{getStatusBadge(u.status)}</td>

                    <td className="py-3 px-4 text-zinc-500 text-[11px]">
                      {u.last_login_at
                        ? new Date(u.last_login_at).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Never"}
                    </td>

                    <td className="py-3 px-4 text-zinc-500 text-[11px]">
                      {new Date(u.created_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {hasPermission("users.update") && (
                          <button
                            onClick={() => handleOpenEdit(u)}
                            title="Edit User Profile"
                            className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                        )}

                        {hasPermission("permissions.assign") && (
                          <button
                            onClick={() => handleOpenRoles(u)}
                            title="Assign Roles"
                            className="p-1.5 rounded-md hover:bg-amber-50 text-amber-700 hover:text-amber-900 transition-colors cursor-pointer"
                          >
                            <Shield className="size-3.5" />
                          </button>
                        )}

                        {(hasPermission("users.disable") || hasPermission("users.update")) && (
                          <button
                            onClick={() => handleOpenStatus(u)}
                            title="Change Status"
                            className="p-1.5 rounded-md hover:bg-blue-50 text-blue-700 hover:text-blue-900 transition-colors cursor-pointer"
                          >
                            <UserCheck className="size-3.5" />
                          </button>
                        )}

                        {hasPermission("users.delete") && (
                          <button
                            onClick={() => setDeletingUser(u)}
                            disabled={u.roles.includes("SUPER_ADMIN")}
                            title={
                              u.roles.includes("SUPER_ADMIN")
                                ? "SUPER_ADMIN cannot be deleted"
                                : "Delete User"
                            }
                            className={`p-1.5 rounded-md transition-colors ${
                              u.roles.includes("SUPER_ADMIN")
                                ? "opacity-30 cursor-not-allowed text-zinc-400"
                                : "hover:bg-red-50 text-red-600 hover:text-red-800 cursor-pointer"
                            }`}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 bg-zinc-50/50 text-xs text-zinc-600">
          <div>
            Showing <span className="font-semibold text-zinc-900">{users.length}</span> of{" "}
            <span className="font-semibold text-zinc-900">{totalCount}</span> user accounts
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

      {/* Edit Profile Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-base font-bold text-zinc-900">Edit User Profile</h3>
              <button onClick={() => setEditingUser(null)} className="cursor-pointer text-zinc-400 hover:text-zinc-700">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={editingUser.email}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-zinc-100 text-zinc-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
                  placeholder="e.g. Jane Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
                  placeholder="e.g. +1 555-0199"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {managingRolesUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="text-base font-bold text-zinc-900">Manage Roles</h3>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">{managingRolesUser.email}</p>
              </div>
              <button onClick={() => setManagingRolesUser(null)} className="cursor-pointer text-zinc-400 hover:text-zinc-700">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700 mb-2">
                Assigned Roles (Approved System Roles)
              </label>
              {APPROVED_ROLES.map((role) => {
                const isChecked = selectedRoles.includes(role);
                return (
                  <label
                    key={role}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? "border-zinc-900 bg-zinc-50 font-semibold text-zinc-900"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleRole(role)}
                        className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                      />
                      <span>{role}</span>
                    </div>
                    {role === "SUPER_ADMIN" && (
                      <span className="text-[10px] font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        Full Access
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setManagingRolesUser(null)}
                className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRoles}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? "Updating..." : "Update Roles"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {statusChangingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-base font-bold text-zinc-900">Change Account Status</h3>
              <button onClick={() => setStatusChangingUser(null)} className="cursor-pointer text-zinc-400 hover:text-zinc-700">
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-600">
              Update status for <strong className="text-zinc-900">{statusChangingUser.email}</strong>:
            </p>

            <div className="space-y-2">
              {(["ACTIVE", "INACTIVE", "SUSPENDED"] as const).map((s) => (
                <label
                  key={s}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer ${
                    newStatus === s
                      ? "border-zinc-900 bg-zinc-50 font-bold text-zinc-900"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="statusChoice"
                    checked={newStatus === s}
                    onChange={() => setNewStatus(s)}
                    className="text-zinc-900"
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setStatusChangingUser(null)}
                className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStatus}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? "Saving..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl border border-red-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 rounded-xl bg-red-50 border border-red-200">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">Delete User Account</h3>
                <p className="text-xs text-red-600">Irreversible Action</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to permanently delete the account for{" "}
              <strong className="text-zinc-900 font-mono">{deletingUser.email}</strong>? This will remove all assigned user roles.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
