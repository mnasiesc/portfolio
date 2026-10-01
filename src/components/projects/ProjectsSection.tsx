"use client";
// ─── ProjectsSection — Client Component ──────────────────────────────────────
// This is the "state manager" for the projects feature.
// It owns one piece of state: which project (if any) is currently selected.
//
// Why is THIS a Client Component but ProjectCard is not?
//   ProjectCard is pure display — it can render on the server.
//   ProjectsSection needs `useState` to track which modal is open.
//   By keeping the state here and passing callbacks down to the cards,
//   we keep ProjectCard simple and testable on its own.
//
// Data flow:
//   config.ts (data) → ProjectsSection (state owner)
//     → ProjectCard (display, calls onSelect)
//     → ProjectModal (display, calls onClose)
//
// Vanilla JS analogy:
//   let selectedProject = null;
//   card.addEventListener('click', () => { selectedProject = project; renderModal(); });
//   modal.closeButton.addEventListener('click', () => { selectedProject = null; });
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import type { Project } from "@/types";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectModal } from "@/components/projects/ProjectModal";

interface ProjectsSectionProps {
  projects: Project[]; // Passed in from page.tsx (which reads from config)
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  // ── State ────────────────────────────────────────────────────────────────
  // `selectedProject` is either a Project object (modal open) or null (closed).
  // useState<Project | null>(null) means: "start with no project selected".
  //
  // When we call setSelectedProject(project), React re-renders this component
  // and ProjectModal receives the new project, making it appear.
  // This replaces: document.querySelector('.modal').classList.add('open')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // ── Callbacks ─────────────────────────────────────────────────────────────
  // useCallback memoizes the function reference so it doesn't get recreated
  // on every render. This is an optimization — not essential but good practice.
  const handleClose = useCallback(() => setSelectedProject(null), []);

  const featuredProjects = projects.filter((p) => p.status === "featured");
  const otherProjects = projects.filter((p) => p.status !== "featured");

  return (
    <section id="projects" className="container-editorial pb-20">

      {/* ── Section header ── */}
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="font-serif text-2xl font-normal">Selected Work</h2>
        <span className="stamp">{projects.length.toString().padStart(2, "0")} Projects</span>
      </div>

      {/* ── Featured project(s) — full width ── */}
      {featuredProjects.length > 0 && (
        <div className="grid grid-cols-1 gap-px bg-border mb-px">
          {featuredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              // Arrow function captures this specific project in scope.
              // When the card calls onSelect(), it runs setSelectedProject(project)
              // here in the parent, causing the modal to open with that project's data.
              onSelect={() => setSelectedProject(project)}
            />
          ))}
        </div>
      )}

      {/* ── Other projects — 2-column grid ── */}
      {otherProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
          {otherProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={() => setSelectedProject(project)}
            />
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {/* ProjectModal reads selectedProject. When null, renders nothing. */}
      {/* When a project is set, it renders the overlay.                 */}
      <ProjectModal
        project={selectedProject}
        onClose={handleClose}
      />

    </section>
  );
}
