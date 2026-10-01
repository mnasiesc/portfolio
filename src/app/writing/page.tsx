// ─── Writings Index Page — React Server Component ─────────────────────────────
// Displays full catalog of articles with category filtering & editorial header.
// ─────────────────────────────────────────────────────────────────────────────

import { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import { ArticleCard } from "@/components/writing/ArticleCard";

export const metadata: Metadata = {
  title: "Writings & Technical Essays | Portfolio",
  description: "Technical writings, engineering notes, and low-level systems breakdowns.",
};

export default async function WritingPage() {
  const articles = await getAllArticles();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* Back Link */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          &larr; BACK TO MAIN ISSUE
        </Link>
      </div>

      {/* Editorial Header */}
      <header className="mb-16 pb-6 border-b-2 border-stone-900 dark:border-stone-100">
        <div className="font-mono text-xs tracking-widest uppercase text-stone-600 dark:text-stone-400 mb-2">
          ARCHIVE // ALL ESSAYS & TECHNICAL NOTES
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-4">
          Writings & <span className="italic font-normal">Essays</span>
        </h1>
        <p className="text-stone-700 dark:text-stone-300 text-lg sm:text-xl max-w-3xl leading-relaxed font-sans">
          Deep-dives into systems programming, storage engine design, C++ performance optimizations, and tactile web UI architectures.
        </p>
      </header>

      {/* Article List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  );
}
