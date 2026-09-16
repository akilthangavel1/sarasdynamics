import React, { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../context/AuthContext.js";
import { LoginForm } from "./LoginForm.js";
import { RegisterForm } from "./RegisterForm.js";
import { ForgotPasswordForm } from "./ForgotPasswordForm.js";

export function AuthModal() {
  const { authModalOpen, authModalView, closeAuthModal, setAuthModalView } = useAuth();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && authModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [authModalOpen, closeAuthModal]);

  return (
    <AnimatePresence>
      {authModalOpen && (
        <div
          id="auth-modal-root"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeAuthModal}
            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl"
          >
            {/* Close button */}
            <button
              id="auth-modal-close-button"
              type="button"
              onClick={closeAuthModal}
              aria-label="Close modal"
              className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <X className="size-5" />
            </button>

            {/* Brand Logo Header */}
            <div className="mb-6 flex items-center justify-center gap-2">
              <img
                src="/saras-dynamics-logo.svg"
                alt="Saras Dynamics"
                className="size-8 object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="text-lg font-bold tracking-tight text-zinc-900">
                Saras<span className="text-red-600 font-extrabold">Dynamics</span>
              </span>
            </div>

            {/* View Switching */}
            {authModalView === "login" && (
              <LoginForm
                onSuccess={closeAuthModal}
                onSwitchToRegister={() => setAuthModalView("register")}
                onSwitchToForgotPassword={() => setAuthModalView("forgot-password")}
              />
            )}

            {authModalView === "register" && (
              <RegisterForm
                onSuccess={closeAuthModal}
                onSwitchToLogin={() => setAuthModalView("login")}
              />
            )}

            {authModalView === "forgot-password" && (
              <ForgotPasswordForm
                onSuccess={() => {}}
                onSwitchToLogin={() => setAuthModalView("login")}
              />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default AuthModal;
