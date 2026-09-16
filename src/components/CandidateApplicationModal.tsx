import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Trash2,
  LogIn,
  Lock,
} from "lucide-react";
import { api, type Job, type PublicApplicationSubmissionResponse } from "../services/api.js";
import { useAuth } from "../context/AuthContext.js";

interface CandidateApplicationModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}

export function CandidateApplicationModal({
  job,
  isOpen,
  onClose,
}: CandidateApplicationModalProps) {
  const { dbUser, firebaseUser, openAuthModal } = useAuth();
  const isAuthenticated = Boolean(dbUser || firebaseUser);

  const [fullName, setFullName] = useState(
    dbUser?.full_name || firebaseUser?.displayName || ""
  );
  const [email, setEmail] = useState(
    dbUser?.email || firebaseUser?.email || ""
  );
  const [phone, setPhone] = useState(dbUser?.phone || "");
  const [currentLocation, setCurrentLocation] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedData, setSubmittedData] =
    useState<PublicApplicationSubmissionResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Sync candidate user info when auth state updates
  useEffect(() => {
    if (dbUser || firebaseUser) {
      if (!fullName) {
        setFullName(dbUser?.full_name || firebaseUser?.displayName || "");
      }
      if (!email) {
        setEmail(dbUser?.email || firebaseUser?.email || "");
      }
      if (!phone && dbUser?.phone) {
        setPhone(dbUser.phone);
      }
    }
  }, [dbUser, firebaseUser]);

  if (!isOpen) return null;

  const handleFileSelection = (file: File) => {
    setErrorMessage(null);

    // Validate size (max 5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMessage("Resume file exceeds the maximum 5MB size limit.");
      return;
    }

    // Validate extension
    const name = file.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".docx") && !name.endsWith(".doc")) {
      setErrorMessage("Please upload a PDF (.pdf) or Word document (.docx, .doc).");
      return;
    }

    setResumeFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isAuthenticated) {
      setErrorMessage("Authentication required. Please sign in to submit your application.");
      openAuthModal("login");
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage("Full Name is required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please provide a valid email address.");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage("Phone number is required.");
      return;
    }
    if (!resumeFile) {
      setErrorMessage("Please upload your resume (PDF or Word document).");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("full_name", fullName.trim());
      formData.append("email", email.trim().toLowerCase());
      formData.append("phone", phone.trim());
      if (currentLocation.trim()) {
        formData.append("current_location", currentLocation.trim());
      }
      if (coverLetter.trim()) {
        formData.append("cover_letter", coverLetter.trim());
      }
      formData.append("resume", resumeFile);

      const response = await api.submitApplication(job.slug, formData);

      if (response.success && response.data?.application) {
        setSubmittedData(response.data.application);
      } else {
        setErrorMessage(
          response.message || "Failed to submit application. Please check your details."
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "A network error occurred while submitting. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setCurrentLocation("");
    setCoverLetter("");
    setResumeFile(null);
    setErrorMessage(null);
    setSubmittedData(null);
    onClose();
  };

  return (
    <div
      id="candidate-application-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-xl bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-zinc-200 my-8 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          id="close-application-modal-btn"
          onClick={resetForm}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="size-5" />
        </button>

        {!isAuthenticated ? (
          /* Authentication Required Prompt View */
          <div id="application-auth-required-view" className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-zinc-100 text-zinc-800 flex items-center justify-center mx-auto mb-4 border border-zinc-200">
              <Lock className="size-7 text-zinc-700" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Authentication Required
            </h3>
            <p className="mt-2 text-sm text-zinc-600 max-w-md mx-auto">
              You must be signed in to submit an application for{" "}
              <span className="font-semibold text-zinc-900">{job.title}</span>.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                id="apply-modal-signin-btn"
                onClick={() => openAuthModal("login")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <LogIn className="size-4" />
                <span>Sign In to Continue</span>
              </button>
              <button
                id="apply-modal-register-btn"
                onClick={() => openAuthModal("register")}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-semibold hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                Create an Account
              </button>
            </div>
          </div>
        ) : submittedData ? (
          /* Application Success View */
          <div id="application-success-view" className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Application submitted successfully.
            </h3>
            <p className="mt-2 text-sm text-zinc-600 max-w-md mx-auto">
              Thank you for applying to{" "}
              <span className="font-semibold text-zinc-900">{job.title}</span> at Saras Dynamics.
            </p>

            <div className="mt-6 p-5 bg-zinc-50 border border-zinc-200 rounded-xl text-left max-w-md mx-auto">
              <span className="text-xs uppercase font-medium text-zinc-500 tracking-wider">
                Application Number
              </span>
              <p
                id="generated-application-number"
                className="text-2xl font-mono font-bold text-zinc-900 mt-1"
              >
                {submittedData.application_number}
              </p>
              <div className="mt-3 pt-3 border-t border-zinc-200 text-xs text-zinc-600 flex justify-between">
                <span>Candidate: {submittedData.full_name}</span>
                <span>Status: {submittedData.status}</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-zinc-500">
              Please save this application number for your reference.
            </p>

            <button
              id="success-close-modal-btn"
              onClick={resetForm}
              className="mt-6 px-6 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* Application Form View */
          <div>
            <div className="border-b border-zinc-100 pb-4 mb-5">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Careers &bull; Saras Dynamics
              </span>
              <h3 className="text-xl font-bold text-zinc-900 mt-1">{job.title}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {job.location || "Remote"} &bull; {job.workplace_type} &bull;{" "}
                {job.employment_type.replace("_", " ")}
              </p>
            </div>

            {errorMessage && (
              <div
                id="application-error-alert"
                className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700"
              >
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="candidate-full-name-input"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="candidate-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="candidate-phone-input"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-019-2834"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                  />
                </div>
              </div>

              {/* Current Location */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Current Location (City, Country / State)
                </label>
                <input
                  id="candidate-location-input"
                  type="text"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  placeholder="San Francisco, CA or London, UK"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                />
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Cover Letter / Note
                </label>
                <textarea
                  id="candidate-cover-letter-input"
                  rows={3}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell us why you are interested in this position and what makes you a great fit..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white resize-none"
                />
              </div>

              {/* Resume File Upload with Drag & Drop */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Resume / CV (PDF or DOCX, max 5MB) <span className="text-red-500">*</span>
                </label>

                {resumeFile ? (
                  <div
                    id="selected-resume-file-container"
                    className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileText className="size-5 text-zinc-700 shrink-0" />
                      <div className="truncate text-xs">
                        <p className="font-semibold text-zinc-900 truncate">
                          {resumeFile.name}
                        </p>
                        <p className="text-zinc-500">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResumeFile(null)}
                      className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-zinc-100 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    id="resume-drag-drop-zone"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                      isDragging
                        ? "border-zinc-900 bg-zinc-50"
                        : "border-zinc-300 hover:border-zinc-400 bg-zinc-50/50"
                    }`}
                  >
                    <UploadCloud className="size-8 text-zinc-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-zinc-800">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      PDF (.pdf) or Word document (.docx, .doc) up to 5MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelection(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900"
                >
                  Cancel
                </button>
                <button
                  id="submit-candidate-application-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Application</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
