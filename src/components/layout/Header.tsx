// ─── Header — Server Component ────────────────────────────────────────────────
// No "use client" here — this runs on the server and produces static HTML.
// It reads site config and renders the masthead structure.
//
// The only interactive part (active link highlighting) is delegated to
// <NavLinks />, which is a small Client Component boundary.
//
// To change the header design entirely: edit ONLY this file.
// The nav data still comes from config.ts untouched.
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { NavLinks } from "@/components/layout/NavLinks";

export function Header() {
  return (
    // Sticky header: stays at the top as you scroll.
    // backdrop-blur + semi-transparent bg creates a frosted paper effect
    // as content scrolls underneath — a subtle but premium touch.
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">

      {/* ── Top rule: thin editorial double-line accent ── */}
      <div className="h-0.5 bg-foreground w-full" />

      {/* ── Main masthead row ── */}
      <div className="container-editorial flex items-center justify-between py-4">

        {/* ── Site name / Logo ── */}
        {/* Link wraps the name so clicking it always goes home.         */}
        {/* `font-serif` triggers Newsreader. `no-underline` removes the */}
        {/* default anchor underline since this is a logo, not inline text. */}
        <Link
          href="/"
          className="no-underline group flex flex-col gap-0.5"
          aria-label={`${siteConfig.name} — home`}
        >
          <span className="font-serif text-xl font-light leading-none tracking-tight group-hover:opacity-70 transition-opacity">
            {siteConfig.name}
          </span>
          {/* Issue stamp below the name — pure editorial typography detail */}
          <span className="stamp text-[10px]">{siteConfig.issueLabel}</span>
        </Link>

        {/* ── Navigation links ── */}
        {/* We pass the nav items from config down as props.              */}
        {/* NavLinks is a Client Component — it renders the active state. */}
        {/* Header (this file) stays a Server Component.                  */}
        <NavLinks items={siteConfig.nav} />
      </div>
    </header>
  );
}
