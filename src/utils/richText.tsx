// Matches [label](url) — url must be an absolute http(s) link or a site-relative path,
// so we never render a javascript: or other unsafe scheme.
const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g;

/** Plain-text preview (cards, hero, meta description) — drops the markdown link syntax. */
export function stripLinks(text: string): string {
  return text.replace(LINK_PATTERN, "$1");
}

/** Collapses line breaks and cuts to maxChars on a word boundary, for a short teaser preview. */
export function truncateText(text: string, maxChars = 200): string {
  const flat = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");

  if (flat.length <= maxChars) return flat;

  const cut = flat.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
