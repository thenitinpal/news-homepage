// Shared logic for serving pre-rendered HTML to AI/search crawlers, used by
// both the Vercel Middleware (middleware.ts) and the Cloudflare Pages
// Function (functions/_middleware.ts). Keeping this in one place means the
// two platform-specific entry points can't drift out of sync with each other.

export const BOT_PATTERN =
  /GPTBot|ChatGPT-User|OAI-SearchBot|PerplexityBot|Perplexity-User|ClaudeBot|Claude-User|Claude-SearchBot|Googlebot|Bingbot|facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|WhatsApp|DuckDuckBot|Applebot/i;

export const CATEGORY_LABELS: Record<string, string> = {
  india: "India",
  world: "World",
  us: "US",
  europe: "Europe",
  business: "Business",
  cricket: "Cricket",
  sports: "Sports",
  entertainment: "Entertainment",
  technology: "Technology",
  lifestyle: "Lifestyle",
  opinion: "Opinion",
};

export interface ArticleRow {
  id: string;
  headline: string;
  excerpt: string;
  image: string | null;
  category: string;
  published_at: string;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pageShell(options: {
  title: string;
  description: string;
  image?: string | null;
  bodyHtml: string;
  jsonLd?: Record<string, unknown>;
}): string {
  const { title, description, image, bodyHtml, jsonLd } = options;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta property="og:site_name" content="Pal News" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
${image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : ""}
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ""}
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

export function htmlResponse(html: string): Response {
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export function renderArticlePage(article: ArticleRow, pageUrl: string): string {
  const categoryLabel = CATEGORY_LABELS[article.category] ?? article.category;
  return pageShell({
    title: `${article.headline} | Pal News`,
    description: article.excerpt,
    image: article.image,
    bodyHtml: `<article>
  <p>${escapeHtml(categoryLabel)}</p>
  <h1>${escapeHtml(article.headline)}</h1>
  <time datetime="${article.published_at}">${new Date(article.published_at).toDateString()}</time>
  ${article.image ? `<img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.headline)}" />` : ""}
  <p>${escapeHtml(article.excerpt)}</p>
</article>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: article.headline,
      description: article.excerpt,
      image: article.image ? [article.image] : undefined,
      datePublished: article.published_at,
      dateModified: article.published_at,
      articleSection: categoryLabel,
      author: { "@type": "Organization", name: "Pal News" },
      publisher: { "@type": "Organization", name: "Pal News" },
      mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    },
  });
}

export function renderCategoryPage(
  label: string,
  articles: Pick<ArticleRow, "id" | "headline" | "excerpt">[],
): string {
  const items = articles
    .map(
      (a) =>
        `<li><a href="/article/${a.id}">${escapeHtml(a.headline)}</a><p>${escapeHtml(a.excerpt)}</p></li>`,
    )
    .join("\n");

  return pageShell({
    title: `${label} News | Pal News`,
    description: `The latest ${label} news and headlines from Pal News.`,
    bodyHtml: `<h1>${escapeHtml(label)} News</h1>\n<ul>\n${items}\n</ul>`,
  });
}

export function renderHomePage(
  articles: Pick<ArticleRow, "id" | "headline" | "excerpt">[],
  origin: string,
): string {
  const items = articles
    .map(
      (a) =>
        `<li><a href="/article/${a.id}">${escapeHtml(a.headline)}</a><p>${escapeHtml(a.excerpt)}</p></li>`,
    )
    .join("\n");

  return pageShell({
    title: "Pal News — Latest News, Breaking Headlines & Top Stories",
    description:
      "Pal News brings you accurate, timely coverage across India, world affairs, business, technology, sports, entertainment, and more.",
    bodyHtml: `<h1>Pal News</h1>\n<ul>\n${items}\n</ul>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "NewsMediaOrganization",
      name: "Pal News",
      url: origin,
    },
  });
}
