import type { Client, GalleryImage, ProjectData, TeamMember } from "../types";
import { escapeHtml, layoutPage } from "./shared";

function gallerySection(images: GalleryImage[]): string {
  if (!images.length) return "";
  const figures = images
    .map((img) => {
      const alt = escapeHtml(img.alt ?? "");
      const cap = img.caption ? `<figcaption>${escapeHtml(img.caption)}</figcaption>` : "";
      return `<figure><img src="${escapeHtml(img.url)}" alt="${alt}" loading="lazy"/>${cap}</figure>`;
    })
    .join("\n");
  return `<section><h2 class="section-title">Gallery</h2><div class="gallery-grid">${figures}</div></section>`;
}

function teamSection(team: TeamMember[]): string {
  if (!team.length) return "";
  const items = team
    .map((m) => {
      const role = m.role ? ` <span class="muted">— ${escapeHtml(m.role)}</span>` : "";
      const link = m.url
        ? `<a href="${escapeHtml(m.url)}" rel="noopener noreferrer">${escapeHtml(m.name)}</a>${role}`
        : `<strong>${escapeHtml(m.name)}</strong>${role}`;
      return `<li>${link}</li>`;
    })
    .join("");
  return `<section><h2 class="section-title">Team</h2><ul class="team-list">${items}</ul></section>`;
}

function sortDateDisplay(sort_date: string | undefined): string {
  if (!sort_date?.trim()) return "";
  const y = sort_date.slice(0, 4);
  return y.length === 4 ? y : sort_date.trim();
}

export function projectPublicPage(
  project: ProjectData,
  team: TeamMember[],
  client: Client | undefined,
  parentClient: Client | undefined,
): string {
  const clientLine = client
    ? client.url
      ? `<p class="muted">${escapeHtml(client.name)} · <a href="${escapeHtml(client.url)}">${escapeHtml(client.url.replace(/^https?:\/\//, ""))}</a>${parentClient ? ` <span class="client-via">· via ${escapeHtml(parentClient.name)}</span>` : ""}</p>`
      : `<p class="muted">${escapeHtml(client.name)}${parentClient ? ` <span class="client-via">· via ${escapeHtml(parentClient.name)}</span>` : ""}</p>`
    : "";

  const tags =
    project.tags?.length ?
      `<p>${project.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</p>`
    : "";

  const sd = sortDateDisplay(project.sort_date);

  const metaParts: string[] = [];
  if (sd) metaParts.push(`<span><strong>Sort</strong> ${escapeHtml(sd)}</span>`);
  metaParts.push(
    `<span><strong>Updated</strong> <time datetime="${escapeHtml(project.edited_at)}">${escapeHtml(project.edited_at.slice(0, 10))}</time></span>`,
  );
  const metaRow = `<div class="meta-row">${metaParts.join("")}</div>`;

  const inner = `
<header class="site-nav">
  <a class="brand" href="/">Work</a>
</header>
<main class="page">
  <div class="back-row"><a href="/">← All projects</a></div>
  <article>
    <header class="project-header">
      <h1>${escapeHtml(project.title)}</h1>
      ${project.summary ? `<p class="dek">${escapeHtml(project.summary)}</p>` : ""}
      ${clientLine}
      ${tags}
      ${metaRow}
    </header>
    ${gallerySection(project.gallery_images)}
    ${teamSection(team)}
    <div class="article-body">${project.rendered_html}</div>
  </article>
</main>`;

  return layoutPage(project.title, inner);
}
