import React from "react";
import { Lock, ShieldAlert, LogIn, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  fallbackMessage?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  fallbackMessage,
}: ProtectedRouteProps) {
  const { dbUser, firebaseUser, loading, hasRole, hasPermission, openAuthModal } = useAuth();

  if (loading) {
    return (
      <div
        id="protected-route-loading"
        className="flex min-h-[400px] w-full flex-col items-center justify-center gap-3 p-8 text-zinc-500"
      >
        <Loader2 className="size-8 animate-spin text-zinc-800" />
        <p className="text-sm font-medium">Verifying authorization credentials...</p>
      </div>
    );
  }

  // Not authenticated
  if (!firebaseUser || !dbUser) {
    return (
      <div
        id="protected-route-unauthenticated"
        className="mx-auto my-12 max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm"
      >
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-800">
          <Lock className="size-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Authentication Required</h2>
        <p className="mt-2 text-sm text-zinc-600">
          {fallbackMessage ||
            "You must be signed in to Saras Dynamics to access this section."}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            id="protected-route-login-btn"
            type="button"
            onClick={() => openAuthModal("login")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <LogIn className="size-4" />
            Sign In to Continue
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.hash = "#";
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            <ArrowLeft className="size-4" />
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Check user account status
  if (dbUser.status !== "ACTIVE") {
    return (
      <div
        id="protected-route-inactive"
        className="mx-auto my-12 max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center"
      >
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-800">
          <ShieldAlert className="size-6" />
        </div>
        <h2 className="text-xl font-bold text-amber-900">Account Access Restricted</h2>
        <p className="mt-2 text-sm text-amber-700">
          Your account status is currently <strong>{dbUser.status}</strong>. Please contact an administrator to reactivate your access.
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => {
              window.location.hash = "#";
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900"
          >
            <ArrowLeft className="size-4" />
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Check required role
  if (requiredRole && !hasRole(requiredRole) && !hasRole("SUPER_ADMIN")) {
    return (
      <div
        id="protected-route-forbidden-role"
        className="mx-auto my-12 max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm"
      >
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-red-100 text-red-700">
          <ShieldAlert className="size-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Access Denied</h2>
        <p className="mt-2 text-sm text-zinc-600">
          This area requires the <strong>{requiredRole}</strong> role. Your account does not have sufficient permissions.
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => {
              window.location.hash = "#";
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            <ArrowLeft className="size-4" />
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Check required permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div
        id="protected-route-forbidden-permission"
        className="mx-auto my-12 max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm"
      >
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-red-100 text-red-700">
          <ShieldAlert className="size-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Access Restricted</h2>
        <p className="mt-2 text-sm text-zinc-600">
          You lack the required system permission (<code>{requiredPermission}</code>) to view this resource.
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => {
              window.location.hash = "#";
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            <ArrowLeft className="size-4" />
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
