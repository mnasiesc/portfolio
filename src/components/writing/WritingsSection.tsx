// ─── WritingsSection — Server Component ──────────────────────────────────────
// Renders the main page writings showcase with magazine issue headers & article cards.
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { Article } from "@/types";
import { ArticleCard } from "./ArticleCard";

interface WritingsSectionProps {
  articles: Article[];
  labels: {
    writingHeading: string;
    viewAllArticles: string;
    viewAllArticlesHref: string;
    readOnHashnode: string;
  };
}

export function WritingsSection({ articles, labels }: WritingsSectionProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section id="writing" className="work-panel-content">
      {/* Section Header */}
      <div className="work-section-heading">
        <h2>
          {labels.writingHeading}
        </h2>

        <Link
          href={labels.viewAllArticlesHref}
          className="panel-action"
        >
          {labels.viewAllArticles} ({articles.length}) →
        </Link>
      </div>

      {/* Grid of Articles */}
      <div className="writing-list">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} readLabel={labels.readOnHashnode} />
        ))}
      </div>
    </section>
  );
}
