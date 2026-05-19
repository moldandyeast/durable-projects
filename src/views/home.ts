import type { IndexEntry } from "../types";
import { detectMediaKind, parseStreamUrl, streamIframeUrl } from "./media";
import { escapeHtml, layoutPage } from "./shared";

/** Supports legacy index rows with only `client_id`. */
function effectiveEntryClientIds(e: IndexEntry): string[] {
  if (e.client_ids?.length) return e.client_ids;
  if (e.client_id) return [e.client_id];
  return [];
}

export function sortEntries(entries: IndexEntry[]): IndexEntry[] {
  return [...entries].sort((a, b) => {
    const as = a.sort_date ?? "";
    const bs = b.sort_date ?? "";
    if (as === "" && bs === "") return b.edited_at.localeCompare(a.edited_at);
    if (as === "") return 1;
    if (bs === "") return -1;
    if (bs !== as) return bs.localeCompare(as);
    return b.edited_at.localeCompare(a.edited_at);
  });
}

function renderIndexMedia(url: string | undefined): string {
  if (!url) return `<div class="index__media index__media--empty" aria-hidden="true"></div>`;
  const kind = detectMediaKind(url);
  if (kind === "video-stream") {
    const ref = parseStreamUrl(url);
    if (ref) {
      const src = streamIframeUrl(ref, { loop: true });
      return `<div class="index__media index__media--video"><iframe class="index__media-iframe" src="${escapeHtml(src)}" title="" aria-hidden="true" tabindex="-1" loading="lazy" allow="autoplay; encrypted-media" referrerpolicy="origin"></iframe></div>`;
    }
  }
  if (kind === "video-file") {
    return `<div class="index__media index__media--video"><video class="index__media-video" src="${escapeHtml(url)}" autoplay loop muted playsinline preload="metadata" aria-hidden="true"></video></div>`;
  }
  return `<div class="index__media"><img src="${escapeHtml(url)}" alt="" loading="lazy" decoding="async"/></div>`;
}

function indexCard(entry: IndexEntry, clientLabels: Map<string, string>): string {
  const ids = effectiveEntryClientIds(entry).filter((cid) => clientLabels.has(cid));
  const clientLabels_ = ids.map((cid) => escapeHtml(clientLabels.get(cid)!).toUpperCase());
  const year = (entry.sort_date ?? "").trim();
  const metaParts = [...clientLabels_];
  if (year) metaParts.push(escapeHtml(year));
  const metaHtml = metaParts.length ?
    `<p class="index__meta">${metaParts.join(' <span class="index__meta-sep" aria-hidden="true">·</span> ')}</p>`
  : "";
  const media = renderIndexMedia(entry.preview_image);
  return `<a class="index__row" href="/${escapeHtml(entry.id)}">
  ${media}
  <div class="index__body">
    <h2 class="index__title">${escapeHtml(entry.title)}</h2>
    ${metaHtml}
  </div>
</a>`;
}

export function homePage(entries: IndexEntry[], clientLabels: Map<string, string>): string {
  const cards = entries.map((e) => indexCard(e, clientLabels)).join("\n");
  const list =
    cards ? `<ol class="index__list">${cards}</ol>` : `<p class="index__empty">No projects yet.</p>`;
  const count = entries.length;
  const countLabel = `${count} ${count === 1 ? "Project" : "Projects"}`;

  const inner = `<header class="site-nav">
  <div class="site-nav__inner">
    <a class="brand" href="/">Work</a>
    <span class="site-nav__meta">${countLabel}</span>
  </div>
</header>
<main class="page page--index">
  <article class="index">
    <hr class="project__rule" aria-hidden="true"/>
    <header class="project__row index__hero">
      <span class="project__index" aria-hidden="true"><span class="project__index-num">000</span><span class="project__index-sep"> / </span><span class="project__index-label">Index</span></span>
      <div class="project__hero-text index__intro">
        <h1 class="project__title index__display">Hello there.</h1>
        <p class="index__lede">Below is a selection of some of my work of the last few years. For more please reach out to <a href="mailto:hej@ramonmarc.com">hej@ramonmarc.com</a> or <a href="https://twitter.com/nilsedison" rel="noopener noreferrer">@nilsedison</a>.</p>
      </div>
    </header>
    <hr class="project__rule" aria-hidden="true"/>
    ${list}
  </article>
</main>`;

  return layoutPage("Projects", inner, { bodyClass: "page-index" });
}
