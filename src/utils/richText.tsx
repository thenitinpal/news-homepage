import type { ReactNode } from "react";

// Matches [label](url) — url must be an absolute http(s) link or a site-relative path,
// so we never render a javascript: or other unsafe scheme.
const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g;

/** Plain-text preview (cards, hero, meta description) — drops the markdown link syntax. */
export function stripLinks(text: string): string {
  return text.replace(LINK_PATTERN, "$1");
}

/**
 * Single flowing block of inline nodes (line breaks collapsed to spaces) — turns [label](url)
 * into a real link. Meant to sit inside a container with `line-clamp-*`, since CSS line-clamp
 * only reliably truncates a single block of inline content, not separate <p> children.
 */
export function renderInlineWithLinks(text: string): ReactNode[] {
  const flat = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");

  const nodes: ReactNode[] = [];
  const pattern = new RegExp(LINK_PATTERN);
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(flat)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(flat.slice(lastIndex, match.index));
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

  if (lastIndex < flat.length) {
    nodes.push(flat.slice(lastIndex));
  }

  return nodes;
}
