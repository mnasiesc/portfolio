import "server-only";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import schema from "../../content/portfolio.schema.json";
import content from "../../content/portfolio.json";
import type { Project, SocialLink } from "@/types";

export type PortfolioContent = typeof content;
export type PortfolioImage = PortfolioContent["images"][number];
export type PortfolioArticle = PortfolioContent["articles"][number] & { content: string };
export type PortfolioProject = PortfolioContent["projects"][number];
export type PortfolioSocial = PortfolioContent["socials"][number];
export type PortfolioTerminal = PortfolioContent["terminal"];

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

if (!validate(content)) {
  const details = (validate.errors ?? [])
    .map((error) => `${error.instancePath || "/"}: ${error.message}`)
    .join("\n");
  throw new Error(`Invalid content/portfolio.json:\n${details}`);
}

const assertUnique = (values: string[], label: string) => {
  if (new Set(values).size !== values.length) {
    throw new Error(`Duplicate ${label} found in content/portfolio.json`);
  }
};

assertUnique(content.projects.map(({ id }) => id), "project ID");
assertUnique(content.articles.map(({ slug }) => slug), "article slug");
assertUnique(content.images.map(({ id }) => id), "image ID");

const imageIds = new Set(content.images.map(({ id }) => id));
const imageReferences = [content.home.avatarImage, ...Object.values(content.site.icons)];
for (const imageId of imageReferences) {
  if (!imageIds.has(imageId)) throw new Error(`Missing portfolio image: ${imageId}`);
}

export const portfolio = content;
export const projects = content.projects as Project[];
export const socials = content.socials as SocialLink[];

export function getImage(id: string): PortfolioImage {
  const image = portfolio.images.find((entry) => entry.id === id);
  if (!image) throw new Error(`Unknown portfolio image: ${id}`);
  return image;
}

export function getAllArticles(): PortfolioArticle[] {
  return [...portfolio.articles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((article) => ({ ...article, content: article.body }));
}

export function getArticleBySlug(slug: string): PortfolioArticle | null {
  return getAllArticles().find((article) => article.slug === slug) ?? null;
}

export function getArticleExternalUrl(
  article: { slug: string; canonicalUrl?: string },
  template: string,
): string {
  return article.canonicalUrl ?? template.replaceAll("{slug}", encodeURIComponent(article.slug));
}