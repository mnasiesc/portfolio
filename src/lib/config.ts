// ─── Site Configuration — Single Source of Truth ─────────────────────────────
// This is the ONLY file you need to edit to update site-wide content:
// your name, nav links, social handles, etc.
//
// Components import from here and render whatever is defined below.
// Analogy: think of this like a `data.json` file in a Vanilla JS project
// that you'd `fetch()` and then loop over to render list items —
// except here it's typed and co-located with your code.
// ─────────────────────────────────────────────────────────────────────────────

import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  // ── Identity ──────────────────────────────────────────────────────────────
  name: "Mnasie",
  role: "Developer & Designer",
  issueLabel: "Vol. 01 · Est. 2026",

  // ── Primary navigation ────────────────────────────────────────────────────
  // To add a new nav item: add an entry here. The Header updates automatically.
  // To remove one: delete the entry. No component files need to change.
  nav: [
    { label: "Work",    href: "/#projects" },
    { label: "Blog",    href: "/blog" },
    { label: "Contact", href: "/#contact" },
  ],

  // ── Social / contact links ────────────────────────────────────────────────
  // Used in the Contact section and Footer (Phase 6).
  socials: [
    {
      label: "GitHub",
      href: "https://github.com/mnasie",
      handle: "@mnasie",
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/mnasie",
      handle: "Mnasie",
    },
    {
      label: "Email",
      href: "mailto:hello@mnasie.dev",
      handle: "hello@mnasie.dev",
    },
  ],
};
