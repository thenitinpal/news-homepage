import { useState, type FormEvent, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { categoryLabels } from "../data/articles";
import { useArticleSearch } from "../hooks/useArticleSearch";

interface SearchToggleProps {
  variant?: "compact" | "expanded";
}

export function SearchToggle({ variant = "compact" }: SearchToggleProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const suggestions = useArticleSearch(query, 6);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setDropdownOpen(false);
    setOpen(false);
  }

  function handleSuggestionMouseDown(e: MouseEvent) {
    // Keeps the input focused so the dropdown doesn't close via blur before the click fires.
    e.preventDefault();
  }

  function goToArticle(id: string) {
    navigate(`/article/${id}`);
    setQuery("");
    setDropdownOpen(false);
    setOpen(false);
  }

  const showDropdown = dropdownOpen && query.trim().length > 0;

  const dropdown = showDropdown && (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
      {suggestions.length === 0 ? (
        <p className="px-4 py-3 text-sm text-slate-500">No matching stories yet.</p>
      ) : (
        <ul>
          {suggestions.map((article) => (
            <li key={article.id}>
              <button
                type="button"
                onMouseDown={handleSuggestionMouseDown}
                onClick={() => goToArticle(article.id)}
                className="flex w-full items-center gap-3 border-b border-slate-100 px-3 py-2 text-left last:border-0 hover:bg-slate-50"
              >
                <img
                  src={article.image}
                  alt=""
                  className="h-10 w-14 shrink-0 rounded object-cover"
                />
                <span className="min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-red-600">
                    {categoryLabels[article.category]}
                  </span>
                  <span className="line-clamp-1 text-sm font-semibold text-slate-800">
                    {article.headline}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  if (variant === "expanded") {
    return (
      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor="site-search-expanded" className="sr-only">
          Search articles
        </label>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          id="site-search-expanded"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setDropdownOpen(true);
          }}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
          placeholder="Search news..."
          className="w-48 rounded-full border border-slate-300 bg-slate-50 py-2 pl-9 pr-4 text-sm focus:border-red-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-400 md:w-56 lg:w-64 xl:w-72"
        />
        {dropdown}
      </form>
    );
  }

  return (
    <div className="relative flex items-center">
      {open && (
        <form onSubmit={handleSubmit} className="relative mr-1">
          <label htmlFor="site-search" className="sr-only">
            Search articles
          </label>
          <input
            id="site-search"
            type="search"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
            placeholder="Search..."
            className="w-36 rounded-full border border-slate-300 px-3 py-1.5 text-sm focus:border-red-400 focus:outline-none sm:w-56"
          />
          {dropdown}
        </form>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close search" : "Open search"}
        aria-expanded={open}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>
    </div>
  );
}
