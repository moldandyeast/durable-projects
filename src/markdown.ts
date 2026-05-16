import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: true,
});

/** Trusted-author markdown → HTML. No wiki-link preprocessing. */
export async function renderMarkdown(md: string): Promise<string> {
  return marked.parse(md, { async: true }) as Promise<string>;
}
