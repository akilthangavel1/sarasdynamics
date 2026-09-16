import React, { useState } from "react";
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  onSwitchToForgotPassword?: () => void;
}

export function LoginForm({
  onSuccess,
  onSwitchToRegister,
  onSwitchToForgotPassword,
}: LoginFormProps) {
  const { loginWithEmail, openAuthModal, setAuthModalView } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithEmail(email, password);
      if (res.success) {
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(res.error || "Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSwitchToRegister) {
      onSwitchToRegister();
    } else {
      setAuthModalView("register");
      openAuthModal("register");
    }
  };

  const handleForgotPasswordClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSwitchToForgotPassword) {
      onSwitchToForgotPassword();
    } else {
      setAuthModalView("forgot-password");
      openAuthModal("forgot-password");
    }
  };

  return (
    <div id="login-form-container" className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
          Welcome back
        </h2>
        <p className="mt-1.5 text-sm text-zinc-600">
          Enter your credentials to access your Saras Dynamics account
        </p>
      </div>

      {error && (
        <div
          id="login-error-alert"
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
            htmlFor="login-email"
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-700"
          >
            Email address
          </label>
          <div className="relative mt-1.5">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="size-4 text-zinc-400" />
            </div>
            <input
              id="login-email"
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

        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-700"
            >
              Password
            </label>
            <button
              id="login-forgot-password-link"
              type="button"
              onClick={handleForgotPasswordClick}
              className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative mt-1.5">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="size-4 text-zinc-400" />
            </div>
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:bg-zinc-50 disabled:text-zinc-500"
            />
            <button
              id="login-toggle-password-visibility"
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        <button
          id="login-submit-button"
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      <div className="mt-6 border-t border-zinc-100 pt-4 text-center">
        <p className="text-sm text-zinc-600">
          Don&apos;t have an account?{" "}
          <button
            id="login-switch-to-register-btn"
            type="button"
            onClick={handleRegisterClick}
            className="font-semibold text-zinc-900 hover:underline"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
