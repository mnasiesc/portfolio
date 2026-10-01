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
const STATUS_CONFIG: Record<Project["status"], { label: string; classes: string }> = {
  featured:     { label: "Featured",     classes: "bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-bold px-2 py-0.5" },
  active:       { label: "Active",       classes: "bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium px-2 py-0.5" },
  experimental: { label: "Experimental", classes: "bg-stone-200/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 px-2 py-0.5" },
  archived:     { label: "Archived",     classes: "bg-stone-200/50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 px-2 py-0.5" },
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface ProjectCardProps {
  project: Project;
  // onSelect: a callback passed DOWN from the parent (ProjectsSection).
  // When the user clicks, we call onSelect() and the parent handles
  // which modal to open. The card itself has no idea modals exist.
  onSelect: () => void;
}

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const status = STATUS_CONFIG[project.status];

  return (
    // Each card is a button so keyboard navigation works out of the box.
    // Pressing Tab to focus and Enter/Space to "click" works automatically.
    <button
      onClick={onSelect}
      className="group w-full text-left bg-background border-0 p-0 cursor-pointer"
      aria-label={`View case study: ${project.title}`}
    >
      <article className="flex flex-col gap-4 p-8 h-full transition-colors duration-200 group-hover:bg-muted/40">

        {/* ── Card header: stamp + status badge ── */}
        <div className="flex items-center justify-between">
          <span className="stamp">{project.tags[0]} · {project.year}</span>
          <span
            className={[
              "stamp text-[10px] px-2 py-0.5",
              status.classes,
            ].join(" ")}
          >
            {status.label}
          </span>
        </div>

        {/* ── Project title: Newsreader serif ── */}
        <h3 className="font-serif text-xl font-normal leading-snug group-hover:opacity-70 transition-opacity duration-200">
          {project.title}
        </h3>

        {/* ── Short description ── */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {project.description}
        </p>

        {/* ── Tech tags ── */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="stamp text-[10px] px-2 py-0.5 bg-muted/60"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* ── CTA footer ── */}
        <div className="pt-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <span className="stamp">Case Study</span>
          <span className="group-hover:translate-x-1 transition-transform duration-200">
            →
          </span>
        </div>

      </article>
    </button>
  );
}
