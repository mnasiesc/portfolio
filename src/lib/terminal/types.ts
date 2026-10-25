import type { Project, SocialLink, TerminalConfig } from "@/types";

export interface CommandHelpItem {
  name: string;
  syntax: string;
  description: string;
}

export interface ProjectSummaryItem {
  numberId: number;
  id: string;
  title: string;
  status: string;
  tags: string[];
  description: string;
  repoUrl: string;
  demoUrl?: string;
}

export interface ArticleSummaryItem {
  numberId: number;
  slug: string;
  title: string;
  date: string;
  readingTime: string;
  category: string;
  tags: string[];
  excerpt: string;
  canonicalUrl?: string;
}

export type TerminalOutput =
  | { type: "empty" }
  | { type: "help"; intro: string; commands: CommandHelpItem[] }
  | {
      type: "whoami";
      name: string;
      role: string;
      bio: string;
      availability: string;
      issueLabel: string;
    }
  | { type: "projects"; projects: ProjectSummaryItem[] }
  | { type: "project"; project: Project; numberId: number }
  | { type: "writings"; articles: ArticleSummaryItem[] }
  | {
      type: "writing";
      article: ArticleSummaryItem;
      localRoute: string;
      externalUrl: string;
    }
  | {
      type: "contact";
      email: string;
      availability: string;
      description: string;
    }
  | { type: "socials"; socials: SocialLink[] }
  | { type: "clear" }
  | { type: "fullscreen"; active: boolean }
  | { type: "gui"; targetUrl: string; message: string }
  | {
      type: "error";
      errorType: "unknown_command" | "missing_argument" | "not_found";
      message: string;
      suggestion?: string;
    };

export interface TerminalContext {
  site: {
    name: string;
    role: string;
    issueLabel: string;
  };
  home: {
    heroTitle: string;
    heroDescription: string;
    availability: string;
    contactDescription: string;
    contactFallbackEmail: string;
  };
  projects: Project[];
  articles: Array<{
    slug: string;
    title: string;
    date: string;
    readingTime: string;
    category: string;
    tags: string[];
    excerpt: string;
    canonicalUrl?: string;
  }>;
  socials: SocialLink[];
  writing: {
    hashnodeLinkHref: string;
  };
  terminal: TerminalConfig;
}
