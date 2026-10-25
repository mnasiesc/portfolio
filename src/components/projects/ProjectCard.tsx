// ─── ProjectCard — Server Component ──────────────────────────────────────────
// Renders a single project grid card.
//
// This is a Server Component: it receives data via props and produces HTML.
// It has NO interactivity — clicking the card is handled by the parent
// ProjectsSection, which is a Client Component that owns the modal state.
//
// Why separate card from modal?
//   The card is pure display (can stay server-side, fast).
//   The modal requires state (must be client-side).
//   Keeping them separate means we minimise the client JS bundle.
//
// Props contract: accepts a Project and an onSelect callback.
// onSelect is a function that, when called, tells the parent "open the modal
// for this project". This is the React equivalent of:
//   card.addEventListener('click', () => openModal(projectData))
// ─────────────────────────────────────────────────────────────────────────────

import type { Project } from "@/types";

// ─── Status badge config ──────────────────────────────────────────────────────
// Maps a project status to a human-readable label and Tailwind color classes.
// Centralised here so changing a badge style is one line, not a grep.
const STATUS_CONFIG: Record<Project["status"], string> = {
  featured: "status-featured",
  active: "status-active",
  experimental: "status-experimental",
  archived: "status-archived",
  early: "status-early",
  concept: "status-concept",
  maintenance: "status-maintenance",
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface ProjectCardProps {
  project: Project;
  labels: {
    projectMore: string;
    projectCardAriaPrefix: string;
    projectStatuses: Record<Project["status"], string>;
  };
  // onSelect: a callback passed DOWN from the parent (ProjectsSection).
  // When the user clicks, we call onSelect() and the parent handles
  // which modal to open. The card itself has no idea modals exist.
  onSelect: () => void;
}

export function ProjectCard({ project, onSelect, labels }: ProjectCardProps) {
  const statusClasses = STATUS_CONFIG[project.status];

  return (
    // Each card is a button so keyboard navigation works out of the box.
    // Pressing Tab to focus and Enter/Space to "click" works automatically.
    <button
      onClick={onSelect}
      className="project-instrument group w-full text-left cursor-pointer"
      aria-label={`${labels.projectCardAriaPrefix} ${project.title}`}
    >
      <article className="project-instrument-body">

        {/* ── Card header: tags + status badge ── */}
        <div className="flex items-center justify-between">
          <span className="project-code">{project.tags.slice(0, 2).join(" / ")}</span>
          <span
            className={[
              "project-status",
              statusClasses,
            ].join(" ")}
          >
            {labels.projectStatuses[project.status]}
          </span>
        </div>

        {/* ── Project title: Newsreader serif ── */}
        <h3 className="project-title">
          {project.title}
        </h3>

        {/* ── Short description ── */}
        <p className="project-description">
          {project.description}
        </p>

        {/* ── Tech tags ── */}
        <div className="project-tags">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="project-tag"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* ── CTA footer ── */}
        <div className="project-card-footer">
          <span>{labels.projectMore}</span>
          <span aria-hidden="true">↗</span>
        </div>

      </article>
    </button>
  );
}
