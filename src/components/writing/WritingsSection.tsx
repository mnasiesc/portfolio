// ─── WritingsSection — Server Component ──────────────────────────────────────
// Renders the main page writings showcase with magazine issue headers & article cards.
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { Article } from "@/types";
import { ArticleCard } from "./ArticleCard";

interface WritingsSectionProps {
  articles: Article[];
}

export function WritingsSection({ articles }: WritingsSectionProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section id="writing" className="py-16 sm:py-24 border-t border-stone-300/70 dark:border-stone-800">
      {/* Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 pb-4 border-b-2 border-stone-900 dark:border-stone-100 gap-4">
        <div>
          <div className="font-mono text-xs tracking-widest uppercase text-stone-600 dark:text-stone-400 mb-1">
            SECTION 02 // ESSAYS & TECHNICAL WRITING
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Writings & <span className="italic font-normal">Notes</span>
          </h2>
        </div>

        <Link
          href="/writing"
          className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase text-stone-900 dark:text-stone-100 hover:opacity-75 transition-opacity"
        >
          VIEW ALL ARTICLES ({articles.length}) &rarr;
        </Link>
      </div>

      {/* Grid of Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
