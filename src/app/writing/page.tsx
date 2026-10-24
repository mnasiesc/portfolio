// ─── Writings Index Page — React Server Component ─────────────────────────────
// Displays full catalog of articles with category filtering & editorial header.
// ─────────────────────────────────────────────────────────────────────────────

import { Metadata } from "next";
import Link from "next/link";
import { getAllArticles, portfolio } from "@/lib/portfolio";
import { ArticleCard } from "@/components/writing/ArticleCard";

export const metadata: Metadata = {
  title: portfolio.writing.pageTitle,
  description: portfolio.writing.pageDescription,
};

export default async function WritingPage() {
  const articles = getAllArticles();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* Back Link */}
      <div className="mb-8">
        <Link
          href={portfolio.writing.backToHomeHref}
          className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          {portfolio.writing.backToHome}
        </Link>
      </div>

      {/* Editorial Header */}
      <header className="mb-16 pb-6 border-b-2 border-stone-900 dark:border-stone-100">
        <div className="font-mono text-xs tracking-widest uppercase text-stone-600 dark:text-stone-400 mb-2">
          {portfolio.writing.archiveEyebrow}
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-4">
          {portfolio.writing.pageHeading}
        </h1>
        <p className="text-stone-700 dark:text-stone-300 text-lg sm:text-xl max-w-3xl leading-relaxed font-sans">
          {portfolio.writing.pageIntro}
        </p>
      </header>

      {/* Article List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} readLabel={portfolio.writing.readOnHashnode} />
        ))}
      </div>
    </div>
  );
}
