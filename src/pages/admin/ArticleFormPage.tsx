import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createArticle,
  fetchArticleById,
  updateArticle,
  uploadArticleImage,
  type ArticleInput,
} from "../../lib/articlesApi";
import { categoryLabels, type Category } from "../../data/articles";
import { SEO } from "../../components/SEO";

const CATEGORIES = Object.keys(categoryLabels) as Category[];

const EMPTY_FORM: ArticleInput = {
  category: "india",
  headline: "",
  excerpt: "",
  image: "",
  featured: false,
  secondary: false,
  trending: false,
  mostRead: false,
  metaTitle: "",
  metaDescription: "",
  focusKeyword: "",
  secondaryKeywords: "",
};

export function ArticleFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<ArticleInput>(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditing);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const excerptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!id) return;
    fetchArticleById(id)
      .then((article) => {
        if (!article) {
          setError("Article not found.");
          return;
        }
        setForm({
          category: article.category,
          headline: article.headline,
          excerpt: article.excerpt,
          image: article.image,
          featured: Boolean(article.featured),
          secondary: Boolean(article.secondary),
          trending: Boolean(article.trending),
          mostRead: Boolean(article.mostRead),
          metaTitle: article.metaTitle ?? "",
          metaDescription: article.metaDescription ?? "",
          focusKeyword: article.focusKeyword ?? "",
          secondaryKeywords: article.secondaryKeywords ?? "",
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load article."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadArticleImage(file);
      setForm((prev) => ({ ...prev, image: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  }

  function handleInsertLink() {
    const url = window.prompt("Link URL (e.g. https://example.com or /article/other-id):");
    if (!url) return;
    const label = window.prompt("Link text:", "") || url;
    const markdown = `[${label}](${url})`;

    const textarea = excerptRef.current;
    const start = textarea?.selectionStart ?? form.excerpt.length;
    const end = textarea?.selectionEnd ?? form.excerpt.length;

    setForm((prev) => ({
      ...prev,
      excerpt: prev.excerpt.slice(0, start) + markdown + prev.excerpt.slice(end),
    }));

    requestAnimationFrame(() => {
      if (!textarea) return;
      textarea.focus();
      const cursor = start + markdown.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.image) {
      setError("Please upload a cover image before saving.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (isEditing && id) {
        await updateArticle(id, form);
      } else {
        await createArticle(form);
      }
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save article.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO title={isEditing ? "Edit Article" : "New Article"} description="Manage Pal News articles." noindex />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-xl font-black tracking-tight text-slate-900">
            Pal<span className="text-red-600">News</span>{" "}
            <span className="text-sm font-semibold text-slate-400">Admin</span>
          </Link>
          <Link to="/admin" className="text-sm font-semibold text-slate-600 hover:text-red-600">
            Back to articles
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-extrabold text-slate-900">
          {isEditing ? "Edit article" : "New article"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-slate-200 bg-white p-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as Category }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {categoryLabels[category]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="headline" className="block text-sm font-medium text-slate-700">
              Headline
            </label>
            <input
              id="headline"
              type="text"
              required
              value={form.headline}
              onChange={(e) => setForm((prev) => ({ ...prev, headline: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="excerpt" className="block text-sm font-medium text-slate-700">
                Excerpt
              </label>
              <button
                type="button"
                onClick={handleInsertLink}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                + Insert link
              </button>
            </div>
            <textarea
              id="excerpt"
              ref={excerptRef}
              required
              rows={14}
              value={form.excerpt}
              onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
              className="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <p className="mt-1 text-xs text-slate-400">
              To link text, select "+ Insert link" or type it manually as{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5">[link text](https://example.com)</code>.
            </p>
          </div>

          <fieldset className="space-y-4 rounded-md border border-slate-200 p-4">
            <legend className="px-1 text-sm font-semibold text-slate-900">
              SEO (optional — helps ranking on Google, ChatGPT, Perplexity)
            </legend>

            <div>
              <label htmlFor="metaTitle" className="block text-sm font-medium text-slate-700">
                Meta title
              </label>
              <input
                id="metaTitle"
                type="text"
                value={form.metaTitle}
                onChange={(e) => setForm((prev) => ({ ...prev, metaTitle: e.target.value }))}
                placeholder="Falls back to headline if left blank"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label htmlFor="metaDescription" className="block text-sm font-medium text-slate-700">
                Meta description
              </label>
              <textarea
                id="metaDescription"
                rows={2}
                value={form.metaDescription}
                onChange={(e) => setForm((prev) => ({ ...prev, metaDescription: e.target.value }))}
                placeholder="Falls back to excerpt if left blank"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label htmlFor="focusKeyword" className="block text-sm font-medium text-slate-700">
                Focus keyword
              </label>
              <input
                id="focusKeyword"
                type="text"
                value={form.focusKeyword}
                onChange={(e) => setForm((prev) => ({ ...prev, focusKeyword: e.target.value }))}
                placeholder="e.g. India Budget 2026"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label htmlFor="secondaryKeywords" className="block text-sm font-medium text-slate-700">
                Secondary keywords
              </label>
              <input
                id="secondaryKeywords"
                type="text"
                value={form.secondaryKeywords}
                onChange={(e) => setForm((prev) => ({ ...prev, secondaryKeywords: e.target.value }))}
                placeholder="Comma-separated, e.g. union budget, tax slabs, finance minister"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </fieldset>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-slate-700">
              Cover image
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 w-full text-sm text-slate-600"
            />
            {uploading && <p className="mt-1 text-xs text-slate-500">Uploading…</p>}
            {form.image && (
              <img
                src={form.image}
                alt="Cover preview"
                className="mt-3 h-40 w-full max-w-xs rounded-md object-cover"
              />
            )}
          </div>

          <fieldset className="grid grid-cols-2 gap-2">
            <legend className="mb-1 text-sm font-medium text-slate-700">Placement</legend>
            {(
              [
                ["featured", "Hero — featured"],
                ["secondary", "Hero — secondary"],
                ["trending", "Trending Now"],
                ["mostRead", "Most Read"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                {label}
              </label>
            ))}
          </fieldset>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting || uploading}
            className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving…" : isEditing ? "Save changes" : "Publish article"}
          </button>
        </form>
      </main>
    </div>
  );
}
