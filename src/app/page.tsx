// ─── What is this file? ───────────────────────────────────────────────────────
// Home page ("/") — a React Server Component (no "use client").
// The Header is already rendered by layout.tsx above this.
// This file only contains the page-specific content.
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1">

      {/* ── HERO ────────────────────────────────────────────────────────── */}
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

      {/* ── EDITORIAL RULE ──────────────────────────────────────────────── */}
      <div className="container-editorial">
        <hr className="rule-editorial" />
      </div>

      {/* ── FEATURED PROJECTS (placeholder section) ─────────────────────── */}
      <section id="projects" className="container-editorial pb-20">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-serif text-2xl font-normal">Selected Work</h2>
          <span className="stamp">03 Projects</span>
        </div>

        {/* Project grid — we'll replace these cards with real ProjectCard components in Phase 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
          {[
            { label: "Project A", tag: "Web App", year: "2026" },
            { label: "Project B", tag: "Design System", year: "2025" },
            { label: "Project C", tag: "Open Source", year: "2025" },
          ].map((project) => (
            <div
              key={project.label}
              className="bg-background p-8 flex flex-col gap-4 group cursor-pointer"
            >
              {/* Card header */}
              <div className="flex items-center justify-between">
                <span className="stamp">{project.tag} · {project.year}</span>
              </div>
              {/* Card title in serif */}
              <h3 className="font-serif text-xl font-normal group-hover:opacity-60 transition-opacity">
                {project.label}
              </h3>
              {/* Arrow indicator */}
              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
                <span>Case Study</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── EDITORIAL RULE ──────────────────────────────────────────────── */}
      <div className="container-editorial">
        <hr className="rule-editorial" />
      </div>

      {/* ── CONTACT PLACEHOLDER ──────────────────────────────────────────── */}
      <section id="contact" className="container-editorial pb-24">
        <span className="stamp block mb-6">Direct Connect</span>
        <p className="pull-quote max-w-xl">
          &ldquo;The best work starts with a conversation.&rdquo;
        </p>
        <p className="mt-8 text-muted-foreground">
          Reach out — contact section coming in Phase 6.
        </p>
      </section>

    </div>
  );
}
