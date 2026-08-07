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
import { renderFormattedBody } from "../../utils/richText";

const CATEGORIES = Object.keys(categoryLabels) as Category[];

const RECOMMENDED_MIN_WIDTH = 1280;
const RECOMMENDED_RATIO = 16 / 9;
const RATIO_TOLERANCE = 0.15;

/** Reads a file's pixel dimensions client-side and flags it if it's below the recommended
 * 1280x720 (16:9, YouTube-thumbnail-ratio) minimum — catches blurry/oddly-cropped cover
 * images before publishing instead of after. */
function checkImageDimensions(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { naturalWidth: width, naturalHeight: height } = img;
      const ratio = width / height;
      const ratioOff = Math.abs(ratio - RECOMMENDED_RATIO) / RECOMMENDED_RATIO;

      if (width < RECOMMENDED_MIN_WIDTH) {
        resolve(
          `This image is ${width}×${height}px — below the recommended 1280×720 minimum. It may look blurry when displayed larger on the site.`,
        );
      } else if (ratioOff > RATIO_TOLERANCE) {
        resolve(
          `This image is ${width}×${height}px, not close to the recommended 16:9 ratio — it may get cropped oddly when displayed.`,
        );
      } else {
        resolve(null);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageSizeWarning, setImageSizeWarning] = useState<string | null>(null);
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
    setUploadError(null);
    setImageSizeWarning(null);
    try {
      const [warning, url] = await Promise.all([
        checkImageDimensions(file),
        uploadArticleImage(file),
      ]);
      setImageSizeWarning(warning);
      setForm((prev) => ({ ...prev, image: url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  }

  /** Wraps the current selection (or a placeholder) with `before`/`after`, e.g. `_` / `_` for underline. */
  function wrapSelection(before: string, after: string, placeholder: string) {
    const textarea = excerptRef.current;
    const value = form.excerpt;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const content = value.slice(start, end) || placeholder;
    const inserted = `${before}${content}${after}`;

    setForm((prev) => ({ ...prev, excerpt: value.slice(0, start) + inserted + value.slice(end) }));

    requestAnimationFrame(() => {
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + content.length);
    });
  }

  /** Inserts the selection (or a placeholder) as its own line prefixed with `prefix`, e.g. "# " for a heading. */
  function insertBlock(prefix: string, placeholder: string) {
    const textarea = excerptRef.current;
    const value = form.excerpt;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const content = value.slice(start, end) || placeholder;
    const needsLeadingNewline = start > 0 && value[start - 1] !== "\n";
    const inserted = `${needsLeadingNewline ? "\n" : ""}${prefix}${content}\n`;

    setForm((prev) => ({ ...prev, excerpt: value.slice(0, start) + inserted + value.slice(end) }));

    requestAnimationFrame(() => {
      if (!textarea) return;
      textarea.focus();
      const selStart = start + (needsLeadingNewline ? 1 : 0) + prefix.length;
      textarea.setSelectionRange(selStart, selStart + content.length);
    });
  }

  /** Inserts a line break at the cursor, starting a fresh paragraph to type into. */
  function insertParagraphBreak() {
    const textarea = excerptRef.current;
    const value = form.excerpt;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;

    setForm((prev) => ({ ...prev, excerpt: value.slice(0, start) + "\n" + value.slice(end) }));

    requestAnimationFrame(() => {
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(start + 1, start + 1);
    });
  }

  function handleInsertLink() {
    const url = window.prompt("Link URL (e.g. https://example.com or /article/other-id):");
    if (!url) return;
    const textarea = excerptRef.current;
    const start = textarea?.selectionStart ?? form.excerpt.length;
    const end = textarea?.selectionEnd ?? form.excerpt.length;
    const selected = form.excerpt.slice(start, end);
    const label = window.prompt("Link text:", selected) || url;
    const markdown = `[${label}](${url})`;

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
            <label htmlFor="excerpt" className="block text-sm font-medium text-slate-700">
              Excerpt
            </label>
            <div className="mt-1 flex flex-wrap items-center gap-1 rounded-t-md border border-b-0 border-slate-300 bg-slate-50 px-2 py-1.5">
              <button
                type="button"
                onClick={() => insertBlock("# ", "Heading text")}
                title="Heading 1"
                className="rounded px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => insertBlock("## ", "Heading text")}
                title="Heading 2"
                className="rounded px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertBlock("### ", "Heading text")}
                title="Heading 3"
                className="rounded px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                H3
              </button>
              <span className="mx-1 h-4 w-px bg-slate-300" aria-hidden="true" />
              <button
                type="button"
                onClick={insertParagraphBreak}
                title="New paragraph"
                className="rounded px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                ¶
              </button>
              <button
                type="button"
                onClick={() => wrapSelection("_", "_", "underlined text")}
                title="Underline"
                className="rounded px-2 py-1 text-xs font-semibold text-slate-700 underline hover:bg-slate-200"
              >
                U
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                title="Insert link"
                className="rounded px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                🔗 Link
              </button>
            </div>
            <textarea
              id="excerpt"
              ref={excerptRef}
              required
              rows={14}
              value={form.excerpt}
              onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
              className="w-full resize-y rounded-b-md border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <p className="mt-1 text-xs text-slate-400">
              The article page shows only the first 2 lines as a preview — write as much as you
              like here for search engines and AI crawlers to index. Each line is its own
              paragraph. Use the toolbar above, or type markup directly: start a line with{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5">#</code>,{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5">##</code>, or{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5">###</code> for a heading, wrap
              text in <code className="rounded bg-slate-100 px-1 py-0.5">_underscores_</code> to
              underline, or use{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5">[link text](https://example.com)</code>{" "}
              for a link.
            </p>

            <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Preview — how this looks on the published article page
              </p>
              {form.excerpt.trim() ? (
                <div className="text-lg leading-relaxed text-slate-700">
                  {renderFormattedBody(form.excerpt)}
                </div>
              ) : (
                <p className="text-sm italic text-slate-400">Nothing typed yet.</p>
              )}
            </div>
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
            {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
            {imageSizeWarning && (
              <p className="mt-1 text-xs text-amber-600">⚠ {imageSizeWarning}</p>
            )}
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
