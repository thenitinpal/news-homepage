import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { buildSitemapXml } from "../edge/sitemap";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    res.status(500).send("Missing Supabase configuration");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: articles } = await supabase
    .from("articles")
    .select("id, published_at")
    .order("published_at", { ascending: false });

  const origin = `https://${req.headers.host}`;
  const xml = buildSitemapXml(origin, articles ?? []);

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(xml);
}
