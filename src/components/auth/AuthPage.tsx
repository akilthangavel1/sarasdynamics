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
    <div id="auth-page-wrapper" className="min-h-screen bg-zinc-50 flex flex-col justify-between">
      <Navbar1Demo />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Back button */}
          <div className="mb-6">
            <button
              id="auth-page-back-to-home-btn"
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back to Home
            </button>
          </div>

          {/* Card Container */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-sm">
            {/* Brand Header */}
            <div className="mb-6 flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src="/saras-dynamics-logo.svg"
                  alt="Saras Dynamics"
                  className="size-8 object-contain"
                  referrerPolicy="no-referrer"
                />
                <span className="text-xl font-bold tracking-tight text-zinc-900">
                  Saras<span className="text-red-600 font-extrabold">Dynamics</span>
                </span>
              </div>
            </div>

            {/* If user is already authenticated */}
            {dbUser ? (
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">You are already signed in</h3>
                  <p className="text-sm text-zinc-600 mt-1">
                    Logged in as <strong>{dbUser.full_name || dbUser.email}</strong>
                  </p>
                  {roles.length > 0 && (
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-800">
                      Roles: {roles.join(", ")}
                    </div>
                  )}
                </div>
                <div className="pt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={onBackToHome}
                    className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition"
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
                      className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 transition"
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
                    onSwitchToRegister={() => setView("register")}
                    onSwitchToForgotPassword={() => setView("forgot-password")}
                  />
                )}

                {view === "register" && (
                  <RegisterForm
                    onSuccess={onBackToHome}
                    onSwitchToLogin={() => setView("login")}
                  />
                )}

                {view === "forgot-password" && (
                  <ForgotPasswordForm
                    onSuccess={() => {}}
                    onSwitchToLogin={() => setView("login")}
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
