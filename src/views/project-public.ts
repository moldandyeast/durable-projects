import type { Client, GalleryImage, ProjectClientRef, ProjectData, ProjectLink, TeamMember } from "../types";
import { detectMediaKind, parseStreamUrl, streamIframeUrl } from "./media";
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

/** "001 / Article" — monospace index label sitting in the left margin of the grid. */
function indexLabel(num: string, label: string): string {
  return `<span class="project__index" aria-hidden="true"><span class="project__index-num">${escapeHtml(num)}</span><span class="project__index-sep"> / </span><span class="project__index-label">${escapeHtml(label)}</span></span>`;
}

function rule(): string {
  return `<hr class="project__rule" aria-hidden="true"/>`;
}

function clientNameLink(c: { name: string; url?: string }): string {
  const name = escapeHtml(c.name);
  const u = c.url?.trim();
  if (!u) return name;
  return `<a href="${escapeHtml(u)}" rel="noopener noreferrer" class="project-client-link">${name}</a>`;
}

function specClientsValue(refs: ProjectClientRef[]): string {
  return refs
    .map((ref) => {
      const c = ref.client;
      const dirVia = ref.parent_client ?
        ` <span class="spec-cell__inline-muted">via</span> ${clientNameLink(ref.parent_client)}`
      : "";
      return `<span class="spec-cell__client">${clientNameLink(c)}${dirVia}</span>`;
    })
    .join('<span class="spec-cell__sep" aria-hidden="true"> · </span>');
}

function specViaValue(viaClients: Client[]): string {
  return viaClients
    .map((c) => `<span class="spec-cell__client">${clientNameLink(c)}</span>`)
    .join('<span class="spec-cell__sep" aria-hidden="true"> · </span>');
}

function specSheet(
  project: ProjectData,
  primaryRefs: ProjectClientRef[],
  viaClients: Client[],
  tags: string[],
): string {
  const cells: string[] = [];
  const date = project.sort_date?.trim();
  if (date) {
    cells.push(
      `<div class="spec-cell spec-cell--date"><dt>Date</dt><dd>${escapeHtml(date)}</dd></div>`,
    );
  }
  const myRole = project.my_role?.trim();
  if (myRole) {
    cells.push(
      `<div class="spec-cell spec-cell--my-role"><dt>My role</dt><dd>${escapeHtml(myRole)}</dd></div>`,
    );
  }
  if (primaryRefs.length) {
    cells.push(
      `<div class="spec-cell spec-cell--clients"><dt>${primaryRefs.length > 1 ? "Clients" : "Client"}</dt><dd>${specClientsValue(primaryRefs)}</dd></div>`,
    );
  }
  if (viaClients.length) {
    cells.push(
      `<div class="spec-cell spec-cell--via"><dt>Via</dt><dd>${specViaValue(viaClients)}</dd></div>`,
    );
  }
  if (tags.length) {
    const list = tags
      .map((t) => `<span class="spec-cell__tag">${escapeHtml(String(t).trim())}</span>`)
      .join('<span class="spec-cell__sep" aria-hidden="true"> · </span>');
    cells.push(`<div class="spec-cell spec-cell--tags"><dt>Tags</dt><dd>${list}</dd></div>`);
  }
  if (!cells.length) return "";
  return `${rule()}
<section class="project__row project__row--spec" aria-label="Project specification">
  ${indexLabel("002", "Spec")}
  <dl class="project__spec">${cells.join("\n    ")}</dl>
</section>`;
}

/** Split free-text on blank lines into paragraphs; escape and wrap each in <p>. */
function whyParagraphs(why: string): string {
  return why
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p class="project__why-p">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("\n");
}

function whySection(project: ProjectData): string {
  const why = project.why?.trim();
  if (!why) return "";
  return `${rule()}
<section class="project__row project__row--why" aria-label="Why this project">
  ${indexLabel("004", "Why")}
  <div class="project__why">${whyParagraphs(why)}</div>
</section>`;
}

function articleSection(project: ProjectData): string {
  const body = project.rendered_html?.trim();
  if (!body) return "";
  return `${rule()}
<section class="project__row project__row--article" aria-label="About">
  ${indexLabel("003", "About")}
  <div class="project__body article-body" id="article-body">${project.rendered_html}</div>
</section>`;
}

function linksSection(links: ProjectLink[] | undefined): string {
  const list = links ?? [];
  if (!list.length) return "";
  const items = list
    .map((l, i) => {
      const num = String(i + 1).padStart(2, "0");
      return `<li><span class="project-links__num">${num}</span><a href="${escapeHtml(l.url)}" rel="noopener noreferrer">${escapeHtml(l.label)}</a></li>`;
    })
    .join("\n");
  return `${rule()}
<section class="project__row project__row--links" aria-label="Links">
  ${indexLabel("005", "Links")}
  <ol class="project__links">${items}</ol>
</section>`;
}

