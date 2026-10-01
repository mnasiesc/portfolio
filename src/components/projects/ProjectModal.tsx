"use client";

// ─── ProjectModal — Client Component ─────────────────────────────────────────
// Case study modal with high z-index (above sticky header) and formatted markdown
// text rendering including styled inline code badges and list items.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect } from "react";
import type { Project } from "@/types";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

/**
 * Formats text with inline code badges: parses `code` tokens and wraps them
 * in a themed vintage code badge.
 */
function FormattedInline({ text }: { text: string }) {
  // Split on inline code blocks: `code`
  const parts = text.split(/(`[^`]+`)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          const code = part.slice(1, -1);
          return (
            <code
              key={i}
              className="inline-block font-mono text-[12px] px-1.5 py-0.5 mx-0.5 rounded bg-stone-200/90 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 font-bold shadow-2xs"
            >
              {code}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/**
 * Renders multi-paragraph description with list item and inline code support.
 */
function ProjectDescription({ content }: { content: string }) {
  const blocks = content.split("\n\n");

  return (
    <div className="space-y-4 text-foreground/90 leading-relaxed font-sans text-sm sm:text-base">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();

        // Check if block contains bullet points
        if (trimmed.includes("\n- ") || trimmed.startsWith("- ")) {
          const lines = trimmed.split("\n");
          return (
            <div key={idx} className="space-y-2">
              {lines.map((line, lIdx) => {
                const lineTrimmed = line.trim();
                if (lineTrimmed.startsWith("- ")) {
                  const bulletText = lineTrimmed.slice(2);
                  return (
                    <div key={lIdx} className="flex items-start gap-2.5 pl-1">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-stone-900 dark:bg-stone-100 shrink-0" />
                      <div className="leading-relaxed">
                        <FormattedInline text={bulletText} />
                      </div>
                    </div>
                  );
                }
                return (
                  <p key={lIdx} className="font-semibold text-stone-900 dark:text-stone-100">
                    <FormattedInline text={lineTrimmed} />
                  </p>
                );
              })}
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={idx} className="leading-relaxed">
            <FormattedInline text={trimmed} />
          </p>
        );
      })}
    </div>
  );
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  // ── Escape key handler ───────────────────────────────────────────────────
  useEffect(() => {
    if (!project) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [project, onClose]);

  // ── Body scroll lock ─────────────────────────────────────────────────────
  useEffect(() => {
    if (project) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [project]);

  if (!project) return null;

  return (
    // ── Backdrop container: z-[100] guarantees it renders ABOVE the sticky header ──
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={`Case study: ${project.title}`}
    >
      {/* Dim overlay covering entire viewport */}
      <div
        className="fixed inset-0 bg-stone-950/60 dark:bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Modal Window Panel ── */}
      <div className="relative z-10 w-full max-w-2xl max-h-[85vh] sm:max-h-[88vh] flex flex-col rounded-lg bg-background border-2 border-stone-800/80 dark:border-stone-200/80 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* ── Fixed Modal Header ── */}
        <div className="shrink-0 bg-background border-b border-border px-5 sm:px-8 py-4 sm:py-5 flex items-start justify-between gap-4">
          <div>
            <p className="stamp mb-1 text-[11px] text-muted-foreground">
              {project.tags[0]} · {project.year}
            </p>
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {project.title}
            </h2>
          </div>

          {/* Close button with large tap target */}
          <button
            onClick={onClose}
            className="stamp text-xl leading-none p-2 -mr-2 rounded hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close case study"
          >
            ×
          </button>
        </div>

        {/* ── Scrollable Modal Body ── */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-8 py-6 space-y-6">
          {/* Formatted description with list items & inline code badges */}
          <ProjectDescription content={project.longDescription} />

          {/* Tech stack badges */}
          <div>
            <p className="stamp mb-2.5 text-xs text-muted-foreground">Built With</p>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="stamp text-xs px-2.5 py-1 rounded bg-stone-200/70 dark:bg-stone-800 border border-stone-300/80 dark:border-stone-700/80 text-foreground font-semibold"
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
              className="inline-flex items-center gap-2 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 px-5 py-2.5 text-xs font-mono font-bold tracking-widest uppercase rounded hover:opacity-90 transition-opacity"
            >
              View on GitHub →
            </a>
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-stone-300 dark:border-stone-700 px-5 py-2.5 text-xs font-mono font-bold tracking-widest uppercase rounded hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
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
