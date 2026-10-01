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

import { siteConfig } from "@/lib/config";
import { getAllArticles } from "@/lib/articles";
import { ProjectsSection } from "@/components/projects/ProjectsSection";
import { WritingsSection } from "@/components/writing/WritingsSection";
import { ContactSection } from "@/components/contact/ContactSection";

export default async function HomePage() {
  const articles = await getAllArticles();

  return (
    <div className="flex flex-col flex-1">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="container-editorial py-16 md:py-24">

          <p className="stamp mb-6">Software Engineer · Open to Work</p>

          <h1 className="font-serif text-5xl md:text-7xl font-light leading-[1.05] tracking-tight max-w-3xl">
            Building things<br />
            on the <em>web.</em>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            Software engineer focused on interfaces, tooling, and learning in public.
            This is the portfolio and technical blog.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-sm font-medium no-underline hover:opacity-80 transition-opacity"
            >
              View Work
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 border border-border px-5 py-2.5 text-sm font-medium no-underline hover:bg-muted transition-colors"
            >
              Get in Touch
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
      <ProjectsSection projects={siteConfig.projects} />

      {/* ── WRITINGS / ARTICLES ───────────────────────────────────────────── */}
      <div className="container-editorial">
        <WritingsSection articles={articles} />
      </div>

      {/* ── EDITORIAL RULE ────────────────────────────────────────────────── */}
      <div className="container-editorial">
        <hr className="rule-editorial" />
      </div>

      {/* ── CONTACT SECTION ────────────────────────────────────────────────── */}
      <div className="container-editorial">
        <ContactSection socials={siteConfig.socials} />
      </div>

    </div>
  );
}
