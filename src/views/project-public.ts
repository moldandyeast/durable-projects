import type { Client, GalleryImage, ProjectClientRef, ProjectData, ProjectLink, TeamMember } from "../types";
import { escapeHtml, layoutPage } from "./shared";

/** ASCII-ish filename for download= attributes (matches server export basename rules). */
function safeDownloadBasename(title: string, id: string): string {
  const raw = title
    .trim()
    .replace(/[\u0000-\u001f<>:"/\\|?*]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96);
  return raw || id;
}

function gallerySection(images: GalleryImage[], mode: "interactive" | "static"): string {
  if (!images.length) return "";
  const n = images.length;
  if (mode === "static") {
    const figures = images
      .map((img, i) => {
        const rawCaption = typeof img.caption === "string" ? img.caption.trim() : "";
        const alt = escapeHtml(img.alt ?? "");
        const capEscaped = escapeHtml(rawCaption);
        const capHtml = rawCaption ? `<figcaption class="gallery-figcaption">${capEscaped}</figcaption>` : "";
        const heroClass = i === 0 ? " gallery-figure--hero" : "";
        const loadAttrs =
          i === 0 ? `loading="eager" decoding="async" fetchpriority="high"` : `loading="lazy" decoding="async"`;
        return `<figure class="gallery-figure gallery-figure--export${heroClass}"><img class="gallery-export-img" src="${escapeHtml(img.url)}" alt="${alt}" ${loadAttrs}/>${capHtml}</figure>`;
      })
      .join("\n");
    return `<section id="project-gallery" class="project-gallery" aria-label="Selected work"><div class="gallery-strip">${figures}</div></section>`;
  }

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
  return `<section id="project-gallery" class="project-gallery" aria-label="Selected work"><div class="gallery-strip" data-gallery-strip>${figures}</div></section>`;
}

/** Modal shell only; runtime loads once via `/project-runtime.js` on every project page. */
function galleryLightboxDialog(): string {
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
</dialog>`;
}

function linksSection(links: ProjectLink[] | undefined): string {
  const list = links ?? [];
  if (!list.length) return "";
  const items = list
    .map((l) => {
      return `<li><a href="${escapeHtml(l.url)}" rel="noopener noreferrer">${escapeHtml(l.label)}</a></li>`;
    })
    .join("\n");
  return `<section><ul class="project-links">${items}</ul></section>`;
}

/** Compact team block — label column + flowing credits (editorial rhythm). */
function teamFooterMinimal(team: TeamMember[]): string {
  if (!team.length) return "";
  const chunks = team.map((m) => {
    const nameHtml = m.url
      ? `<a href="${escapeHtml(m.url)}" rel="noopener noreferrer" class="project-team-min__name">${escapeHtml(m.name)}</a>`
      : `<span class="project-team-min__name">${escapeHtml(m.name)}</span>`;
    const roleHtml = m.role ? `<span class="project-team-min__role">${escapeHtml(m.role)}</span>` : "";
    const inner = roleHtml ? `${nameHtml}\u200a\u200a${roleHtml}` : nameHtml;
    return `<span class="project-team-min__member">${inner}</span>`;
  });
  return `<div class="project-team-min"><span class="project-team-min__tag">Team</span><div class="project-team-min__body">${chunks.join('<span class="project-team-min__sep" aria-hidden="true"> · </span>')}</div></div>`;
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

function buildDateClientsRow(
  project: ProjectData,
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

  if (dateSpan && clientsInner) {
    return `<div class="project-header-date-clients">${dateSpan}<span class="project-header-date-clients__sep" aria-hidden="true"> | </span><span class="project-header-date-clients__clients">${clientsInner}</span></div>`;
  }
  if (dateSpan) return `<div class="project-header-date-clients">${dateSpan}</div>`;
  if (clientsInner) {
    return `<div class="project-header-date-clients"><span class="project-header-date-clients__clients">${clientsInner}</span></div>`;
  }
  return "";
}

/** Article markup shared by the live page and standalone HTML export. */
export function projectArticleInnerHtml(
  project: ProjectData,
  team: TeamMember[],
  primaryRefs: ProjectClientRef[],
  viaClients: Client[],
  galleryMode: "interactive" | "static",
): string {
  const dateClientsRow = buildDateClientsRow(project, primaryRefs, viaClients);
  return `<article>
    <header class="project-header">
      <h1 id="project-heading">${escapeHtml(project.title)}</h1>
      ${project.summary ? `<p class="dek">${escapeHtml(project.summary)}</p>` : ""}
      ${dateClientsRow}
    </header>
    <div id="article-body" class="article-body">${project.rendered_html}</div>
    ${linksSection(project.project_links)}
    ${gallerySection(project.gallery_images, galleryMode)}
    ${teamFooterMinimal(team)}
    ${tagsAndUpdatedFooter(project.tags ?? [], project.edited_at)}
  </article>`;
}

function projectToolbarHeader(project: ProjectData): string {
  const id = escapeHtml(project.id);
  const title = escapeHtml(project.title);
  const base = escapeHtml(safeDownloadBasename(project.title, project.id));
  return `<header class="site-nav site-nav--project">
  <div class="site-nav__start">
    <a class="brand" href="/">Work</a>
    <a class="site-nav__crumb" href="/">All projects</a>
  </div>
  <div class="site-nav__title-slot">
    <span class="site-nav__doc-title" id="site-nav-doc-title" aria-hidden="true">${title}</span>
  </div>
  <nav class="site-nav__tools" aria-label="Share and download">
    <button type="button" class="site-nav__tool" data-project-share aria-label="Share this project">Share</button>
    <a class="site-nav__tool site-nav__tool--link" href="/${id}.md" download="${base}.md">Markdown</a>
    <a class="site-nav__tool site-nav__tool--link" href="/${id}/export.html" download="${base}.html">HTML</a>
  </nav>
</header>`;
}

export function projectPublicPage(
  project: ProjectData,
  team: TeamMember[],
  primaryRefs: ProjectClientRef[],
  viaClients: Client[],
): string {
  const inner = `${projectToolbarHeader(project)}
<main class="page page--project">
${projectArticleInnerHtml(project, team, primaryRefs, viaClients, "interactive")}
</main>`;

  const suffixParts: string[] = [];
  if (project.gallery_images?.length) suffixParts.push(galleryLightboxDialog());
  suffixParts.push(`<script src="/project-runtime.js" defer></script>`);

  return layoutPage(project.title, inner, {
    bodyClass: "page-project",
    bodySuffix: suffixParts.join("\n"),
  });
}
