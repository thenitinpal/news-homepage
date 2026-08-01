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

const NEWS_SITEMAP_WINDOW_MS = 48 * 60 * 60 * 1000;

/**
 * Google News sitemap — must contain only articles published in the last 48 hours
 * (https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap),
 * so Google can discover breaking stories faster than the regular sitemap's crawl cadence.
 */
export function buildNewsSitemapXml(
  origin: string,
  articles: { id: string; headline: string; published_at: string }[],
): string {
  const cutoff = Date.now() - NEWS_SITEMAP_WINDOW_MS;
  const recent = articles.filter((article) => new Date(article.published_at).getTime() >= cutoff);

  const urls = recent.map((article) => {
    const pubDate = new Date(article.published_at).toISOString();
    return `  <url>
    <loc>${escapeXml(`${origin}/article/${article.id}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>Pal News</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(article.headline)}</news:title>
    </news:news>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls.join("\n")}
</urlset>`;
}
