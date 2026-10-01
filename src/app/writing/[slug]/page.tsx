// ─── Article Reader Page — React Server Component ─────────────────────────────
// Dynamic route for reading individual markdown articles in magazine feature article layout.
// ─────────────────────────────────────────────────────────────────────────────

import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllArticles, getArticleBySlug } from "@/lib/articles";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  return {
    title: `${article.title} | Technical Notes`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* Navigation & Issue Header */}
      <div className="mb-10 flex items-center justify-between border-b border-stone-300/60 dark:border-stone-800 pb-4">
        <Link
          href="/writing"
          className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          &larr; BACK TO WRITINGS
        </Link>
        <span className="font-mono text-xs text-stone-500 uppercase tracking-wider">
          FEATURE ARTICLE // VOL. 01
        </span>
      </div>

      {/* Main Editorial Article Header */}
      <header className="mb-12">
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-stone-600 dark:text-stone-400 mb-4 tracking-wider uppercase">
          <span className="px-2.5 py-1 rounded bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold">
            {article.category}
          </span>
          <span>•</span>
          <time dateTime={article.date}>{article.date}</time>
          <span>•</span>
          <span>{article.readingTime}</span>
          {article.canonicalUrl && (
            <>
              <span>•</span>
              <a
                href={article.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-stone-900 dark:hover:text-stone-100"
              >
                Hashnode ↗
              </a>
            </>
          )}
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-6 leading-[1.15]">
          {article.title}
        </h1>

        <p className="text-xl sm:text-2xl text-stone-700 dark:text-stone-300 font-serif italic border-l-4 border-stone-900 dark:border-stone-100 pl-6 py-1 leading-relaxed">
          {article.excerpt}
        </p>
      </header>

      {/* Article Content Rendered with Editorial Prose Layout */}
      <div className="prose dark:prose-invert max-w-none text-stone-800 dark:text-stone-200 font-sans text-base sm:text-lg leading-relaxed space-y-6">
        {article.content.split("\n\n").map((paragraph, idx) => {
          const trimmed = paragraph.trim();

          if (trimmed.startsWith("### ")) {
            return (
              <h3
                key={idx}
                className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 pt-6 pb-2 border-b border-stone-300/50 dark:border-stone-800"
              >
                {trimmed.replace("### ", "")}
              </h3>
            );
          }

          if (trimmed.startsWith("#### ")) {
            return (
              <h4
                key={idx}
                className="font-mono text-lg font-bold text-stone-900 dark:text-stone-100 pt-4"
              >
                {trimmed.replace("#### ", "")}
              </h4>
            );
          }

          if (trimmed.startsWith("```")) {
            const lines = trimmed.split("\n");
            const lang = lines[0].replace("```", "");
            const code = lines.slice(1, -1).join("\n");
            return (
              <div
                key={idx}
                className="my-6 rounded-lg bg-stone-900 dark:bg-stone-950 text-stone-100 p-4 sm:p-6 font-mono text-sm overflow-x-auto border border-stone-800 shadow-inner"
              >
                {lang && (
                  <div className="text-xs text-stone-500 uppercase font-bold mb-2 tracking-widest border-b border-stone-800 pb-1">
                    {lang}
                  </div>
                )}
                <pre>
                  <code>{code || trimmed.replace(/```[a-z]*/g, "")}</code>
                </pre>
              </div>
            );
          }

          if (trimmed.startsWith("- ")) {
            const items = trimmed.split("\n").map((item) => item.replace(/^- /, ""));
            return (
              <ul key={idx} className="list-disc list-inside space-y-2 pl-2 my-4 text-stone-700 dark:text-stone-300">
                {items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            );
          }

          return (
            <p key={idx} className="leading-relaxed">
              {trimmed}
            </p>
          );
        })}
      </div>

      {/* Article Footer & Tags */}
      <footer className="mt-16 pt-8 border-t-2 border-stone-900 dark:border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 text-xs font-mono rounded bg-stone-200/80 dark:bg-stone-800 text-stone-800 dark:text-stone-200"
            >
              #{tag}
            </span>
          ))}
        </div>

        <Link
          href="/writing"
          className="font-mono text-xs font-bold tracking-widest uppercase text-stone-900 dark:text-stone-100 hover:underline"
        >
          &larr; ALL ARTICLES
        </Link>
      </footer>
    </article>
  );
}
