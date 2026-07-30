import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ArticleCard } from "../components/ArticleCard";
import type { Article } from "../data/articles";
import { fetchArticles } from "../lib/articlesApi";
import { useAuth } from "../context/AuthContext";

export function ForYouPage() {
  const { profile } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles()
      .then(setArticles)
      .finally(() => setLoading(false));
  }, []);

  const preferred = profile?.preferredCategories ?? [];
  const forYou = articles.filter((a) => preferred.includes(a.category));

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="mb-2 text-3xl font-extrabold text-slate-900">For You</h1>
        <p className="mb-8 text-sm text-slate-500">Stories from the categories you follow.</p>

        {loading ? (
          <p className="py-16 text-center text-slate-500">Loading…</p>
        ) : preferred.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-slate-600">You haven't picked any categories yet.</p>
            <Link
              to="/account"
              className="mt-3 inline-block rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
            >
              Choose your topics
            </Link>
          </div>
        ) : forYou.length === 0 ? (
          <p className="py-16 text-center text-slate-500">
            No stories in your chosen categories right now — check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {forYou.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
