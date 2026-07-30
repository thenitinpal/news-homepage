// Cloudflare Worker entry point (Workers + static assets model). This single
// script does three things:
//   1. Serves /sitemap.xml dynamically from Supabase.
//   2. Serves pre-rendered HTML to known AI/search crawlers on "/", "/article/:id",
//      and "/category/:slug" — see edge/botRender.ts for the shared logic also
//      used by the Vercel version (middleware.ts).
//   3. Otherwise, falls through to the static Vite build via the ASSETS binding
//      (which also handles SPA routing for humans, via not_found_handling in
//      wrangler.jsonc).
import { createClient } from "@supabase/supabase-js";
import {
  BOT_PATTERN,
  CATEGORY_LABELS,
  htmlResponse,
  renderArticlePage,
  renderCategoryPage,
  renderHomePage,
  type ArticleRow,
} from "../edge/botRender";
import { buildSitemapXml } from "../edge/sitemap";

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

async function handleSitemap(env: Env, origin: string): Promise<Response> {
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    return new Response("Missing Supabase configuration", { status: 500 });
  }
  const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
  const { data: articles } = await supabase
    .from("articles")
    .select("id, published_at")
    .order("published_at", { ascending: false });

  return new Response(buildSitemapXml(origin, articles ?? []), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

async function handleBotRequest(url: URL, env: Env): Promise<Response | null> {
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) return null;
  const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

  const articleMatch = url.pathname.match(/^\/article\/([^/]+)\/?$/);
  if (articleMatch) {
    const { data: article } = await supabase
      .from("articles")
      .select("*")
      .eq("id", articleMatch[1])
      .maybeSingle<ArticleRow>();
    if (!article) return null;
    return htmlResponse(renderArticlePage(article, url.toString()));
  }

  const categoryMatch = url.pathname.match(/^\/category\/([^/]+)\/?$/);
  if (categoryMatch) {
    const slug = categoryMatch[1];
    const label = CATEGORY_LABELS[slug];
    if (!label) return null;
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

  return null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/sitemap.xml") {
      return handleSitemap(env, url.origin);
    }

    const userAgent = request.headers.get("user-agent") ?? "";
    if (BOT_PATTERN.test(userAgent)) {
      const botResponse = await handleBotRequest(url, env);
      if (botResponse) return botResponse;
    }

    return env.ASSETS.fetch(request);
  },
};
