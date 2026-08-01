import { Link } from "react-router-dom";
import type { Article } from "../data/articles";
import { categoryLabels } from "../data/articles";
import { formatRelativeTime } from "../utils/time";
import { stripFormatting, truncateText } from "../utils/richText";

interface HeroProps {
  featured: Article;
  secondary: Article[];
}

export function Hero({ featured, secondary }: HeroProps) {
  return (
    <section aria-label="Top stories" className="grid gap-6 lg:grid-cols-3">
      <Link to={`/article/${featured.id}`} className="group lg:col-span-2">
        <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
          <img
            src={featured.image}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
        <span className="mt-4 inline-block text-xs font-bold uppercase tracking-wide text-red-600">
          {categoryLabels[featured.category]}
        </span>
        <h1 className="mt-2 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
          {featured.headline}
        </h1>
        <p className="mt-2 text-slate-600">{truncateText(stripFormatting(featured.excerpt), 200)}</p>
        <p className="mt-2 text-sm text-slate-400">{formatRelativeTime(featured.timestamp)}</p>
      </Link>

      <div className="flex flex-col">
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-400">
          More Top Stories
        </h2>
        {secondary.slice(0, 5).map((article) => (
          <Link
            key={article.id}
            to={`/article/${article.id}`}
            className="group flex gap-3 border-b border-slate-100 py-3 last:border-0"
          >
            <img
              src={article.image}
              alt=""
              className="h-16 w-20 shrink-0 rounded-md object-cover"
              loading="lazy"
            />
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wide text-blue-600">
                {categoryLabels[article.category]}
              </span>
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800 group-hover:text-red-600">
                {article.headline}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
