import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Sidebar } from "../components/Sidebar";
import { SEO, StructuredData } from "../components/SEO";
import { categoryLabels, type Article } from "../data/articles";
import {
  fetchArticleById,
  fetchArticles,
  getMostReadArticles,
  getTrendingArticles,
} from "../lib/articlesApi";
import { fetchSavedArticleIds, saveArticle, unsaveArticle } from "../lib/savedArticlesApi";
import { fetchComments, postComment, type Comment } from "../lib/commentsApi";
import { formatRelativeTime } from "../utils/time";
import { useAuth } from "../context/AuthContext";

export function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { session, profile } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trending, setTrending] = useState<Article[]>([]);
  const [mostRead, setMostRead] = useState<Article[]>([]);

  const [saved, setSaved] = useState(false);
  const [savePending, setSavePending] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchArticleById(id)
      .then(setArticle)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load article."))
      .finally(() => setLoading(false));

    fetchArticles().then((all) => {
      setTrending(getTrendingArticles(all));
      setMostRead(getMostReadArticles(all));
    });

    fetchComments(id)
      .then(setComments)
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!session || !id) {
      setSaved(false);
      return;
    }
    fetchSavedArticleIds(session.user.id).then((ids) => setSaved(ids.has(id)));
  }, [session, id]);

  async function handleToggleSave() {
    if (!session || !id) return;
    setSavePending(true);
    try {
      if (saved) {
        await unsaveArticle(session.user.id, id);
        setSaved(false);
      } else {
        await saveArticle(session.user.id, id);
        setSaved(true);
      }
    } finally {
      setSavePending(false);
    }
  }

  async function handlePostComment(event: FormEvent) {
    event.preventDefault();
    if (!session || !profile || !id || !commentBody.trim()) return;
    setPostingComment(true);
    setCommentError(null);
    try {
      const comment = await postComment(id, session.user.id, profile.displayName, commentBody.trim());
      setComments((prev) => [comment, ...prev]);
      setCommentBody("");
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : "Failed to post comment.");
    } finally {
      setPostingComment(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {article && (
        <>
          <SEO
            title={article.headline}
            description={article.excerpt}
            image={article.image}
            type="article"
            publishedTime={article.timestamp}
          />
          <StructuredData
            data={{
              "@context": "https://schema.org",
              "@type": "NewsArticle",
              headline: article.headline,
              description: article.excerpt,
              image: [article.image],
              datePublished: article.timestamp,
              dateModified: article.timestamp,
              articleSection: categoryLabels[article.category],
              author: { "@type": "Organization", name: "Pal News" },
              publisher: {
                "@type": "Organization",
                name: "Pal News",
                logo: { "@type": "ImageObject", url: `${window.location.origin}/favicon.svg` },
              },
              mainEntityOfPage: { "@type": "WebPage", "@id": window.location.href },
            }}
          />
        </>
      )}
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {loading ? (
          <p className="py-24 text-center text-slate-500">Loading article…</p>
        ) : error || !article ? (
          <p className="py-24 text-center text-slate-500">{error ?? "Article not found."}</p>
        ) : (
          <div className="flex flex-col gap-10 lg:flex-row">
            <div className="min-w-0 flex-1">
              <Link
                to={`/category/${article.category}`}
                className="text-xs font-bold uppercase tracking-wide text-red-600 hover:underline"
              >
                {categoryLabels[article.category]}
              </Link>
              <h1 className="mt-2 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
                {article.headline}
              </h1>
              <div className="mt-3 flex items-center gap-3 text-sm text-slate-500">
                <span>{formatRelativeTime(article.timestamp)}</span>
                {session ? (
                  <button
                    type="button"
                    onClick={handleToggleSave}
                    disabled={savePending}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold disabled:opacity-60 ${
                      saved
                        ? "border-red-600 bg-red-50 text-red-600"
                        : "border-slate-300 text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {saved ? "Saved ✓" : "Save"}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-400"
                  >
                    Log in to save
                  </Link>
                )}
              </div>

              <img
                src={article.image}
                alt={article.headline}
                className="mt-6 aspect-[16/9] w-full rounded-xl object-cover"
              />

              <p className="mt-6 text-lg leading-relaxed text-slate-700">{article.excerpt}</p>

              <section className="mt-12 border-t border-slate-200 pt-8">
                <h2 className="text-lg font-bold text-slate-900">
                  Comments {comments.length > 0 && `(${comments.length})`}
                </h2>

                {session && profile ? (
                  <form onSubmit={handlePostComment} className="mt-4">
                    <label htmlFor="comment" className="sr-only">
                      Write a comment
                    </label>
                    <textarea
                      id="comment"
                      rows={3}
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      placeholder={`Comment as ${profile.displayName}...`}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    {commentError && <p className="mt-1 text-sm text-red-600">{commentError}</p>}
                    <button
                      type="submit"
                      disabled={postingComment || !commentBody.trim()}
                      className="mt-2 rounded-md bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {postingComment ? "Posting…" : "Post comment"}
                    </button>
                  </form>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    <Link to="/login" className="font-semibold text-red-600 hover:underline">
                      Log in
                    </Link>{" "}
                    to join the conversation.
                  </p>
                )}

                <ul className="mt-6 space-y-5">
                  {comments.map((comment) => (
                    <li key={comment.id} className="border-b border-slate-100 pb-5 last:border-0">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-slate-900">{comment.displayName}</span>
                        <span className="text-slate-400">{formatRelativeTime(comment.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{comment.body}</p>
                    </li>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-sm text-slate-400">No comments yet — be the first.</p>
                  )}
                </ul>
              </section>
            </div>

            <Sidebar trending={trending} mostRead={mostRead} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
