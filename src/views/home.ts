import type { IndexEntry } from "../types";
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

export function homePage(entries: IndexEntry[], clientLabels: Map<string, string>): string {
  const cards = entries
    .map((e) => {
      const media = e.preview_image
        ? `<div class="card-media"><img src="${escapeHtml(e.preview_image)}" alt="" loading="lazy"/></div>`
        : `<div class="card-media" aria-hidden="true"></div>`;
      const ids = effectiveEntryClientIds(e).filter((cid) => clientLabels.has(cid));
      const client = ids.length ?
        ids.map((cid) => `<span class="client-pill">${escapeHtml(clientLabels.get(cid)!)}</span>`).join(" ")
      : "";
      const summary =
        e.summary.length > 160 ? `${escapeHtml(e.summary.slice(0, 160))}…` : escapeHtml(e.summary);
      return `
      <a href="/${escapeHtml(e.id)}" class="project-card">
        ${media}
        <div class="card-body">
          <h2 class="card-title">${escapeHtml(e.title)}</h2>
          <p class="card-summary">${summary}</p>
          ${client}
        </div>
      </a>`;
    })
    .join("");

  const grid = cards ? `<div class="card-grid">${cards}</div>` : `<p class="empty-state">No projects yet.</p>`;

  const inner = `
<header class="site-nav">
  <a class="brand" href="/">Work</a>
</header>
<main class="page">
  <header class="hero">
    <h1>Projects</h1>
    <p class="lede">Portfolio work · filter with <code>?tag=</code> and <code>?client=&lt;client id&gt;</code> (matches primary or any via client).</p>
  </header>
  ${grid}
</main>`;

  return layoutPage("Projects", inner);
}
