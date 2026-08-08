// Vercel Routing Middleware — see edge/botRender.ts for the shared rendering
// logic also used by the Cloudflare Pages version (functions/_middleware.ts).
import { next } from "@vercel/functions";
import { createClient } from "@supabase/supabase-js";
import {
  BOT_PATTERN,
  CATEGORY_LABELS,
  htmlResponse,
  renderArticlePage,
  renderCategoryPage,
  renderHomePage,
  type ArticleRow,
} from "./edge/botRender";

export const config = {
  matcher: ["/", "/article/:id*", "/category/:slug*"],
};

export default async function middleware(request: Request) {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (!BOT_PATTERN.test(userAgent)) {
    return next();
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return next();
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const url = new URL(request.url);

  const articleMatch = url.pathname.match(/^\/article\/([^/]+)\/?$/);
  if (articleMatch) {
    const { data: article } = await supabase
      .from("articles")
      .select("*")
      .eq("id", articleMatch[1])
      .maybeSingle<ArticleRow>();

    if (!article) return next();
    return htmlResponse(renderArticlePage(article, url.toString()));
  }

  const categoryMatch = url.pathname.match(/^\/category\/([^/]+)\/?$/);
  if (categoryMatch) {
    const slug = categoryMatch[1];
    const label = CATEGORY_LABELS[slug];
    if (!label) return next();

    const { data: articles } = await supabase
      .from("articles")
      .select("id, headline, excerpt, image")
      .eq("category", slug)
      .order("published_at", { ascending: false })
      .limit(30);

    return htmlResponse(renderCategoryPage(label, articles ?? []));
  }

  if (url.pathname === "/") {
    const { data: articles } = await supabase
      .from("articles")
      .select("id, headline, excerpt, image")
      .order("published_at", { ascending: false })
      .limit(30);

    return htmlResponse(renderHomePage(articles ?? [], url.origin));
  }

  return next();
}
