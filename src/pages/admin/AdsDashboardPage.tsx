import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AD_PLACEMENTS, deleteAd, fetchAllAds, type SponsoredAd } from "../../lib/adsApi";
import { SEO } from "../../components/SEO";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function adStatus(ad: SponsoredAd): { label: string; className: string } {
  const now = Date.now();
  const start = new Date(ad.startDate).getTime();
  const end = new Date(ad.endDate).getTime();

  if (!ad.active) return { label: "Paused", className: "bg-slate-100 text-slate-600" };
  if (now < start) return { label: "Scheduled", className: "bg-blue-100 text-blue-700" };
  if (now > end) return { label: "Expired", className: "bg-slate-100 text-slate-500" };
  return { label: "Live", className: "bg-green-100 text-green-700" };
}

export function AdsDashboardPage() {
  const [ads, setAds] = useState<SponsoredAd[]>([]);
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
      setAds(await fetchAllAds());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ads.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this ad? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteAd(id);
      setAds((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete ad.");
    } finally {
      setDeletingId(null);
    }
  }

  const placementLabel = (value: string) =>
    AD_PLACEMENTS.find((p) => p.value === value)?.label ?? value;

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO title="Sponsored Ads" description="Manage Pal News sponsored ads." noindex />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-xl font-black tracking-tight text-slate-900">
            Pal<span className="text-red-600">News</span>{" "}
            <span className="text-sm font-semibold text-slate-400">Admin</span>
          </Link>
          <Link to="/admin" className="text-sm font-semibold text-slate-600 hover:text-red-600">
            Back to articles
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-slate-900">Sponsored Ads</h1>
          <Link
            to="/admin/ads/new"
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
          >
            + New ad
          </Link>
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-slate-500">Loading ads…</p>
        ) : ads.length === 0 ? (
          <p className="text-slate-500">
            No sponsored ads yet. When an advertiser reaches out, create one here and it'll
            replace the placeholder box in the sidebar automatically.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Banner</th>
                  <th className="px-4 py-3 font-semibold">Advertiser</th>
                  <th className="px-4 py-3 font-semibold">Placement</th>
                  <th className="px-4 py-3 font-semibold">Runs</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad) => {
                  const status = adStatus(ad);
                  return (
                    <tr key={ad.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3">
                        <img
                          src={ad.image}
                          alt=""
                          className="h-10 w-16 rounded object-cover"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{ad.advertiserName}</td>
                      <td className="px-4 py-3 text-slate-600">{placementLabel(ad.placement)}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDate(ad.startDate)} – {formatDate(ad.endDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          <Link
                            to={`/admin/ads/${ad.id}/edit`}
                            className="font-semibold text-blue-600 hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(ad.id)}
                            disabled={deletingId === ad.id}
                            className="font-semibold text-red-600 hover:underline disabled:opacity-50"
                          >
                            {deletingId === ad.id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
