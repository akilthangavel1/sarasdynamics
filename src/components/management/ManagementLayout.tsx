import React, { useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  FileText,
  Globe,
  UserCheck,
  Shield,
  Activity,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export type ManagementTab =
  | "dashboard"
  | "jobs"
  | "applications"
  | "interviews"
  | "blog"
  | "seo"
  | "users"
  | "roles"
  | "audit-logs";

interface NavItem {
  id: ManagementTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    description: "System stats & recent activity",
  },
  {
    id: "jobs",
    label: "Job Openings",
    icon: Briefcase,
    permission: "jobs.read",
    description: "Requisitions & postings",
  },
  {
    id: "applications",
    label: "Applications",
    icon: Users,
    permission: "applications.read",
    description: "Candidate submission pipeline",
  },
  {
    id: "interviews",
    label: "Interviews",
    icon: Calendar,
    permission: "interviews.read",
    description: "Schedules & scorecard feedback",
  },
  {
    id: "blog",
    label: "Blog & Articles",
    icon: FileText,
    permission: "blog.read",
    description: "Editorial publications & tags",
  },
  {
    id: "seo",
    label: "SEO Metadata",
    icon: Globe,
    permission: "seo.read",
    description: "Search & OpenGraph tags",
  },
  {
    id: "users",
    label: "User Accounts",
    icon: UserCheck,
    permission: "users.read",
    description: "Team profiles & statuses",
  },
  {
    id: "roles",
    label: "Roles & Permissions",
    icon: Shield,
    permission: "roles.read",
    description: "RBAC matrix & security",
  },
  {
    id: "audit-logs",
    label: "Audit Logs",
    icon: Activity,
    permission: "audit_logs.read",
    description: "Compliance & activity trail",
  },
];

interface ManagementLayoutProps {
  activeTab: ManagementTab;
  onSelectTab: (tab: ManagementTab) => void;
  onBackToWebsite: () => void;
  children: React.ReactNode;
}

export function ManagementLayout({
  activeTab,
  onSelectTab,
  onBackToWebsite,
  children,
}: ManagementLayoutProps) {
  const { firebaseUser, dbUser, roles, permissions, hasPermission, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter items based strictly on RBAC permissions
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  const activeItem = NAV_ITEMS.find((n) => n.id === activeTab);

  const handleTabClick = (tab: ManagementTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div id="management-console-shell" className="w-full min-h-screen bg-zinc-100 flex flex-col selection:bg-zinc-900 selection:text-white">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-zinc-200 shadow-3xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

            <div
              onClick={onBackToWebsite}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#c30000] group-hover:scale-110 transition-transform" />
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight text-zinc-900 uppercase">
                  Saras Dynamics
                </span>
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Management Console
                </span>
              </div>
            </div>
          </div>

          {/* User Menu & Navigation Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToWebsite}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-colors cursor-pointer shadow-3xs"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Website</span>
            </button>

            <div className="h-6 w-px bg-zinc-200 hidden sm:block" />

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="size-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold uppercase shadow-2xs">
                {dbUser?.full_name?.charAt(0) || firebaseUser?.email?.charAt(0) || "U"}
              </div>

              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-zinc-900 leading-tight">
                  {dbUser?.full_name || firebaseUser?.email?.split("@")[0] || "User"}
                </span>
                <div className="flex items-center gap-1">
                  {roles.map((r) => (
                    <span
                      key={r}
                      className="text-[9px] font-bold uppercase tracking-wider text-red-600 font-mono"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={signOut}
              title="Sign Out"
              className="p-2 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 w-full flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-200 bg-white p-4 space-y-1 shrink-0 min-h-[calc(100vh-4rem)]">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Navigation
          </div>

          <nav className="space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-zinc-900 text-white shadow-2xs"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`size-4 ${isActive ? "text-red-500" : "text-zinc-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="size-3.5 text-zinc-400" />}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-zinc-100 space-y-2">
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                <Shield className="size-3.5 text-red-600" />
                <span>Security Status</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-snug">
                {permissions.length} active permissions granted on this session.
              </p>
            </div>

            <button
              onClick={onBackToWebsite}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-600 hover:bg-zinc-100 cursor-pointer transition-colors"
            >
              <ArrowLeft className="size-3" />
              <span>Back to Public Site</span>
            </button>
          </div>
        </aside>

        {/* Mobile Slide-out Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <div className="relative w-72 max-w-[80vw] bg-white h-full p-4 flex flex-col space-y-2 z-10 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Management Menu
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto pt-2">
                {visibleNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                        isActive
                          ? "bg-zinc-900 text-white"
                          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`size-4 ${isActive ? "text-red-500" : "text-zinc-500"}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="size-3.5 text-zinc-400" />}
                    </button>
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-zinc-200">
                <button
                  onClick={onBackToWebsite}
                  className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-800 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Back to Website</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
