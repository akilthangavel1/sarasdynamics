"use client";

import * as React from "react";
import FeaturedProjectHero, { type FeaturedProject } from "@/components/ui/featured-project-hero";
import { cn } from "@/lib/utils";

const settings = {
  eyebrow: "FEATURED WORK",
  title: "Apps Built for\nReal Users",
  description:
    "We handle the design, the code and the launch so you can focus on your users.",
  projectCount: 3,
  showServices: true,
  showOutcome: true,
  showProjectCount: false,
};

const demoStyles = `
.fph-demo {width:100%;max-width:1100px;margin:0 auto;box-sizing:border-box;font-family:inherit}
.fph-demo *, .fph-demo__dialog * {box-sizing:border-box}
.fph-demo__note {margin:24px 0 0;padding-top:16px;border-top-width:1px;font-size:10px;line-height:1.7}
.fph-demo__visual {position:relative;display:flex;flex-direction:column;justify-content:center;width:100%;height:100%;padding:clamp(20px,3cqw,30px);overflow:hidden;background:linear-gradient(145deg,color-mix(in srgb,currentColor 4%,transparent),transparent 75%)}
.fph-demo__visual::before {content:"";position:absolute;width:220px;height:220px;border:1px solid currentColor;border-radius:50%;opacity:.04;left:-90px;top:-110px;pointer-events:none}
.fph-demo__visual-label {display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:18px;font-size:9px;letter-spacing:.08em;text-transform:uppercase}
.fph-demo__visual-label strong {font-size:11px;font-weight:600;letter-spacing:-.025em;text-transform:none}
.fph-demo__window {position:relative;min-width:0;width:100%;border:1px solid;border-color:inherit;border-radius:12px;overflow:hidden;box-shadow:0 16px 32px -20px color-mix(in srgb,currentColor 20%,transparent);transform:rotate(-2deg)}
.fph-demo__window-head {display:flex;align-items:center;gap:4px;height:29px;padding:0 11px;border-bottom-width:1px}
.fph-demo__dot {width:4px;height:4px;border-radius:50%;background:currentColor;opacity:.25}
.fph-demo__window-head span:last-child {margin-left:auto;font-size:7px;letter-spacing:.015em}
.fph-demo__product {display:grid;grid-template-columns:68px 1fr;min-height:198px}
.fph-demo__sidebar {border-right-width:1px;padding:13px 9px;font-size:7px;line-height:1.4}
.fph-demo__brand {display:block;margin-bottom:17px;font-size:9px;font-weight:650;letter-spacing:-.025em}
.fph-demo__nav {display:block;margin-top:8px;padding:5px 4px;border-radius:4px;white-space:nowrap}
.fph-demo__screen {min-width:0;padding:14px 12px}
.fph-demo__screen-title {display:block;font-size:11px;font-weight:550;letter-spacing:-.025em}
.fph-demo__screen-sub {display:block;margin-top:4px;font-size:7px;line-height:1.5}
.fph-demo__metric {margin-top:16px;padding:10px;border:1px solid;border-color:inherit;border-radius:7px}
.fph-demo__metric-head {display:flex;align-items:center;justify-content:space-between;font-size:7px}
.fph-demo__bars {display:flex;align-items:end;gap:5px;height:56px;margin-top:10px}
.fph-demo__bar {flex:1;min-width:0;border-radius:3px 3px 1px 1px}
.fph-demo__release {display:flex;align-items:center;justify-content:space-between;gap:5px;margin-top:11px;padding-top:9px;border-top-width:1px;font-size:7px}
.fph-demo__status {display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
.fph-demo__status::before {content:"";width:3px;height:3px;background:currentColor;border-radius:50%}
.fph-demo__folio {padding:18px;min-height:224px}
.fph-demo__folio-top {display:flex;justify-content:space-between;align-items:center;font-size:7px}
.fph-demo__folio-title {margin:19px 0 12px;font-size:23px;font-weight:500;line-height:1.03;letter-spacing:-.06em;max-width:9ch}
.fph-demo__gallery {display:grid;grid-template-columns:1fr 1fr;gap:8px}
.fph-demo__art {height:65px;border-radius:5px;overflow:hidden;position:relative;background:color-mix(in srgb,currentColor 8%,transparent)}
.fph-demo__art:first-child::before {content:"";position:absolute;inset:16px 22px;border-radius:50%;border:10px solid currentColor;opacity:.65;transform:rotate(-30deg)}
.fph-demo__art:last-child::before {content:"";position:absolute;inset:12px 23px;background:currentColor;opacity:.2;transform:rotate(-25deg);border-radius:2px}
.fph-demo__art-label {display:flex;justify-content:space-between;margin-top:6px;font-size:6px}
.fph-demo__relay {padding:17px 12px;min-height:224px}
.fph-demo__board {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:17px}
.fph-demo__column-label {font-size:6px;display:flex;justify-content:space-between;padding:0 2px 7px;white-space:nowrap}
.fph-demo__task {min-height:45px;margin-bottom:6px;border:1px solid;border-color:inherit;border-radius:5px;padding:7px 6px}
.fph-demo__task-label {display:block;font-size:6px;line-height:1.45}
.fph-demo__task-line {height:2px;width:70%;background:currentColor;opacity:.12;border-radius:2px;margin-top:8px}
.fph-demo__task-dot {display:block;width:7px;height:7px;border-radius:50%;margin-top:7px;background:currentColor;opacity:.22}
.fph-demo__visual-footer {display:flex;align-items:center;justify-content:space-between;margin-top:19px;font-size:7px;letter-spacing:.06em;text-transform:uppercase}
.fph-demo__dialog {width:min(660px,calc(100vw - 32px));max-height:calc(100dvh - 40px);margin:auto;padding:0;border:1px solid;border-color:var(--color-border,currentColor);border-radius:22px;overflow:auto;font-family:inherit;box-shadow:0 24px 80px #0003}
.fph-demo__dialog::backdrop {background:#0008}
.fph-demo__dialog-body {padding:clamp(24px,6vw,42px)}
.fph-demo__dialog-top {display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:25px;font-size:10px;letter-spacing:.08em;text-transform:uppercase}
.fph-demo__close {display:grid;place-items:center;width:36px;height:36px;border:1px solid;border-color:inherit;border-radius:50%;background:transparent;color:inherit;cursor:pointer}
.fph-demo__close:focus-visible {outline:2px solid var(--color-ring,currentColor);outline-offset:3px}
.fph-demo__dialog h2 {margin:0 0 13px;font-size:34px;font-weight:550;letter-spacing:-.05em;line-height:1.1}
.fph-demo__dialog-summary {margin:0;font-size:14px;line-height:1.8}
.fph-demo__case-section {margin-top:27px;padding-top:22px;border-top-width:1px}
.fph-demo__case-section h3 {margin:0 0 8px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;font-weight:550}
.fph-demo__case-section p {margin:0;font-size:13px;line-height:1.8}
@media (prefers-reduced-motion:reduce) {.fph-demo__window{transform:none}}
`;

