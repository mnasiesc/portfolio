"use client";

// ─── ProjectModal — Client Component ─────────────────────────────────────────
// Case study modal with high z-index (above sticky header) and formatted markdown
// text rendering including styled inline code badges and list items.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import type { Project } from "@/types";

interface ModalImageRecord {
  id: string;
  mimeType: string;
  generatedFile: string;
  width: number;
  height: number;
  alt: string;
}

interface ProjectModalProps {
  project: Project | null;
  images?: ModalImageRecord[];
  onClose: () => void;
  labels: {
    projectModalClose: string;
    projectModalTitle: string;
    builtWith: string;
    viewOnGitHub: string;
    liveDemo: string;
  };
}

function resolveProjectMedia(project: Project, images?: ModalImageRecord[]) {
  const pow = project.proofOfWork;
  const directImageId = pow?.imageId || project.image;
  const imageMatch = directImageId ? images?.find((img) => img.id === directImageId) : undefined;

  // If pow.url is provided, use it; otherwise use local uploaded asset file
  const rawUrl = (pow?.url && pow.url.trim()) ? pow.url.trim() : (imageMatch?.generatedFile || "");
  if (!rawUrl) return null;

  const mimeType = imageMatch?.mimeType;
  const explicitType = pow?.mediaType || "auto";

  let isEmbed = false;
  let embedUrl = "";
  let badgeLabel = "CAPTURE // MEDIA";

  // Asciinema recording (e.g. https://asciinema.org/a/Wc2xprecUM1YnUK0)
  const asciinemaMatch = rawUrl.match(/asciinema\.org\/a\/([a-zA-Z0-9_\-]+)/);
  if (asciinemaMatch) {
    isEmbed = true;
    embedUrl = `https://asciinema.org/a/${asciinemaMatch[1]}/iframe`;
    badgeLabel = "TERMINAL // ASCIINEMA";
  }

  // YouTube recording (e.g. https://youtube.com/watch?v=... or https://youtu.be/...)
  const youtubeMatch = rawUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_\-]+)/);
  if (!isEmbed && youtubeMatch) {
    isEmbed = true;
    embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeMatch[1]}`;
    badgeLabel = "STREAM // YOUTUBE";
  }

  // Vimeo recording
  const vimeoMatch = rawUrl.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (!isEmbed && vimeoMatch) {
    isEmbed = true;
    embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    badgeLabel = "STREAM // VIMEO";
  }

  const cleanUrl = rawUrl.split("?")[0].toLowerCase();
  const isVideo = !isEmbed && (explicitType === "video" ||
    (explicitType !== "image" && (
      Boolean(mimeType?.startsWith("video/")) ||
      cleanUrl.endsWith(".mp4") ||
      cleanUrl.endsWith(".webm") ||
      cleanUrl.endsWith(".ogg") ||
      cleanUrl.endsWith(".ogv") ||
      cleanUrl.endsWith(".mov")
    )));

  if (isVideo) badgeLabel = "STREAM // VIDEO";
  else if (!isEmbed && (cleanUrl.endsWith(".gif") || mimeType === "image/gif")) badgeLabel = "ANIMATION // GIF";

  const width = pow?.width || imageMatch?.width || 720;
  const height = pow?.height || imageMatch?.height || 405;
  const caption = pow?.caption;
  const alt = pow?.alt || imageMatch?.alt || `${project.title} proof of work`;

  return {
    url: isEmbed ? embedUrl : rawUrl,
    isEmbed,
    isVideo,
    badgeLabel,
    width,
    height,
    caption,
    alt,
  };
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
              className="project-code-token"
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

export function ProjectModal({ project, images, onClose, labels }: ProjectModalProps) {
  const media = project ? resolveProjectMedia(project, images) : null;
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

  if (!project || typeof document === "undefined") return null;

  // Render directly onto document.body using createPortal so it escapes all parent
  // stacking contexts, sections, and containers, guaranteeing it sits above the sticky header.
  return createPortal(
    <div
      className="project-modal-backdrop fixed inset-0 flex items-center justify-center p-3 sm:p-6"
      style={{ zIndex: 99999 }}
      role="dialog"
      aria-modal="true"
      aria-label={`${labels.projectModalTitle}: ${project.title}`}
    >
      {/* Dim overlay covering entire viewport and sticky header */}
      <div
        className="project-modal-scrim fixed inset-0"
        style={{ zIndex: 99999 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Modal Window Panel ── */}
      <div
        className="project-modal-window relative w-full max-w-2xl max-h-[82vh] sm:max-h-[85vh] flex flex-col overflow-hidden my-auto"
        style={{ zIndex: 100000 }}
      >
        {/* ── Fixed Modal Header ── */}
        <div className="project-modal-header shrink-0 flex items-start justify-between gap-4">
          <div>
            <p className="project-modal-kicker">
              {project.tags.slice(0, 2).join(" · ")}
            </p>
            <h2 className="project-modal-title">
              {project.title}
            </h2>
          </div>

          {/* Close button with large tap target */}
          <button
            onClick={onClose}
            className="project-modal-close"
            aria-label={labels.projectModalClose}
          >
            ×
          </button>
        </div>

        {/* ── Scrollable Modal Body (scrollbar visually hidden, scrolling preserved) ── */}
        <div className="project-modal-content overflow-y-auto flex-1 no-scrollbar">
          {/* Formatted description with list items & inline code badges */}
          <ProjectDescription content={project.longDescription} />

          {/* ── Proof of Work Media Attachment (Image, Video, GIF) ── */}
          {media && (
            <div className="project-proof-of-work my-4 border border-station-panel-border/80 rounded bg-stone-950/70 p-2.5 sm:p-3 overflow-hidden">
              <div className="proof-header flex items-center justify-between pb-2 mb-2.5 border-b border-station-panel-border text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-accent font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block animate-pulse" />
                  PROOF OF WORK // ARTIFACT
                </span>
                <span>{media.badgeLabel}</span>
              </div>

              <div
                className="proof-media-frame relative w-full overflow-hidden rounded bg-black/60 border border-station-panel-border/90 flex items-center justify-center mx-auto"
                style={{
                  aspectRatio: `${media.width} / ${media.height}`,
                  maxHeight: `${Math.min(media.height, 460)}px`,
                }}
              >
                {media.isEmbed ? (
                  <iframe
                    src={media.url}
                    title={media.alt}
                    className="w-full h-full border-0 block"
                    style={{
                      width: "100%",
                      height: "100%",
                      border: 0,
                    }}
                    allow="autoplay; fullscreen; clipboard-read; clipboard-write"
                    loading="lazy"
                  />
                ) : media.isVideo ? (
                  <video
                    src={media.url}
                    controls
                    playsInline
                    autoPlay
                    muted
                    loop
                    className="w-full h-full object-cover object-center block"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center",
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={media.url}
                    alt={media.alt}
                    className="w-full h-full object-cover object-center block"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center",
                    }}
                    loading="lazy"
                  />
                )}
              </div>

              {media.caption && (
                <p className="mt-2 text-xs font-mono text-muted-foreground text-center">
                  {media.caption}
                </p>
              )}
            </div>
          )}

          {/* Tech stack badges */}
          <div>
            <p className="stamp mb-2.5 text-xs text-muted-foreground">{labels.builtWith}</p>
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
          <div className="project-modal-actions flex flex-wrap gap-3">
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="station-button station-button-primary"
            >
              {labels.viewOnGitHub}
            </a>
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="station-button"
              >
                {labels.liveDemo}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
