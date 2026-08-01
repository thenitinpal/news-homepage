import type { ReactNode } from "react";

// Inline markup, applied within a single line:
//   [label](url)   -> link (url must be absolute http(s) or a site-relative path)
//   _text_         -> underline
const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/;
const UNDERLINE_PATTERN = /_([^_\n]+)_/;
const INLINE_SOURCE = `${LINK_PATTERN.source}|${UNDERLINE_PATTERN.source}`;

// Block-level markup, checked at the start of a line: "#", "##", or "### " -> heading.
// Rendered one level below the page's own <h1> (the headline) to keep a valid heading
// hierarchy, so "H1" in the admin toolbar becomes an <h2>, and so on.
const HEADING_PATTERN = /^(#{1,3})\s+(.*)$/;

/** Plain-text preview (cards, hero, meta description, JSON-LD) — drops all markup, keeps only the words. */
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

/** Collapses to plain text and cuts to maxChars on a word boundary, for a short teaser preview. */
export function truncateText(text: string, maxChars = 200): string {
  if (text.length <= maxChars) return text;

  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/** Full body rendering (the dedicated article page) — headings, underline, and links all render for real. */
export function renderFormattedBody(text: string): ReactNode {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line, index) => {
    const spacing = index > 0 ? "mt-4" : undefined;
    const heading = line.match(HEADING_PATTERN);
    if (heading) {
      const content = renderInline(heading[2]);
      const level = heading[1].length;
      if (level === 1) {
        return (
          <h2 key={index} className={`${spacing ?? ""} text-2xl font-bold text-slate-900`}>
            {content}
          </h2>
        );
      }
      if (level === 2) {
        return (
          <h3 key={index} className={`${spacing ?? ""} text-xl font-bold text-slate-900`}>
            {content}
          </h3>
        );
      }
      return (
        <h4 key={index} className={`${spacing ?? ""} text-lg font-semibold text-slate-900`}>
          {content}
        </h4>
      );
    }
    return (
      <p key={index} className={spacing}>
        {renderInline(line)}
      </p>
    );
  });
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = new RegExp(INLINE_SOURCE, "g");
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const [full, linkLabel, url, underlineText] = match;
    if (linkLabel !== undefined) {
      const isExternal = url.startsWith("http");
      nodes.push(
        <a
          key={`n-${key++}`}
          href={url}
          className="font-medium text-red-600 underline underline-offset-2 hover:text-red-700"
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {linkLabel}
        </a>,
      );
    } else if (underlineText !== undefined) {
      nodes.push(<u key={`n-${key++}`}>{underlineText}</u>);
    }
    lastIndex = match.index + full.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}
