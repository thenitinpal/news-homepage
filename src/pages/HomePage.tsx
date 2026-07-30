import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { Ticker } from "../components/Ticker";
import { Hero } from "../components/Hero";
import { CategorySection } from "../components/CategorySection";
import { Sidebar } from "../components/Sidebar";
import { Footer } from "../components/Footer";
import { categoryLabels, type Article } from "../data/articles";
import {
  fetchArticles,
  getArticlesByCategory,
  getFeaturedArticle,
  getMostReadArticles,
  getSecondaryArticles,
  getTrendingArticles,
} from "../lib/articlesApi";

const HOMEPAGE_CATEGORIES = ["india", "world", "business", "sports", "entertainment"] as const;

export function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles()
      .then(setArticles)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load articles."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <p className="flex-1 py-24 text-center text-slate-500">Loading the latest news…</p>
        <Footer />
      </div>
    );
  }

  if (error || articles.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <p className="flex-1 py-24 text-center text-slate-500">
          {error ?? "No articles published yet."}
        </p>
        <Footer />
      </div>
    );
  }

  const featured = getFeaturedArticle(articles) ?? articles[0];
  const secondary = getSecondaryArticles(articles).filter((a) => a.id !== featured.id);
  const trending = getTrendingArticles(articles);
  const mostRead = getMostReadArticles(articles);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <Ticker articles={[...trending, ...mostRead]} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-12">
          <Hero featured={featured} secondary={secondary} />
        </div>

        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="min-w-0 flex-1 space-y-12">
            {HOMEPAGE_CATEGORIES.map((category) => (
              <CategorySection
                key={category}
                category={category}
                title={categoryLabels[category]}
                articles={getArticlesByCategory(articles, category)}
              />
            ))}
          </div>

          <Sidebar trending={trending} mostRead={mostRead} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