function galleryItem(
  img: GalleryImage,
  i: number,
  total: number,
  mode: "interactive" | "static",
): string {
  const rawCaption = typeof img.caption === "string" ? img.caption.trim() : "";
  const altText = img.alt ?? "";
  const alt = escapeHtml(altText);
  const capEscaped = escapeHtml(rawCaption);
  const capHtml = rawCaption ? `<figcaption class="gallery-figcaption">${capEscaped}</figcaption>` : "";
  const heroClass = i === 0 ? " gallery-figure--hero" : "";
  const kind = detectMediaKind(img.url);

  // Cloudflare Stream — embed the official iframe player (autoplay + muted + looped)
  if (kind === "video-stream") {
    const ref = parseStreamUrl(img.url);
    if (ref) {
      const src = streamIframeUrl(ref, { autoplay: true });
      const titleAttr = escapeHtml(altText || `Video ${i + 1} of ${total}`);
      return `<figure class="gallery-figure gallery-figure--video${heroClass}">
  <div class="gallery-video">
    <iframe class="gallery-video__iframe" src="${escapeHtml(src)}" loading="lazy" title="${titleAttr}" allow="autoplay; accelerometer; gyroscope; encrypted-media; picture-in-picture;" allowfullscreen></iframe>
  </div>
  ${capHtml}
</figure>`;
    }
  }

  // Direct .mp4/.webm/… — native <video>, autoplay + muted + looped, controls available
  if (kind === "video-file") {
    return `<figure class="gallery-figure gallery-figure--video${heroClass}">
  <div class="gallery-video">
    <video class="gallery-video__el" src="${escapeHtml(img.url)}" autoplay loop muted playsinline controls preload="metadata"></video>
  </div>
  ${capHtml}
</figure>`;
  }

  // Image branch
  const loadAttrs =
    i === 0 ? `loading="eager" decoding="async" fetchpriority="high"` : `loading="lazy" decoding="async"`;
  if (mode === "static") {
    return `<figure class="gallery-figure gallery-figure--export${heroClass}"><img class="gallery-export-img" src="${escapeHtml(img.url)}" alt="${alt}" ${loadAttrs}/>${capHtml}</figure>`;
  }
  const aria = escapeHtml(`Open image ${i + 1} of ${total} larger`);
  return `<figure class="gallery-figure${heroClass}"><button type="button" class="gallery-thumb" aria-label="${aria}" data-gallery-src="${escapeHtml(img.url)}" data-gallery-alt="${alt}" data-gallery-caption="${capEscaped}"><img src="${escapeHtml(img.url)}" alt="${alt}" ${loadAttrs}/></button>${capHtml}</figure>`;
}

function gallerySection(images: GalleryImage[], mode: "interactive" | "static"): string {
  if (!images.length) return "";
  const figures = images.map((img, i) => galleryItem(img, i, images.length, mode)).join("\n");
  const stripAttrs = mode === "interactive" ? ` data-gallery-strip` : "";
  return `${rule()}
<section id="project-gallery" class="project__row project__row--gallery" aria-label="Selected work">
  ${indexLabel("006", "Plates")}
  <div class="gallery-strip"${stripAttrs}>${figures}</div>
</section>`;
}

function creditsSection(team: TeamMember[]): string {
  if (!team.length) return "";
  const rows = team
    .map((m) => {
      const nameHtml = m.url ?
        `<a href="${escapeHtml(m.url)}" rel="noopener noreferrer">${escapeHtml(m.name)}</a>`
      : escapeHtml(m.name);
      const role = m.role ? escapeHtml(m.role) : "";
      return `<div class="project__team-row"><dt>${nameHtml}</dt><dd>${role}</dd></div>`;
    })
    .join("\n");
  return `${rule()}
<section class="project__row project__row--credits" aria-label="Credits">
  ${indexLabel("007", "Credits")}
  <dl class="project__team">${rows}</dl>
</section>`;
}

function colophonSection(editedAt: string): string {
  const day = editedAt.slice(0, 10);
  return `${rule()}
<footer class="project__row project__row--colophon">
  ${indexLabel("000", "Colophon")}
  <p class="project__updated">Updated <time datetime="${escapeHtml(editedAt)}">${escapeHtml(day)}</time></p>
</footer>`;
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

/** Article markup shared by the live page and standalone HTML export. */
export function projectArticleInnerHtml(
  project: ProjectData,
  team: TeamMember[],
  primaryRefs: ProjectClientRef[],
  viaClients: Client[],
  galleryMode: "interactive" | "static",
): string {
  const tags = Array.isArray(project.tags) ? project.tags.filter((t) => String(t).trim()) : [];
  return `<article class="project">
  ${rule()}
  <header class="project__row project__hero">
    ${indexLabel("001", "Project")}
    <div class="project__hero-text">
      <h1 class="project__title" id="project-heading">${escapeHtml(project.title)}</h1>
      ${project.summary ? `<p class="project__dek">${escapeHtml(project.summary)}</p>` : ""}
    </div>
  </header>
  ${specSheet(project, primaryRefs, viaClients, tags)}
  ${articleSection(project)}
  ${whySection(project)}
  ${linksSection(project.project_links)}
  ${gallerySection(project.gallery_images, galleryMode)}
  ${creditsSection(team)}
  ${colophonSection(project.edited_at)}
</article>`;
}

function projectToolbarHeader(project: ProjectData): string {
  const id = escapeHtml(project.id);
  const title = escapeHtml(project.title);
  const base = escapeHtml(safeDownloadBasename(project.title, project.id));
  return `<header class="site-nav site-nav--project">
  <div class="site-nav__inner">
    <div class="site-nav__start">
      <a class="brand" href="/">Work</a>
      <a class="site-nav__crumb" href="/">All projects</a>
    </div>
    <div class="site-nav__title-slot">
      <span class="site-nav__doc-title" id="site-nav-doc-title" aria-hidden="true">${title}</span>
    </div>
    <nav class="site-nav__tools" aria-label="Share and download">
      <button type="button" class="site-nav__tool" data-project-share aria-label="Share this project">Share</button>
      <a class="site-nav__tool site-nav__tool--link" href="/${id}.md" download="${base}.md">MD</a>
      <a class="site-nav__tool site-nav__tool--link" href="/${id}/export.html" download="${base}.html">HTML</a>
    </nav>
  </div>
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
