// ─── Site-wide TypeScript Interfaces ─────────────────────────────────────────
// Defining shapes here means every component that uses these objects
// gets auto-complete and type errors if something is missing or misspelled.
// This replaces the Vanilla JS pattern of just passing around plain objects
// and hoping the right keys exist at runtime.
// ─────────────────────────────────────────────────────────────────────────────

// A single navigation link item
export interface NavItem {
  label: string;  // Display text, e.g. "Work"
  href: string;   // URL, e.g. "/blog" or "/#projects"
  // optional: mark external links (open in new tab)
  external?: boolean;
}

// Social / contact link
export interface SocialLink {
  label: string;  // e.g. "GitHub"
  href: string;   // e.g. "https://github.com/mnasie"
  handle?: string; // e.g. "@mnasie" — short display text
}

// The top-level site configuration shape
export interface SiteConfig {
  name: string;          // Site owner name
  role: string;          // Short tagline under the name
  issueLabel: string;    // Editorial stamp, e.g. "Vol. 01 · Est. 2026"
  nav: NavItem[];        // Primary navigation links
  socials: SocialLink[]; // Social / contact links
}
