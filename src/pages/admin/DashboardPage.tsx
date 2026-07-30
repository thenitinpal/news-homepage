import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteArticle, fetchArticles } from "../../lib/articlesApi";
import { categoryLabels, type Article } from "../../data/articles";
import { formatRelativeTime } from "../../utils/time";
import { useAuth } from "../../context/AuthContext";

export function DashboardPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setArticles(await fetchArticles());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load articles.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete article.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-xl font-black tracking-tight text-slate-900">
            Pal<span className="text-red-600">News</span>{" "}
            <span className="text-sm font-semibold text-slate-400">Admin</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link to="/admin/ads" className="text-sm font-semibold text-slate-600 hover:text-red-600">
              Sponsored Ads
            </Link>
            <Link to="/admin/messages" className="text-sm font-semibold text-slate-600 hover:text-red-600">
              Messages
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm font-semibold text-slate-600 hover:text-red-600"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-slate-900">Articles</h1>
          <Link
            to="/admin/new"
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
          >
            + New article
          </Link>
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-slate-500">Loading articles…</p>
        ) : articles.length === 0 ? (
          <p className="text-slate-500">No articles yet. Create your first one.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Headline</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Published</th>
                  <th className="px-4 py-3 font-semibold">Flags</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className="border-b border-slate-100 last:border-0">
                    <td className="max-w-xs truncate px-4 py-3 font-medium text-slate-800">
                      {article.headline}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{categoryLabels[article.category]}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatRelativeTime(article.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {[
                        article.featured && "Featured",
                        article.secondary && "Secondary",
                        article.trending && "Trending",
                        article.mostRead && "Most read",
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <Link
                          to={`/admin/${article.id}/edit`}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(article.id)}
                          disabled={deletingId === article.id}
                          className="font-semibold text-red-600 hover:underline disabled:opacity-50"
                        >
                          {deletingId === article.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
