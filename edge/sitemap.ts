// Shared sitemap.xml generation, used by both api/sitemap.xml.ts (Vercel)
// and functions/sitemap.xml.ts (Cloudflare).

export const STATIC_PATHS = [
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

export function buildSitemapXml(
  origin: string,
  articles: { id: string; published_at: string }[],
): string {
  const staticUrls = STATIC_PATHS.map(
    (path) => `  <url><loc>${escapeXml(`${origin}/${path}`)}</loc></url>`,
  );

  const articleUrls = articles.map((article) => {
    const lastmod = new Date(article.published_at).toISOString();
    return `  <url><loc>${escapeXml(`${origin}/article/${article.id}`)}</loc><lastmod>${lastmod}</lastmod></url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...articleUrls].join("\n")}
</urlset>`;
}
