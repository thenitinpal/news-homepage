import { Link } from "react-router-dom";
import type { Article, Category } from "../data/articles";
import { ArticleCard } from "./ArticleCard";

interface CategorySectionProps {
  category: Category;
  title: string;
  articles: Article[];
  limit?: number;
}

export function CategorySection({ category, title, articles, limit = 6 }: CategorySectionProps) {
  const items = articles.slice(0, limit);
  if (items.length === 0) return null;

  return (
    <section aria-labelledby={`section-${category}`}>
      <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-2">
        <h2 id={`section-${category}`} className="text-xl font-bold text-slate-900">
          {title}
        </h2>
        <Link
          to={`/category/${category}`}
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          See more &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
