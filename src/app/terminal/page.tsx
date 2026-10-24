// ─── Terminal Workstation Page — React Server Component ───────────────────────
// Bookmarkable /terminal route backed by the shared validated portfolio.json.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
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
    <div className="fixed inset-0 z-[60] w-screen h-screen bg-[#0a110c] text-stone-100 flex flex-col overflow-hidden">
      <TerminalEmulator context={context} />
    </div>
  );
}
