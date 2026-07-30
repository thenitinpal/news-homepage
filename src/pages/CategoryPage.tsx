import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { Ticker } from "../components/Ticker";
import { ArticleCard } from "../components/ArticleCard";
import { Sidebar } from "../components/Sidebar";
import { Footer } from "../components/Footer";
import { SEO } from "../components/SEO";
import { categoryLabels, type Article, type Category } from "../data/articles";
import {
  fetchArticles,
  getArticlesByCategory,
  getMostReadArticles,
  getTrendingArticles,
} from "../lib/articlesApi";

const KNOWN_CATEGORIES = Object.keys(categoryLabels) as Category[];

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles()
      .then(setArticles)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load articles."))
      .finally(() => setLoading(false));
  }, []);

  const trending = getTrendingArticles(articles);
  const mostRead = getMostReadArticles(articles);
  const category = KNOWN_CATEGORIES.find((c) => c === slug);
  const items = category ? getArticlesByCategory(articles, category) : [];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SEO
        title={category ? `${categoryLabels[category]} News` : "Category not found"}
        description={
          category
            ? `The latest ${categoryLabels[category]} news and headlines from Pal News.`
            : "This category doesn't exist."
        }
        noindex={!category}
      />
      <Header />
      <Ticker articles={[...trending, ...mostRead]} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="mb-6 border-b border-slate-200 pb-3 text-3xl font-extrabold text-slate-900">
          {category ? categoryLabels[category] : "Category not found"}
        </h1>

        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="min-w-0 flex-1">
            {loading ? (
              <p className="py-16 text-center text-slate-500">Loading articles…</p>
            ) : error ? (
              <p className="py-16 text-center text-slate-500">{error}</p>
            ) : items.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <p className="py-16 text-center text-slate-500">
                No articles found in this category.
              </p>
            )}
          </div>

          <Sidebar trending={trending} mostRead={mostRead} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
