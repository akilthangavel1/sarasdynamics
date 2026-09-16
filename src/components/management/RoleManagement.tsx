import React, { useState, useEffect } from "react";
import {
  Shield,
  CheckCircle2,
  Lock,
  Edit2,
  RefreshCw,
  X,
  AlertTriangle,
  Layers,
  Search,
  Key,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  api,
  type AdminRoleItem,
  type AdminPermissionItem,
} from "../../services/api";

export function RoleManagement() {
  const { hasPermission } = useAuth();

  const [roles, setRoles] = useState<AdminRoleItem[]>([]);
  const [permissions, setPermissions] = useState<AdminPermissionItem[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, AdminPermissionItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [editingRole, setEditingRole] = useState<AdminRoleItem | null>(null);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchRoleData = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.getAdminRoles(),
        api.getAdminPermissions(),
      ]);

      if (rolesRes.success && rolesRes.data) {
        setRoles(rolesRes.data);
      }
      if (permsRes.success && permsRes.data) {
        setPermissions(permsRes.data.all || []);
        setGroupedPermissions(permsRes.data.grouped || {});
      }
    } catch (err: any) {
      console.error("Failed to load roles and permissions:", err);
      setActionError(err.message || "Failed to load roles data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoleData();
  }, []);

  const handleOpenEdit = (role: AdminRoleItem) => {
    setEditingRole(role);
    setRolePermissions([...role.permissions]);
    setActionError(null);
  };

  const handleTogglePerm = (permName: string) => {
    if (rolePermissions.includes(permName)) {
      setRolePermissions(rolePermissions.filter((p) => p !== permName));
    } else {
      setRolePermissions([...rolePermissions, permName]);
    }
  };

  const handleSelectAllModule = (modulePerms: AdminPermissionItem[]) => {
    const names = modulePerms.map((p) => p.name);
    const allSelected = names.every((n) => rolePermissions.includes(n));
    if (allSelected) {
      setRolePermissions(rolePermissions.filter((p) => !names.includes(p)));
    } else {
      setRolePermissions(Array.from(new Set([...rolePermissions, ...names])));
    }
  };

  const handleSavePermissions = async () => {
    if (!editingRole) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await api.updateAdminRolePermissions(editingRole.id, rolePermissions);
      if (res.success) {
        setActionSuccess(`Permissions updated for role ${editingRole.name}`);
        setEditingRole(null);
        fetchRoleData();
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to update role permissions");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div id="role-management-view" className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Roles &amp; Permission Matrix
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Enterprise RBAC definition containing exactly 4 approved system roles and 42 granular permissions.
          </p>
        </div>

        <button
          onClick={fetchRoleData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
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

      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {roles.map((r) => (
          <div
            key={r.id}
            className="flex flex-col justify-between p-5 rounded-2xl border border-zinc-200 bg-white shadow-2xs hover:border-zinc-300 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    r.name === "SUPER_ADMIN"
                      ? "bg-red-100 text-red-800 border border-red-200"
                      : r.name === "ADMIN"
                      ? "bg-purple-100 text-purple-800 border border-purple-200"
                      : r.name === "RECRUITER"
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {r.name}
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
                  <Lock className="size-3" /> System
                </span>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed min-h-[36px]">
                {r.description || "System configured access role."}
              </p>

              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                <span>Granted Permissions:</span>
                <span className="font-bold text-zinc-900 font-mono">
                  {r.permissions.length} / {permissions.length}
                </span>
              </div>
            </div>

            {hasPermission("permissions.assign") && (
              <div className="pt-4 mt-4 border-t border-zinc-100">
                <button
                  onClick={() => handleOpenEdit(r)}
                  disabled={r.name === "SUPER_ADMIN"}
                  className={`w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    r.name === "SUPER_ADMIN"
                      ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                      : "bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer shadow-2xs"
                  }`}
                >
                  <Edit2 className="size-3.5" />
                  <span>
                    {r.name === "SUPER_ADMIN" ? "All Permissions Fixed" : "Edit Permissions"}
                  </span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Permissions Hierarchy & Grouped Explorer */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-100 text-zinc-900">
              <Layers className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">
                System Permissions Catalog ({permissions.length} Approved)
              </h2>
              <p className="text-xs text-zinc-500">
                Granular capabilities partitioned across functional application domains.
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Filter permissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedPermissions).map(([moduleName, rawPerms]) => {
            const perms = rawPerms as AdminPermissionItem[];
            const filteredPerms = perms.filter(
              (p) =>
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
            );

            if (search && filteredPerms.length === 0) return null;

            return (
              <div
                key={moduleName}
                className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                    {moduleName}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-zinc-200 text-zinc-600 font-semibold">
                    {filteredPerms.length} rules
                  </span>
                </div>

                <div className="space-y-1.5">
                  {filteredPerms.map((p) => (
                    <div
                      key={p.id}
                      className="p-2 rounded-lg bg-white border border-zinc-100 text-xs space-y-0.5 shadow-3xs"
                    >
                      <div className="font-mono font-semibold text-zinc-900 text-[11px] flex items-center gap-1.5">
                        <Key className="size-3 text-red-600 shrink-0" />
                        <span>{p.name}</span>
                      </div>
                      {p.description && (
                        <div className="text-[11px] text-zinc-500 pl-4">{p.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Role Permissions Modal */}
      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl border border-zinc-200 space-y-5 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 shrink-0">
              <div>
                <h3 className="text-base font-bold text-zinc-900">
                  Edit Permissions for {editingRole.name}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Select granted capabilities. Changes take effect on subsequent token authorizations.
                </p>
              </div>
              <button onClick={() => setEditingRole(null)} className="cursor-pointer text-zinc-400 hover:text-zinc-700">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {Object.entries(groupedPermissions).map(([modName, rawPerms]) => {
                const perms = rawPerms as AdminPermissionItem[];
                const names = perms.map((p) => p.name);
                const allSelected = names.every((n) => rolePermissions.includes(n));
                const someSelected = names.some((n) => rolePermissions.includes(n));

                return (
                  <div key={modName} className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                        {modName} Module
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSelectAllModule(perms)}
                        className="text-[11px] font-semibold text-zinc-700 hover:text-zinc-900 underline cursor-pointer"
                      >
                        {allSelected ? "Deselect All" : "Select All"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {perms.map((p) => {
                        const isChecked = rolePermissions.includes(p.name);
                        return (
                          <label
                            key={p.id}
                            className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                              isChecked
                                ? "border-zinc-900 bg-white font-medium text-zinc-900"
                                : "border-zinc-200 bg-white/70 text-zinc-600 hover:border-zinc-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePerm(p.name)}
                              className="mt-0.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                            />
                            <div className="space-y-0.5">
                              <div className="font-mono text-[11px] font-semibold">{p.name}</div>
                              {p.description && (
                                <div className="text-[10px] text-zinc-400 leading-tight">
                                  {p.description}
                                </div>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 shrink-0">
              <div className="text-xs text-zinc-500 font-mono">
                {rolePermissions.length} permissions granted
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  {actionLoading ? "Saving..." : "Save Role Permissions"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
