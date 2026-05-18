import type { Client, GalleryImage, ProjectClientRef, ProjectData, ProjectLink, TeamMember } from "../types";
import { escapeHtml, layoutPage } from "./shared";

function gallerySection(images: GalleryImage[]): string {
  if (!images.length) return "";
  const n = images.length;
  const figures = images
    .map((img, i) => {
      const rawCaption = typeof img.caption === "string" ? img.caption.trim() : "";
      const alt = escapeHtml(img.alt ?? "");
      const capEscaped = escapeHtml(rawCaption);
      const capHtml = rawCaption ? `<figcaption class="gallery-figcaption">${capEscaped}</figcaption>` : "";
      const aria = escapeHtml(`Open image ${i + 1} of ${n} larger`);
      const heroClass = i === 0 ? " gallery-figure--hero" : "";
      const loadAttrs =
        i === 0 ? `loading="eager" decoding="async" fetchpriority="high"` : `loading="lazy" decoding="async"`;
      return `<figure class="gallery-figure${heroClass}"><button type="button" class="gallery-thumb" aria-label="${aria}" data-gallery-src="${escapeHtml(img.url)}" data-gallery-alt="${alt}" data-gallery-caption="${capEscaped}"><img src="${escapeHtml(img.url)}" alt="${alt}" ${loadAttrs}/></button>${capHtml}</figure>`;
    })
    .join("\n");
  return `<section class="project-gallery" aria-label="Gallery"><div class="project-gallery__head"><h2 class="section-title">Gallery</h2></div><div class="gallery-strip" data-gallery-strip>${figures}</div></section>`;
}

/** Dialog + external script before </body> when the page has a gallery strip (see /gallery-lightbox.js). */
function galleryLightboxFragment(): string {
  return `<dialog id="gallery-lightbox" class="gallery-lightbox" aria-modal="true">
<div class="gallery-lightbox__shell">
<button type="button" class="gallery-lightbox__close" data-gallery-close>Close</button>
<div class="gallery-lightbox__row">
<button type="button" class="gallery-lightbox__nav gallery-lightbox__nav--prev" data-gallery-prev aria-label="Previous image">&#8249;</button>
<figure class="gallery-lightbox__figure">
<img class="gallery-lightbox__img" alt="" decoding="async"/>
<figcaption class="gallery-lightbox__caption"></figcaption>
</figure>
<button type="button" class="gallery-lightbox__nav gallery-lightbox__nav--next" data-gallery-next aria-label="Next image">&#8250;</button>
</div>
</div>
</dialog>
<script src="/gallery-lightbox.js" defer></script>`;
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
    s += `<span class="project-header-date-clients__muted"> · </span><span class="project-header-date-clients__value">via ${clientNameLink(vc)}</span>`;
  }
  return s;
}

function primaryClientSegments(refs: ProjectClientRef[]): string {
  const mutedDot = '<span class="project-header-date-clients__muted"> · </span>';
  return refs
    .map((ref) => {
      const c = ref.client;
      const dirVia = ref.parent_client ?
        `${mutedDot}<span class="project-header-date-clients__value">via ${clientNameLink(ref.parent_client)}</span>`
      : "";
      return `<span class="project-header-date-clients__value">${clientNameLink(c)}</span>${dirVia}`;
    })
    .join(mutedDot);
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
  const dateSpan = sortRaw ?
    `<span class="project-header-date-clients__date"><span class="project-header-date-clients__muted">Date : </span><span class="project-header-date-clients__value">${escapeHtml(sortRaw)}</span></span>`
  : "";

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

  return layoutPage(project.title, inner, {
    bodySuffix: project.gallery_images?.length ? galleryLightboxFragment() : undefined,
  });
}
