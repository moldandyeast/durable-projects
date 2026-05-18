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

/** Tags and last-updated on one line at the bottom: `tags | Updated …`. */
function tagsAndUpdatedFooter(tags: string[], editedAt: string): string {
  const list = Array.isArray(tags) ? tags.filter((t) => String(t).trim()) : [];
  const updatedHtml = `<time datetime="${escapeHtml(editedAt)}">Updated ${escapeHtml(editedAt.slice(0, 10))}</time>`;
  if (!list.length) {
    return `<p class="project-footer-meta">${updatedHtml}</p>`;
  }
  const tagSpans = list
    .map((t) => `<span class="project-footer-meta__tag">${escapeHtml(String(t).trim())}</span>`)
    .join('<span class="project-footer-meta__tagsep"> · </span>');
  return `<p class="project-footer-meta"><span class="project-footer-meta__tags">${tagSpans}</span><span class="project-footer-meta__sep" aria-hidden="true"> | </span>${updatedHtml}</p>`;
}

function clientNameLink(c: { name: string; url?: string }): string {
  const name = escapeHtml(c.name);
  const u = c.url?.trim();
  if (!u) return name;
  return `<a href="${escapeHtml(u)}" rel="noopener noreferrer" class="project-client-link">${name}</a>`;
}

function projectViaSuffix(viaClients: Client[]): string {
  let s = "";
  for (const vc of viaClients) {
    s += ` <span class="client-via">· via ${clientNameLink(vc)}</span>`;
  }
  return s;
}

function primaryClientSegments(refs: ProjectClientRef[]): string {
  return refs
    .map((ref) => {
      const c = ref.client;
      const dirVia = ref.parent_client ?
        ` <span class="client-via">· via ${clientNameLink(ref.parent_client)}</span>`
      : "";
      return `${clientNameLink(c)}${dirVia}`;
    })
    .join(" · ");
}

export function projectPublicPage(
  project: ProjectData,
  team: TeamMember[],
  primaryRefs: ProjectClientRef[],
  viaClients: Client[],
): string {
  const clientsInner =
    primaryRefs.length ?
      `${primaryClientSegments(primaryRefs)}${projectViaSuffix(viaClients)}`
    : "";

  const sortRaw = project.sort_date?.trim();
  const dateSpan = sortRaw ? `<span class="meta-row__date">Date : ${escapeHtml(sortRaw)}</span>` : "";

  let dateClientsRow = "";
  if (dateSpan && clientsInner) {
    dateClientsRow = `<div class="project-header-date-clients">${dateSpan}<span class="project-header-date-clients__sep" aria-hidden="true"> | </span><span class="project-header-date-clients__clients">${clientsInner}</span></div>`;
  } else if (dateSpan) {
    dateClientsRow = `<div class="project-header-date-clients">${dateSpan}</div>`;
  } else if (clientsInner) {
    dateClientsRow = `<div class="project-header-date-clients"><span class="project-header-date-clients__clients">${clientsInner}</span></div>`;
  }

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
      ${dateClientsRow}
    </header>
    <div class="article-body">${project.rendered_html}</div>
    ${gallerySection(project.gallery_images)}
    ${linksSection(project.project_links)}
    ${teamFooterMinimal(team)}
    ${tagsAndUpdatedFooter(project.tags ?? [], project.edited_at)}
  </article>
</main>`;

  return layoutPage(project.title, inner);
}
