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
  meta_title?: string | null;
  meta_description?: string | null;
  focus_keyword?: string | null;
  secondary_keywords?: string | null;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Matches [label](url) — same convention as the admin "Insert link" tool. Url must be an
// absolute http(s) link or a site-relative path, so we never render an unsafe scheme.
const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g;

/** Plain-text (meta description, JSON-LD) — drops the markdown link syntax. */
export function stripLinks(text: string): string {
  return text.replace(LINK_PATTERN, "$1");
}

/**
 * Body HTML — every line becomes its own <p> (matching the article page's paragraph
 * rendering); [label](url) becomes a real <a> tag.
 */
function linkedHtml(text: string): string {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${linkedLineHtml(line)}</p>`)
    .join("\n");
}

function linkedLineHtml(text: string): string {
  const pattern = new RegExp(LINK_PATTERN);
  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    result += escapeHtml(text.slice(lastIndex, match.index));
    const [full, label, url] = match;
    const external = url.startsWith("http");
    result += `<a href="${escapeHtml(url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(label)}</a>`;
    lastIndex = match.index + full.length;
  }
  result += escapeHtml(text.slice(lastIndex));
  return result;
}

function pageShell(options: {
  title: string;
  description: string;
  image?: string | null;
  keywords?: string | null;
  bodyHtml: string;
  jsonLd?: Record<string, unknown>;
}): string {
  const { title, description, image, keywords, bodyHtml, jsonLd } = options;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : ""}
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
  const title = article.meta_title || article.headline;
  const description = stripLinks(article.meta_description || article.excerpt);
  const keywords = [article.focus_keyword, article.secondary_keywords].filter(Boolean).join(", ");
  return pageShell({
    title: `${title} | Pal News`,
    description,
    image: article.image,
    keywords: keywords || null,
    bodyHtml: `<article>
  <p>${escapeHtml(categoryLabel)}</p>
  <h1>${escapeHtml(article.headline)}</h1>
  <time datetime="${article.published_at}">${new Date(article.published_at).toDateString()}</time>
  ${article.image ? `<img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.headline)}" />` : ""}
  ${linkedHtml(article.excerpt)}
</article>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: title,
      description,
      image: article.image ? [article.image] : undefined,
      datePublished: article.published_at,
      dateModified: article.published_at,
      articleSection: categoryLabel,
      ...(keywords ? { keywords } : {}),
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
        `<li><a href="/article/${a.id}">${escapeHtml(a.headline)}</a><p>${escapeHtml(stripLinks(a.excerpt))}</p></li>`,
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
        `<li><a href="/article/${a.id}">${escapeHtml(a.headline)}</a><p>${escapeHtml(stripLinks(a.excerpt))}</p></li>`,
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