function ProductPreview({ kind, name }: { kind: "lms" | "voice" | "pdf"; name: string }) {
  return (
    <div className="fph-demo__visual bg-muted/40 text-foreground">
      <div className="fph-demo__visual-label text-muted-foreground">
        <strong className="text-foreground">{name}</strong>
        <span>Platform / 0{kind === "lms" ? 1 : kind === "voice" ? 2 : 3}</span>
      </div>
      <div className="fph-demo__window border-border bg-card text-card-foreground">
        <div className="fph-demo__window-head border-border">
          <i className="fph-demo__dot" />
          <i className="fph-demo__dot" />
          <i className="fph-demo__dot" />
          <span className="text-muted-foreground">{name.toLowerCase()} — live product</span>
        </div>
        {kind === "lms" ? (
          <div className="fph-demo__product">
            <div className="fph-demo__sidebar border-border text-muted-foreground">
              <span className="fph-demo__brand text-foreground">s / skillpath</span>
              <span className="fph-demo__nav bg-muted text-foreground">Curriculum</span>
              <span className="fph-demo__nav">Learners</span>
              <span className="fph-demo__nav">SCORM Tests</span>
              <span className="fph-demo__nav">Certificates</span>
            </div>
            <div className="fph-demo__screen">
              <strong className="fph-demo__screen-title">AI & Engineering Curriculum</strong>
              <span className="fph-demo__screen-sub text-muted-foreground">Module 04: SCORM / xAPI Auto-Graded</span>
              <div className="fph-demo__metric border-border">
                <div className="fph-demo__metric-head text-muted-foreground">
                  <span>Completion Rate</span>
                  <span>96.4% avg</span>
                </div>
                <div className="fph-demo__bars">
                  {[45, 62, 58, 80, 72, 88, 91, 98].map((height, index) => (
                    <span
                      key={index}
                      className="fph-demo__bar bg-primary"
                      style={{ height: `${height}%`, opacity: index === 7 ? 0.95 : 0.2 + index * 0.08 }}
                    />
                  ))}
                </div>
              </div>
              <div className="fph-demo__release border-border text-muted-foreground">
                <span>Accreditation / SSO</span>
                <span className="fph-demo__status text-foreground">Active</span>
              </div>
            </div>
          </div>
        ) : kind === "voice" ? (
          <div className="fph-demo__screen p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <strong className="text-xs font-semibold">Callwise Telephony Gateway</strong>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">SIP: 200 OK</span>
            </div>
            <div className="my-4 p-3 rounded-lg bg-muted/40 border border-border">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Caller: +1 (555) 019-2834</span>
                <span className="font-mono text-emerald-500">Latency: 380ms</span>
              </div>
              <p className="mt-2 text-xs font-medium text-foreground">
                &ldquo;Thanks for calling Saras. I can book your technical discovery sprint right away.&rdquo;
              </p>
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border">
              <span>Streaming STT &rarr; LLM &rarr; TTS</span>
              <span className="text-foreground font-semibold">CRM Synced</span>
            </div>
          </div>
        ) : (
          <div className="fph-demo__screen p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <strong className="text-xs font-semibold">ClearPDF Document Engine</strong>
              <span className="text-[10px] font-mono text-emerald-500">Cleaned in 0.8s</span>
            </div>
            <div className="my-4 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-border bg-muted/30 text-center">
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground block mb-1">Before</span>
                <span className="text-xs line-through text-red-400 font-mono">WATERMARK</span>
                <span className="text-[10px] text-muted-foreground block mt-1">Obscured Layout</span>
              </div>
              <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-center">
                <span className="text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">After</span>
                <span className="text-xs font-bold text-foreground font-mono">Clean Vector</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-1">100% Quality</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border">
              <span>Client-Side Isolation</span>
              <span className="text-foreground font-semibold">Ready to Download</span>
            </div>
          </div>
        )}
      </div>
      <div className="fph-demo__visual-footer text-muted-foreground">
        <span>Engineered by Saras Dynamics</span>
        <span>↗ 2026</span>
      </div>
    </div>
  );
}

