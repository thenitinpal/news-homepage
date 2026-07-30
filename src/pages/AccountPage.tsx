import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ArticleCard } from "../components/ArticleCard";
import { categoryLabels, type Article, type Category } from "../data/articles";
import { fetchArticles } from "../lib/articlesApi";
import { fetchSavedArticleIds } from "../lib/savedArticlesApi";
import { updateProfile } from "../lib/profileApi";
import { isSubscribed, subscribe, unsubscribe } from "../lib/newsletterApi";
import { useAuth } from "../context/AuthContext";

const ALL_CATEGORIES = Object.keys(categoryLabels) as Category[];

export function AccountPage() {
  const { session, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);

  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [preferredCategories, setPreferredCategories] = useState<Category[]>(
    profile?.preferredCategories ?? [],
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [subscribed, setSubscribed] = useState(false);
  const [subscribePending, setSubscribePending] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setPreferredCategories(profile.preferredCategories);
    }
  }, [profile]);

  useEffect(() => {
    if (!session) return;
    Promise.all([fetchArticles(), fetchSavedArticleIds(session.user.id)])
      .then(([all, savedIds]) => {
        setSavedArticles(all.filter((a) => savedIds.has(a.id)));
      })
      .finally(() => setLoadingSaved(false));

    isSubscribed(session.user.id).then(setSubscribed);
  }, [session]);

  function toggleCategory(category: Category) {
    setPreferredCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  }

  async function handleSaveProfile() {
    if (!session) return;
    setSavingProfile(true);
    setProfileSaved(false);
    try {
      await updateProfile(session.user.id, { displayName, preferredCategories });
      await refreshProfile();
      setProfileSaved(true);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleToggleSubscribe() {
    if (!session) return;
    setSubscribePending(true);
    try {
      if (subscribed) {
        await unsubscribe(session.user.id);
        setSubscribed(false);
      } else {
        await subscribe(session.user.email ?? "", session.user.id);
        setSubscribed(true);
      }
    } finally {
      setSubscribePending(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  if (!session) return null;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-slate-900">My Account</h1>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm font-semibold text-slate-600 hover:text-red-600"
          >
            Sign out
          </button>
        </div>

        <section className="rounded-lg border border-slate-200 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-blue-600">Profile</h2>

          <div className="mt-4">
            <label htmlFor="displayName" className="block text-sm font-medium text-slate-700">
              Display name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div className="mt-5">
            <p className="text-sm font-medium text-slate-700">
              Preferred categories <span className="text-slate-400">(powers your For You feed)</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    preferredCategories.includes(category)
                      ? "bg-red-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {categoryLabels[category]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="rounded-md bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingProfile ? "Saving…" : "Save changes"}
            </button>
            {profileSaved && <span className="text-sm text-green-600">Saved.</span>}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-blue-600">Newsletter</h2>
          <p className="mt-2 text-sm text-slate-600">
            {subscribed
              ? `You're subscribed with ${session.user.email}.`
              : "Get top stories in your inbox."}
          </p>
          <button
            type="button"
            onClick={handleToggleSubscribe}
            disabled={subscribePending}
            className={`mt-3 rounded-full px-4 py-1.5 text-sm font-semibold disabled:opacity-60 ${
              subscribed
                ? "border border-slate-300 text-slate-600 hover:border-slate-400"
                : "bg-red-600 text-white hover:bg-red-500"
            }`}
          >
            {subscribed ? "Unsubscribe" : "Subscribe"}
          </button>
        </section>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-blue-600">Saved articles</h2>
            <Link to="/for-you" className="text-sm font-semibold text-red-600 hover:underline">
              For You feed →
            </Link>
          </div>

          {loadingSaved ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : savedArticles.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nothing saved yet — tap "Save" on any article to keep it here.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {savedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
