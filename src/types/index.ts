// ─── Site-wide TypeScript Interfaces ─────────────────────────────────────────
// Defining shapes here means every component that uses these objects
// gets auto-complete and type errors if something is missing or misspelled.
// This replaces the Vanilla JS pattern of just passing around plain objects
// and hoping the right keys exist at runtime.
// ─────────────────────────────────────────────────────────────────────────────

// Status of a project — controls how it's visually badged
export type ProjectStatus = "featured" | "active" | "experimental" | "archived";

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

// A single project entry
export interface Project {
  id: string;              // Unique slug used as React key
  title: string;           // Display name
  description: string;     // Short 1–2 sentence summary shown on the card
  longDescription: string; // Detailed write-up shown inside the modal
  tags: string[];          // Tech stack / language badges
  status: ProjectStatus;   // Featured, active, experimental, or archived
  year: string;            // Year built / last updated
  repoUrl: string;         // GitHub link
  demoUrl?: string;        // Live demo link (optional)
}

// Metadata header stored in markdown frontmatter
export interface ArticleMetadata {
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  category: string;
  tags: string[];
  canonicalUrl?: string;
  featured?: boolean;
}

// Full Article object parsed from local markdown files
export interface Article extends ArticleMetadata {
  slug: string;
  content: string; // Raw or converted body text
}

// The top-level site configuration shape
export interface SiteConfig {
  name: string;
  role: string;
  issueLabel: string;
  nav: NavItem[];
  socials: SocialLink[];
  projects: Project[];     // All project data lives in config, not in components
}
