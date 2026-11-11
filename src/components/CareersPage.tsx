import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight,
  Send,
  Search,
  Tag,
  Shield,
  RefreshCw,
  X,
} from "lucide-react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { SiteFooter } from "@/components/ui/site-footer";
import CTA from "@/components/ui/cta-06";
import NotchedProjectCardsDemo from "@/components/ui/notched-project-card-demo";
import { useAuth } from "../context/AuthContext";
import {
  api,
  type Job,
  type JobCategory,
} from "../services/api";
import { AdminJobManagement } from "./AdminJobManagement";
import { CandidateApplicationModal } from "./CandidateApplicationModal";

interface CareersPageProps {
  onBackToHome?: () => void;
}


export function CareersPage({ onBackToHome }: CareersPageProps) {
  const { dbUser, firebaseUser, roles, hasPermission, openAuthModal } = useAuth();
  const isAuthenticated = Boolean(dbUser || firebaseUser);

  const canAccessJobAdmin =
    hasPermission("jobs.read") ||
    hasPermission("jobs.create") ||
    hasPermission("jobs.update") ||
    hasPermission("jobs.update_content");

  const [isAdminViewOpen, setIsAdminViewOpen] = useState(false);

  // Live state from backend
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const [appliedRole, setAppliedRole] = useState<Job | null>(null);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantNote, setApplicantNote] = useState("");

  // Restore preserved job application flow after successful authentication
  useEffect(() => {
    if (isAuthenticated && jobs.length > 0 && !appliedRole) {
      const savedSlug = sessionStorage.getItem("saras_intended_apply_slug");
      if (savedSlug) {
        const matched = jobs.find((j) => j.slug === savedSlug);
        if (matched) {
          setAppliedRole(matched);
        }
        sessionStorage.removeItem("saras_intended_apply_slug");
      }
    }
  }, [isAuthenticated, jobs, appliedRole]);

  const handleApplyClick = (position: Job) => {
    setAppliedRole(position);
    setApplicationSubmitted(false);
    if (!isAuthenticated) {
      sessionStorage.setItem("saras_intended_apply_slug", position.slug);
      openAuthModal("login");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsRes, jobsRes] = await Promise.all([
        api.getPublicCategories(),
        api.getPublicJobs({
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          search: searchQuery || undefined,
          limit: 50,
        }),
      ]);

      if (catsRes.success && catsRes.data) {
        setCategories(catsRes.data);
      }
      if (jobsRes.success && jobsRes.data) {
        setJobs(jobsRes.data);
      }
    } catch (err) {
      console.error("Failed to load careers data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantEmail) return;
    setApplicationSubmitted(true);
  };

  const resetApplicationModal = () => {
    setAppliedRole(null);
    setApplicationSubmitted(false);
    setApplicantName("");
    setApplicantEmail("");
    setApplicantNote("");
  };

  if (isAdminViewOpen) {
    return <AdminJobManagement onClose={() => setIsAdminViewOpen(false)} />;
  }

  return (
    <div id="careers-page-wrapper" className="w-full min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-serif selection:bg-zinc-900 selection:text-white transition-colors duration-300">
      {/* Sticky Responsive Header Navigation */}
      <Navbar1Demo />

      {/* Admin Quick Banner for Team Members */}
      {canAccessJobAdmin && (
        <div className="bg-slate-900 text-slate-200 border-b border-slate-800 py-2.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>
                Talent Operations Portal &bull; Logged in as{" "}
                <span className="font-semibold text-white">{roles.join(", ")}</span>
              </span>
            </div>
            <button
              onClick={() => {
                window.location.hash = "#management/jobs";
              }}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-md transition-colors cursor-pointer"
            >
              Open in Management Console &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1 w-full flex flex-col">
        {/* Open Positions Section */}
        <section id="open-positions" className="w-full py-12 md:py-16 bg-white dark:bg-zinc-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                Current Openings
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
                Find your place at the studio
              </h2>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search open positions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-800 dark:focus:border-zinc-300"
              />
            </form>
          </div>

          {/* Department Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === "All"
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat.slug
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Positions List */}
          {loading ? (
            <div className="py-20 text-center text-zinc-400 flex items-center justify-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-zinc-600 dark:text-zinc-400" />
              <span>Loading current openings...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((position) => (
                <div
                  key={position.id}
                  className="group p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="max-w-2xl space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {position.category && (
                        <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
                          {position.category.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                        <MapPin className="size-3.5" />
                        {position.location || position.workplace_type}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                        <Clock className="size-3.5" />
                        {position.employment_type.replace("_", " ")}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-white transition-colors">
                      {position.title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                      {position.description}
                    </p>

                    {/* Skill Tags */}
                    {position.skills && position.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {position.skills.map((skill) => (
                          <span
                            key={skill.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => setViewingJob(position)}
                      className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                    <button
                      id={`apply-job-${position.slug}-btn`}
                      onClick={() => handleApplyClick(position)}
                      className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white transition-colors cursor-pointer"
                    >
                      <span>{isAuthenticated ? "Apply Now" : "Login to Apply"}</span>
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {jobs.length === 0 && (
                <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                  No published openings currently found in this filter. Check back soon!
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Job Details Modal */}
      <AnimatePresence>
        {viewingJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-6 text-zinc-900 dark:text-zinc-100"
            >
              <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {viewingJob.category && (
                      <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
                        {viewingJob.category.name}
                      </span>
                    )}
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      {viewingJob.workplace_type} &bull; {viewingJob.employment_type.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{viewingJob.title}</h3>
                </div>
                <button
                  onClick={() => setViewingJob(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Skills */}
              {viewingJob.skills && viewingJob.skills.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase font-semibold text-zinc-400 tracking-wider mb-2">
                    Key Competencies
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingJob.skills.map((s) => (
                      <span
                        key={s.id}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Overview */}
              {viewingJob.description && (
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-semibold text-zinc-400 tracking-wider">
                    Role Overview
                  </h4>
                  <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {viewingJob.description}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {viewingJob.requirements && (
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-semibold text-zinc-400 tracking-wider">
                    Qualifications & Requirements
                  </h4>
                  <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {viewingJob.requirements}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => setViewingJob(null)}
                  className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  Close
                </button>
                <button
                  id="job-detail-apply-btn"
                  onClick={() => {
                    const j = viewingJob;
                    setViewingJob(null);
                    handleApplyClick(j);
                  }}
                  className="px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white"
                >
                  {isAuthenticated ? "Apply for this Role" : "Login to Apply"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Real Candidate Application Modal */}
      {appliedRole && (
        <CandidateApplicationModal
          job={appliedRole}
          isOpen={Boolean(appliedRole)}
          onClose={() => setAppliedRole(null)}
        />
      )}

      {/* Featured Projects & Engineering Craft Section */}
      <section id="careers-projects-showcase" className="w-full py-16 md:py-24 bg-white dark:bg-zinc-950 border-t border-zinc-200/80 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
          <div className="w-full grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6 md:gap-10 lg:gap-12">
            {/* Left Column: Eyebrow with red accent line & Title */}
            <div className="flex flex-col items-start gap-3">
              <div className="flex items-center gap-3.5">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-zinc-900 dark:text-zinc-100">
                  Our Work &amp; Craft
                </span>
                <span
                  className="inline-block w-20 sm:w-24 h-[2px] bg-[#c30000] rounded-sm shrink-0"
                  aria-hidden="true"
                />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white sm:text-4xl md:text-5xl leading-[1.08] text-balance">
                What you&apos;ll build<br className="hidden sm:inline" /> with our team
              </h2>
            </div>

            {/* Center Divider: Vertical separator line */}
            <div
              className="hidden md:block w-px h-16 lg:h-20 bg-zinc-200 dark:bg-zinc-800 shrink-0"
              aria-hidden="true"
            />

            {/* Right Column: Description positioned at right */}
            <div className="flex flex-col justify-center max-w-md md:ml-auto">
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Explore the kind of engineering challenges, intelligent automation, and polished user experiences our talent tackles every day.
              </p>
            </div>
          </div>
        </div>
        <NotchedProjectCardsDemo surface="var(--background)" />
      </section>

      {/* Careers Call To Action */}
      <section id="careers-cta-section" className="w-full bg-white dark:bg-zinc-950 transition-colors">
        <CTA
          fullWidth
          title="Ready to build the future with us?"
          description="Join an ambitious engineering and design team pushing the boundaries of software, AI, and digital experiences. Explore our open roles and find your fit today."
          primaryButtonText="Explore Open Positions"
          onPrimaryClick={() => {
            const el = document.getElementById("open-positions");
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            }
          }}
          secondaryButtonText="Learn About Saras"
          onSecondaryClick={() => {
            window.location.hash = "#about";
          }}
        />
      </section>
    </main>

    {/* Global Footer */}
    <SiteFooter />
    </div>
  );
}

export default CareersPage;

