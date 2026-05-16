import type { IndexEntry } from "../types";
import { escapeHtml, layoutPage } from "./shared";

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
      const thumb = e.preview_image ?
          `<img src="${escapeHtml(e.preview_image)}" alt="" width="120" height="80" style="object-fit:cover;border-radius:6px;width:100%;max-height:140px"/>`
      : `<div style="height:120px;background:#eee;border-radius:6px"></div>`;
      const client =
        e.client_id && clientLabels.has(e.client_id) ?
          `<span class="muted">${escapeHtml(clientLabels.get(e.client_id)!)}</span>`
        : "";
      return `
      <a href="/${escapeHtml(e.id)}" style="text-decoration:none;color:inherit;display:block;background:var(--card);border:1px solid var(--border);border-radius:10px;overflow:hidden">
        ${thumb}
        <div style="padding:0.85rem 1rem">
          <div style="font-weight:600">${escapeHtml(e.title)}</div>
          <div class="muted" style="margin-top:0.25rem;font-size:0.9rem">${escapeHtml(e.summary.slice(0, 140))}${e.summary.length > 140 ? "…" : ""}</div>
          ${client ? `<div style="margin-top:0.5rem">${client}</div>` : ""}
        </div>
      </a>`;
    })
    .join("");

  const grid = cards ?
      `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1.25rem">${cards}</div>`
    : `<p class="muted">No projects yet.</p>`;

  const inner = `
<main>
  <header style="margin-bottom:2rem">
    <h1 style="margin:0">Projects</h1>
    <p class="muted" style="margin:0.5rem 0 0">Portfolio work · filter with <code>?tag=</code> and <code>?client=&lt;client id&gt;</code></p>
  </header>
  ${grid}
</main>`;

  return layoutPage("Projects", inner);
}
