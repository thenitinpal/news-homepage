import { Link } from "react-router-dom";
import type { Article } from "../data/articles";
import { AdPlaceholder } from "./AdPlaceholder";

interface SidebarProps {
  trending: Article[];
  mostRead: Article[];
}

function TextList({ title, articles }: { title: string; articles: Article[] }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">{title}</h2>
      <ol className="space-y-3">
        {articles.map((article, index) => (
          <li key={article.id} className="flex gap-3">
            <span className="text-lg font-extrabold text-slate-200">{index + 1}</span>
            <Link
              to={`/article/${article.id}`}
              className="text-sm font-semibold leading-snug text-slate-800 hover:text-red-600"
            >
              {article.headline}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Sidebar({ trending, mostRead }: SidebarProps) {
  return (
    <aside
      aria-label="Sidebar"
      className="w-full shrink-0 space-y-8 lg:w-80 lg:border-l lg:border-slate-200 lg:pl-8"
    >
      <TextList title="Trending Now" articles={trending} />
      <TextList title="Most Read" articles={mostRead} />
      <div className="space-y-4">
        <AdPlaceholder placement="sidebar-300x250" width={300} height={250} />
        <AdPlaceholder placement="sidebar-300x600" width={300} height={600} />
      </div>
    </aside>
  );
}
