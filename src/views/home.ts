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

function indexNumber(idx: number, year: string): string {
  const n = String(idx).padStart(3, "0");
  const y = year.trim();
  const yearPart = y ?
    `<span class="index__num-sep"> / </span><span class="index__num-year">${escapeHtml(y)}</span>`
  : "";
  return `<span class="index__num" aria-hidden="true"><span class="index__num-n">${n}</span>${yearPart}</span>`;
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

function indexRow(entry: IndexEntry, idx: number, clientLabels: Map<string, string>): string {
  const ids = effectiveEntryClientIds(entry).filter((cid) => clientLabels.has(cid));
  const clientLabel = ids
    .map((cid) => escapeHtml(clientLabels.get(cid)!).toUpperCase())
    .join(' <span class="index__client-sep" aria-hidden="true">·</span> ');
  const clientHtml = clientLabel ? `<div class="index__clients">${clientLabel}</div>` : "";
  const summary =
    entry.summary.length > 200 ? `${escapeHtml(entry.summary.slice(0, 200))}…` : escapeHtml(entry.summary);
  const dek = summary ? `<p class="index__dek">${summary}</p>` : "";
  const media = renderIndexMedia(entry.preview_image);
  // Alternate body/media side every other row for a Gerstner-style rhythm.
  const flipClass = idx % 2 === 1 ? " index__row--flip" : "";
  return `<a class="index__row${flipClass}" href="/${escapeHtml(entry.id)}">
  ${indexNumber(idx + 1, entry.sort_date ?? "")}
  <div class="index__body">
    <h2 class="index__title">${escapeHtml(entry.title)}</h2>
    ${dek}
    ${clientHtml}
  </div>
  ${media}
</a>`;
}

export function homePage(entries: IndexEntry[], clientLabels: Map<string, string>): string {
  const rows = entries.map((e, i) => indexRow(e, i, clientLabels)).join("\n");
  const list =
    rows ? `<ol class="index__list">${rows}</ol>` : `<p class="index__empty">No projects yet.</p>`;
  const count = entries.length;
  const countLabel = `${count} ${count === 1 ? "Project" : "Projects"}`;

  const inner = `<header class="site-nav">
  <div class="site-nav__inner">
    <a class="brand" href="/">Work</a>
    <span class="site-nav__meta">Selected · ${countLabel}</span>
  </div>
</header>
<main class="page page--index">
  <article class="index">
    <hr class="project__rule" aria-hidden="true"/>
    <header class="project__row index__hero">
      <span class="project__index" aria-hidden="true"><span class="project__index-num">000</span><span class="project__index-sep"> / </span><span class="project__index-label">Index</span></span>
      <div class="project__hero-text">
        <h1 class="project__title">Selected work</h1>
        <p class="project__dek">10× design, engineered. <span class="index__hero-meta">Filter via <code>?tag=</code> or <code>?client=&lt;id&gt;</code>.</span></p>
      </div>
    </header>
    <hr class="project__rule" aria-hidden="true"/>
    ${list}
  </article>
</main>`;

  return layoutPage("Projects", inner, { bodyClass: "page-index" });
}
