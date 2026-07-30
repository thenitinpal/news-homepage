import { createClient } from "@supabase/supabase-js";
import type { PagesFunction } from "@cloudflare/workers-types";
import { buildSitemapXml } from "../edge/sitemap";

interface Env {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response("Missing Supabase configuration", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: articles } = await supabase
    .from("articles")
    .select("id, published_at")
    .order("published_at", { ascending: false });

  const origin = new URL(request.url).origin;
  const xml = buildSitemapXml(origin, articles ?? []);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
};
