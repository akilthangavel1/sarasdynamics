import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ManagementLayout, type ManagementTab } from "./ManagementLayout";
import { ManagementDashboard } from "./ManagementDashboard";
import { UserManagement } from "./UserManagement";
import { RoleManagement } from "./RoleManagement";
import { AuditLogsManagement } from "./AuditLogsManagement";
import { SeoManagement } from "./SeoManagement";
import { AdminJobManagement } from "../AdminJobManagement";
import { AdminApplicationManagement } from "../AdminApplicationManagement";
import { AdminInterviewManagement } from "../AdminInterviewManagement";
import { AdminBlogManagement } from "../AdminBlogManagement";
import { ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";

interface ManagementConsolePageProps {
  initialSubTab?: string;
  onNavigateHome: () => void;
}

export function ManagementConsolePage({
  initialSubTab,
  onNavigateHome,
}: ManagementConsolePageProps) {
  const { firebaseUser, dbUser, roles, permissions, loading, hasPermission } = useAuth();

  // Determine active sub tab based on hash or initialSubTab
  const [activeTab, setActiveTab] = useState<ManagementTab>(() => {
    const validTabs: ManagementTab[] = [
      "dashboard",
      "jobs",
      "applications",
      "interviews",
      "blog",
      "seo",
      "users",
      "roles",
      "audit-logs",
    ];
    if (initialSubTab && validTabs.includes(initialSubTab as ManagementTab)) {
      return initialSubTab as ManagementTab;
    }
    return "dashboard";
  });

  // Sync hash when tab changes
  const handleSelectTab = (tab: ManagementTab) => {
    setActiveTab(tab);
    window.location.hash = tab === "dashboard" ? "management" : `management/${tab}`;
  };

  // Sync state when browser hash changes
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, "");
      const parts = hash.split("/");
      if (parts[0] === "management") {
        const sub = parts[1] as ManagementTab;
        const validTabs: ManagementTab[] = [
          "dashboard",
          "jobs",
          "applications",
          "interviews",
          "blog",
          "seo",
          "users",
          "roles",
          "audit-logs",
        ];
        if (sub && validTabs.includes(sub)) {
          setActiveTab(sub);
        } else if (!sub) {
          setActiveTab("dashboard");
        }
      }
    };

    window.addEventListener("hashchange", parseHash);
    return () => window.removeEventListener("hashchange", parseHash);
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-zinc-900" />
          <span className="text-xs font-semibold text-zinc-600">
            Verifying administrative access authorization...
          </span>
        </div>
      </div>
    );
  }

  // Ensure user has at least one role/permission to view management area
  const hasAnyAdminAccess =
    roles.length > 0 &&
    (roles.includes("SUPER_ADMIN") ||
      roles.includes("ADMIN") ||
      roles.includes("RECRUITER") ||
      roles.includes("CONTENT_WRITER") ||
      permissions.length > 0);

  if (!hasAnyAdminAccess) {
    return (
      <div className="w-full min-h-screen bg-zinc-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-zinc-200 shadow-xl text-center space-y-4">
          <div className="size-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="size-6" />
          </div>

          <h2 className="text-lg font-bold text-zinc-900">Access Restricted</h2>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Your account (<strong className="text-zinc-900">{dbUser?.email || firebaseUser?.email}</strong>) does not have any assigned administrative roles or system permissions.
          </p>

          <button
            onClick={onNavigateHome}
            className="w-full py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="size-3.5" />
            <span>Return to Public Website</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <ManagementLayout
      activeTab={activeTab}
      onSelectTab={handleSelectTab}
      onBackToWebsite={onNavigateHome}
    >
      {activeTab === "dashboard" && (
        <ManagementDashboard onNavigateTab={handleSelectTab} />
      )}

      {activeTab === "jobs" && hasPermission("jobs.read") && (
        <AdminJobManagement onClose={() => handleSelectTab("dashboard")} />
      )}

      {activeTab === "applications" && hasPermission("applications.read") && (
        <AdminApplicationManagement />
      )}

      {activeTab === "interviews" && hasPermission("interviews.read") && (
        <AdminInterviewManagement />
      )}

      {activeTab === "blog" && hasPermission("blog_posts.read") && (
        <AdminBlogManagement onClose={() => handleSelectTab("dashboard")} />
      )}

      {activeTab === "seo" && (hasPermission("seo.read") || hasPermission("seo.manage")) && (
        <SeoManagement />
      )}

      {activeTab === "users" && hasPermission("users.read") && (
        <UserManagement />
      )}

      {activeTab === "roles" && (hasPermission("roles.read") || hasPermission("permissions.read")) && (
        <RoleManagement />
      )}

      {activeTab === "audit-logs" && hasPermission("audit_logs.read") && (
        <AuditLogsManagement />
      )}
    </ManagementLayout>
  );
}
