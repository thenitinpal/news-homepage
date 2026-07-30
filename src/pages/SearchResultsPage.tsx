import { useSearchParams } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ArticleCard } from "../components/ArticleCard";
import { SEO } from "../components/SEO";
import { useArticleSearch } from "../hooks/useArticleSearch";

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const results = useArticleSearch(query, 30);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SEO title={`Search: ${query}`} description={`Search results for "${query}" on Pal News.`} noindex />
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="mb-1 text-2xl font-extrabold text-slate-900">
          Search results for &ldquo;{query}&rdquo;
        </h1>
        <p className="mb-8 text-sm text-slate-500">
          {results.length} {results.length === 1 ? "story" : "stories"} found
        </p>

        {results.length === 0 ? (
          <p className="py-16 text-center text-slate-500">
            No stories matched your search. Try a different word or check the spelling.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