const projects: readonly FeaturedProject[] = [
  {
    id: "lms",
    name: "SkillPath",
    tabLabel: "SkillPath",
    category: "LMS & E-LEARNING",
    year: "2026",
    summary:
      "A SCORM-compliant learning platform that makes it easy to build courses, assign training and measure results.",
    services: ["SCORM / xAPI", "AI Auto-Grading", "SSO"],
    outcome: "One platform, from first lesson to final certificate.",
    actionLabel: "Explore the LMS",
    href: "#lms",
    visual: <ProductPreview kind="lms" name="SkillPath" />,
    visualDescription:
      "SkillPath concept: enterprise learning platform with course management, SCORM compliance and auto-grading.",
  },
  {
    id: "voice",
    name: "Callwise",
    tabLabel: "Callwise",
    category: "VOICE AI",
    year: "2026",
    summary:
      "A real-time voice agent that answers calls, books appointments and updates your CRM, with natural conversation and no awkward pauses.",
    services: ["Streaming STT/TTS", "SIP Trunking", "CRM Sync"],
    outcome: "Every call answered, every lead followed up.",
    actionLabel: "Hear the agent",
    href: "#voice-agent",
    visual: <ProductPreview kind="voice" name="Callwise" />,
    visualDescription:
      "Callwise concept: real-time telephony agent with sub-second latency and live CRM synchronization.",
  },
  {
    id: "pdf",
    name: "ClearPDF",
    tabLabel: "ClearPDF",
    category: "PDF TOOLS",
    year: "2026",
    summary:
      "A fast online tool that removes watermarks from your own PDF documents in seconds, keeping the layout, text and quality intact.",
    services: ["PDF Processing", "Batch Upload", "Secure Files"],
    outcome: "Upload, clean, download. No software to install.",
    actionLabel: "Try the tool",
    href: "#contact",
    visual: <ProductPreview kind="pdf" name="ClearPDF" />,
    visualDescription:
      "ClearPDF concept: fast PDF watermark removal utility with instant document preview and export.",
  },
];

