// ─── Home Page — React Server Component ──────────────────────────────────────
// No "use client" — this runs on the server and outputs static HTML.
// Interactive pieces (ProjectsSection modal) are Client Components imported
// inside it. Next.js handles the boundary automatically.
//
// Data flow:
//   siteConfig (config.ts) → this page → ProjectsSection (as props)
// The page acts like a thin "data fetcher + assembler". It reads from config
// and passes the right data down to each section component.
// ─────────────────────────────────────────────────────────────────────────────

import Image from "next/image";
import { getAllArticles, getImage, portfolio, projects, socials } from "@/lib/portfolio";
import { ProjectsSection } from "@/components/projects/ProjectsSection";
import { WritingsSection } from "@/components/writing/WritingsSection";
import { ContactSection } from "@/components/contact/ContactSection";

export default async function HomePage() {
  const articles = getAllArticles();

  return (
    <div className="flex flex-col flex-1">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="border-b border-border py-12 md:py-16">
        <div className="container-editorial">
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-500 animate-pulse" />
            <span>{portfolio.home.availability}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8 md:gap-10">
            {/* ── Signature Image: Ernst Haeckel Plate 92 Filicinae (Left side, bigger, sharp edges, no border) ── */}
            <div className="shrink-0">
              <Image
                src={getImage(portfolio.home.avatarImage).generatedFile}
                alt={getImage(portfolio.home.avatarImage).alt}
                width={getImage(portfolio.home.avatarImage).width}
                height={getImage(portfolio.home.avatarImage).height}
                sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 176px"
                preload
                className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 object-cover object-top shadow-lg"
              />
            </div>

            <div>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.12]">
                {portfolio.home.heroTitle}
              </h1>

              <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed font-sans">
                {portfolio.home.heroDescription}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-xs font-bold uppercase tracking-wider">
            <a
              href={portfolio.home.actions[0].href}
              className="px-5 py-2.5 rounded bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              {portfolio.home.actions[0].label}
            </a>
            <a
              href={portfolio.home.actions[1].href}
              className="px-5 py-2.5 rounded border border-border text-foreground hover:bg-muted transition-colors"
            >
              {portfolio.home.actions[1].label}
            </a>
          </div>
        </div>
      </section>

      {/* ── EDITORIAL RULE ────────────────────────────────────────────────── */}
      <div className="container-editorial">
        <hr className="rule-editorial" />
      </div>

      {/* ── PROJECTS ──────────────────────────────────────────────────────── */}
      {/*
        We pass siteConfig.projects DOWN as props.
        This is the "data in, UI out" React pattern.
        ProjectsSection handles rendering + modal state internally.
        If you want to later load projects from an API or CMS instead,
        you only change THIS line — not any component.
      */}
      <ProjectsSection projects={projects} labels={{ ...portfolio.home, ...portfolio.writing }} />

      {/* ── WRITINGS / ARTICLES ───────────────────────────────────────────── */}
      <div className="container-editorial">
        <WritingsSection articles={articles} labels={{ ...portfolio.home, ...portfolio.writing }} />
      </div>

      {/* ── EDITORIAL RULE ────────────────────────────────────────────────── */}
      <div className="container-editorial">
        <hr className="rule-editorial" />
      </div>

      {/* ── CONTACT SECTION ────────────────────────────────────────────────── */}
      <div className="container-editorial">
        <ContactSection socials={socials} labels={portfolio.home} />
      </div>

    </div>
  );
}
