import managedArticles from "@/content/managed-articles.json";
import { ARTICLES as legacyArticles, CTA } from "@/lib/articles";

const seen = new Set();
export const ARTICLES = [...managedArticles, ...legacyArticles]
  .filter((article) => {
    if (!article?.slug || seen.has(article.slug)) return false;
    seen.add(article.slug);
    return true;
  })
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));

export function getArticle(slug) {
  return ARTICLES.find((article) => article.slug === slug);
}

export { CTA };
