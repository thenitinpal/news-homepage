import type { ReactNode } from "react";

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

/** Full body rendering (the dedicated article page) — every line is its own paragraph; [label](url) becomes a real link. */
export function renderTextWithLinks(text: string): ReactNode {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={index} className={index > 0 ? "mt-4" : undefined}>
        {renderParagraph(paragraph)}
      </p>
    ));
}

function renderParagraph(paragraph: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = new RegExp(LINK_PATTERN);
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(paragraph)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(paragraph.slice(lastIndex, match.index));
    }
    const [full, label, url] = match;
    const isExternal = url.startsWith("http");
    nodes.push(
      <a
        key={`link-${key++}`}
        href={url}
        className="font-medium text-red-600 underline underline-offset-2 hover:text-red-700"
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {label}
      </a>,
    );
    lastIndex = match.index + full.length;
  }

  if (lastIndex < paragraph.length) {
    nodes.push(paragraph.slice(lastIndex));
  }

  return nodes;
}
