"use client";

import * as React from "react";

export interface FeaturedProject {
  id: string;
  name: string;
  category: string;
  year: string;
  summary: string;
  services: readonly string[];
  outcome: string;
  /** A custom image, illustration, or product preview. */
  visual?: React.ReactNode;
  /** Describes a decorative preview as one image to assistive technology. */
  visualDescription?: string;
  /** A real case-study route; links take priority over the callback. */
  href?: string;
}

export interface FeaturedProjectHeroProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title" | "children" | "onChange"> {
  title?: string;
  description?: string;
  eyebrow?: string;
  projects: readonly FeaturedProject[];
  defaultProjectId?: string;
  activeProjectId?: string;
  onProjectChange?: (project: FeaturedProject, index: number) => void;
  onOpenProject?: (id: string) => void;
  actionLabel?: string;
  showServices?: boolean;
  showOutcome?: boolean;
  showProjectCount?: boolean;
}

const styles = `
.fph {width:100%;min-width:0;container-type:inline-size;font-family:inherit;box-sizing:border-box}
.fph *, .fph *::before, .fph *::after {box-sizing:border-box}
.fph button,.fph a {font:inherit;-webkit-tap-highlight-color:transparent}
.fph button {cursor:pointer}
.fph :focus-visible {outline:2px solid var(--color-ring,currentColor);outline-offset:4px}
.fph__eyebrow {display:flex;align-items:center;gap:14px;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;margin:0 0 14px}
.fph__eyebrow-line {display:inline-block;width:96px;height:2px;background:#c30000;border-radius:2px;flex-shrink:0}
.fph__header {display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:32px 48px;margin-bottom:28px;width:100%}
.fph__left {display:flex;flex-direction:column;align-items:flex-start}
.fph__divider {width:1px;height:76px;background:currentColor;opacity:.18;flex-shrink:0}
.fph__title {margin:0;font-size:clamp(32px,5.2cqw,52px);line-height:1.08;letter-spacing:-.045em;font-weight:750;text-wrap:balance;overflow-wrap:anywhere}
.fph__intro {display:grid;gap:12px;justify-items:start;max-width:440px;margin-left:auto}
.fph__description {margin:0;font-size:14.5px;line-height:1.65;text-wrap:pretty}
.fph__count {display:flex;align-items:center;gap:8px;font-size:10px;letter-spacing:.045em}
.fph__count strong {font-size:11px;font-weight:500;font-variant-numeric:tabular-nums}
.fph__tabs {display:flex;gap:8px;overflow-x:auto;scrollbar-width:thin;border-bottom-width:1px;padding:5px 2px 18px;margin:28px -2px 28px;scroll-padding-inline:2px}
.fph__tab {display:inline-flex;align-items:center;gap:9px;flex:0 0 auto;min-height:44px;padding:8px 14px 8px 9px;border:1px solid transparent;border-radius:12px;background:transparent;font-size:12px;transition:background .2s,color .2s,border-color .2s;white-space:nowrap}
.fph__tab:hover {background:color-mix(in srgb,currentColor 5%,transparent)}
.fph__tab[aria-selected=true] {border-color:inherit}
.fph__tab-number {display:grid;place-items:center;width:25px;height:25px;border-radius:8px;font-size:9px;font-variant-numeric:tabular-nums;transition:background .2s,color .2s}
.fph__panel {display:grid;grid-template-columns:1.22fr 1fr;gap:36px;align-items:center;animation:fph-enter .4s cubic-bezier(.22,1,.36,1) both;min-width:0}
.fph__visual {position:relative;min-width:0;aspect-ratio:1.12;border:1px solid;border-color:inherit;border-radius:22px;overflow:hidden}
.fph__visual-content {height:100%;width:100%}
.fph__placeholder {height:100%;display:grid;place-items:center;padding:25px;font-size:clamp(28px,5cqw,46px);font-weight:550;letter-spacing:-.05em;background:linear-gradient(145deg,color-mix(in srgb,currentColor 5%,transparent),transparent)}
.fph__info {min-width:0;padding:6px 0}
.fph__meta {display:flex;align-items:center;gap:8px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.12em;margin-bottom:17px;flex-wrap:wrap}
.fph__meta-separator {opacity:.4}
.fph__name {margin:0 0 16px;font-size:clamp(30px,4.7cqw,44px);font-weight:550;line-height:1.08;letter-spacing:-.055em;overflow-wrap:anywhere}
.fph__summary {margin:0;max-width:40ch;font-size:14px;line-height:1.7;text-wrap:pretty;overflow-wrap:anywhere}
.fph__services {display:flex;flex-wrap:wrap;gap:6px;margin:20px 0 0;padding:0;list-style:none}
.fph__service {border:1px solid;border-color:inherit;border-radius:7px;padding:5px 8px;font-size:10px;line-height:1.4}
.fph__outcome {margin:23px 0 0;border-top-width:1px;padding-top:18px}
.fph__outcome-label {display:block;margin-bottom:6px;font-size:9px;letter-spacing:.13em;text-transform:uppercase}
.fph__outcome p {margin:0;max-width:38ch;font-size:12px;line-height:1.65}
.fph__action {display:inline-flex;align-items:center;justify-content:space-between;gap:26px;min-height:44px;margin-top:24px;padding:12px 16px;border:0;border-radius:11px;text-decoration:none;font-size:12px;font-weight:500;line-height:1.5;transition:opacity .2s,transform .2s}
.fph__action:hover {opacity:.87}
.fph__action svg {transition:transform .2s;flex-shrink:0}
.fph__action:hover svg {transform:translate(2px,-2px)}
.fph__action:active {transform:translateY(1px)}
.fph__empty {display:grid;justify-items:center;text-align:center;gap:7px;min-height:260px;align-content:center;border:1px dashed;border-color:inherit;border-radius:22px;margin-top:28px;padding:28px}
.fph__empty strong {font-size:17px;font-weight:550;letter-spacing:-.025em}
.fph__empty p {margin:0;font-size:12px;line-height:1.7}
@keyframes fph-enter {from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@container (max-width:768px) {.fph__panel{grid-template-columns:1fr;gap:25px}.fph__visual{aspect-ratio:1.25}.fph__info{padding:0}.fph__header{grid-template-columns:1fr;gap:16px}.fph__divider{display:none}.fph__intro{gap:12px;margin-left:0;max-width:100%}.fph__description{max-width:48ch}.fph__name{font-size:36px}.fph__title{max-width:20ch}.fph__tabs{margin-top:22px}}
@container (max-width:370px) {.fph__title{font-size:32px}.fph__tab{padding-right:11px;gap:7px}.fph__tabs{gap:2px}.fph__visual{aspect-ratio:1.1}.fph__name{font-size:32px}}
@media (prefers-reduced-motion:reduce) {.fph *, .fph *::before, .fph *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;

function Arrow() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" /></svg>;
}

/** A portfolio hero with accessible project tabs and consumer-owned case-study actions. */
export function FeaturedProjectHero({
  title = "Selected work", description, eyebrow = "Featured projects", projects = [],
  defaultProjectId, activeProjectId, onProjectChange, onOpenProject,
  actionLabel = "Explore case study", showServices = true, showOutcome = true,
  showProjectCount = true, className = "", ...rest
}: FeaturedProjectHeroProps) {
  const uid = React.useId();
  const tabs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const [selectedId, setSelectedId] = React.useState(defaultProjectId ?? projects[0]?.id ?? "");
  const selectedIndex = Math.max(0, projects.findIndex(project => project.id === (activeProjectId ?? selectedId)));
  const project = projects[selectedIndex];
  const panelId = `${uid}-panel`;

  const select = (index: number) => {
    const next = projects[index];
    if (!next || next.id === project?.id) return;
    if (activeProjectId === undefined) setSelectedId(next.id);
    onProjectChange?.(next, index);
  };

  return (
    <section {...rest} className={`fph text-foreground ${className}`} aria-labelledby={`${uid}-title`}>
      <style>{styles}</style>
      <header className="fph__header">
        <div className="fph__left">
          {eyebrow && (
            <div className="fph__eyebrow text-foreground">
              <span>{eyebrow}</span>
              <span className="fph__eyebrow-line" aria-hidden="true" />
            </div>
          )}
          <h2 id={`${uid}-title`} className="fph__title text-foreground">
            {typeof title === "string" ? (
              title.split("\n").map((line, idx, arr) => (
                <React.Fragment key={idx}>
                  {line}
                  {idx < arr.length - 1 && <br />}
                </React.Fragment>
              ))
            ) : (
              title
            )}
          </h2>
        </div>
        <div className="fph__divider" aria-hidden="true" />
        <div className="fph__intro">
          {description && <p className="fph__description text-muted-foreground">{description}</p>}
          {showProjectCount && (
            <span className="fph__count text-muted-foreground">
              Selected work <span aria-hidden="true">/</span>
              <strong className="text-foreground">
                {String(projects.length).padStart(2, "0")} {projects.length === 1 ? "project" : "projects"}
              </strong>
            </span>
          )}
        </div>
      </header>
      {project ? <>
        <div className="fph__tabs border-border" role="tablist" aria-label="Featured projects" aria-orientation="horizontal">
          {projects.map((item, index) => <button key={item.id} ref={node => { tabs.current[index] = node; }} type="button" role="tab"
            id={`${uid}-tab-${index}`} aria-controls={panelId} aria-selected={index === selectedIndex} tabIndex={index === selectedIndex ? 0 : -1}
            className={`fph__tab border-border ${index === selectedIndex ? "bg-muted/50 text-foreground" : "text-muted-foreground"}`}
            onClick={() => select(index)}
            onKeyDown={event => {
              if (event.altKey || event.ctrlKey || event.metaKey || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
              event.preventDefault();
              const next = event.key === "Home" ? 0 : event.key === "End" ? projects.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + projects.length) % projects.length;
              select(next);
              tabs.current[next]?.focus();
            }}>
            <span className={`fph__tab-number ${index === selectedIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{item.name}
          </button>)}
        </div>
        <article key={project.id} className="fph__panel" id={panelId} role="tabpanel" aria-labelledby={`${uid}-tab-${selectedIndex}`} tabIndex={0}>
          <div className="fph__visual border-border bg-muted/40" role={project.visualDescription ? "img" : undefined} aria-label={project.visualDescription}>
            <div className="fph__visual-content" aria-hidden={project.visualDescription ? true : undefined}>
              {project.visual ?? <div className="fph__placeholder text-muted-foreground">{project.name}</div>}
            </div>
          </div>
          <div className="fph__info">
            <div className="fph__meta text-muted-foreground"><span>{project.category}</span><span className="fph__meta-separator" aria-hidden="true">/</span><span>{project.year}</span></div>
            <h3 className="fph__name">{project.name}</h3>
            <p className="fph__summary text-muted-foreground">{project.summary}</p>
            {showServices && project.services.length > 0 && <ul className="fph__services border-border" aria-label="Project services">{project.services.map((service, index) => <li key={`${service}-${index}`} className="fph__service border-border bg-card text-muted-foreground">{service}</li>)}</ul>}
            {showOutcome && project.outcome && <div className="fph__outcome border-border"><span className="fph__outcome-label text-muted-foreground">The difference</span><p>{project.outcome}</p></div>}
            {project.href ? <a className="fph__action bg-primary text-primary-foreground" href={project.href}>{actionLabel}<Arrow /></a> : onOpenProject ? <button type="button" className="fph__action bg-primary text-primary-foreground" onClick={() => onOpenProject(project.id)}>{actionLabel}<Arrow /></button> : null}
          </div>
        </article>
      </> : <div className="fph__empty border-border bg-muted/20 text-muted-foreground" role="status"><strong className="text-foreground">No projects yet</strong><p>Add a project to start your selected-work collection.</p></div>}
    </section>
  );
}

export default FeaturedProjectHero;

