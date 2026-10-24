// ─── ArticleCard — Server Component ──────────────────────────────────────────
// Pure presentation component for rendering a single writing item in the article list.
// Formatted like a high-contrast newspaper article entry with date stamp & tags.
// ─────────────────────────────────────────────────────────────────────────────

import { Article } from "@/types";
import { getArticleExternalUrl, portfolio } from "@/lib/portfolio";

interface ArticleCardProps {
  article: Article;
  readLabel: string;
}

export function ArticleCard({ article, readLabel }: ArticleCardProps) {
  const targetUrl = getArticleExternalUrl(article, portfolio.writing.readOnHashnodeHref);

  return (
    <article className="article-instrument group relative">
      {/* Top Metadata Row: Issue Date, Category, Reading Time */}
      <div>
        <div className="article-metadata">
          <div className="flex items-center gap-2">
            <span className="article-category">
              {article.category}
            </span>
            <time dateTime={article.date}>{article.date}</time>
          </div>
          <span>{article.readingTime}</span>
        </div>

        {/* Article Title */}
        <h3 className="article-title">
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="absolute inset-0" aria-hidden="true" />
            {article.title}
          </a>
        </h3>

        {/* Article Excerpt */}
        <p className="article-excerpt">
          {article.excerpt}
        </p>
      </div>

      {/* Bottom Footer: Tags & Read Link Arrow */}
      <div className="article-footer">
        <div className="flex flex-wrap gap-1.5">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="article-tag"
            >
              #{tag}
            </span>
          ))}
        </div>

        <span className="article-read-label">
          {readLabel}
        </span>
      </div>
    </article>
  );
}
