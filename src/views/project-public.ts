import type { Client, GalleryImage, ProjectData, TeamMember } from "../types";
import { escapeHtml, layoutPage } from "./shared";

function gallerySection(images: GalleryImage[]): string {
  if (!images.length) return "";
  const figures = images
    .map((img) => {
      const alt = escapeHtml(img.alt ?? "");
      const cap = img.caption ? `<figcaption class="muted">${escapeHtml(img.caption)}</figcaption>` : "";
      return `<figure style="margin:0 0 1rem"><img src="${escapeHtml(img.url)}" alt="${alt}" style="max-width:100%;height:auto;border-radius:6px"/>${cap}</figure>`;
    })
    .join("\n");
  return `<section style="margin:2rem 0"><h2 class="muted" style="font-size:1rem;margin-bottom:0.75rem">Gallery</h2><div style="display:grid;gap:1rem">${figures}</div></section>`;
}

function teamSection(team: TeamMember[]): string {
  if (!team.length) return "";
  const items = team
    .map((m) => {
      const role = m.role ? ` <span class="muted">— ${escapeHtml(m.role)}</span>` : "";
      const link = m.url
        ? `<a href="${escapeHtml(m.url)}" rel="noopener noreferrer">${escapeHtml(m.name)}</a>${role}`
        : `<strong>${escapeHtml(m.name)}</strong>${role}`;
      return `<li style="margin:0.35rem 0">${link}</li>`;
    })
    .join("");
  return `<section style="margin:2rem 0"><h2 class="muted" style="font-size:1rem;margin-bottom:0.5rem">Team</h2><ul style="margin:0;padding-left:1.2rem">${items}</ul></section>`;
}

function sortDateDisplay(sort_date: string | undefined): string {
  if (!sort_date?.trim()) return "";
  const y = sort_date.slice(0, 4);
  return y.length === 4 ? y : escapeHtml(sort_date);
}

export function projectPublicPage(project: ProjectData, team: TeamMember[], client: Client | undefined): string {
  const clientLine = client
    ? client.url
      ? `<p class="muted">${escapeHtml(client.name)} · <a href="${escapeHtml(client.url)}">${escapeHtml(client.url.replace(/^https?:\/\//, ""))}</a></p>`
      : `<p class="muted">${escapeHtml(client.name)}</p>`
    : "";

  const tags =
    project.tags?.length ?
      `<p>${project.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</p>`
    : "";

  const sd = sortDateDisplay(project.sort_date);

  const inner = `
<main>
  <p class="muted"><a href="/">← Projects</a></p>
  <article>
    <header style="margin-bottom:2rem">
      <h1 style="margin:0 0 0.5rem;font-size:2rem">${escapeHtml(project.title)}</h1>
      ${project.summary ? `<p style="font-size:1.15rem;margin:0 0 1rem">${escapeHtml(project.summary)}</p>` : ""}
      ${clientLine}
      ${tags}
      <p class="muted" style="margin:0.5rem 0 0">
        ${sd ? `Sort: ${escapeHtml(sd)} · ` : ""}
        Updated <time datetime="${escapeHtml(project.edited_at)}">${escapeHtml(project.edited_at.slice(0, 10))}</time>
      </p>
    </header>
    ${gallerySection(project.gallery_images)}
    ${teamSection(team)}
    <div class="article-body">${project.rendered_html}</div>
  </article>
</main>`;

  return layoutPage(project.title, inner);
}
