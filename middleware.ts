// Vercel Routing Middleware — runs before every request to "/", "/article/:id",
// and "/category/:slug". For real browsers, it does nothing (the normal React
// SPA loads as usual). For known AI/search crawlers — which mostly do NOT
// execute JavaScript and would otherwise see an empty <div id="root"></div> —
// it serves a plain, pre-rendered HTML page with the real article content
// already in it, fetched live from Supabase. This is "dynamic rendering," a
// technique Google itself has documented for exactly this problem: both bots
// and humans see the same underlying content, just delivered differently.
import { next } from "@vercel/functions";
import { createClient } from "@supabase/supabase-js";

export const config = {
  matcher: ["/", "/article/:id*", "/category/:slug*"],
};

const BOT_PATTERN =
  /GPTBot|ChatGPT-User|OAI-SearchBot|PerplexityBot|Perplexity-User|ClaudeBot|Claude-User|Claude-SearchBot|Googlebot|Bingbot|facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|WhatsApp|DuckDuckBot|Applebot/i;

const CATEGORY_LABELS: Record<string, string> = {
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

function escapeHtml(value: string): string {
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

function htmlResponse(html: string): Response {
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default async function middleware(request: Request) {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (!BOT_PATTERN.test(userAgent)) {
    return next();
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return next();
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const url = new URL(request.url);

  const articleMatch = url.pathname.match(/^\/article\/([^/]+)\/?$/);
  if (articleMatch) {
    const { data: article } = await supabase
      .from("articles")
      .select("*")
      .eq("id", articleMatch[1])
      .maybeSingle();

    if (!article) return next();

    const categoryLabel = CATEGORY_LABELS[article.category] ?? article.category;
    const html = pageShell({
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
        mainEntityOfPage: { "@type": "WebPage", "@id": url.toString() },
      },
    });

    return htmlResponse(html);
  }

  const categoryMatch = url.pathname.match(/^\/category\/([^/]+)\/?$/);
  if (categoryMatch) {
    const slug = categoryMatch[1];
    const label = CATEGORY_LABELS[slug];
    if (!label) return next();

    const { data: articles } = await supabase
      .from("articles")
      .select("id, headline, excerpt, published_at")
      .eq("category", slug)
      .order("published_at", { ascending: false })
      .limit(30);

    const items = (articles ?? [])
      .map(
        (a) =>
          `<li><a href="/article/${a.id}">${escapeHtml(a.headline)}</a><p>${escapeHtml(a.excerpt)}</p></li>`,
      )
      .join("\n");

    const html = pageShell({
      title: `${label} News | Pal News`,
      description: `The latest ${label} news and headlines from Pal News.`,
      bodyHtml: `<h1>${escapeHtml(label)} News</h1>\n<ul>\n${items}\n</ul>`,
    });

    return htmlResponse(html);
  }

  if (url.pathname === "/") {
    const { data: articles } = await supabase
      .from("articles")
      .select("id, headline, excerpt, published_at")
      .order("published_at", { ascending: false })
      .limit(30);

    const items = (articles ?? [])
      .map(
        (a) =>
          `<li><a href="/article/${a.id}">${escapeHtml(a.headline)}</a><p>${escapeHtml(a.excerpt)}</p></li>`,
      )
      .join("\n");

    const html = pageShell({
      title: "Pal News — Latest News, Breaking Headlines & Top Stories",
      description:
        "Pal News brings you accurate, timely coverage across India, world affairs, business, technology, sports, entertainment, and more.",
      bodyHtml: `<h1>Pal News</h1>\n<ul>\n${items}\n</ul>`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "NewsMediaOrganization",
        name: "Pal News",
        url: url.origin,
      },
    });

    return htmlResponse(html);
  }

  return next();
}
