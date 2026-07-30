import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const STATIC_PATHS = [
  "",
  "who-we-are",
  "editorial-team",
  "advertise",
  "contact",
  "category/india",
  "category/world",
  "category/us",
  "category/europe",
  "category/business",
  "category/cricket",
  "category/sports",
  "category/entertainment",
  "category/technology",
  "category/lifestyle",
  "category/opinion",
];

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

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

  const staticUrls = STATIC_PATHS.map(
    (path) => `  <url><loc>${escapeXml(`${origin}/${path}`)}</loc></url>`,
  );

  const articleUrls = (articles ?? []).map((article) => {
    const lastmod = new Date(article.published_at as string).toISOString();
    return `  <url><loc>${escapeXml(`${origin}/article/${article.id}`)}</loc><lastmod>${lastmod}</lastmod></url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...articleUrls].join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(xml);
}
