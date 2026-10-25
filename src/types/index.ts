// ─── Site-wide TypeScript Interfaces ─────────────────────────────────────────
// Defining shapes here means every component that uses these objects
// gets auto-complete and type errors if something is missing or misspelled.
// This replaces the Vanilla JS pattern of just passing around plain objects
// and hoping the right keys exist at runtime.
// ─────────────────────────────────────────────────────────────────────────────

// Status of a project — controls how it's visually badged
export type ProjectStatus = "featured" | "active" | "experimental" | "archived" | "early" | "concept" | "maintenance";

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

// Proof of work attachment (screenshot, video, gif) for a project
export interface ProjectProofOfWork {
  mediaType?: "image" | "video" | "auto";
  imageId?: string;
  url?: string;
  posterImageId?: string;
  posterUrl?: string;
  caption?: string;
  alt?: string;
  width?: number;
  height?: number;
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
  image?: string;          // Direct image reference (optional)
  proofOfWork?: ProjectProofOfWork; // Proof of work attachment (optional)
}

// Metadata stored in the JSON-backed article content model
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

// Full article object from the validated JSON document
export interface Article extends ArticleMetadata {
  slug: string;
  content: string; // Raw or converted body text
}

// Terminal workstation configuration
export interface TerminalConfig {
  pageTitle: string;
  pageDescription: string;
  promptUser: string;
  promptHost: string;
  welcomeBanner: string[];
  helpIntro: string;
  switchToVisualLabel: string;
  switchToVisualHref: string;
  navLabel: string;
}

// Modular custom section item (e.g. hobby, open source contribution, speaking)
export interface CustomSectionItem {
  title: string;
  description: string;
  meta?: string;
  link?: string;
}

// Modular custom section container
export interface CustomSection {
  id: string;
  title: string;
  description: string;
  items: CustomSectionItem[];
}
