// Cloudflare Pages Function — Cloudflare's equivalent of middleware.ts (Vercel).
// See edge/botRender.ts for the shared rendering logic both versions use.
import { createClient } from "@supabase/supabase-js";
import type { PagesFunction } from "@cloudflare/workers-types";
import {
  BOT_PATTERN,
  CATEGORY_LABELS,
  htmlResponse,
  renderArticlePage,
  renderCategoryPage,
  renderHomePage,
  type ArticleRow,
} from "../edge/botRender";

interface Env {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const userAgent = request.headers.get("user-agent") ?? "";
  if (!BOT_PATTERN.test(userAgent)) {
    return context.next();
  }

  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return context.next();
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

    if (!article) return context.next();
    return htmlResponse(renderArticlePage(article, url.toString()));
  }

  const categoryMatch = url.pathname.match(/^\/category\/([^/]+)\/?$/);
  if (categoryMatch) {
    const slug = categoryMatch[1];
    const label = CATEGORY_LABELS[slug];
    if (!label) return context.next();

    const { data: articles } = await supabase
      .from("articles")
      .select("id, headline, excerpt")
      .eq("category", slug)
      .order("published_at", { ascending: false })
      .limit(30);

    return htmlResponse(renderCategoryPage(label, articles ?? []));
  }

  if (url.pathname === "/") {
    const { data: articles } = await supabase
      .from("articles")
      .select("id, headline, excerpt")
      .order("published_at", { ascending: false })
      .limit(30);

    return htmlResponse(renderHomePage(articles ?? [], url.origin));
  }

  return context.next();
};
