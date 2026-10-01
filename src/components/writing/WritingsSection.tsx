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
      {/* Section Header */}
      <div className="flex items-baseline justify-between mb-8 pb-3 border-b-2 border-stone-900 dark:border-stone-100">
        <h2 className="font-serif text-2xl font-normal text-stone-900 dark:text-stone-100">
          Writings &amp; Technical Notes
        </h2>

        <Link
          href="/writing"
          className="stamp text-xs text-stone-900 dark:text-stone-100 hover:opacity-75 transition-opacity"
        >
          VIEW ALL ({articles.length}) &rarr;
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
