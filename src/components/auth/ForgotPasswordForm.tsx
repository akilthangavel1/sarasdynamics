import React, { useState } from "react";
import { Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function ForgotPasswordForm({
  onSuccess,
  onSwitchToLogin,
}: ForgotPasswordFormProps) {
  const { sendPasswordReset, openAuthModal, setAuthModalView } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await sendPasswordReset(email);
      if (res.success) {
        setSubmitted(true);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(res.error || "Failed to send password reset email. Please try again.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSwitchToLogin) {
      onSwitchToLogin();
    } else {
      setAuthModalView("login");
      openAuthModal("login");
    }
  };

  return (
    <div id="forgot-password-form-container" className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
          Reset password
        </h2>
        <p className="mt-1.5 text-sm text-zinc-600">
          Enter your email and we will send you instructions to reset your password
        </p>
      </div>

      {submitted ? (
        <div
          id="forgot-password-success-message"
          className="space-y-5 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-center"
        >
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="size-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-emerald-900">
              Check your inbox
            </h3>
            <p className="mt-1 text-sm text-emerald-700">
              We have sent password reset instructions to <strong>{email}</strong> if an account exists.
            </p>
          </div>
          <button
            id="forgot-password-return-login-btn"
            type="button"
            onClick={handleBackToLogin}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <ArrowLeft className="size-4" />
            Back to Sign In
          </button>
        </div>
      ) : (
        <>
          {error && (
            <div
              id="forgot-password-error-alert"
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-800"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="forgot-password-email"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-700"
              >
                Email address
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="size-4 text-zinc-400" />
                </div>
                <input
                  id="forgot-password-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:bg-zinc-50 disabled:text-zinc-500"
                />
              </div>
            </div>

            <button
              id="forgot-password-submit-button"
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Sending instructions...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-zinc-100 pt-4 text-center">
            <button
              id="forgot-password-back-btn"
              type="button"
              onClick={handleBackToLogin}
              className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:text-zinc-900 hover:underline"
            >
              <ArrowLeft className="size-4" />
              Back to Sign In
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ForgotPasswordForm;
