import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import { fetchArticles } from "../lib/articlesApi";
import type { Article } from "../data/articles";

// Shared across every SearchToggle instance + the search results page, so typing
// in the header doesn't refetch the article list on every keystroke or re-render.
let cachedArticles: Article[] | null = null;
let cachedPromise: Promise<Article[]> | null = null;

function loadArticles(): Promise<Article[]> {
  if (cachedArticles) return Promise.resolve(cachedArticles);
  if (!cachedPromise) {
    cachedPromise = fetchArticles().then((articles) => {
      cachedArticles = articles;
      return articles;
    });
  }
  return cachedPromise;
}

export function useArticleSearch(query: string, limit = 8) {
  const [articles, setArticles] = useState<Article[] | null>(cachedArticles);

  useEffect(() => {
    if (!articles) {
      loadArticles().then(setArticles);
    }
  }, [articles]);

  const fuse = useMemo(() => {
    if (!articles) return null;
    // threshold + ignoreLocation: tolerates typos and partial/out-of-order matches
    // rather than requiring an exact substring, so close-but-not-perfect queries
    // still surface the right (or closely related) stories.
    return new Fuse(articles, {
      keys: [
        { name: "headline", weight: 0.6 },
        { name: "excerpt", weight: 0.25 },
        { name: "category", weight: 0.15 },
      ],
      threshold: 0.38,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [articles]);

  return useMemo(() => {
    if (!fuse || !query.trim()) return [];
    return fuse.search(query, { limit }).map((result) => result.item);
  }, [fuse, query, limit]);
}