const caseNotes: Record<string, { challenge: string; approach: string }> = {
  lms: {
    challenge:
      "Legacy enterprise learning platforms were rigid, difficult to author in, and lacked modern automated grading or clean SSO integrations.",
    approach:
      "Architected a SCORM and xAPI-compliant LMS with a modular authoring canvas, AI-driven assessment grading, and turnkey enterprise SSO authentication.",
  },
  voice: {
    challenge:
      "High inbound call volumes caused missed opportunities, long caller wait queues, and manual, error-prone CRM record keeping.",
    approach:
      "Engineered an ultra-low latency voice pipeline running streaming speech recognition and neural TTS over WebRTC/SIP, executing live CRM lookups and booking calendar invites mid-sentence.",
  },
  pdf: {
    challenge:
      "Stripping intrusive watermarks from personal and business PDFs typically corrupted document vectors, stripped fonts, or required unsafe software downloads.",
    approach:
      "Built a secure, client-accelerated PDF processing pipeline that isolates and eliminates background watermark layers while preserving text formatting, vector sharpness, and document resolution.",
  },
};

export interface FeaturedProjectHeroDemoProps {
  className?: string;
  title?: string;
  description?: string;
  eyebrow?: string;
  projectCount?: number;
  showServices?: boolean;
  showOutcome?: boolean;
  showProjectCount?: boolean;
}

export default function FeaturedProjectHeroDemo({
  className = "",
  ...props
}: FeaturedProjectHeroDemoProps) {
  const config = { ...settings, ...props };
  const visibleProjects = projects.slice(0, Math.max(0, Math.min(projects.length, Math.round(config.projectCount))));
  const [openProjectId, setOpenProjectId] = React.useState<string | null>(null);
  const dialog = React.useRef<HTMLDialogElement>(null);
  const openProject = projects.find((project) => project.id === openProjectId);

  React.useEffect(() => {
    if (openProject && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [openProject]);

  return (
    <div className={cn("w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-border/80 bg-background text-foreground", className)}>
      <style>{demoStyles}</style>
      <div className="fph-demo">
        <FeaturedProjectHero
          title={config.title}
          description={config.description}
          eyebrow={config.eyebrow}
          projects={visibleProjects}
          showServices={config.showServices}
          showOutcome={config.showOutcome}
          showProjectCount={config.showProjectCount}
          onOpenProject={setOpenProjectId}
        />
        <p className="fph-demo__note border-border text-muted-foreground">
          Selected platforms and specialized product builds developed by Saras Dynamics.
        </p>
      </div>

      {openProject && (
        <dialog
          ref={dialog}
          className="fph-demo__dialog bg-card text-card-foreground"
          aria-labelledby="fph-case-title"
          aria-describedby="fph-case-summary"
          onClose={() => setOpenProjectId(null)}
          onClick={(event) => {
            if (event.target !== event.currentTarget) return;
            const bounds = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < bounds.left ||
              event.clientX > bounds.right ||
              event.clientY < bounds.top ||
              event.clientY > bounds.bottom
            )
              event.currentTarget.close();
          }}
        >
          <div className="fph-demo__dialog-body">
            <div className="fph-demo__dialog-top text-muted-foreground">
              <span>Concept case study / {openProject.year}</span>
              <button
                type="button"
                className="fph-demo__close border-border"
                aria-label="Close case study"
                onClick={() => dialog.current?.close()}
                autoFocus
              >
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                  <path d="m5 5 10 10M15 5 5 15" />
                </svg>
              </button>
            </div>
            <h2 id="fph-case-title">{openProject.name}</h2>
            <p id="fph-case-summary" className="fph-demo__dialog-summary text-muted-foreground">
              {openProject.summary}
            </p>
            <div className="fph-demo__case-section border-border">
              <h3>The challenge</h3>
              <p className="text-muted-foreground">{caseNotes[openProject.id]!.challenge}</p>
            </div>
            <div className="fph-demo__case-section border-border">
              <h3>The approach</h3>
              <p className="text-muted-foreground">{caseNotes[openProject.id]!.approach}</p>
            </div>
            <div className="fph-demo__case-section border-border">
              <h3>The direction</h3>
              <p>{openProject.outcome}</p>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}

export { FeaturedProjectHeroDemo };

