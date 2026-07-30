import { Link } from "react-router-dom";
import type { Article } from "../data/articles";

interface TickerProps {
  articles: Article[];
}

export function Ticker({ articles }: TickerProps) {
  if (articles.length === 0) return null;

  // Duplicated so the -50% translateX loop is seamless.
  const items = [...articles, ...articles];

  return (
    <div className="overflow-hidden bg-red-600 text-white" aria-label="Breaking news">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 sm:px-6">
        <span className="shrink-0 rounded bg-white/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
          Breaking
        </span>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex w-max animate-[ticker_32s_linear_infinite] gap-10 whitespace-nowrap hover:[animation-play-state:paused]">
            {items.map((article, i) => (
              <Link
                key={`${article.id}-${i}`}
                to={`/article/${article.id}`}
                className="text-sm font-medium hover:underline"
              >
                {article.headline}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
