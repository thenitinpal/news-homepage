import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AD_PLACEMENTS,
  createAd,
  fetchAdById,
  updateAd,
  type AdInput,
  type AdPlacement,
} from "../../lib/adsApi";
import { uploadArticleImage } from "../../lib/articlesApi";
import { SEO } from "../../components/SEO";

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

function todayPlusDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function emptyForm(): AdInput {
  return {
    advertiserName: "",
    image: "",
    linkUrl: "",
    placement: "sidebar-300x250",
    startDate: todayPlusDays(0),
    endDate: todayPlusDays(30),
    active: true,
  };
}

export function AdFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<AdInput>(emptyForm);
  const [loading, setLoading] = useState(isEditing);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchAdById(id)
      .then((ad) => {
        if (!ad) {
          setError("Ad not found.");
          return;
        }
        setForm({
          advertiserName: ad.advertiserName,
          image: ad.image,
          linkUrl: ad.linkUrl,
          placement: ad.placement,
          startDate: toDateInputValue(ad.startDate),
          endDate: toDateInputValue(ad.endDate),
          active: ad.active,
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load ad."))
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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.image) {
      setError("Please upload a banner image before saving.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload: AdInput = {
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      };
      if (isEditing && id) {
        await updateAd(id, payload);
      } else {
        await createAd(payload);
      }
      navigate("/admin/ads");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save ad.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO title={isEditing ? "Edit Ad" : "New Ad"} description="Manage Pal News sponsored ads." noindex />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-xl font-black tracking-tight text-slate-900">
            Pal<span className="text-red-600">News</span>{" "}
            <span className="text-sm font-semibold text-slate-400">Admin</span>
          </Link>
          <Link to="/admin/ads" className="text-sm font-semibold text-slate-600 hover:text-red-600">
            Back to ads
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-extrabold text-slate-900">
          {isEditing ? "Edit sponsored ad" : "New sponsored ad"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-slate-200 bg-white p-6">
          <div>
            <label htmlFor="advertiserName" className="block text-sm font-medium text-slate-700">
              Advertiser name
            </label>
            <input
              id="advertiserName"
              type="text"
              required
              value={form.advertiserName}
              onChange={(e) => setForm((prev) => ({ ...prev, advertiserName: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label htmlFor="linkUrl" className="block text-sm font-medium text-slate-700">
              Destination link
            </label>
            <input
              id="linkUrl"
              type="url"
              required
              placeholder="https://example.com"
              value={form.linkUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, linkUrl: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label htmlFor="placement" className="block text-sm font-medium text-slate-700">
              Placement
            </label>
            <select
              id="placement"
              value={form.placement}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, placement: e.target.value as AdPlacement }))
              }
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              {AD_PLACEMENTS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Upload a banner matching this size — it's shown at its exact pixel dimensions.
            </p>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-slate-700">
              Banner image
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
                alt="Banner preview"
                className="mt-3 max-w-xs rounded-md border border-slate-200 object-cover"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">
                Start date
              </label>
              <input
                id="startDate"
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">
                End date
              </label>
              <input
                id="endDate"
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
            />
            Active
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting || uploading}
            className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving…" : isEditing ? "Save changes" : "Create ad"}
          </button>
        </form>
      </main>
    </div>
  );
}
