import React, { useState, useEffect } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Navbar1Demo } from "@/components/ui/navbar-demo";
import { SiteFooter } from "@/components/ui/site-footer";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { useAuth } from "../../context/AuthContext";

interface AuthPageProps {
  initialView?: "login" | "register" | "forgot-password";
  onBackToHome: () => void;
}

export function AuthPage({ initialView = "login", onBackToHome }: AuthPageProps) {
  const [view, setView] = useState<"login" | "register" | "forgot-password">(initialView);
  const { dbUser, roles } = useAuth();

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  return (
    <div id="auth-page-wrapper" className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between transition-colors">
      <Navbar1Demo />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Back button */}
          <div className="mb-6">
            <button
              id="auth-page-back-to-home-btn"
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back to Home
            </button>
          </div>

          {/* Card Container */}
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
            {/* Brand Header */}
            <div className="mb-6 flex flex-col items-center justify-center">
              <div className="flex items-center gap-2.5 mb-2">
                <img
                  src="/saras-dynamics-logo.png?v=2"
                  alt="Saras Dynamics"
                  className="h-9 w-auto object-contain dark:hidden shrink-0"
                />
                <img
                  src="/saras-dynamics-logo-dark.png?v=2"
                  alt="Saras Dynamics"
                  className="h-9 w-auto object-contain hidden dark:block shrink-0"
                />
                <span className="text-xl tracking-tight">
                  <span className="text-black dark:text-white font-black">Saras </span>
                  <span className="text-zinc-500 dark:text-zinc-400 font-bold">Dynamics</span>
                </span>
              </div>
            </div>

            {/* If user is already authenticated */}
            {dbUser ? (
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">You are already signed in</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    Logged in as <strong>{dbUser.full_name || dbUser.email}</strong>
                  </p>
                  {roles.length > 0 && (
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      Roles: {roles.join(", ")}
                    </div>
                  )}
                </div>
                <div className="pt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={onBackToHome}
                    className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-100 py-2.5 text-sm font-semibold text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition"
                  >
                    Return to Homepage
                  </button>
                  {(roles.includes("SUPER_ADMIN") || roles.includes("ADMIN") || roles.includes("RECRUITER") || roles.includes("CONTENT_WRITER")) && (
                    <button
                      type="button"
                      onClick={() => {
                        window.location.hash = "#careers";
                        onBackToHome();
                      }}
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-2.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
                    >
                      Go to Management Console
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {view === "login" && (
                  <LoginForm
                    onSuccess={onBackToHome}
                    onSwitchToRegister={() => {
                      setView("register");
                      window.location.hash = "#register";
                    }}
                    onSwitchToForgotPassword={() => {
                      setView("forgot-password");
                      window.location.hash = "#forgot-password";
                    }}
                  />
                )}

                {view === "register" && (
                  <RegisterForm
                    onSuccess={onBackToHome}
                    onSwitchToLogin={() => {
                      setView("login");
                      window.location.hash = "#login";
                    }}
                  />
                )}

                {view === "forgot-password" && (
                  <ForgotPasswordForm
                    onSuccess={() => {
                      setView("login");
                      window.location.hash = "#login";
                    }}
                    onSwitchToLogin={() => {
                      setView("login");
                      window.location.hash = "#login";
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export default AuthPage;
