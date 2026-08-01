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

// Inline markup, same convention as the admin toolbar:
//   [label](url) -> link (url must be absolute http(s) or a site-relative path)
//   _text_       -> underline
const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/;
const UNDERLINE_PATTERN = /_([^_\n]+)_/;
const INLINE_SOURCE = `${LINK_PATTERN.source}|${UNDERLINE_PATTERN.source}`;

// Block-level markup: "#", "##", or "### " at the start of a line -> heading, rendered one
// level below the page's own <h1> (the headline) to keep a valid heading hierarchy.
const HEADING_PATTERN = /^(#{1,3})\s+(.*)$/;

/** Plain-text (meta description, JSON-LD) — drops all markup, keeps only the words. */
export function stripFormatting(text: string): string {
  const flat = text
    .split("\n")
    .map((line) => line.trim().replace(HEADING_PATTERN, "$2").trim())
    .filter(Boolean)
    .join(" ");

  return flat.replace(new RegExp(INLINE_SOURCE, "g"), (...args) => {
    const [, linkLabel, , underlineText] = args as (string | undefined)[];
    return linkLabel ?? underlineText ?? "";
  });
}

/**
 * Body HTML — headings become real <h2>/<h3>/<h4> tags, every other line becomes its own
 * <p> (matching the article page's rendering); [label](url) and _underline_ render for real.
 */
function formattedBodyHtml(text: string): string {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const heading = line.match(HEADING_PATTERN);
      if (heading) {
        const level = heading[1].length;
        const tag = level === 1 ? "h2" : level === 2 ? "h3" : "h4";
        return `<${tag}>${inlineHtml(heading[2])}</${tag}>`;
      }
      return `<p>${inlineHtml(line)}</p>`;
    })
    .join("\n");
}

function inlineHtml(text: string): string {
  const pattern = new RegExp(INLINE_SOURCE, "g");
  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    result += escapeHtml(text.slice(lastIndex, match.index));
    const [full, linkLabel, url, underlineText] = match;
    if (linkLabel !== undefined) {
      const external = url.startsWith("http");
      result += `<a href="${escapeHtml(url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(linkLabel)}</a>`;
    } else if (underlineText !== undefined) {
      result += `<u>${escapeHtml(underlineText)}</u>`;
    }
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
  const description = stripFormatting(article.meta_description || article.excerpt);
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
  ${formattedBodyHtml(article.excerpt)}
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
      author: { "@type": "Person", name: "Nitin Pal" },
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
        `<li><a href="/article/${a.id}">${escapeHtml(a.headline)}</a><p>${escapeHtml(stripFormatting(a.excerpt))}</p></li>`,
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
        `<li><a href="/article/${a.id}">${escapeHtml(a.headline)}</a><p>${escapeHtml(stripFormatting(a.excerpt))}</p></li>`,
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
