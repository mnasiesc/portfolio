// ─── Terminal Workstation Page — React Server Component ───────────────────────
// Bookmarkable /terminal route backed by the shared validated portfolio.json.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles, portfolio, projects, socials } from "@/lib/portfolio";
import type { TerminalContext } from "@/lib/terminal/types";
import { TerminalEmulator } from "@/components/terminal/TerminalEmulator";

export const metadata: Metadata = {
  title: portfolio.terminal.pageTitle,
  description: portfolio.terminal.pageDescription,
  openGraph: {
    ...portfolio.site.openGraph,
    title: portfolio.terminal.pageTitle,
    description: portfolio.terminal.pageDescription,
    siteName: portfolio.site.name,
  },
};

export default function TerminalPage() {
  const articles = getAllArticles();

  const context: TerminalContext = {
    site: portfolio.site,
    home: portfolio.home,
    projects: projects,
    articles: articles,
    socials: socials,
    writing: portfolio.writing,
    terminal: portfolio.terminal,
  };

  return (
    <div className="station-page terminal-page pb-12">
      <div className="station-shell space-y-3">
        {/* Quick Route Status Bar */}
        <div className="flex items-center justify-between text-xs font-mono text-stone-500 px-1 select-none">
          <Link
            href={portfolio.terminal.switchToVisualHref}
            className="text-stone-400 hover:text-stone-200 uppercase tracking-widest text-[11px] hover:underline font-bold inline-flex items-center gap-1.5"
          >
            <span>←</span>
            <span>{portfolio.terminal.switchToVisualLabel}</span>
          </Link>
          <span className="uppercase tracking-wider text-[11px] text-stone-600 hidden sm:inline">
            INTERACTIVE SHELL SIMULATOR // READ-ONLY
          </span>
        </div>

        {/* Main Command Simulator */}
        <TerminalEmulator context={context} />
      </div>
    </div>
  );
}
