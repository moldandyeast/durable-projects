import type { Client, GalleryImage, ProjectClientRef, ProjectData, ProjectLink, TeamMember } from "../types";
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

function linksSection(links: ProjectLink[] | undefined): string {
  const list = links ?? [];
  if (!list.length) return "";
  const items = list
    .map((l) => {
      return `<li><a href="${escapeHtml(l.url)}" rel="noopener noreferrer">${escapeHtml(l.label)}</a></li>`;
    })
    .join("\n");
  return `<section><h2 class="section-title">Links</h2><ul class="project-links">${items}</ul></section>`;
}

/** Compact team line at the bottom of the article (after body). */
function teamFooterMinimal(team: TeamMember[]): string {
  if (!team.length) return "";
  const chunks = team.map((m) => {
    const nameHtml = m.url
      ? `<a href="${escapeHtml(m.url)}" rel="noopener noreferrer" class="project-team-min__name">${escapeHtml(m.name)}</a>`
      : `<span class="project-team-min__name">${escapeHtml(m.name)}</span>`;
    const roleHtml = m.role ? `<span class="project-team-min__role">${escapeHtml(m.role)}</span>` : "";
    return roleHtml ? `${nameHtml}\u00a0${roleHtml}` : nameHtml;
  });
  return `<div class="project-team-min"><span class="project-team-min__tag">Team</span> ${chunks.join(" · ")}</div>`;
}

function lastUpdatedFooter(editedAt: string): string {
  return `<p class="project-updated-last"><time datetime="${escapeHtml(editedAt)}">Updated ${escapeHtml(editedAt.slice(0, 10))}</time></p>`;
}

function sortDateDisplay(sort_date: string | undefined): string {
  if (!sort_date?.trim()) return "";
  const y = sort_date.slice(0, 4);
  return y.length === 4 ? y : sort_date.trim();
}

function projectViaSuffix(viaClients: Client[]): string {
  let s = "";
  for (const vc of viaClients) {
    s += ` <span class="client-via">· via ${escapeHtml(vc.name)}</span>`;
  }
  return s;
}

function primaryClientSegments(refs: ProjectClientRef[]): string {
  return refs
    .map((ref) => {
      const c = ref.client;
      const dirVia = ref.parent_client ?
        ` <span class="client-via">· via ${escapeHtml(ref.parent_client.name)}</span>`
      : "";
      if (c.url) {
        return `${escapeHtml(c.name)} · <a href="${escapeHtml(c.url)}">${escapeHtml(c.url.replace(/^https?:\/\//, ""))}</a>${dirVia}`;
      }
      return `${escapeHtml(c.name)}${dirVia}`;
    })
    .join(" · ");
}

export function projectPublicPage(
  project: ProjectData,
  team: TeamMember[],
  primaryRefs: ProjectClientRef[],
  viaClients: Client[],
): string {
  const clientLine =
    primaryRefs.length ?
      `<p class="muted">${primaryClientSegments(primaryRefs)}${projectViaSuffix(viaClients)}</p>`
    : "";

  const tags =
    project.tags?.length ?
      `<p>${project.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</p>`
    : "";

  const sd = sortDateDisplay(project.sort_date);

  const metaParts: string[] = [];
  if (sd) metaParts.push(`<span><strong>Sort</strong> ${escapeHtml(sd)}</span>`);
  const metaRow = metaParts.length ? `<div class="meta-row">${metaParts.join("")}</div>` : "";

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
    ${linksSection(project.project_links)}
    <div class="article-body">${project.rendered_html}</div>
    ${teamFooterMinimal(team)}
    ${lastUpdatedFooter(project.edited_at)}
  </article>
</main>`;

  return layoutPage(project.title, inner);
}
