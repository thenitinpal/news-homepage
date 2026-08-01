import type { ReactNode } from "react";

// Matches [label](url) — url must be an absolute http(s) link or a site-relative path,
// so we never render a javascript: or other unsafe scheme.
const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g;

/** Plain-text preview (cards, hero, meta description) — drops the markdown link syntax. */
export function stripLinks(text: string): string {
  return text.replace(LINK_PATTERN, "$1");
}

/** Full body rendering — turns [label](url) into a real, clickable link. */
export function renderTextWithLinks(text: string): ReactNode {
  return text.split(/\n{2,}/).map((paragraph, index) => (
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
      nodes.push(...withLineBreaks(paragraph.slice(lastIndex, match.index), key));
      key += 1;
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
    nodes.push(...withLineBreaks(paragraph.slice(lastIndex), key));
  }

  return nodes;
}

function withLineBreaks(text: string, keyBase: number): ReactNode[] {
  const lines = text.split("\n");
  return lines.flatMap((line, i) =>
    i === 0 ? [line] : [<br key={`br-${keyBase}-${i}`} />, line],
  );
}
