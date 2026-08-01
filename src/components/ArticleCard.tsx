import { Link } from "react-router-dom";
import type { Article } from "../data/articles";
import { categoryLabels } from "../data/articles";
import { formatRelativeTime } from "../utils/time";
import { stripLinks } from "../utils/richText";

interface ArticleCardProps {
  article: Article;
  /** Compact rows skip the excerpt and shrink the thumbnail — used in dense secondary lists. */
  compact?: boolean;
}

export function ArticleCard({ article, compact = false }: ArticleCardProps) {
  if (compact) {
    return (
      <Link
        to={`/article/${article.id}`}
        className="group flex gap-3 border-b border-slate-100 py-3 last:border-0"
      >
        <img
          src={article.image}
          alt=""
          width={80}
          height={64}
          className="h-16 w-20 shrink-0 rounded-md object-cover"
          loading="lazy"
        />
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800 group-hover:text-red-600">
            {article.headline}
          </h3>
          <p className="mt-1 text-xs text-slate-400">{formatRelativeTime(article.timestamp)}</p>
        </div>
      </Link>
    );
  }

  return (
    <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-md">
      <Link to={`/article/${article.id}`}>
        <div className="aspect-[16/10] overflow-hidden bg-slate-100">
          <img
            src={article.image}
            alt=""
            width={800}
            height={500}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="p-4">
        <Link
          to={`/category/${article.category}`}
          className="text-xs font-bold uppercase tracking-wide text-red-600 hover:underline"
        >
          {categoryLabels[article.category]}
        </Link>
        <Link to={`/article/${article.id}`}>
          <h3 className="mt-1.5 line-clamp-2 text-base font-bold leading-snug text-slate-900 group-hover:text-red-600">
            {article.headline}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">{stripLinks(article.excerpt)}</p>
          <p className="mt-2 text-xs font-medium text-slate-400">
            {formatRelativeTime(article.timestamp)}
          </p>
        </Link>
      </div>
    </article>
  );
}
