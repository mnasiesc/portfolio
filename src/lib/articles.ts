import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Article, ArticleMetadata } from "@/types";

// Path to the local directory where markdown articles are stored
const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

/**
 * Utility: Calculate estimated reading time if missing from frontmatter
 */
function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

/**
 * Fetch all articles from local filesystem.
 * Sorted in reverse chronological order (newest first).
 *
 * MODULAR ARCHITECTURE NOTE:
 * If you ever decide to fetch articles from a CMS (e.g. Sanity, Hashnode, GitHub API),
 * you only need to update THIS function. Your UI components won't break!
 */
export async function getAllArticles(): Promise<Article[]> {
  if (!fs.existsSync(ARTICLES_DIR)) {
    return [];
  }

  const filenames = fs.readdirSync(ARTICLES_DIR);

  const articles: Article[] = filenames
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.(md|mdx)$/, "");
      const filePath = path.join(ARTICLES_DIR, filename);
      const fileContents = fs.readFileSync(filePath, "utf8");

      // Parse YAML frontmatter using gray-matter
      const { data, content } = matter(fileContents);
      const metadata = data as Partial<ArticleMetadata>;

      return {
        slug,
        title: metadata.title || slug,
        excerpt: metadata.excerpt || "",
        date: metadata.date || new Date().toISOString().split("T")[0],
        readingTime: metadata.readingTime || calculateReadingTime(content),
        category: metadata.category || "Notes",
        tags: metadata.tags || [],
        canonicalUrl: metadata.canonicalUrl,
        featured: metadata.featured || false,
        content,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return articles;
}

/**
 * Fetch a single article by its slug.
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const articles = await getAllArticles();
    const article = articles.find((a) => a.slug === slug);
    return article || null;
  } catch {
    return null;
  }
}
