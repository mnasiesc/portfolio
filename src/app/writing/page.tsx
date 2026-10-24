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
    <div className="station-shell writing-archive-page">
      {/* Back Link */}
      <div className="archive-back-link">
        <Link
          href={portfolio.writing.backToHomeHref}
          className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          {portfolio.writing.backToHome}
        </Link>
      </div>

      {/* Editorial Header */}
      <header className="archive-heading">
        <div className="archive-eyebrow">
          {portfolio.writing.archiveEyebrow}
        </div>
        <h1 className="archive-title">
          {portfolio.writing.pageHeading}
        </h1>
        <p className="archive-intro">
          {portfolio.writing.pageIntro}
        </p>
      </header>

      {/* Article List Grid */}
      <div className="archive-article-grid">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} readLabel={portfolio.writing.readOnHashnode} />
        ))}
      </div>
    </div>
  );
}
