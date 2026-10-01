// ─── ArticleCard — Server Component ──────────────────────────────────────────
// Pure presentation component for rendering a single writing item in the article list.
// Formatted like a high-contrast newspaper article entry with date stamp & tags.
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { Article } from "@/types";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="group relative flex flex-col justify-between p-6 sm:p-8 rounded-lg bg-stone-100/60 dark:bg-stone-900/60 border border-stone-300/60 dark:border-stone-800 transition-all duration-300 hover:border-stone-900 dark:hover:border-stone-100 hover:shadow-md">
      {/* Top Metadata Row: Issue Date, Category, Reading Time */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-stone-600 dark:text-stone-400 mb-3 tracking-wider uppercase">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold">
              {article.category}
            </span>
            <time dateTime={article.date}>{article.date}</time>
          </div>
          <span>{article.readingTime}</span>
        </div>

        {/* Article Title */}
        <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 group-hover:underline underline-offset-4 decoration-stone-400 dark:decoration-stone-600 transition-colors">
          <Link href={`/writing/${article.slug}`}>
            <span className="absolute inset-0" aria-hidden="true" />
            {article.title}
          </Link>
        </h3>

        {/* Article Excerpt */}
        <p className="mt-3 text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed line-clamp-3">
          {article.excerpt}
        </p>
      </div>

      {/* Bottom Footer: Tags & Read Link Arrow */}
      <div className="mt-6 pt-4 border-t border-stone-300/40 dark:border-stone-800/80 flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-mono text-stone-600 dark:text-stone-400"
            >
              #{tag}
            </span>
          ))}
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-stone-900 dark:text-stone-100 group-hover:translate-x-1 transition-transform duration-200">
          READ ARTICLE &rarr;
        </span>
      </div>
    </article>
  );
}
