"use client";
// ─── ProjectModal — Client Component ─────────────────────────────────────────
// Why "use client" here?
//   This component needs:
//     1. useEffect — to lock body scroll and handle Escape key closes
//     2. Browser APIs — document.body.style, addEventListener
//   Both require the browser runtime, so this must be a Client Component.
//
// The modal receives `project` and `onClose` as props.
// It knows nothing about HOW it gets opened — that's the parent's concern.
// If you want to swap this modal for a slide-in drawer or a full-page
// transition, you replace ONLY this file. Config and card stay untouched.
//
// Vanilla JS analogy:
//   This is the equivalent of a `<div class="modal">` with:
//     modal.classList.add('open')    → state change from parent triggers render
//     document.addEventListener('keydown', e => if e.key === 'Escape' close())
//     modal.addEventListener('click', e => if e.target === overlay close())
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import type { Project } from "@/types";

interface ProjectModalProps {
  project: Project | null; // null = modal is closed
  onClose: () => void;     // called when user dismisses the modal
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  // ── Escape key handler ───────────────────────────────────────────────────
  // useEffect runs AFTER the component renders in the browser.
  // We register the keydown listener, and return a cleanup function that
  // removes it when the component unmounts or the dependency changes.
  //
  // React's useEffect replaces: window.addEventListener + manual cleanup.
  useEffect(() => {
    if (!project) return; // no project = modal closed, no listener needed

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);
    // Cleanup: this runs when the modal closes or the component unmounts
    return () => document.removeEventListener("keydown", handleKey);
  }, [project, onClose]);

  // ── Body scroll lock ─────────────────────────────────────────────────────
  // When the modal is open, prevent the page from scrolling behind it.
  useEffect(() => {
    if (project) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [project]);

  // ── Early return: modal closed ───────────────────────────────────────────
  // In React, returning null renders nothing.
  // This replaces: modal.style.display = 'none' / classList.remove('open')
  if (!project) return null;

  return (
    // ── Backdrop overlay ──────────────────────────────────────────────────
    // Clicking the dark background closes the modal.
    // `animate-in fade-in` comes from tw-animate-css (installed by shadcn).
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={`Case study: ${project.title}`}
    >
      {/* Dim overlay — click to close */}
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Modal panel ── */}
      {/* slide-in-from-bottom on mobile, zoom-in on desktop */}
      <div className="relative z-10 w-full md:max-w-2xl max-h-[90dvh] overflow-y-auto bg-background border border-border shadow-xl animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 md:zoom-in-95 duration-200">

        {/* ── Modal header ── */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-8 py-5 flex items-start justify-between gap-4">
          <div>
            <p className="stamp mb-1">{project.tags[0]} · {project.year}</p>
            <h2 className="font-serif text-2xl font-light leading-tight">
              {project.title}
            </h2>
          </div>
          {/* Close button */}
          <button
            onClick={onClose}
            className="stamp text-lg leading-none mt-1 hover:opacity-50 transition-opacity"
            aria-label="Close case study"
          >
            ×
          </button>
        </div>

        {/* ── Modal body ── */}
        <div className="px-8 py-8 space-y-8">

          {/* Long description */}
          <p className="leading-relaxed text-foreground/90">
            {project.longDescription}
          </p>

          {/* Tech stack */}
          <div>
            <p className="stamp mb-3">Built With</p>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="stamp text-xs px-3 py-1 bg-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Action links */}
          <div className="pt-4 border-t border-border flex flex-wrap gap-3">
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-sm font-medium no-underline hover:opacity-80 transition-opacity stamp"
            >
              View on GitHub →
            </a>
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-border px-5 py-2.5 text-sm font-medium no-underline hover:bg-muted transition-colors stamp"
              >
                Live Demo →
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
